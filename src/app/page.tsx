"use client";

import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { AnimatedSection } from "@/components/AnimatedSection";
import { ParticlesBackground } from "@/components/Particles";
import { Logo } from "@/components/LogoCoordenada";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Headphones,
  Zap,
  Award,
  TrendingUp,
  Users,
  Target,
  CheckCircle,
  Star,
  ChevronRight,
  Sparkles,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const headerScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.98]);

  const features = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Conteúdo em Texto Premium",
      description:
        "Material completo e organizado para cada concurso, com destaques e resumos inteligentes",
      color: "from-orange-500 to-orange-600",
      stats: "+500 aulas",
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: "Podcasts Exclusivos",
      description:
        "Estude onde estiver com áudios dos principais tópicos. Perfeito para revisões",
      color: "from-orange-400 to-orange-500",
      stats: "+200 horas",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Questões Interativas",
      description:
        "Teste seus conhecimentos com simulados personalizados e correção comentada",
      color: "from-orange-500 to-orange-600",
      stats: "+5000 questões",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Cards de Memorização",
      description:
        "Revise os pontos mais importantes com flashcards baseados em ciência do aprendizado",
      color: "from-orange-400 to-orange-500",
      stats: "98% de retenção",
    },
  ];

  const stats = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      value: "50+",
      label: "Concursos",
      suffix: "disponíveis",
    },
    {
      icon: <Users className="w-8 h-8" />,
      value: "1000+",
      label: "Alunos",
      suffix: "aprovados",
    },
    {
      icon: <Target className="w-8 h-8" />,
      value: "92%",
      label: "Aprovação",
      suffix: "nos simulados",
    },
  ];

  const testimonials = [
    {
      name: "Ana Silva",
      role: "Aprovada - TRF 1ª Região",
      content:
        "A plataforma mudou completamente minha forma de estudar. Os podcasts são incríveis para revisões!",
      rating: 5,
      image: "/testimonials/ana.jpg",
    },
    {
      name: "Carlos Santos",
      role: "Aprovado - Polícia Federal",
      content:
        "Conteúdo de altíssima qualidade. As questões comentadas fizeram toda diferença na minha preparação.",
      rating: 5,
      image: "/testimonials/carlos.jpg",
    },
    {
      name: "Mariana Costa",
      role: "Aprovada - SEFAZ SP",
      content:
        "Finalmente uma plataforma que entende como a gente estuda. Interface linda e conteúdo impecável!",
      rating: 5,
      image: "/testimonials/mariana.jpg",
    },
  ];

  const plans = [
    {
      name: "Gratuito",
      price: "0",
      period: "",
      description: "Para começar sua jornada",
      features: [
        "3 concursos disponíveis",
        "10% de cada matéria",
        "Acesso limitado",
        "Suporte básico",
      ],
      cta: "Começar grátis",
      popular: false,
    },
    {
      name: "Premium Mensal",
      price: "24,90",
      period: "/mês",
      description: "Acesso completo imediato",
      features: [
        "Todos os concursos",
        "Conteúdo 100% liberado",
        "Podcasts exclusivos",
        "Questões ilimitadas",
        "Flashcards completos",
        "Suporte prioritário",
      ],
      cta: "Assinar agora",
      popular: true,
    },
    {
      name: "Premium Anual",
      price: "199,90",
      period: "/ano",
      description: "Melhor custo-benefício",
      features: [
        "Tudo do plano mensal",
        "2 meses grátis",
        "Conteúdo exclusivo",
        "Acesso antecipado",
        "Descontos em eventos",
        "Mentoria mensal",
      ],
      cta: "Assinar agora",
      popular: false,
      savings: "Economize R$ 98,90",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Partículas de fundo */}
      <ParticlesBackground />

      {/* Header com efeito de vidro */}
      <motion.header
        style={{ opacity: headerOpacity, scale: headerScale }}
        className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-orange-100/50"
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Logo />

            {/* Menu Desktop */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="hidden md:flex items-center gap-8"
            >
              <Link
                href="#como-funciona"
                className="text-gray-600 hover:text-orange-500 transition font-medium"
              >
                Como funciona
              </Link>
              <Link
                href="#concursos"
                className="text-gray-600 hover:text-orange-500 transition font-medium"
              >
                Concursos
              </Link>
              <Link
                href="#planos"
                className="text-gray-600 hover:text-orange-500 transition font-medium"
              >
                Planos
              </Link>
              <Link
                href="#depoimentos"
                className="text-gray-600 hover:text-orange-500 transition font-medium"
              >
                Depoimentos
              </Link>
            </motion.div>

            {/* Botões Desktop */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="hidden md:flex items-center gap-4"
            >
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:text-orange-600"
                >
                  Entrar
                </Button>
              </Link>
              <Link href="/cadastro">
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25">
                  Começar grátis
                </Button>
              </Link>
            </motion.div>

            {/* Menu Mobile Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-orange-50 transition"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Menu Mobile */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t border-orange-100"
            >
              <div className="flex flex-col gap-4">
                <Link
                  href="#como-funciona"
                  className="text-gray-600 hover:text-orange-500 transition font-medium py-2"
                >
                  Como funciona
                </Link>
                <Link
                  href="#concursos"
                  className="text-gray-600 hover:text-orange-500 transition font-medium py-2"
                >
                  Concursos
                </Link>
                <Link
                  href="#planos"
                  className="text-gray-600 hover:text-orange-500 transition font-medium py-2"
                >
                  Planos
                </Link>
                <Link
                  href="#depoimentos"
                  className="text-gray-600 hover:text-orange-500 transition font-medium py-2"
                >
                  Depoimentos
                </Link>
                <div className="flex flex-col gap-2 pt-2">
                  <Link href="/login">
                    <Button variant="outline" className="w-full">
                      Entrar
                    </Button>
                  </Link>
                  <Link href="/cadastro">
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 ">
                      Começar grátis
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </nav>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Conteúdo da esquerda */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Plataforma #1 em aprovações
                </span>
              </div>

              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
                Sua aprovação
                <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent block">
                  começa aqui
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 max-w-lg">
                Estude para concursos públicos com conteúdo em texto, áudio e
                exercícios interativos. Tudo em um só lugar, do seu jeito, no
                seu ritmo.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 mb-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="p-3 bg-orange-50 rounded-xl text-orange-500">
                      {stat.icon}
                    </div>
                    <div>
                      <div className="font-display text-2xl font-bold text-gray-900">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTAs - MESMO TAMANHO */}
              <div className="flex flex-wrap gap-4">
                <Link href="/cadastro">
                  <Button
                    size="lg"
                    variant="primary"
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25 group min-w-[180px]"
                  >
                    Começar grátis
                  </Button>
                </Link>
                <Link href="#como-funciona">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-orange-200 text-gray-700 hover:bg-orange-50 min-w-[180px] h-[50px]" // 🔥 Força mesma altura
                  >
                    Como funciona
                  </Button>
                </Link>
              </div>

              <p className="mt-6 text-sm text-gray-500 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-orange-500" />7 dias grátis
                • Cancele quando quiser • Acesso a todo conteúdo
              </p>
            </motion.div>

            {/* Imagem/Ilustração da direita - SEM ANIMAÇÕES */}
            <div className="relative hidden lg:block">
              <div className="relative w-full h-[600px]">
                {/* Cards estáticos */}
                <div className="absolute top-20 right-0 bg-white rounded-2xl shadow-2xl p-6 w-64">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <div className="font-display font-bold">
                        Direito Constitucional
                      </div>
                      <div className="text-sm text-gray-500">
                        32 aulas disponíveis
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div className="bg-orange-500 h-2 rounded-full w-3/4" />
                  </div>
                  <span className="text-sm text-gray-600">75% concluído</span>
                </div>

                <div className="absolute bottom-20 left-0 bg-white rounded-2xl shadow-2xl p-6 w-72">
                  <div className="flex items-center gap-2 mb-3">
                    <Headphones className="w-5 h-5 text-orange-500" />
                    <span className="font-display font-semibold">
                      Podcast: Revisão Rápida
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Zap className="w-4 h-4" />
                    Tocando agora • 15min restantes
                  </div>
                </div>

                {/* Card principal */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 w-80 text-white shadow-2xl">
                    <GraduationCap className="w-12 h-12 mb-4" />
                    <h3 className="font-display text-2xl font-bold mb-2">
                      Prepare-se com os melhores
                    </h3>
                    <p className="text-orange-100 mb-4">
                      Mais de 1000 alunos aprovados
                    </p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-5 h-5 fill-current text-yellow-400"
                        />
                      ))}
                      <span className="ml-2 text-orange-100">(4.9)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - COM ANIMAÇÃO AO SCROLL */}
      <section
        id="como-funciona"
        className="py-24 bg-gradient-to-b from-white to-orange-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Tudo que você precisa para passar
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Uma plataforma completa com múltiplos formatos de estudo para você
              aprender do seu jeito
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <AnimatedSection key={index} delay={index * 0.1} direction="up">
                <motion.div
                  whileHover={{ y: -5 }}
                  className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}
                  />

                  {/* Ícone - tamanho fixo */}
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
                  >
                    {feature.icon}
                  </div>

                  {/* Título - altura fixa para 2 linhas */}
                  <h3 className="font-display text-xl font-bold text-gray-900 mb-3 min-h-[56px] flex items-start">
                    {feature.title}
                  </h3>

                  {/* Descrição - altura fixa para 3 linhas */}
                  <p className="text-gray-600 mb-4 min-h-[72px]">
                    {feature.description}
                  </p>

                  {/* Stats - sempre no final */}
                  <div className="text-sm font-semibold text-orange-500 mt-auto pt-4 border-t border-gray-100">
                    {feature.stats}
                  </div>

                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-5 h-5 text-orange-500" />
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos - COM ANIMAÇÃO AO SCROLL */}
      <section id="depoimentos" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Quem já aprovou recomenda
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Veja o que nossos alunos dizem sobre a plataforma
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
                >
                  <div className="flex items-center gap-2 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-current text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-gray-900">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Planos - COM ANIMAÇÃO AO SCROLL */}
      <section
        id="planos"
        className="py-24 bg-gradient-to-b from-orange-50 to-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Invista no seu futuro
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Escolha o plano ideal para sua jornada de estudos
            </p>
          </AnimatedSection>

          <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className={`relative bg-white rounded-2xl p-8 ${
                    plan.popular
                      ? "border-2 border-orange-500 shadow-2xl scale-105 lg:scale-110"
                      : "border border-gray-200 shadow-lg"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Mais escolhido
                    </div>
                  )}

                  {plan.savings && (
                    <div className="absolute top-4 right-4 bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">
                      {plan.savings}
                    </div>
                  )}

                  <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>

                  <div className="mb-6">
                    <span className="font-display text-4xl font-extrabold text-gray-900">
                      R$ {plan.price}
                    </span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/cadastro">
                    <Button
                      className={`w-full ${
                        plan.popular
                          ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25"
                          : "bg-gray-900 hover:bg-gray-800 text-white"
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final - COM ANIMAÇÃO AO SCROLL */}
      <section className="py-24 bg-gradient-to-r from-orange-600 to-orange-500 relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
          <div className="absolute bottom-0 -right-4 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-4">
          <AnimatedSection>
            <h2 className="font-display text-4xl md:text-5xl font-extrabold text-white mb-6">
              Comece sua jornada hoje
            </h2>
            <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              ‌7 dias grátis. Sem compromisso. Cancele quando quiser. Junte-se a
              mais de 1000 alunos que já estão se preparando.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/cadastro">
                <Button
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-orange-50 shadow-xl group min-w-[200px]"
                >
                  Quero estudar de verdade
                  {/* <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" /> */}
                </Button>
              </Link>
              <Link href="#como-funciona">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 min-w-[200px] p-2.5"
                >
                  Conhecer plataforma
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-sm text-orange-100">
              ✅ Sem taxas escondidas • ✅ Cancele quando quiser • ✅ Suporte
              24/7
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <Logo showText={false} />
              <p className="text-gray-400 mt-4 mb-4">
                Sua aprovação começa aqui. Estude de forma inteligente e alcance
                seus sonhos.
              </p>
            </div>

            <div>
              <h4 className="font-display font-bold text-lg mb-4">Produto</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link
                    href="#como-funciona"
                    className="hover:text-orange-500 transition"
                  >
                    Como funciona
                  </Link>
                </li>
                <li>
                  <Link
                    href="#planos"
                    className="hover:text-orange-500 transition"
                  >
                    Preços
                  </Link>
                </li>
                <li>
                  <Link
                    href="#concursos"
                    className="hover:text-orange-500 transition"
                  >
                    Concursos
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-orange-500 transition">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-display font-bold text-lg mb-4">Empresa</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-orange-500 transition">
                    Sobre nós
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-orange-500 transition">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-orange-500 transition">
                    Carreiras
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-orange-500 transition">
                    Contato
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-display font-bold text-lg mb-4">Legal</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-orange-500 transition">
                    Termos de uso
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-orange-500 transition">
                    Política de privacidade
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-orange-500 transition">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2024 Coordenada Concursos. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
