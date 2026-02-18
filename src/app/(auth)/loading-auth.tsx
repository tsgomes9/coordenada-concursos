"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/LogoCoordenada";

export default function LoadingAuth() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="text-center">
        <Logo className="justify-center mb-8" />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full mx-auto mb-6"
        />

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-display text-xl font-medium text-gray-700 mb-2"
        >
          Completando seu login...
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-sm text-gray-500"
        >
          Você será redirecionado em instantes
        </motion.p>

        {/* Cards animados de fundo */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -20, 0],
                x: [0, i % 2 === 0 ? 10 : -10, 0],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 5 + i,
                repeat: Infinity,
                delay: i * 0.5,
              }}
              className={`absolute ${
                i === 1
                  ? "top-20 left-20"
                  : i === 2
                    ? "bottom-20 right-20"
                    : "top-1/2 right-32"
              }`}
            >
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full text-sm">
                {i === 1
                  ? "Polícia Federal"
                  : i === 2
                    ? "INSS"
                    : "Banco do Brasil"}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
