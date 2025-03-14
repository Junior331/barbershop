import { Link } from "react-router-dom";
import { getIcons } from "@/assets/icons";

type HeaderProps = {
  title: string;
  backPath: string;
};

export const Header = ({ title, backPath }: HeaderProps) => {
  return (
    <header className="flex w-full items-center gap-4 p-4">
      <Link
        to={backPath}
        className=""
      >
        <img src={getIcons("arrow_circle_left")} alt="Icon arrow circle left" />
      </Link>
      <h2 className="mx-auto my-0 text-[#000] text-[20px] inter">{title}</h2>
    </header>
  );
};
