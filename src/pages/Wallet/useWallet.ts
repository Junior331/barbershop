import { toast } from "react-hot-toast";
import { useState, useEffect, useCallback, useMemo } from "react";

import { supabase } from "@/lib/supabase";
import { isAndroid } from "@/utils/platform";
import { detectCardBrand } from "@/utils/utils";
import { WalletData, PaymentMethod, Transaction } from "./@types";

export const useWallet = (userId: string) => {
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);

  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance);
  };

  const fetchWalletData = useCallback(async () => {
    try {
      if (!userId) {
        setWallet(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { data: walletData, error: walletError } = await supabase
        .from("wallet")
        .select("id, balance")
        .eq("user_id", userId)
        .single();

      if (walletError) throw walletError;
      if (!walletData) throw new Error("Carteira não encontrada");

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
        toast.success("Método de pagamento padrão adicionado");
      }

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

      toast.success("Dados da carteira atualizados");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMsg);
      toast.error(`Erro ao carregar carteira: ${errorMsg}`);
      console.error("Error fetching wallet data:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    setWallet(null);
    setError(null);

    if (userId) {
      fetchWalletData();
    }
  }, [userId, fetchWalletData]);

  const paymentMethods = useMemo(
    () => wallet?.payment_methods || [],
    [wallet?.payment_methods]
  );
  const transactions = useMemo(
    () => wallet?.transactions || [],
    [wallet?.transactions]
  );

  const removePaymentMethod = async (methodId: string) => {
    try {
      if (!wallet) {
        toast.error("Carteira não disponível");
        return;
      }

      const { error } = await supabase
        .from("payment_methods")
        .delete()
        .eq("id", methodId)
        .eq("wallet_id", wallet.id);

      if (error) throw error;

      await fetchWalletData();
      toast.success("Método de pagamento removido com sucesso");
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Erro ao remover método";
      setError(errorMsg);
      toast.error(`Erro ao remover método: ${errorMsg}`);
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
        toast.success("Cartão adicionado com sucesso!");
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
        toast.success("Método de pagamento adicionado com sucesso!");
      }

      await fetchWalletData();
      return result;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Erro ao adicionar método";
      toast.error(errorMsg);
      console.error("Error adding payment method:", err);
      throw err; // Re-lança o erro para ser tratado no UI
    }
  };

  useEffect(() => {
    setError(null);
    setWallet(null);

    // if (userId) {
    //   fetchWalletData()
    // }

    if (userId) {
      toast
        .promise(fetchWalletData(), {
          loading: "Carregando dados da carteira...",
          success: "Dados da carteira carregados!",
          error: (err) => `Erro ao carregar: ${err.message}`,
        })
        .catch(() => {});
    }
  }, [userId, fetchWalletData]);

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
    refresh: fetchWalletData,
    handlePaymentMethodClick,
  };
};
