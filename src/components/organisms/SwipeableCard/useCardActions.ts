import { useNavigate } from "react-router-dom";

const useCardActions = () => {
  const navigate = useNavigate();

  const handleLeftAction = (id: string) => {
    navigate(`/detailsorder/${id}`)
  };

  const handleRightAction = () => {
    alert("Excluir agendamento!");
  };

  return {
    handleLeftAction,
    handleRightAction,
  };
};

export default useCardActions;
