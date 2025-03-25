import { getIcons } from "@/assets/icons";
import { Header } from "@/components/organisms";
import { Layout } from "@/components/templates";
import { formatter } from "@/utils/utils";

export const Wallet = () => {
  return (
    <Layout>
      <div className="flex flex-col justify-start items-center h-full w-full">
        <Header title={"Carteira"} backPath={"/home"} />

        <div className="flex flex-col w-full justify-center items-start gap-5 px-4">
          <div className="flex w-full p-[10px_15px] flex-col items-start gap-[25px] rounded-[5px] bg-white shadow-[0px_4px_44px_0px_rgba(0,0,0,0.06)]">
            <h2 className="flex w-fit h-auto flex-col justify-center text-[#181D27] inter textarea-lg font-medium opacity-60">
              Saldo disponível
            </h2>

            <div>
              <p className="w-[169.177px] text-[#000] inter textarea-lg font-normal opacity-80">
                {formatter({
                  type: "pt-BR",
                  currency: "BRL",
                  style: "currency",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(1800)}{" "}
              </p>
            </div>
          </div>

          <div className="flex w-full p-[10px_8px] flex-col items-start gap-[8px] rounded-[5px] bg-white shadow-[0px_4px_44px_0px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between w-full gap-1">
              <h2 className="flex w-fit h-auto flex-col justify-center text-[#181D27] text-base font-medium">
                Métodos de pagamento
              </h2>

              <button
                type="button"
                className="btn p-0 m-0 btn-link border-none !no-underline text-[#181D27] font-[500] text-[12px] inter opacity-80"
              >
                Ver mais
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
                  <p className="flex flex-col justify-center  text-[#181D27] inter textarea-sm font-extralight leading-[19.5px]">
                    Payment
                  </p>

                  <p className="flex flex-col justify-center  text-[#181D27] inter textarea-md font-medium ">
                    Apple pay
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-1 h-[94px]  rounded-[10px] border-[0.5px] border-[#EAEAEA] bg-white p-2">
                <img
                  alt="Ícone"
                  className="w-6 h-6 absolute"
                  src={getIcons("card_credit")}
                />

                <div className="mt-auto">
                  <p className="flex flex-col justify-center  text-[#181D27] inter textarea-sm font-extralight leading-[19.5px]">
                    Visa
                  </p>

                  <p className="flex flex-col justify-center  text-[#181D27] inter textarea-md font-medium leading-[19.5px]">
                    **** 3708
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-1 h-[94px]  rounded-[10px] border-[0.5px] border-[#EAEAEA] bg-white p-2">
                <img
                  alt="Ícone"
                  className="w-6 h-6 absolute"
                  src={getIcons("card_add")}
                />

                <div className="mt-auto">
                  <p className="flex flex-col justify-center  text-[#181D27] inter textarea-sm font-extralight leading-[19.5px]">
                    Register
                  </p>

                  <p className="flex flex-col justify-center  text-[#181D27] inter textarea-md font-medium leading-[19.5px]">
                    new card
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full p-[10px_15px] flex-col items-start gap-[25px] rounded-[5px] bg-white shadow-[0px_4px_44px_0px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between w-full gap-1">
              <h2 className="flex w-fit h-auto flex-col justify-center  text-[#181D27] text-base font-medium leading-[19.5px]">
                Recent transactions
              </h2>

              <button
                type="button"
                className="btn p-0 m-0 btn-link border-none !no-underline text-[#181D27] font-[500] text-[12px] inter opacity-80"
              >
                Ver mais
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
