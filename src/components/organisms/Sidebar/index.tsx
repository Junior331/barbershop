import { useNavigate, useLocation } from "react-router-dom";
import { routes } from "./utils";

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="flex items-center justify-center w-full fixed bottom-0 left-0 right-0">
      <nav className="flex w-[414px] h-[76px] shrink-0 rounded-tl-[12px] rounded-tr-[12px] rounded-bl-0 rounded-br-0 border border-[#F3F4F6] bg-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.10),0px_4px_6px_0px_rgba(0,0,0,0.05)]">
        <ul className="flex items-center justify-between px-10 w-full h-full">
          {routes.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <li
                key={item.path}
                className="cursor-pointer"
                onClick={() => navigate(item.path)}
              >
                <img
                  alt={`Icon ${item.name}`}
                  src={isActive ? item.icon_active : item.icon}
                />
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
