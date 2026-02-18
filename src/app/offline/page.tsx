"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/LogoCoordenada";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <Logo className="justify-center mb-8" />

        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-12 h-12 text-orange-500" />
        </div>

        <h1 className="font-display text-3xl font-bold text-gray-900 mb-3">
          Sem conexão com internet
        </h1>

        <p className="text-gray-600 mb-8">
          Parece que você está offline. Alguns recursos podem não estar
          disponíveis, mas você ainda pode acessar conteúdos já carregados.
        </p>

        <Button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar reconectar
        </Button>
      </motion.div>
    </div>
  );
}
