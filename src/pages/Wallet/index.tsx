import { useWallet } from "./useWallet";
import { formatter } from "@/utils/utils";
import { getIcons } from "@/assets/icons";
import { Layout } from "@/components/templates";
import { useAuth } from "@/context/AuthContext";
import { Loading, Text, Title } from "@/components/elements";
import { AddCardModal, Header, PixModal } from "@/components/organisms";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const Wallet = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    error,
    wallet,
    loading,
    refresh,
    showBalance,
    transactions,
    paymentMethods,
    isPixModalOpen,
    setIsPixModalOpen,
    isAddCardModalOpen,
    getPaymentMethodIcon,
    getPaymentMethodLabel,
    setIsAddCardModalOpen,
    toggleBalanceVisibility,
    handlePaymentMethodClick,
    addPaymentMethod,
  } = useWallet(user?.id || "");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const pixCode =
    "00020101021126330014br.gov.bcb.pix0111195274927185204000053039865802BR5919JARILSON R T JUNIOR6013RIO DE JANEIR62070503***63047D65";

  if (!user) return null;
  if (loading) return <Loading />;
  if (error)
    return (
      <div className="p-4 text-center">
        <Text className="!text-red-500">{error}</Text>
        <button
          onClick={() => refresh()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Tentar novamente
        </button>
      </div>
    );
  if (!wallet)
    return (
      <div className="p-4 text-center">
        <Text>Nenhum dado da carteira encontrado</Text>
        <button
          onClick={() => refresh()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Tentar novamente
        </button>
      </div>
    );

  return (
    <Layout>
      <div className="flex flex-col justify-start items-center h-full w-full">
        <Header title={"Carteira"} backPath={"/"} />

        <div className="flex flex-col w-full justify-center items-start gap-5 px-4">
          {/* Saldo disponível */}
          <div className="flex w-full p-[10px_15px] flex-col items-start gap-2.5 rounded-[5px] bg-white shadow-[0px_4px_44px_0px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between w-full gap-2">
              <Title className="font-medium">Saldo disponível</Title>
              <button
                onClick={toggleBalanceVisibility}
                className="flex items-center justify-center p-1 rounded-full hover:bg-gray-100"
                aria-label={showBalance ? "Esconder saldo" : "Mostrar saldo"}
              >
                <img
                  src={getIcons(
                    showBalance ? "eye_slash_outline" : "eye_outline"
                  )}
                  alt={showBalance ? "Esconder saldo" : "Mostrar saldo"}
                  className="w-5 h-5 opacity-60"
                />
              </button>
            </div>
            <Text className="!text-base font-medium text-[#181D27]">
              {showBalance
                ? formatter({
                    type: "pt-BR",
                    currency: "BRL",
                    style: "currency",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(wallet.balance)
                : "••••••"}
            </Text>
          </div>

          {/* Métodos de pagamento */}
          <div className="flex w-full p-[10px_8px] flex-col items-start gap-[8px] rounded-[5px] bg-white shadow-[0px_4px_44px_0px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between w-full gap-1">
              <Title className="font-normal">Métodos de pagamento</Title>
              <button
                type="button"
                className="btn p-0 m-0 btn-link border-none !no-underline"
              >
                <Text className="!text-xs !text-[#111827]">Ver mais</Text>
              </button>
            </div>

            <div className="flex items-center w-full gap-1.5">
              {paymentMethods.slice(0, 2).map((method) => (
                <div
                  key={method.id}
                  className="flex w-fit flex-1 md:flex-none md:min-w-36 h-[94px] rounded-[10px] border-[0.5px] border-[#EAEAEA] bg-white p-2 relative cursor-pointer"
                  onClick={() => handlePaymentMethodClick(method)}
                >
                  <img
                    alt="Ícone"
                    className="w-6 h-6 absolute"
                    src={getIcons(getPaymentMethodIcon(method.method_type))}
                  />
                  <div className="mt-auto">
                    <Text className="!font-light !text-[#111827] !text-sm">
                      {method.method_type === "credit_card"
                        ? method.card_brand
                        : "Pagamento"}
                    </Text>
                    <Title className="!text-[#111827] inter textarea-md font-medium">
                      {method.method_type === "credit_card"
                        ? `**** ${method.card_last_four}`
                        : getPaymentMethodLabel(method.method_type)}
                    </Title>
                  </div>
                </div>
              ))}

              <div
                className="flex w-fit flex-1 md:flex-none md:min-w-36 h-[94px] rounded-[10px] border-[0.5px] border-[#EAEAEA] bg-white p-2 cursor-pointer"
                onClick={() => setIsAddCardModalOpen(true)}
              >
                <img
                  alt="Ícone"
                  className="w-6 h-6 absolute"
                  src={getIcons("card_add")}
                />
                <div className="mt-auto">
                  <Text className="!font-light !text-[#111827] !text-sm">
                    Adicionar
                  </Text>
                  <Title className="!text-[#111827] inter textarea-md font-medium">
                    Cartão
                  </Title>
                </div>
              </div>
            </div>
          </div>

          {/* Transações recentes */}
          <div className="flex w-full p-[10px_15px] flex-col items-start gap-[25px] rounded-[5px] bg-white shadow-[0px_4px_44px_0px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between w-full gap-1">
              <Title className="font-normal">Transações recentes</Title>
              <button
                type="button"
                className="btn p-0 m-0 btn-link border-none !no-underline"
              >
                <Text className="!text-xs !text-[#181D27]">Ver mais</Text>
              </button>
            </div>

            {transactions.length > 0 ? (
              <div className="w-full space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex flex-col gap-1">
                    <Text className="!text-sm !font-medium">
                      {transaction.service_name}
                    </Text>
                    <div className="flex justify-between items-center">
                      <Text className="!text-xs !text-gray-500">
                        {transaction.barber_name} • {transaction.date}
                      </Text>
                      <Text className="!text-sm !font-medium">
                        {formatter({
                          type: "pt-BR",
                          currency: "BRL",
                          style: "currency",
                        }).format(transaction.amount)}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Text className="!text-sm m-auto mb-4 !text-gray-500">
                Nenhuma transação recente
              </Text>
            )}
          </div>
        </div>
      </div>

      <AddCardModal
        isOpen={isAddCardModalOpen}
        onClose={() => setIsAddCardModalOpen(false)}
        addPaymentMethod={addPaymentMethod}
      />

      <PixModal
        title="Depósito"
        value={pixCode}
        isOpen={isPixModalOpen}
        onClose={() => setIsPixModalOpen(false)}
      />
    </Layout>
  );
};
