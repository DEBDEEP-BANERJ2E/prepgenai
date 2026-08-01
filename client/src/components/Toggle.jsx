import React, { useEffect, useState } from "react";
import { motion } from "motion/react";

export function Toggle({ label, checked, onChange }) {
  return (
    <div
      className="flex items-center gap-4 cursor-pointer select-none"
      onClick={onChange}
    >
      <motion.div
        animate={{
          backgroundColor: checked
            ? "rgba(34,197,94,0.35)" // green when ON
            : "rgba(255,255,255,0.15)", // gray when OFF
        }}
        transition={{ duration: 0.25 }}
        className="relative w-12 h-6 rounded-full
          border border-white/20
          backdrop-blur-lg"
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className=" absolute top-0.5
            h-5 w-5 rounded-full
            bg-white
            shadow-[0_5px_15px_rgba(0,0,0,0.5)]"
          style={{
            left: checked ? "1.6rem" : "0.25rem",
          }}
        ></motion.div>
      </motion.div>

      <span
        className={`text-sm transition-colors ${
          checked ? "text-green-300" : "text-gray-300"
        }`}
      >
        {label}
      </span>
    </div>
  );
}