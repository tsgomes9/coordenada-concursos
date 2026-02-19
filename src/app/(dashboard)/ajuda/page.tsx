"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  HelpCircle,
  ArrowLeft,
  MessageCircle,
  FileText,
  Mail,
  ChevronRight,
  Search,
  BookOpen,
  Headphones,
  Zap,
  Target,
  Users,
  Sparkles,
  CheckCircle,
  Clock,
  Award,
  ChevronDown,
  ExternalLink,
  LifeBuoy,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

// Dados reais da plataforma
const faqs = [
  {
    category: "Primeiros passos",
    icon: <Sparkles className="w-5 h-5" />,
    questions: [
      {
        q: "Como começar a estudar?",
        a: "Após criar sua conta gratuita, você pode explorar os concursos disponíveis e escolher seus favoritos. Recomendamos começar definindo sua meta diária de estudos e explorando as matérias básicas do seu concurso alvo.",
      },
      {
        q: "O que está incluído no plano gratuito?",
        a: "No plano gratuito você tem acesso a 3 concursos, 10% do conteúdo de cada matéria, e pode testar todas as funcionalidades da plataforma para decidir se o plano Premium atende suas necessidades.",
      },
      {
        q: "Como escolho meus concursos de interesse?",
        a: "Acesse a página de Concursos, navegue pelas opções disponíveis e clique no ícone de coração para favoritar. Os concursos favoritos aparecerão no seu dashboard e você receberá notificações sobre prazos importantes.",
      },
    ],
  },
  {
    category: "Conteúdo de estudo",
    icon: <BookOpen className="w-5 h-5" />,
    questions: [
      {
        q: "Como funciona o conteúdo em texto?",
        a: "Nosso conteúdo em texto é organizado por tópicos, com destaques em pontos importantes, resumos ao final de cada módulo e exemplos práticos. Você pode marcar seu progresso e voltar de onde parou a qualquer momento.",
      },
      {
        q: "O que são os podcasts exclusivos?",
        a: "São áudios produzidos especialmente para você estudar onde estiver. Cada podcast aborda um tópico completo da matéria, ideal para revisões durante deslocamentos ou momentos de pausa. Disponível apenas no plano Premium.",
      },
      {
        q: "Como funcionam os flashcards?",
        a: "Os flashcards são cards de memorização baseados em ciência do aprendizado. Você pode revisar os pontos mais importantes de cada matéria, e o sistema acompanha seu desempenho para repetir os cards que você tem mais dificuldade.",
      },
    ],
  },
  {
    category: "Questões e simulados",
    icon: <Target className="w-5 h-5" />,
    questions: [
      {
        q: "Quantas questões estão disponíveis?",
        a: "Atualmente temos mais de 5000 questões no banco, todas com comentários detalhados e organizadas por matéria, banca e nível de dificuldade. As questões são atualizadas constantemente.",
      },
      {
        q: "Os simulados são personalizáveis?",
        a: "Sim! Você pode criar simulados personalizados escolhendo as matérias, número de questões e tempo de duração. Ao final, recebe estatísticas completas do seu desempenho.",
      },
      {
        q: "As questões têm comentários?",
        a: "Todas as questões têm comentários detalhados, explicando não só a resposta correta mas também por que as outras alternativas estão erradas, ajudando no aprendizado completo.",
      },
    ],
  },
  {
    category: "Assinatura e planos",
    icon: <Award className="w-5 h-5" />,
    questions: [
      {
        q: "Como funciona o período de teste?",
        a: "Oferecemos 7 dias grátis para você testar todos os recursos da plataforma, sem compromisso e sem precisar cadastrar cartão de crédito. Aproveite para explorar tudo!",
      },
      {
        q: "Posso cancelar quando quiser?",
        a: "Sim! Você pode cancelar sua assinatura a qualquer momento pela área de configurações. Se cancelar, ainda terá acesso até o final do período já pago.",
      },
      {
        q: "Quais as formas de pagamento?",
        a: "Aceitamos cartões de crédito (Visa, Mastercard, Elo, American Express) e boleto bancário (para planos anuais). Todas as transações são processadas com segurança.",
      },
    ],
  },
];

// Artigos da base de conhecimento
const articles = [
  {
    title: "Guia completo: Como estudar para concursos",
    description: "Estratégias de estudo baseadas em ciência do aprendizado",
    icon: <GraduationCap className="w-5 h-5" />,
    color: "from-orange-500 to-orange-600",
    readTime: "8 min",
    url: "#",
  },
  {
    title: "Dominando os flashcards",
    description: "Técnicas para memorização de longo prazo",
    icon: <Zap className="w-5 h-5" />,
    color: "from-blue-500 to-blue-600",
    readTime: "5 min",
    url: "#",
  },
  {
    title: "Como usar os podcasts nos estudos",
    description: "Aprenda a revisar onde estiver",
    icon: <Headphones className="w-5 h-5" />,
    color: "from-purple-500 to-purple-600",
    readTime: "4 min",
    url: "#",
  },
  {
    title: "Interpretação de questões",
    description: "Técnicas para não cair em pegadinhas",
    icon: <Target className="w-5 h-5" />,
    color: "from-green-500 to-green-600",
    readTime: "6 min",
    url: "#",
  },
];

