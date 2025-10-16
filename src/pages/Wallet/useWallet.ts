import { toast } from "react-hot-toast";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";

import { walletService } from "@/services/wallet.service";
import { paymentsService } from "@/services/payments.service";
import type { WalletTransaction } from "@/services/wallet.service";
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

      // Debug: Check authentication
      const token = document.cookie.split('; ').find(row => row.startsWith('access_token='));
      console.log('🔍 [Wallet] Auth token exists:', !!token);
      console.log('🔍 [Wallet] Fetching wallet data for userId:', userId);

      // ✅ Fetch wallet data from backend API (auto-creates if not exists)
      let walletData;
      try {
        walletData = await walletService.getWallet();
        console.log('✅ [Wallet] Wallet data received:', walletData);
      } catch (walletError: any) {
        console.error('❌ [Wallet] Failed to fetch wallet:', walletError);
        console.error('❌ [Wallet] Error response:', walletError.response?.data);
        throw walletError;
      }

      // ✅ Fetch payment methods from backend
      const paymentMethodsResponse = await paymentsService.getPaymentMethods(userId);
      let methods = paymentMethodsResponse || [];

      // Add default payment method if none exist
      if (methods.length === 0) {
        const defaultMethod = {
          method_type: isAndroid() ? "google_pay" : "apple_pay",
          is_default: true,
          cardholder_name: "Pagamento Padrão",
        };

        try {
          const addedMethod = await paymentsService.addPaymentMethod(userId, defaultMethod);
          methods = [addedMethod];

          if (!silent) {
            toast.success("Método de pagamento padrão adicionado");
          }
        } catch (addError) {
          console.error("Error adding default payment method:", addError);
          // Continue even if adding default method fails
        }
      }

      // ✅ Format transactions from backend
      const formattedTransactions: Transaction[] = (walletData.recentTransactions || []).map(
        (item: WalletTransaction) => ({
          id: item.id,
          service_name: item.description || "Transação",
          barber_name: "", // Backend doesn't return barber info yet
          payment_method: "Carteira",
          date: new Date(item.createdAt).toLocaleDateString("pt-BR"),
          amount: item.amount,
          // Convert backend status (UPPERCASE) to frontend format (lowercase)
          status: item.status.toLowerCase() as "completed" | "pending" | "failed",
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

      if (!userId) {
        toast.error("Usuário não identificado");
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading("Removendo método de pagamento...");

      // ✅ Use backend API to remove payment method
      await paymentsService.deletePaymentMethod(userId, methodId);

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

      if (!userId) {
        toast.error("Usuário não identificado");
        throw new Error("User not identified");
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

        // ✅ Use backend API to add payment method
        result = await paymentsService.addPaymentMethod(userId, {
          method_type: "credit_card",
          card_last_four: lastFour,
          card_brand: brand,
          is_default: false,
          cardholder_name: method.cardholder_name,
          expiry_date: method.expiry_date,
        });

        toast.dismiss(loadingToast);
        toast.success(`Cartão ${brand} terminado em ${lastFour} adicionado com sucesso!`);
      } else {
        // ✅ Use backend API for other payment methods
        result = await paymentsService.addPaymentMethod(userId, {
          ...method,
          is_default: false,
        });

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
    getPaymentMethodLabel,
    setIsAddCardModalOpen,
    toggleBalanceVisibility,
    refresh: () => fetchWalletData({ force: true, silent: false }),
    handlePaymentMethodClick,
  };
};
