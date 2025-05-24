import { useState } from "react";

import { formatter } from "@/utils/utils";
import { getIcons } from "@/assets/icons";
import { Header } from "@/components/organisms";
import { Layout } from "@/components/templates";
import { Text, Title } from "@/components/elements";

export const Wallet = () => {
  const [showBalance, setShowBalance] = useState(true);

  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance);
  };

  return (
    <Layout>
      <div className="flex flex-col justify-start items-center h-full w-full">
        <Header title={"Carteira"} backPath={"/"} />

        <div className="flex flex-col w-full justify-center items-start gap-5 px-4">
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
                  }).format(0)
                : "••••••"}{" "}
            </Text>
          </div>

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
              <div className="flex w-full flex-1 h-[94px]  rounded-[10px] border-[0.5px] border-[#EAEAEA] bg-white p-2">
                <img
                  alt="Ícone"
                  className="w-6 h-6 absolute"
                  src={getIcons("apple_solid")}
                />

                <div className="mt-auto">
                  <Text className="!font-light !text-[#111827] !text-sm">
                    Payment
                  </Text>

                  <Title className="!text-[#111827] inter textarea-md font-medium">
                    Apple pay
                  </Title>
                </div>
              </div>

              <div className="flex w-full flex-1 h-[94px]  rounded-[10px] border-[0.5px] border-[#EAEAEA] bg-white p-2">
                <img
                  alt="Ícone"
                  className="w-6 h-6 absolute"
                  src={getIcons("card_credit")}
                />

                <div className="mt-auto">
                  <Text className="!font-light !text-[#111827] !text-sm">
                    Visa
                  </Text>

                  <Title className="!text-[#111827] inter textarea-md font-medium">
                    **** 3708
                  </Title>
                </div>
              </div>

              <div className="flex w-full flex-1 h-[94px]  rounded-[10px] border-[0.5px] border-[#EAEAEA] bg-white p-2">
                <img
                  alt="Ícone"
                  className="w-6 h-6 absolute"
                  src={getIcons("card_add")}
                />

                <div className="mt-auto">
                  <Text className="!font-light !text-[#111827] !text-sm">
                    Register
                  </Text>

                  <Title className="!text-[#111827] inter textarea-md font-medium">
                    new card
                  </Title>
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full p-[10px_15px] flex-col items-start gap-[25px] rounded-[5px] bg-white shadow-[0px_4px_44px_0px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between w-full gap-1">
              <Title className="font-normal">Transacções recentes</Title>

              <button
                type="button"
                className="btn p-0 m-0 btn-link border-none !no-underline"
              >
                <Text className="!text-xs !text-[#181D27]">Ver mais</Text>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
