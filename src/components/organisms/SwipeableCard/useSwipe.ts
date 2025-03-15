import { useRef } from "react";
import { useMotionValue, useTransform, animate } from "framer-motion";

import { IUseSwipeProps } from "./@types";

const useSwipe = ({ onLeftAction, onRightAction, setIsSwipedLeft, setIsSwipedRight }: IUseSwipeProps) => {
  const x = useMotionValue(0);
  const opacityLeft = useTransform(x, [-70, 0], [1, 0]);
  const opacityRight = useTransform(x, [0, 70], [0, 1]);

  const hasCalledLeftAction = useRef(false);
  const hasCalledRightAction = useRef(false);

  const handleDrag = () => {
    if (x.get() < -80 && !hasCalledLeftAction.current) {
      onRightAction();
      hasCalledLeftAction.current = true;
      hasCalledRightAction.current = false;
    } else if (x.get() > 80 && !hasCalledRightAction.current) {
      onLeftAction();
      hasCalledRightAction.current = true;
      hasCalledLeftAction.current = false;
    }
  };

  const handleDragEnd = () => {
    if (x.get() < -80) {
      setIsSwipedLeft(true);
      setIsSwipedRight(false);
    } else if (x.get() > 80) {
      setIsSwipedRight(true);
      setIsSwipedLeft(false);
    } else {
      setIsSwipedLeft(false);
      setIsSwipedRight(false);
    }

    hasCalledLeftAction.current = false;
    hasCalledRightAction.current = false;

    animate(x, 0, {
      type: "spring",
      stiffness: 500,
      damping: 30,
    });
  };

  return {
    x,
    opacityLeft,
    opacityRight,
    handleDrag,
    handleDragEnd,
  };
};

export default useSwipe;
