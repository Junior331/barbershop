import { Header } from "@/components/organisms";
import { Layout } from "@/components/templates";

export const Profile = () => {
  return (
    <Layout>
      <div className="flex flex-col justify-start items-center h-full w-full">
        <Header title={"Account"} backPath={"/home"} />
      </div>
    </Layout>
  );
};
