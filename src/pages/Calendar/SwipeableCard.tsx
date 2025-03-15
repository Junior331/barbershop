import React, { useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Card } from "@/components/organisms";
import { getServices } from "@/assets/services";
import { formatDateTime, formatter } from "@/utils/utils";
import { generateRandomDate } from "@/services/mocks/orders";
import { getIcons } from "@/assets/icons";

const SwipeableCard = () => {
  const [isSwipedLeft, setIsSwipedLeft] = useState(false);
  const [isSwipedRight, setIsSwipedRight] = useState(false);

  const x = useMotionValue(0);
  const opacityLeft = useTransform(x, [-70, 0], [1, 0]);
  const opacityRight = useTransform(x, [0, 70], [0, 1]);

  const handleDragEnd = () => {
    if (x.get() < -70) {
      setIsSwipedLeft(true);
      setIsSwipedRight(false);
    } else if (x.get() > 70) {
      setIsSwipedRight(true);
      setIsSwipedLeft(false);
    } else {
      setIsSwipedLeft(false);
      setIsSwipedRight(false);
    }
    x.set(0);
  };

  const handleLeftAction = () => {
    alert("Ação da esquerda executada!");
  };

  const handleRightAction = () => {
    alert("Ação da direita executada!");
  };

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
          zIndex: 4,
          top: "50%",
          display: "flex",
          paddingLeft: 20,
          alignItems: "center",
          position: "absolute",
          opacity: opacityRight,
          transform: "translateY(-50%)",
        }}
        onClick={() => handleLeftAction()}
      >
        <img src={getIcons("edit")} alt="" />
      </motion.div>

      <motion.div
        style={{
          x,
          position: "relative",
          zIndex: 10,
        }}
        drag="x"
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
                alt={`Service`}
                className="w-[87px] h-[87px]"
              />
              <div className="flex flex-col justify-start items-start w-full gap-2 flex-grow pl-2">
                <p className="text-white font-inter text-[13px] font-bold leading-[150%]">
                  Beard & hair
                </p>
                <p className="text-white inter text-[8px] font-[300] leading-none">
                  <strong className="font-bold text-[11px]">Price: </strong>
                  {formatter({
                    type: "pt-BR",
                    currency: "BRL",
                    style: "currency",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(40)}{" "}
                </p>
                <p className="text-white inter text-[8px] font-[300] leading-none">
                  <strong className="font-bold text-[11px]">Time: </strong>
                  40 minutes
                </p>
                <p className="text-white inter text-[8px] font-[300] leading-none">
                  <strong className="font-bold text-[11px]">Date: </strong>
                  {formatDateTime(
                    generateRandomDate("2025-03-16"),
                    "date"
                  )} at{" "}
                  {formatDateTime(generateRandomDate("2025-03-16"), "time")}
                </p>
                <p className="text-white inter text-[8px] font-[300] leading-none">
                  <strong className="font-bold text-[11px]">Barber: </strong>
                  Breno Tavares
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
          zIndex: 4,
          top: "50%",
          display: "flex",
          paddingRight: 20,
          alignItems: "center",
          position: "absolute",
          opacity: opacityLeft,
          justifyContent: "flex-end",
          transform: "translateY(-50%)",
        }}
        onClick={() => handleRightAction()}
      >
        <img src={getIcons("trash")} alt="" />
      </motion.div>
    </div>
  );
};

export default SwipeableCard;
