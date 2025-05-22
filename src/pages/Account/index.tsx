import { useNavigate } from "react-router-dom";

import { Avatar } from "@/components/elements";
import { Layout } from "@/components/templates";
import { useAuth } from "@/context/AuthContext";
import { AccountHeader } from "./AccountHeader";
import { Card, Header } from "@/components/organisms";
import { getAccountItems, getMoreItems } from "./utils";

export const Account = () => {
  const navigate = useNavigate();
  const moreItems = getMoreItems();
  const { user, setAuth } = useAuth();
  const accountItems = getAccountItems({ setAuth, navigate });

  const handleAction = (item: ReturnType<typeof getAccountItems>[0]) => {
    if (item.handleAction) {
      item.handleAction();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col justify-start items-start h-full w-full">
        <Header title="Perfil" backPath="/" />
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
                <Avatar />
                <div className="flex flex-col justify-start items-start w-full flex-grow pl-2 gap-2">
                  <p className="text-[#000] inter textarea-lg font-medium leading-[150%]">
                    {user?.user_metadata.name}
                  </p>
                  <p className="text-[#000] inter textarea-md font-light leading-none">
                    {user?.email}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex w-full p-2.5 px-1.5 flex-col items-start rounded-[5px] gap-[25px] bg-white shadow-[0px_4px_44px_0px_rgba(0,0,0,0.06)]">
            {accountItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleAction(item)}
                className="w-full hover:bg-gray-50 transition-colors py-2 px-2 rounded cursor-pointer"
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

          <h2 className="text-black my-4 inter text-[18px] tracking-[1.2px]">
            Mais
          </h2>

          <div className="flex w-full p-2.5 px-1.5 flex-col items-start rounded-[5px] gap-[25px] bg-white shadow-[0px_4px_44px_0px_rgba(0,0,0,0.06)]">
            {moreItems.map((item) => (
              <div
                key={item.id}
                onClick={() => item.path && navigate(item.path)}
                className="w-full hover:bg-gray-50 transition-colors py-2 px-2 rounded cursor-pointer"
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
