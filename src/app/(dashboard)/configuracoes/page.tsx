"use client";

import { motion } from "framer-motion";
import { Construction, Settings, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ConfiguracoesPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md mx-auto px-4"
      >
        {/* Ícone animado */}
        <motion.div
          animate={{
            rotate: [0, 10, -10, 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
          className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-orange-500/25"
        >
          <Settings className="w-12 h-12 text-white" />
        </motion.div>

        {/* Título */}
        <h1 className="text-3xl font-black text-gray-900 mb-3">
          Configurações
        </h1>

        {/* Subtítulo */}
        <p className="text-gray-500 mb-8">
          Estamos preparando um espaço incrível para você personalizar sua
          experiência. Em breve você poderá ajustar tudo por aqui!
        </p>

        {/* Barra de progresso animada */}
        <div className="w-full h-2 bg-gray-100 rounded-full mb-8 overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "70%" }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
          />
        </div>

        {/* Status */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full mb-8">
          <Construction className="w-4 h-4 text-orange-600" />
          <span className="text-sm font-medium text-orange-600">
            Em construção • 70% concluído
          </span>
        </div>

        {/* Botão voltar */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm hover:shadow-md group"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:-translate-x-1 transition-transform" />
          <span className="text-gray-700 font-medium">
            Voltar para o dashboard
          </span>
        </Link>

        {/* Preview das funcionalidades */}
        <div className="mt-12 grid grid-cols-2 gap-3 text-left">
          <div className="p-3 bg-gray-50 rounded-xl">
            <div className="w-2 h-2 bg-green-500 rounded-full mb-2" />
            <p className="text-xs font-medium text-gray-900">Perfil</p>
            <p className="text-xs text-gray-500">Em breve</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl opacity-50">
            <div className="w-2 h-2 bg-gray-300 rounded-full mb-2" />
            <p className="text-xs font-medium text-gray-900">Notificações</p>
            <p className="text-xs text-gray-500">Em breve</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl opacity-50">
            <div className="w-2 h-2 bg-gray-300 rounded-full mb-2" />
            <p className="text-xs font-medium text-gray-900">Preferências</p>
            <p className="text-xs text-gray-500">Em breve</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl opacity-50">
            <div className="w-2 h-2 bg-gray-300 rounded-full mb-2" />
            <p className="text-xs font-medium text-gray-900">Assinatura</p>
            <p className="text-xs text-gray-500">Em breve</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
