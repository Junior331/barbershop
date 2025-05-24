import { Loading } from "./components/elements";
import { useAuthRedirect } from "./hooks/useAuthRedirect";

export const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isLoading } = useAuthRedirect();

  if (isLoading) {
    return <Loading />;
  }

  return <>{children}</>;
};
