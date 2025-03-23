import { useState } from "react";
import { motion } from "framer-motion";

import useSwipe from "./useSwipe";
import { IProps } from "./@types";
import { getIcons } from "@/assets/icons";
import useCardActions from "./useCardActions";
import { Card } from "@/components/organisms";
import { getServices } from "@/assets/services";
import { formatDateTime, formatter } from "@/utils/utils";

export const SwipeableCard = ({ item }: IProps) => {
  const [isSwipedLeft, setIsSwipedLeft] = useState(false);
  const [isSwipedRight, setIsSwipedRight] = useState(false);

  const { handleLeftAction, handleRightAction } = useCardActions();
  const { x, opacityLeft, opacityRight, handleDrag, handleDragEnd } = useSwipe({
    onLeftAction: handleLeftAction,
    onRightAction: handleRightAction,
    setIsSwipedLeft,
    setIsSwipedRight,
  });

  return (
    <div
      className="card-container"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "min-content",
      }}
    >
      <motion.div
        className="card_edit"
        style={{
          left: 7,
          zIndex: isSwipedRight ? 2 : 1,
          top: "50%",
          display: "flex",
          paddingLeft: 20,
          alignItems: "center",
          position: "absolute",
          opacity: opacityRight,
          transform: "translateY(-50%)",
        }}
        onClick={handleLeftAction}
      >
        <img src={getIcons("edit")} alt="Editar" />
      </motion.div>

      <motion.div
        style={{
          x,
          position: "relative",
          zIndex: 3,
        }}
        drag="x"
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        dragConstraints={{ left: -70, right: 70 }}
      >
        <div className="btn w-full h-auto bg-transparent border-0 shadow-none p-0">
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
                src={getServices("beard_hair")}
                alt="Serviço"
                className="w-[87px] h-[87px]"
              />
              <div className="flex flex-col justify-start items-start w-full gap-2 flex-grow pl-2">
                <p className="text-white inter text-[13px] font-bold leading-[150%]">
                  {item.name}
                </p>
                <p className="text-white inter text-[8px] font-[300] leading-none">
                  <strong className="font-bold text-[11px]">Price: </strong>
                  {formatter({
                    type: "pt-BR",
                    currency: "BRL",
                    style: "currency",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(item.price || 0)}{" "}
                </p>
                <p className="text-white inter text-[8px] font-[300] leading-none">
                  <strong className="font-bold text-[11px]">Time: </strong>
                  {item.time} minutes
                </p>
                <p className="text-white inter text-[8px] font-[300] leading-none">
                  <strong className="font-bold text-[11px]">Date: </strong>
                  {formatDateTime(item.date, "date")} at{" "}
                  {formatDateTime(item.date, "time")}
                </p>
                <p className="text-white inter text-[8px] font-[300] leading-none">
                  <strong className="font-bold text-[11px]">Barber: </strong>
                  {item.barber}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      <motion.div
        className="card_delete"
        style={{
          right: 7,
          zIndex: isSwipedLeft ? 2 : 1,
          top: "50%",
          display: "flex",
          paddingRight: 20,
          alignItems: "center",
          position: "absolute",
          opacity: opacityLeft,
          justifyContent: "flex-end",
          transform: "translateY(-50%)",
        }}
        onClick={handleRightAction}
      >
        <img src={getIcons("trash")} alt="Excluir" />
      </motion.div>
    </div>
  );
};
