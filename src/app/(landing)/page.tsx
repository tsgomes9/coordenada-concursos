"use client";

import { Button } from "@/components/ui/Button";
import { ArrowRight, BookOpen, Headphones, Zap, Award } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const features = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Conteúdo em Texto",
      description: "Material completo e organizado para cada concurso",
    },
    {
      icon: <Headphones className="w-6 h-6" />,
      title: "Podcasts Exclusivos",
      description: "Estude onde estiver com áudios dos principais tópicos",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Questões Interativas",
      description: "Teste seus conhecimentos com simulados personalizados",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Cards de Memorização",
      description: "Revise os pontos mais importantes com flashcards",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-2xl font-bold text-blue-600">
              ConcursoSaaS
            </span>
            <div className="flex gap-4">
              <Link href="/login">
                <Button variant="ghost">Entrar</Button>
              </Link>
              <Link href="/cadastro">
                <Button>Começar Grátis</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Sua aprovação começa <span className="text-blue-600">aqui</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Estude para concursos públicos com conteúdo em texto, áudio e
              exercícios interativos. Tudo em um só lugar, do seu jeito.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/cadastro">
                <Button size="lg" className="gap-2">
                  Começar grátis <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="#saiba-mais">
                <Button variant="outline" size="lg">
                  Saiba mais
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              🔥 7 dias grátis • Cancele quando quiser
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Tudo que você precisa para passar
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-lg hover:shadow-lg transition"
              >
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            Comece sua jornada hoje
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            ‌7 dias grátis. Sem compromisso.
          </p>
          <Link href="/cadastro">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Quero estudar de verdade
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
