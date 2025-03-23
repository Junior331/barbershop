import { Order } from "@/utils/types";

export interface IUseSwipeProps {
  onLeftAction: () => void;
  onRightAction: () => void;
  setIsSwipedLeft: (value: boolean) => void;
  setIsSwipedRight: (value: boolean) => void;
}
export interface IProps {
  item: Order;
}
