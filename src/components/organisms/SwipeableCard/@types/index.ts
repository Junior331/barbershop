import { IOrder } from "@/utils/types";

export interface IUseSwipeProps {
  onLeftAction: () => void;
  onRightAction: () => void;
  setIsSwipedLeft: (value: boolean) => void;
  setIsSwipedRight: (value: boolean) => void;
}
export interface IProps {
  item: IOrder;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
}
