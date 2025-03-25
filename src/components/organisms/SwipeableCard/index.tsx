import { useState } from "react";
import { motion } from "framer-motion";

import useSwipe from "./useSwipe";
import { IProps } from "./@types";
import { getIcons } from "@/assets/icons";
import { Card } from "@/components/organisms";
import useCardActions from "./useCardActions";
import { formatDateTime } from "@/utils/utils";
import { getServices } from "@/assets/services";

export const SwipeableCard = ({ item }: IProps) => {
  const [isSwipedLeft, setIsSwipedLeft] = useState(false);
  const [isSwipedRight, setIsSwipedRight] = useState(false);

  // Atualize o hook para receber o ID do pedido
  const { handleLeftAction, handleRightAction } = useCardActions();
  const { x, opacityLeft, opacityRight, handleDrag, handleDragEnd } = useSwipe({
    onLeftAction: () => handleLeftAction(item.id),
    onRightAction: handleRightAction,
    setIsSwipedLeft,
    setIsSwipedRight,
  });

  // const totalTime = item.services.reduce(
  //   (sum, service) => sum + service.time,
  //   0
  // );

  return (
    <div
      className="card-container p-[10px_2px]"
      style={{
        overflow: "hidden",
        position: "relative",
        minHeight: "min-content",
      }}
    >
      <motion.div
        className="card_edit"
        style={{
          left: 7,
          top: "50%",
          display: "flex",
          paddingLeft: 20,
          alignItems: "center",
          position: "absolute",
          opacity: opacityRight,
          zIndex: isSwipedRight ? 2 : 1,
          transform: "translateY(-50%)",
        }}
        onClick={() => handleLeftAction(item.id)}
      >
        <img src={getIcons("edit")} alt="Editar" />
      </motion.div>

      <motion.div
        style={{
          x,
          zIndex: 3,
          position: "relative",
        }}
        drag="x"
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        dragConstraints={{ left: -70, right: 70 }}
      >
          <Card
            style={{
              padding: 11.5,
              paddingLeft: 2,
              minWidth: "100%",
              minHeight: "initial",
            }}
          >
            <div className="flex items-center w-full h-full">
              <img
                src={item.services[0]?.icon || getServices("fallback")}
                alt="Serviço"
                className="w-[87px] h-[87px]"
              />
              <div className="flex flex-col justify-start items-start w-full gap-2 flex-grow pl-2">
                <p className="text-[#6B7280] inter textarea-lg font-bold leading-[150%] truncate max-w-[calc(100vw-140px)]">
                  {item.services.map((service) => service.name).join(", ")}
                </p>

                <p className="text-[#6B7280] inter textarea-lg font-[300] leading-none">
                  <strong className="font-bold textarea-lg">Hora: </strong>
                  {formatDateTime(item.date || "", "time")}
                </p>
                
                <p className="text-[#6B7280] inter textarea-lg font-[300] leading-none">
                  <strong className="font-bold textarea-lg">Dia: </strong>
                  {formatDateTime(item.date || "", "date")}
                </p>
              </div>
            </div>
          </Card>
      </motion.div>

      <motion.div
        className="card_delete"
        style={{
          right: 7,
          top: "50%",
          display: "flex",
          paddingRight: 20,
          alignItems: "center",
          position: "absolute",
          opacity: opacityLeft,
          justifyContent: "flex-end",
          zIndex: isSwipedLeft ? 2 : 1,
          transform: "translateY(-50%)",
        }}
        onClick={handleRightAction}
      >
        <img src={getIcons("trash")} alt="Excluir" />
      </motion.div>
    </div>
  );
};
