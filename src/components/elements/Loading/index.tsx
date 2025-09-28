import { motion } from "framer-motion";
import { getIcons } from "@/assets/icons";
import { dots, dotVariants } from "./utils";

export const Loading = () => (
  <div className="flex flex-col gap-3 items-center justify-center w-screen h-screen fixed top-0 left-0 bg-[#f7f8fdcc] z-50">
    <motion.img
      className="w-32 h-40"
      src={getIcons("pole")}
      animate={{
        y: [0, -15, 0],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />

    <motion.div
      className="flex gap-1 items-end text-xl text-text leading-[12px]"
      initial="hidden"
      animate="visible"
      transition={{
        staggerChildren: 0,
      }}
    >
      LOADING
      {dots.map((item) => (
        <motion.div
          key={item.id}
          variants={dotVariants}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatDelay: 0.5,
            delay: item.delay,
            repeatType: "reverse",
          }}
          className="size-[3px] bg-[#6E6B7B] rounded-2xl"
        />
      ))}

    </motion.div>
  </div>
);