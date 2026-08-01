import React from 'react'
import { motion } from "motion/react";

function Features({icon, title, des}) {
  return (
    <motion.div 
        whileHover={{ y: -12, rotateX: 8, rotateY: -8, scale: 1.05 }}
       transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className='relative rounded-2xl p-6
        bg-gradient-to-br from-black/90 via-black/80 to-black/90
        backdrop-blur-2xl
        border border-white/10
        shadow-[0_30px_80px_rgba(0,0,0,0.7)]
        text-white'
         style={{ transformStyle: "preserve-3d" }}
        >
         
            <div className='relative z-10' style={{ transform: "translateZ(30px)" }}>
                 <div className="text-4xl mb-3">{icon}</div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-300 text-sm leading-relaxed">{des}</p>

            </div>
          


        </motion.div>
  )
}

export default Features
