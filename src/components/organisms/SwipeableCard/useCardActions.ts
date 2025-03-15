const useCardActions = () => {
  const handleLeftAction = () => {
    alert("Editar agendamento!");
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
