/* eslint-disable @typescript-eslint/no-explicit-any */
import { Key, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import useSwipe from "./useSwipe";
import { IProps } from "./@types";
import { getIcons } from "@/assets/icons";
import { Card } from "@/components/organisms";
import { formatCustomDateTime, formatter } from "@/utils/utils";
import { CircleIcon, StatusBadge, Text, Title } from "@/components/elements";
import { StatusType } from "@/components/elements/StatusBadge/@types";
import { getServices } from "@/assets/services";

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
          minHeight: 228,
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
            minWidth: "100%",
          }}
        >
          <div className="flex flex-col items-center w-full h-full">
            <ServiceIcons services={item.services} />

            <div className="flex flex-col justify-start items-start w-full flex-grow pl-2 relative">
              <Title className="flex items-center gap-1 max-w-full">
                Serviços:
                <Text className="truncate">
                  {item.services.map((s) => s.service_name).join(", ")}
                </Text>
              </Title>
              <Title className="flex items-center gap-1 max-w-full">
                Data:
                <Text className="truncate">
                  {formatCustomDateTime(new Date(item.start_time))}
                </Text>
              </Title>
              <Title className="flex items-center gap-1 max-w-full">
                Barber:
                <Text className="truncate">{item.barber.name}</Text>
              </Title>
            </div>

            <div className="flex flex-col items-center gap-[5px] absolute bottom-5 right-5">
              <Title className="textarea-md font-[300] ">
                {formatter({
                  type: "pt-BR",
                  currency: "BRL",
                  style: "currency",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(item.services.reduce((sum, service) => sum + service.service_price, 0) || 0)}
              </Title>
            </div>

            <StatusBadge
              variant="outline"
              status={item.status as StatusType}
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
          minHeight: 228,
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

export const ServiceIcons = ({ services }: { services: any }) => {
  const displayedServices = services.slice(0, 6);
  const remainingServicesCount = services.length - displayedServices.length;

  return (
    <div className="flex items-center w-full mb-2">
      {displayedServices.map((service: any, index: Key | null | undefined) => (
        <div key={index} className="-ml-4 first:ml-0">
          <CircleIcon className="w-24 h-24 border-2 border-white">
            <img
              alt={`Service ${service.service_name}`}
              src={service.service_icon || getServices("fallback")}
              className="w-[calc(100%-15px)] h-[calc(100%-15px)] object-cover"
            />
          </CircleIcon>
        </div>
      ))}
      {remainingServicesCount > 0 && (
        <div className="-ml-4">
          <CircleIcon className="w-24 h-24 bg-orange-500 flex items-center justify-center border-2 border-white text-white font-bold">
            +{remainingServicesCount}
          </CircleIcon>
        </div>
      )}
    </div>
  );
};