export default function AjudaPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // Filtrar FAQs baseado na busca
  const filteredFaqs = faqs
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.a.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((category) => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      {/* Header simples */}

      {/* Hero da página */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full mb-6"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Estamos aqui para ajudar</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-6xl font-black text-gray-900 mb-4"
        >
          Central de Ajuda
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-600 max-w-2xl mx-auto mb-8"
        >
          Tire suas dúvidas, encontre tutoriais e fale com nossa equipe
        </motion.p>

        {/* Busca */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative max-w-2xl mx-auto"
        >
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar ajuda... (ex: flashcards, questões, assinatura)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-900 placeholder-gray-400 shadow-lg"
          />
        </motion.div>
      </div>

      {/* Canais de atendimento */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto"
        >
          {/* E-mail */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2">E-mail</h3>
            <p className="text-gray-600 text-sm mb-4">
              Respondemos em até 24h úteis
            </p>
            <p className="text-xs text-gray-400 mb-4">
              suporte@coordenada.com.br
            </p>
            <a
              href="mailto:suporte@coordenada.com.br"
              className="text-blue-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all"
            >
              Enviar e-mail <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Central de ajuda */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition group">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <LifeBuoy className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2">
              Base de conhecimento
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Documentação completa e tutoriais
            </p>
            <p className="text-xs text-gray-400 mb-4">Disponível 24/7</p>
            <button
              onClick={() =>
                document
                  .getElementById("faqs")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="text-purple-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all"
            >
              Acessar FAQs <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Artigos recomendados */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-2xl font-black text-gray-900 mb-8"
        >
          Artigos recomendados
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {articles.map((article, index) => (
            <Link key={index} href={article.url}>
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all group"
              >
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${article.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition`}
                >
                  {article.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {article.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {article.readTime} de leitura
                  </span>
                  <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition" />
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>

      {/* FAQs */}
      <div id="faqs" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-black text-gray-900 mb-4">
            Perguntas frequentes
          </h2>
          <p className="text-gray-600">
            Encontre respostas para as dúvidas mais comuns
          </p>
        </motion.div>

        {/* Categorias */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap gap-2 mb-8 justify-center"
        >
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              selectedCategory === null
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                : "bg-white text-gray-600 hover:bg-blue-50 border border-gray-200"
            }`}
          >
            Todas
          </button>
          {faqs.map((category) => (
            <button
              key={category.category}
              onClick={() => setSelectedCategory(category.category)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
                selectedCategory === category.category
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                  : "bg-white text-gray-600 hover:bg-blue-50 border border-gray-200"
              }`}
            >
              {category.icon}
              {category.category}
            </button>
          ))}
        </motion.div>

        {/* Lista de FAQs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="space-y-6"
        >
          {(selectedCategory
            ? faqs.filter((c) => c.category === selectedCategory)
            : filteredFaqs
          ).map((category, categoryIndex) => (
            <div
              key={category.category}
              className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  {category.icon}
                  <h3 className="font-bold text-gray-900">
                    {category.category}
                  </h3>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {category.questions.map((faq, index) => {
                  const faqId = `${category.category}-${index}`;
                  const isExpanded = expandedFaq === faqId;

                  return (
                    <div key={index} className="p-6">
                      <button
                        onClick={() =>
                          setExpandedFaq(isExpanded ? null : faqId)
                        }
                        className="w-full flex items-start justify-between gap-4 text-left"
                      >
                        <span className="font-medium text-gray-900 flex-1">
                          {faq.q}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 text-gray-600 text-sm leading-relaxed"
                        >
                          {faq.a}
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                Nenhum resultado encontrado para "{searchTerm}"
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 text-blue-600 font-medium text-sm"
              >
                Limpar busca
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* CTA final - Formulário de contato (mockado) */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl"
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-black text-gray-900 mb-4">
                  Não encontrou o que procurava?
                </h2>
                <p className="text-gray-600 mb-6">
                  Nossa equipe está pronta para ajudar você. Envie uma mensagem
                  e responderemos o mais breve possível.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        E-mail
                      </p>
                      <p className="text-xs text-gray-500">
                        Resposta em até 24h
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Horário de atendimento
                      </p>
                      <p className="text-xs text-gray-500">
                        Seg a Sex, 8h às 20h
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulário mockado */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">
                  Envie uma mensagem
                </h3>
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Seu nome"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Seu e-mail"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-700">
                      <option>Assunto</option>
                      <option>Dúvida sobre assinatura</option>
                      <option>Problema técnico</option>
                      <option>Sugestão</option>
                      <option>Outro</option>
                    </select>
                  </div>
                  <div>
                    <textarea
                      placeholder="Sua mensagem"
                      rows={4}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                    />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700">
                    Enviar mensagem
                  </Button>
                  <p className="text-xs text-gray-400 text-center">
                    ✅ Respondemos em até 24h úteis
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
