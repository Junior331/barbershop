import { useState, useEffect, useCallback } from "react";

import { isIOS } from "@/utils/platform";
import { supabase } from "@/lib/supabase";
import { WalletData, PaymentMethod, Transaction } from "./@types";

export const useWallet = (userId: string) => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWalletData = useCallback(async () => {
    try {
      setLoading(true);

      // Buscar wallet incluindo o id
      const { data: walletData, error: walletError } = await supabase
        .from("wallet")
        .select("id, balance")
        .eq("user_id", userId)
        .single();

      if (walletError) throw walletError;
      if (!walletData) throw new Error("Wallet not found");

      // Buscar métodos de pagamento existentes
      const { data: paymentMethods, error: methodsError } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("wallet_id", walletData.id);

      if (methodsError) throw methodsError;

      // Se não houver métodos, cria os padrões
      let methods = paymentMethods;
      if (methods.length === 0) {
        const defaultMethods: Omit<PaymentMethod, "id" | "created_at">[] = [
          { method_type: "pix", is_default: true }
        ];

        // Adiciona método padrão baseado na plataforma
        if (isIOS()) {
          defaultMethods.push({ method_type: "apple_pay", is_default: false });
        } else {
          // Android ou outros dispositivos
          defaultMethods.push({ method_type: "google_pay", is_default: false });
        }

        // Insere os métodos padrão
        const { data: insertedMethods, error: insertError } = await supabase
          .from("payment_methods")
          .insert(defaultMethods.map(m => ({
            ...m,
            wallet_id: walletData.id
          })))
          .select();

        if (insertError) throw insertError;
        methods = insertedMethods;
      }

      // Restante do código permanece igual...
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transactions")
        .select(`
          id,
          amount,
          transaction_date,
          status,
          services:service_id(name),
          users:barber_id(name)
        `)
        .eq("wallet_id", walletData.id)
        .order("transaction_date", { ascending: false })
        .limit(5);

      if (transactionsError) throw transactionsError;

      const formattedTransactions: Transaction[] = transactionsData.map(item => ({
        id: item.id,
        service_name: item.services?.name || "Serviço não especificado",
        barber_name: item.users?.name || "Barbeiro não especificado",
        payment_method: "Apple Pay",
        date: new Date(item.transaction_date).toLocaleDateString("pt-BR"),
        amount: item.amount,
        status: item.status,
      }));

      setWallet({
        id: walletData.id,
        balance: walletData.balance || 0,
        payment_methods: methods as PaymentMethod[],
        transactions: formattedTransactions,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      console.error("Error fetching wallet data:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Restante do código permanece igual...
  const addPaymentMethod = async (
    method: Omit<PaymentMethod, "id" | "created_at" | "is_default"> & {
      card_number?: string;
      expiry_date?: string;
      cvv?: string;
    }
  ) => {
    try {
      if (!wallet) return;

      if (method.method_type === "credit_card" && method.card_number) {
        const lastFour = method.card_number.slice(-4);
        const brand = detectCardBrand(method.card_number);
        
        const { data, error } = await supabase
          .from("payment_methods")
          .insert([{
            wallet_id: wallet.id,
            method_type: "credit_card",
            card_last_four: lastFour,
            card_brand: brand,
            is_default: false,
          }])
          .select();

        if (error) throw error;
        await fetchWalletData();
        return data[0];
      } else {
        const { data, error } = await supabase
          .from("payment_methods")
          .insert([{
            wallet_id: wallet.id,
            ...method,
            is_default: false,
          }])
          .select();

        if (error) throw error;
        await fetchWalletData();
        return data[0];
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar método");
      console.error("Error adding payment method:", err);
      return null;
    }
  };

  const removePaymentMethod = async (methodId: string) => {
    try {
      if (!wallet) return;

      const { error } = await supabase
        .from("payment_methods")
        .delete()
        .eq("id", methodId)
        .eq("wallet_id", wallet.id);

      if (error) throw error;
      await fetchWalletData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover método");
      console.error("Error removing payment method:", err);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchWalletData();
    }
  }, [userId, fetchWalletData]);

  return {
    wallet,
    loading,
    error,
    refresh: fetchWalletData,
    addPaymentMethod,
    removePaymentMethod,
  };
};

// Helper para detectar a bandeira do cartão
function detectCardBrand(cardNumber: string): string {
  if (/^4/.test(cardNumber)) return "Visa";
  if (/^5[1-5]/.test(cardNumber)) return "Mastercard";
  if (/^3[47]/.test(cardNumber)) return "American Express";
  return "Other";
}