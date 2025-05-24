import { toast } from "react-hot-toast";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";

import { supabase } from "@/lib/supabase";
import { isAndroid } from "@/utils/platform";
import { detectCardBrand } from "@/utils/utils";
import { WalletData, PaymentMethod, Transaction } from "./@types";

export const useWallet = (userId: string) => {
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  
  // Add cache ref to prevent redundant fetches
  const cacheRef = useRef<{
    lastFetchTime: number;
    lastUserId: string | null;
    isLoading: boolean;
  }>({
    lastFetchTime: 0,
    lastUserId: null,
    isLoading: false,
  });

  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance);
  };

  const fetchWalletData = useCallback(async (options?: { force?: boolean; silent?: boolean }) => {
    const { force = false, silent = false } = options || {};
    const now = Date.now();
    const cacheTimeout = 30000; // 30 seconds cache
    
    // Skip if already loading or if cached data is recent (unless forced)
    if (
      cacheRef.current.isLoading || 
      (!force && 
       userId === cacheRef.current.lastUserId && 
       now - cacheRef.current.lastFetchTime < cacheTimeout)
    ) {
      return true; // Retorna true para indicar que não houve erro
    }

    try {
      if (!userId) {
        setWallet(null);
        setLoading(false);
        return true; // Não é um erro, apenas não há usuário
      }

      cacheRef.current.isLoading = true;
      setLoading(true);
      setError(null);

      // Fetch wallet data
      const { data: walletData, error: walletError } = await supabase
        .from("wallet")
        .select("id, balance")
        .eq("user_id", userId)
        .single();

      if (walletError) {
        // Verificar se é um erro de "não encontrado" - isso pode ser normal para novos usuários
        if (walletError.code === "PGRST116") {
          // Não encontrou a carteira - pode ser um novo usuário
          // Podemos criar uma carteira aqui ou tratar de outra forma
          if (!silent) {
            toast.loading("Criando nova carteira para você...");
          }
          
          // Aqui você poderia implementar a lógica para criar uma nova carteira
          // Por enquanto, apenas retornamos false para indicar que não foi bem-sucedido
          setError("Carteira não encontrada. Por favor, tente novamente mais tarde.");
          return false;
        }
        throw walletError;
      }
      
      if (!walletData) {
        setError("Carteira não encontrada");
        if (!silent) {
          toast.error("Carteira não encontrada");
        }
        return false;
      }

      // Fetch payment methods
      const { data: paymentMethods, error: methodsError } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("wallet_id", walletData.id);

      if (methodsError) throw methodsError;

      let methods = paymentMethods;
      if (methods.length === 0) {
        const defaultMethod: Omit<PaymentMethod, "id" | "created_at"> = {
          method_type: isAndroid() ? "google_pay" : "apple_pay",
          is_default: true,
        };

        const { data: insertedMethod, error: insertError } = await supabase
          .from("payment_methods")
          .insert([
            {
              ...defaultMethod,
              wallet_id: walletData.id,
            },
          ])
          .select();

        if (insertError) throw insertError;
        methods = insertedMethod;
        
        if (!silent) {
          toast.success("Método de pagamento padrão adicionado");
        }
      }

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } =
        await supabase
          .from("transactions")
          .select(
            `
          id,
          amount,
          transaction_date,
          status,
          services:service_id(name),
          users:barber_id(name)
        `
          )
          .eq("wallet_id", walletData.id)
          .order("transaction_date", { ascending: false })
          .limit(5);

      if (transactionsError) throw transactionsError;

      const formattedTransactions: Transaction[] = transactionsData.map(
        (item) => ({
          id: item.id,
          service_name: item.services?.[0]?.name || "Serviço não especificado",
          barber_name: item.users?.[0]?.name || "Barbeiro não especificado",
          payment_method: "Apple Pay",
          date: new Date(item.transaction_date).toLocaleDateString("pt-BR"),
          amount: item.amount,
          status: item.status,
        })
      );

      setWallet({
        id: walletData.id,
        balance: walletData.balance || 0,
        payment_methods: methods as PaymentMethod[],
        transactions: formattedTransactions,
      });

      // Update cache
      cacheRef.current.lastFetchTime = now;
      cacheRef.current.lastUserId = userId;
      
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMsg);
      
      if (!silent) {
        // Usar toast.error apenas se não estiver em modo silencioso
        toast.error(`Erro ao carregar carteira: ${errorMsg}`);
      }
      
      console.error("Error fetching wallet data:", err);
      return false;
    } finally {
      cacheRef.current.isLoading = false;
      setLoading(false);
    }
  }, [userId]);

  // Single consolidated useEffect for data fetching
  useEffect(() => {
    setWallet(null);
    setError(null);

    if (userId) {
      // If userId changed, force a refresh
      const shouldForceRefresh = userId !== cacheRef.current.lastUserId;
      
      if (shouldForceRefresh) {
        // Show a single loading toast
        const loadingToast = toast.loading("Carregando dados da carteira...");
        
        // Execute the fetch
        fetchWalletData({ force: true, silent: true })
          .then((success) => {
            if (success) {
              // Dismiss the loading toast
              toast.dismiss(loadingToast);
              
              // Show specific success messages for different parts
              toast.success("Saldo atualizado", { duration: 2000 });
              
              // Stagger the toasts slightly for better UX
              setTimeout(() => {
                toast.success("Métodos de pagamento carregados", { duration: 2000 });
              }, 300);
              
              setTimeout(() => {
                toast.success("Transações recentes atualizadas", { duration: 2000 });
              }, 600);
            } else {
              toast.dismiss(loadingToast);
              toast.error("Falha ao carregar dados da carteira");
            }
          })
          .catch((err) => {
            toast.dismiss(loadingToast);
            toast.error(`Erro ao carregar: ${err.message}`);
          });
      } else {
        // Normal fetch with caching - silent loading
        fetchWalletData({ silent: true });
      }
    }
  }, [userId, fetchWalletData]);

  const removePaymentMethod = async (methodId: string) => {
    try {
      if (!wallet) {
        toast.error("Carteira não carregada");
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading("Removendo método de pagamento...");

      const { error } = await supabase
        .from("payment_methods")
        .delete()
        .eq("id", methodId);

      if (error) throw error;

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success("Método de pagamento removido com sucesso");
      
      // Update wallet data after removing payment method - silent refresh
      await fetchWalletData({ force: true, silent: true });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(`Erro ao remover método de pagamento: ${errorMsg}`);
      console.error("Error removing payment method:", err);
    }
  };

  const getPaymentMethodIcon = (methodType: string) => {
    switch (methodType) {
      case "pix":
        return "pix_solid";
      case "apple_pay":
        return "apple_solid";
      case "google_pay":
        return "apple_solid";
      case "credit_card":
        return "card_credit";
      default:
        return "card_add";
    }
  };

  const getPaymentMethodLabel = (methodType: string) => {
    switch (methodType) {
      case "apple_pay":
        return "Apple Pay";
      case "google_pay":
        return "Google Pay";
      case "pix":
        return "PIX";
      default:
        return "Pagamento";
    }
  };

  const handlePaymentMethodClick = (method: PaymentMethod) => {
    if (method.method_type === "pix") {
      setIsPixModalOpen(true);
    }
  };

  const addPaymentMethod = async (
    method: Omit<PaymentMethod, "id" | "created_at" | "is_default"> & {
      cvv?: string;
      method_type: string;
      card_number?: string;
      expiry_date?: string;
      cardholder_name: string;
    }
  ) => {
    try {
      if (!wallet) {
        toast.error("Carteira não carregada. Por favor, tente novamente.");
        throw new Error("Wallet not loaded");
      }

      // Validação básica para cartão de crédito
      if (method.method_type === "credit_card") {
        if (!method.card_number || method.card_number.length < 13) {
          toast.error("Número do cartão inválido");
          throw new Error("Número do cartão inválido");
        }
        if (!method.expiry_date) {
          toast.error("Data de expiração inválida");
          throw new Error("Data de expiração inválida");
        }
      }

      // Show loading toast with appropriate message
      const methodTypeLabel = method.method_type === "credit_card" 
        ? "cartão" 
        : method.method_type === "pix" 
          ? "PIX" 
          : "método de pagamento";
      
      const loadingToast = toast.loading(`Adicionando ${methodTypeLabel}...`);

      let result;
      if (method.method_type === "credit_card" && method.card_number) {
        const lastFour = method.card_number.slice(-4);
        const brand = detectCardBrand(method.card_number);

        const { data, error } = await supabase
          .from("payment_methods")
          .insert([
            {
              wallet_id: wallet.id,
              method_type: "credit_card",
              card_last_four: lastFour,
              card_brand: brand,
              is_default: false,
              cardholder_name: method.cardholder_name,
              expiry_date: method.expiry_date,
            },
          ])
          .select();

        if (error) throw error;

        result = data[0];
        toast.dismiss(loadingToast);
        toast.success(`Cartão ${brand} terminado em ${lastFour} adicionado com sucesso!`);
      } else {
        const { data, error } = await supabase
          .from("payment_methods")
          .insert([
            {
              wallet_id: wallet.id,
              ...method,
              is_default: false,
            },
          ])
          .select();

        if (error) throw error;

        result = data[0];
        toast.dismiss(loadingToast);
        toast.success(`${getPaymentMethodLabel(method.method_type)} adicionado com sucesso!`);
      }

      // Force refresh after adding payment method - silent refresh
      await fetchWalletData({ force: true, silent: true });
      return result;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Erro ao adicionar método";
      toast.error(errorMsg);
      console.error("Error adding payment method:", err);
      throw err; // Re-lança o erro para ser tratado no UI
    }
  };

  const transactions = useMemo(() => wallet?.transactions || [], [wallet]);
  const paymentMethods = useMemo(() => wallet?.payment_methods || [], [wallet]);

  return {
    error,
    wallet,
    loading,
    showBalance,
    transactions,
    paymentMethods,
    isPixModalOpen,
    addPaymentMethod,
    setIsPixModalOpen,
    isAddCardModalOpen,
    removePaymentMethod,
    getPaymentMethodIcon,
    getPaymentMethodLabel,
    setIsAddCardModalOpen,
    toggleBalanceVisibility,
    refresh: () => fetchWalletData({ force: true, silent: false }),
    handlePaymentMethodClick,
  };
};
