"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  CheckCircle,
  Sparkles,
  Zap,
  Star,
  ArrowLeft,
  HelpCircle,
  Clock,
  Award,
  Users,
  Target,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function PlanosPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">(
    "annual",
  );

  const plans = [
    {
      id: "free",
      name: "Gratuito",
      price: 0,
      description: "Para começar sua jornada",
      features: [
        "3 concursos disponíveis",
        "10% de cada matéria",
        "Acesso limitado",
        "Suporte via e-mail",
      ],
      cta: "Começar grátis",
      popular: false,
      color: "from-gray-500 to-gray-600",
    },
    {
      id: "premium-monthly",
      name: "Premium Mensal",
      price: billingPeriod === "monthly" ? 24.9 : 19.9,
      originalPrice: billingPeriod === "annual" ? 29.9 : undefined,
      period: billingPeriod === "monthly" ? "/mês" : "/mês (anual)",
      description: "Acesso completo imediato",
      features: [
        "Todos os concursos",
        "Conteúdo 100% liberado",
        "Podcasts exclusivos",
        "Questões ilimitadas",
        "Flashcards completos",
        "Suporte prioritário 24/7",
        "Estatísticas avançadas",
        "Modo offline",
      ],
      cta: "Assinar agora",
      popular: false,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "premium-annual",
      name: "Premium Anual",
      price: billingPeriod === "annual" ? 199.9 : 249.9,
      originalPrice: billingPeriod === "annual" ? 299.9 : undefined,
      period: billingPeriod === "annual" ? "/ano" : "/ano (parcelado)",
      description: "Melhor custo-benefício",
      features: [
        "Tudo do plano mensal",
        "2 meses grátis",
        "Conteúdo exclusivo",
        "Acesso antecipado",
        "Descontos em eventos",
        "Mentoria mensal em grupo",
        "Certificado de conclusão",
        "Prioridade em novas features",
      ],
      cta: "Assinar agora",
      popular: true,
      savings: "Economize R$ 98,90",
      color: "from-orange-500 to-orange-600",
    },
  ];

  const faqs = [
    {
      question: "Posso cancelar quando quiser?",
      answer:
        "Sim! Você pode cancelar sua assinatura a qualquer momento. Se cancelar, ainda terá acesso até o final do período já pago.",
    },
    {
      question: "Como funciona o período de teste?",
      answer:
        "Oferecemos 7 dias grátis para você testar todos os recursos da plataforma, sem compromisso e sem precisar cadastrar cartão.",
    },
    {
      question: "O conteúdo é atualizado com frequência?",
      answer:
        "Sim! Nossa equipe está sempre atualizando o conteúdo conforme novos editais são lançados e leis são alteradas.",
    },
    {
      question: "Posso estudar em mais de um dispositivo?",
      answer:
        "Com os planos Premium, você pode acessar sua conta em quantos dispositivos quiser, inclusive simultaneamente.",
    },
  ];

  const comparisonFeatures = [
    {
      feature: "Concursos disponíveis",
      free: "3",
      premium: "Todos",
    },
    {
      feature: "Conteúdo liberado",
      free: "10%",
      premium: "100%",
    },
    {
      feature: "Questões",
      free: "Limitado",
      premium: "Ilimitado",
    },
    {
      feature: "Podcasts",
      free: "Amostras",
      premium: "Completo",
    },
    {
      feature: "Flashcards",
      free: "Básico",
      premium: "Avançado",
    },
    {
      feature: "Suporte",
      free: "E-mail",
      premium: "Prioritário 24/7",
    },
    {
      feature: "Estatísticas",
      free: "❌",
      premium: "✅",
    },
    {
      feature: "Modo offline",
      free: "❌",
      premium: "✅",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white">
      {/* Header simples */}

      {/* Hero da página */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full mb-6"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Invista no seu futuro</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-6xl font-black text-gray-900 mb-4"
        >
          Escolha seu plano
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-600 max-w-2xl mx-auto mb-8"
        >
          Comece grátis por 7 dias e descubra como estudar de verdade
        </motion.p>

        {/* Toggle de período */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-3 p-1 bg-white border border-gray-200 rounded-2xl shadow-sm mb-12"
        >
          <button
            onClick={() => setBillingPeriod("monthly")}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              billingPeriod === "monthly"
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                : "text-gray-600 hover:text-orange-600"
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setBillingPeriod("annual")}
            className={`px-6 py-3 rounded-xl font-medium transition-all relative ${
              billingPeriod === "annual"
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                : "text-gray-600 hover:text-orange-600"
            }`}
          >
            Anual
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
              -33%
            </span>
          </button>
        </motion.div>
      </div>

      {/* Grid de planos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid lg:grid-cols-3 gap-8 items-center">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className={`relative bg-white rounded-2xl ${
                index === 1 // Premium Mensal (plano do meio)
                  ? "border-2 border-orange-500 shadow-2xl scale-105 lg:scale-110 z-10"
                  : "border border-gray-200 shadow-lg hover:shadow-xl"
              } transition-all duration-300`}
            >
              {/* Badge de popular - SÓ PARA O PLANO DO MEIO */}
              {index === 1 && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                  Mais escolhido
                </div>
              )}

              {/* Badge de economia - só para o plano anual */}
              {plan.savings && index === 2 && (
                <div className="absolute top-4 right-4 bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">
                  {plan.savings}
                </div>
              )}

              <div className="p-8">
                {/* Cabeçalho */}
                <div className="mb-6">
                  <h3 className="text-2xl font-black text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </div>

                {/* Preço */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-gray-900">
                      R$ {plan.price.toFixed(2)}
                    </span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-400 line-through">
                        R$ {plan.originalPrice.toFixed(2)}
                      </span>
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                        Preço promocional
                      </span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href="/cadastro">
                  <Button
                    className={`w-full ${
                      index === 1 // Premium Mensal (plano do meio)
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25"
                        : plan.id === "free"
                          ? "bg-gray-900 hover:bg-gray-800 text-white"
                          : "bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-50"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>

                {/* Garantia */}
                {plan.id !== "free" && (
                  <p className="text-xs text-gray-400 text-center mt-4">
                    ✅ 7 dias grátis • Cancele quando quiser
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabela comparativa */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-24"
        >
          <h2 className="text-3xl font-black text-gray-900 text-center mb-8">
            Compare os planos
          </h2>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-gray-600 font-medium">
                    Recursos
                  </th>
                  <th className="text-center py-4 px-6 text-gray-600 font-medium">
                    Gratuito
                  </th>
                  <th className="text-center py-4 px-6 text-orange-600 font-medium">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="py-4 px-6 text-gray-700">{item.feature}</td>
                    <td className="text-center py-4 px-6 text-gray-600">
                      {item.free}
                    </td>
                    <td className="text-center py-4 px-6 text-orange-600 font-medium">
                      {item.premium}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-24"
        >
          <h2 className="text-3xl font-black text-gray-900 text-center mb-4">
            Perguntas frequentes
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Tire suas dúvidas sobre nossos planos e assinaturas
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.05 }}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 text-sm">{faq.answer}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA final */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-24 text-center bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-12 shadow-2xl"
        >
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Ainda em dúvida?
          </h2>
          <p className="text-orange-100 text-lg mb-8 max-w-2xl mx-auto">
            Comece com 7 dias grátis, sem compromisso. Descubra por que mais de
            1000 alunos já estão estudando com a gente.
          </p>
          <Link href="/cadastro">
            <Button className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-4 text-lg shadow-xl">
              Quero experimentar grátis
            </Button>
          </Link>
          <p className="text-orange-100 text-sm mt-4">
            ✅ Sem taxas escondidas • ✅ Cancele quando quiser • ✅ Suporte 24/7
          </p>
        </motion.div>
      </div>
    </div>
  );
}
