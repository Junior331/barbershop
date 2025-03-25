import { useNavigate } from "react-router-dom";

import { getImage } from "@/assets/images";
import { AccountHeaderProps } from "./@types";
import { Layout } from "@/components/templates";
import { accountItems, moreItems } from "./utils";
import { Card, Header } from "@/components/organisms";

const AccountHeader = ({
  imageSrc,
  imageAlt,
  title,
  subtitle,
  children,
}: AccountHeaderProps) => {
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="min-w-10 min-h-10 rounded-full bg-[#F4F4F4] p-1.5">
        <img src={imageSrc} alt={imageAlt} className="size-full" />
      </div>
      <div className="flex flex-col gap-1 flex-1">
        {title && (
          <h2 className="textarea-md font-medium text-[#181D27]">{title}</h2>
        )}
        {subtitle && <p className="text-[#ABABAB] textarea-sm">{subtitle}</p>}
      </div>
      <div className="w-fit">{children}</div>
    </div>
  );
};

export const Account = () => {
  const navigate = useNavigate();

  const handleAction = (path?: string) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col justify-start items-start h-full w-full">
        <Header title={"Account"} backPath={"/home"} />
        <div className="bg-[#f7f8fde8] w-screen h-screen fixed top-[180px]" />

        <div className="flex flex-col h-full w-full p-4 pt-2 overflow-y-auto z-10">
          <div className="w-full h-auto bg-transparent border-0 shadow-none p-0 mb-4">
            <Card
              style={{
                padding: 11.5,
                minWidth: "100%",
                paddingLeft: 11.5,
                minHeight: "initial",
              }}
            >
              <div className="flex items-center w-full h-full">
                <img
                  alt="Image avatar"
                  src={getImage("Jaja")}
                  className="size-[69px] rounded-[70px] border-3 object-cover border-white shadow-[0_0_14px_rgba(0,0,0,0.14)]"
                />
                <div className="flex flex-col justify-start items-start w-full flex-grow pl-2 gap-2">
                  <p className="text-[#000] inter textarea-lg font-medium leading-[150%]">
                    Jaja teste
                  </p>
                  <p className="text-[#000] inter textarea-md font-light leading-none">
                    teste@gmail.com
                  </p>
                </div>
              </div>
            </Card>
          </div>
          <div className="flex w-full p-2.5 flex-col items-start rounded-[5px] gap-[25px] bg-white shadow-[0px_4px_44px_0px_rgba(0,0,0,0.06)]">
            {accountItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleAction(item.path)}
                className="w-full hover:bg-gray-50 transition-colors py-2 pl-2 rounded"
              >
                <AccountHeader
                  title={item.title}
                  imageAlt={item.alt}
                  imageSrc={item.icon}
                  subtitle={item.subtitle}
                >
                  {typeof item.children === "string" ? (
                    <img src={item.children} alt="ícone" className="size-4" />
                  ) : (
                    item.children
                  )}
                </AccountHeader>
              </div>
            ))}
          </div>
          <h2 className="text-black my-4  inter text-[18px] tracking-[1.2px]">
            Mais
          </h2>

          <div className="flex w-full p-[10px_15px] flex-col items-start rounded-[5px] gap-[25px] bg-white shadow-[0px_4px_44px_0px_rgba(0,0,0,0.06)]">
            {moreItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleAction(item.path)}
                className="w-full hover:bg-gray-50 transition-colors"
              >
                <AccountHeader
                  title={item.title}
                  imageAlt={item.alt}
                  imageSrc={item.icon}
                  subtitle={item.subtitle}
                >
                  {typeof item.children === "string" ? (
                    <img src={item.children} alt="ícone" className="size-4" />
                  ) : (
                    item.children
                  )}
                </AccountHeader>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};
