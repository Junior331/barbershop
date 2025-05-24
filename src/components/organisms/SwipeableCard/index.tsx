import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import useSwipe from "./useSwipe";
import { IProps } from "./@types";
import { getIcons } from "@/assets/icons";
import { Card } from "@/components/organisms";
import { getServices } from "@/assets/services";
import { formatCustomDateTime, formatter } from "@/utils/utils";
import { CircleIcon, StatusBadge, Text, Title } from "@/components/elements";

export const SwipeableCard = ({ item, onDelete }: IProps) => {
  const navigate = useNavigate();
  const [isSwipedLeft, setIsSwipedLeft] = useState(false);
  const [isSwipedRight, setIsSwipedRight] = useState(false);

  const { x, opacityLeft, opacityRight, handleDrag, handleDragEnd } = useSwipe({
    onLeftAction: () => navigate(`/detailsorder/${item.id}`),
    onRightAction: () => onDelete(item.id),
    setIsSwipedLeft,
    setIsSwipedRight,
  });

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
          padding: 21.5,
          minHeight: 130,
          display: "flex",
          paddingLeft: 20,
          alignItems: "center",
          position: "absolute",
          opacity: opacityRight,
          zIndex: isSwipedRight ? 2 : 1,
          transform: "translateY(-50%)",
        }}
        onClick={() => navigate(`/detailsorder/${item.id}`)}
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
            padding: 21.5,
            paddingLeft: 2,
            minWidth: "100%",
            
          }}
        >
          <div className="flex items-center w-full h-full">
            <CircleIcon className="min-w-[87px] h-[87px] my-auto overflow-hidden">
              <img
                alt={`Service ${item.services[0]?.name}`}
                src={item.services[0]?.icon || getServices("fallback")}
                className="w-[calc(100%-25px)] h-[calc(100%-25px)] object-cover"
              />
            </CircleIcon>

            <div className="flex flex-col justify-start items-start w-full gap-2 flex-grow pl-2 relative">
              <Title className="font-bold leading-[150%] truncate max-w-[calc(100vw-32px)]">
                {item.services.map((s) => s.name).join(", ")}
              </Title>
              <Text className="font-[300] leading-none">
                <strong className="font-bold text-[#111827]">Data: </strong>

                {formatCustomDateTime(item.date || "")}
              </Text>
              <Text className="font-[300] leading-none">
                <strong className="font-bold text-[#111827]">Barber: </strong>
                {item.barber.name}
              </Text>
            </div>

            <div className="flex flex-col items-center gap-[5px] absolute bottom-5 right-5">
              <Title className="textarea-md font-[300] ">
                {formatter({
                  type: "pt-BR",
                  currency: "BRL",
                  style: "currency",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(item.total_price || 0)}
              </Title>
            </div>

            <StatusBadge
              variant="outline"
              status={item.status}
              className="capitalize p-2.5 absolute top-5 right-5"
            />
          </div>
        </Card>
      </motion.div>

      <motion.div
        className="card_delete"
        style={{
          right: 7,
          top: "50%",
          minHeight: 130,
          display: "flex",
          paddingRight: 20,
          alignItems: "center",
          position: "absolute",
          opacity: opacityLeft,
          justifyContent: "flex-end",
          zIndex: isSwipedLeft ? 2 : 1,
          transform: "translateY(-50%)",
        }}
        onClick={() => onDelete(item.id)}
      >
        <img src={getIcons("trash")} alt="Excluir" />
      </motion.div>
    </div>
  );
};
