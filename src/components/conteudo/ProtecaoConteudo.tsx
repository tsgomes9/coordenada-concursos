"use client";

import { useAcesso } from "@/lib/hooks/useAcesso";
import { Lock, Sparkles, Crown, Calendar } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect } from "react";

interface ProtecaoConteudoProps {
  children: React.ReactNode;
  isPreview?: boolean;
  previewContent?: React.ReactNode;
}

export function ProtecaoConteudo({
  children,
  isPreview = false,
  previewContent,
}: ProtecaoConteudoProps) {
  const { nivelAcesso, loading } = useAcesso();

  // 🔥 LOG DETALHADO
  useEffect(() => {
    console.log("🔍 ===== DEBUG PROTEÇÃO =====");
    console.log("📦 isPreview (prop):", isPreview);
    console.log("👤 nívelAcesso:", nivelAcesso);
    console.log("⏳ loading:", loading);
    console.log("🔓 podeAcessarConteudo:", nivelAcesso.podeAcessarConteudo);
    console.log("📊 status:", nivelAcesso.status);
    console.log("=========================");
  }, [isPreview, nivelAcesso, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500" />
      </div>
    );
  }

  // Se o conteúdo é preview, libera sempre
  if (isPreview) {
    console.log("✅ É PREVIEW - liberando conteúdo");
    return <>{previewContent || children}</>;
  }

  // Se não tem acesso
  if (!nivelAcesso.podeAcessarConteudo) {
    console.log("❌ NÃO TEM ACESSO - mostrando bloqueio");
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
      >
        {/* Header do bloqueio */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg">
                Conteúdo exclusivo
              </h3>
              <p className="text-orange-100 text-sm">
                Assinantes têm acesso completo
              </p>
            </div>
          </div>
        </div>

        {/* Corpo */}
        <div className="p-6">
          {/* Preview do conteúdo (10%) */}
          {previewContent && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">
                  Prévia gratuita
                </span>
              </div>
              <div className="opacity-60 relative">
                {previewContent}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white pointer-events-none" />
              </div>
            </div>
          )}

          {/* Status da assinatura */}
          {nivelAcesso.status === "trial" && nivelAcesso.diasRestantes ? (
            <div className="bg-blue-50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Período de teste</span>
              </div>
              <p className="text-sm text-blue-600 mb-2">
                Você tem {nivelAcesso.diasRestantes} dias restantes no seu
                trial.
              </p>
              <Link
                href="/planos"
                className="text-sm text-blue-700 font-medium hover:underline"
              >
                Garanta seu acesso vitalício →
              </Link>
            </div>
          ) : nivelAcesso.status === "expired" ? (
            <div className="bg-red-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-red-600 mb-2">
                Sua assinatura expirou.
              </p>
              <Link
                href="/planos"
                className="text-sm text-red-700 font-medium hover:underline"
              >
                Renovar assinatura →
              </Link>
            </div>
          ) : null}

          {/* Call to Action */}
          <div className="text-center">
            <Lock className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-1">
              Conteúdo bloqueado
            </h4>
            <p className="text-sm text-gray-500 mb-4">
              Assine um plano para ter acesso a todo conteúdo
            </p>
            <Link
              href="/planos"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition"
            >
              <Crown className="w-4 h-4" />
              Ver planos
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  // Tem acesso total
  console.log("✅ TEM ACESSO - mostrando conteúdo completo");
  return <>{children}</>;
}
