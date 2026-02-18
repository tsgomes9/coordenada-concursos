"use client";

import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg blur-sm opacity-20" />
        <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg">
          <GraduationCap className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
      </motion.div>

      {showText && (
        <motion.div
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col"
        >
          <span className="text-xl font-display font-bold text-gray-900 leading-tight">
            Coordenada
          </span>
          <span className="text-xs font-medium text-orange-500 -mt-1">
            CONCURSOS
          </span>
        </motion.div>
      )}
    </div>
  );
}
