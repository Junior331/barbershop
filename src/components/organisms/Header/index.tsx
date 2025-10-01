import { useNavigate } from "react-router-dom";
import { getIcons } from "@/assets/icons";

type HeaderProps = {
  title: string;
  backPath?: string;
};

export const Header = ({ title, backPath }: HeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1); // Volta para a página anterior
    }
  };

  return (
    <header className="flex w-full items-center gap-4 p-4">
      <button
        onClick={handleBack}
        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
        type="button"
      >
        <img
          src={getIcons("arrow_circle_left")}
          alt="Voltar"
          className="w-6 h-6"
        />
      </button>
      <h2 className="flex-1 text-center text-[#000] text-[20px] font-medium inter">{title}</h2>
      <div className="w-10 h-10"></div>
    </header>
  );
};
