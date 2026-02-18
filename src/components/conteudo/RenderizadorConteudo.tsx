"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Headphones,
  CheckCircle,
  BookOpen,
  Star,
  Clock,
  Award,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Sparkles,
  Brain,
  Target,
  XCircle,
  Check,
} from "lucide-react";

interface ConteudoProps {
  materia: string;
  topicoId: string;
}

interface Questao {
  id: string;
  pergunta: string;
  alternativas: string[];
  correta: number;
  explicacao: string;
  dificuldade: string;
}

export function RenderizadorConteudo({ materia, topicoId }: ConteudoProps) {
  const [conteudo, setConteudo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progresso, setProgresso] = useState<string[]>([]);
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [respostaSelecionada, setRespostaSelecionada] = useState<number | null>(
    null,
  );
  const [mostrarResposta, setMostrarResposta] = useState(false);
  const [flashcardAtual, setFlashcardAtual] = useState(0);
  const [modoFlashcard, setModoFlashcard] = useState<"frente" | "verso">(
    "frente",
  );

  useEffect(() => {
    fetch(`/data/conteudo/${materia}/${topicoId}.json`)
      .then((res) => res.json())
      .then((data) => {
        setConteudo(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar conteúdo:", err);
        setLoading(false);
      });
  }, [materia, topicoId]);

  const marcarTopicoConcluido = (topicoId: string) => {
    setProgresso((prev) => [...prev, topicoId]);
    // TODO: Salvar no Firestore
  };

  const verificarResposta = () => {
    if (respostaSelecionada === null) return;
    setMostrarResposta(true);
  };

  const proximaQuestao = () => {
    setQuestaoAtual((prev) => prev + 1);
    setRespostaSelecionada(null);
    setMostrarResposta(false);
  };

  const virarFlashcard = () => {
    setModoFlashcard((prev) => (prev === "frente" ? "verso" : "frente"));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando conteúdo...</p>
        </div>
      </div>
    );
  }

  if (!conteudo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
            Conteúdo não encontrado
          </h2>
          <p className="text-gray-600">
            O tópico que você está procurando não existe.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header com progresso */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <span className="text-sm text-orange-500 font-medium">
                {conteudo.materia}
              </span>
              <h1 className="font-display text-3xl font-bold text-gray-900">
                {conteudo.titulo}
              </h1>
            </div>
          </div>
          <button
            onClick={() => marcarTopicoConcluido(conteudo.id)}
            className={`p-3 rounded-xl transition ${
              progresso.includes(conteudo.id)
                ? "bg-green-100 text-green-600"
                : "bg-gray-100 text-gray-400 hover:bg-gray-200"
            }`}
          >
            <CheckCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Metadados */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{conteudo.tempoEstimado} minutos</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="w-4 h-4" />
            <span className="capitalize">{conteudo.nivel}</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="w-4 h-4" />
            <span>Atualizado em {conteudo.dataAtualizacao}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {conteudo.tags?.map((tag: string) => (
            <span
              key={tag}
              className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Player de áudio */}
      {conteudo.audioUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 mb-8 text-white"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Volume2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="font-medium mb-2">🎧 Ouça enquanto estuda</p>
              <audio controls className="w-full">
                <source src={conteudo.audioUrl} type="audio/mpeg" />
              </audio>
            </div>
          </div>
        </motion.div>
      )}

      {/* Introdução */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="prose prose-lg max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: conteudo.introducao }}
      />

      {/* Tópicos do conteúdo */}
      <div className="space-y-12">
        {conteudo.topicos?.map((topico: any, index: number) => (
          <motion.section
            key={topico.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="scroll-mt-20"
            id={topico.id}
          >
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center text-sm">
                {index + 1}
              </span>
              {topico.titulo}
            </h2>
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: topico.html }}
            />
          </motion.section>
        ))}
      </div>

      {/* Flashcards */}
      {conteudo.flashcards && conteudo.flashcards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16"
        >
          <h3 className="font-display text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Brain className="w-6 h-6 text-orange-500" />
            Flashcards para revisão
          </h3>

          <div className="relative perspective-1000">
            <motion.div
              key={flashcardAtual + modoFlashcard}
              initial={{ rotateY: modoFlashcard === "frente" ? 0 : 180 }}
              animate={{ rotateY: modoFlashcard === "frente" ? 0 : 180 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer min-h-[200px] flex items-center justify-center border-2 border-orange-100"
              onClick={virarFlashcard}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="text-center">
                <p className="text-lg text-gray-900">
                  {modoFlashcard === "frente"
                    ? conteudo.flashcards[flashcardAtual].frente
                    : conteudo.flashcards[flashcardAtual].verso}
                </p>
                <p className="text-sm text-gray-400 mt-4">
                  Clique para{" "}
                  {modoFlashcard === "frente" ? "ver resposta" : "voltar"}
                </p>
              </div>
            </motion.div>

            <div className="flex justify-between mt-4">
              <button
                onClick={() => {
                  setFlashcardAtual((prev) => Math.max(0, prev - 1));
                  setModoFlashcard("frente");
                }}
                disabled={flashcardAtual === 0}
                className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-500">
                {flashcardAtual + 1} de {conteudo.flashcards.length}
              </span>
              <button
                onClick={() => {
                  setFlashcardAtual((prev) =>
                    Math.min(conteudo.flashcards.length - 1, prev + 1),
                  );
                  setModoFlashcard("frente");
                }}
                disabled={flashcardAtual === conteudo.flashcards.length - 1}
                className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Exercícios */}
      {conteudo.exercicios && conteudo.exercicios.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <h3 className="font-display text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-orange-500" />
            Pratique o que aprendeu
          </h3>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">
                Questão {questaoAtual + 1} de {conteudo.exercicios.length}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs ${
                  conteudo.exercicios[questaoAtual].dificuldade === "facil"
                    ? "bg-green-100 text-green-600"
                    : conteudo.exercicios[questaoAtual].dificuldade === "medio"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-red-100 text-red-600"
                }`}
              >
                {conteudo.exercicios[questaoAtual].dificuldade}
              </span>
            </div>

            <p className="text-lg text-gray-900 mb-6">
              {conteudo.exercicios[questaoAtual].pergunta}
            </p>

            <div className="space-y-3 mb-6">
              {conteudo.exercicios[questaoAtual].alternativas.map(
                (alt: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() =>
                      !mostrarResposta && setRespostaSelecionada(idx)
                    }
                    className={`w-full text-left p-4 rounded-xl border-2 transition ${
                      respostaSelecionada === idx
                        ? mostrarResposta
                          ? idx === conteudo.exercicios[questaoAtual].correta
                            ? "border-green-500 bg-green-50"
                            : "border-red-500 bg-red-50"
                          : "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-200"
                    }`}
                    disabled={mostrarResposta}
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1">{alt}</span>
                      {mostrarResposta &&
                        idx === conteudo.exercicios[questaoAtual].correta && (
                          <Check className="w-5 h-5 text-green-500" />
                        )}
                    </div>
                  </button>
                ),
              )}
            </div>

            {mostrarResposta && (
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <p className="font-medium text-blue-800 mb-2">📖 Explicação:</p>
                <div
                  className="text-blue-700 text-sm prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: conteudo.exercicios[questaoAtual].explicacao,
                  }}
                />
              </div>
            )}

            <div className="flex justify-between">
              {!mostrarResposta ? (
                <button
                  onClick={verificarResposta}
                  disabled={respostaSelecionada === null}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl disabled:opacity-50"
                >
                  Verificar resposta
                </button>
              ) : (
                <button
                  onClick={proximaQuestao}
                  disabled={questaoAtual === conteudo.exercicios.length - 1}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl disabled:opacity-50"
                >
                  Próxima questão
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Conteúdos relacionados */}
      {conteudo.relacionados && conteudo.relacionados.length > 0 && (
        <div className="mt-16 pt-8 border-t border-gray-200">
          <h4 className="font-display text-lg font-bold text-gray-900 mb-4">
            📚 Conteúdos relacionados
          </h4>
          <div className="flex flex-wrap gap-2">
            {conteudo.relacionados.map((rel: string) => (
              <a
                key={rel}
                href={`/materia/${materia}/topico/${rel}`}
                className="bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-orange-600 px-4 py-2 rounded-full text-sm transition"
              >
                {rel.replace(/-/g, " ")}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
