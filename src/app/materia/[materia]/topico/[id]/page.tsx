"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Flashcard } from "@/components/conteudo/Flashcard";
import { Exercicio } from "@/components/conteudo/Exercicio";
import { ChevronLeft, Loader2, Clock, CheckCircle } from "lucide-react";
import { ProtecaoConteudo } from "@/components/conteudo/ProtecaoConteudo";
import { useAcesso } from "@/lib/hooks/useAcesso";
import { useProgresso } from "@/lib/hooks/useProgresso";

interface Metadados {
  id: string;
  titulo: string;
  materia: string;
  materiaId?: string;
  materiaSlug?: string;
  concursoId?: string;
  isPreview?: boolean;
  flashcards?: any[];
  exercicios?: any[];
  tempoEstimado?: number;
}

export default function TopicoPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const materia = params.materia as string;
  const id = params.id as string;
  const concursoId = searchParams.get("concurso");

  const [html, setHtml] = useState<string>("");
  const [metadados, setMetadados] = useState<Metadados | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [tempoInicio, setTempoInicio] = useState<number>(Date.now());

  const { nivelAcesso, loading: loadingAcesso } = useAcesso();
  const { progresso, iniciarTopico, atualizarProgresso, responderQuestao } =
    useProgresso();

  useEffect(() => {
    async function carregarConteudo() {
      try {
        console.log("📥 Carregando:", { materia, id, concursoId });

        const htmlRes = await fetch(`/data/conteudo/${materia}/${id}.html`);
        if (htmlRes.ok) {
          const htmlText = await htmlRes.text();
          setHtml(htmlText);
          console.log("✅ HTML carregado, tamanho:", htmlText.length);
        } else {
          console.log("❌ HTML não encontrado:", htmlRes.status);
          setErro("Arquivo HTML não encontrado");
        }

        const jsonRes = await fetch(`/data/conteudo/${materia}/${id}.json`);
        if (jsonRes.ok) {
          const jsonData = await jsonRes.json();
          setMetadados({
            ...jsonData,
            materiaId: jsonData.materiaId || materia,
            materiaSlug: jsonData.materiaSlug || materia,
            tempoEstimado: jsonData.tempoEstimado || 45,
          });
          console.log("✅ JSON carregado", jsonData);
        }
      } catch (error) {
        console.error("❌ Erro:", error);
        setErro("Erro ao carregar conteúdo");
      } finally {
        setLoading(false);
      }
    }

    if (materia && id) carregarConteudo();
  }, [materia, id, concursoId]);

  // 🔥 REGISTRAR INÍCIO DO TÓPICO - com 5 argumentos
  useEffect(() => {
    if (metadados && concursoId && metadados.titulo) {
      console.log("🎯 Iniciando tópico:", {
        topicoId: id,
        concursoId,
        materiaId: metadados.materiaId || materia,
        titulo: metadados.titulo,
      });

      iniciarTopico(
        id,
        concursoId,
        metadados.titulo,
        metadados.materia || materia,
        metadados.materiaSlug || materia,
      );
    }
  }, [id, metadados, concursoId, materia, iniciarTopico]);

  // Calcular tempo gasto
  useEffect(() => {
    const interval = setInterval(() => {
      if (progresso[id]?.status === "em_andamento") {
        const tempoDecorrido = Math.floor((Date.now() - tempoInicio) / 60000);
        if (tempoDecorrido > 0) {
          atualizarProgresso(id, progresso[id].progresso, tempoDecorrido);
          setTempoInicio(Date.now());
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [id, progresso, tempoInicio, atualizarProgresso]);

  // Marcar como concluído - chamada com 3 argumentos (SEM boolean)
  const marcarConcluido = async () => {
    const tempoTotal = Math.floor((Date.now() - tempoInicio) / 60000);
    await atualizarProgresso(id, 100, tempoTotal);
  };

  // Handler para responder questão - com 4 argumentos
  const handleResponderQuestao = (acertou: boolean, tempo: number) => {
    responderQuestao(id, acertou, tempo, concursoId || undefined);
  };

  // LOG PARA DEBUG
  useEffect(() => {
    console.log("🔐 Status do acesso:", nivelAcesso);
    console.log("📄 Metadados do tópico:", metadados);
    console.log("📊 Progresso do tópico:", progresso[id]);
    console.log("🎯 Concurso ID:", concursoId);
  }, [nivelAcesso, metadados, progresso, id, concursoId]);

  if (loading || loadingAcesso) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (erro || !html) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">😕</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
            Conteúdo não encontrado
          </h2>
          <p className="text-gray-600 mb-4">
            {erro || "O arquivo HTML não foi encontrado"}
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Caminho: /data/conteudo/{materia}/{id}.html
          </p>
          <Link
            href={concursoId ? `/concurso/${concursoId}` : "/concursos"}
            className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar para {concursoId ? "concurso" : "concursos"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header com progresso */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div
          className="max-w-1100 w-full mx-auto"
          style={{ padding: "1rem 2rem" }}
        >
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between"
            style={{ gap: "0.75rem" }}
          >
            {/* Link Voltar */}
            <Link
              href={concursoId ? `/concurso/${concursoId}` : "/concursos"}
              className="cursor-pointer group inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-all duration-200 w-fit"
            >
              <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
              <span className="text-base font-medium">Voltar</span>
            </Link>

            {/* Ações */}
            <div
              className="flex items-center justify-between sm:justify-end"
              style={{ gap: "1rem" }}
            >
              {/* Timer */}
              <div
                className="flex items-center gap-2 bg-gray-50/80 rounded-lg"
                style={{ padding: "0.625rem 1rem" }}
              >
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {metadados?.tempoEstimado || 30} min estimado
                </span>
                {progresso[id]?.tempoGasto > 0 && (
                  <span className="text-xs text-gray-400 ml-1">
                    (estudado: {progresso[id].tempoGasto} min)
                  </span>
                )}
              </div>

              {/* Botão concluir */}
              <button
                onClick={marcarConcluido}
                disabled={progresso[id]?.status === "concluido"}
                style={{ padding: "0.625rem 1.5rem" }}
                className={`cursor-pointer inline-flex items-center gap-2 rounded-lg text-sm font-medium transition-all duration-200 transform active:scale-[0.98] ${
                  progresso[id]?.status === "concluido"
                    ? "bg-green-50 text-green-600 border border-green-200"
                    : "bg-orange-500 text-white hover:bg-orange-600 shadow-sm hover:shadow"
                }`}
              >
                <CheckCircle
                  className={`w-4 h-4 ${progresso[id]?.status === "concluido" ? "fill-green-600 text-white" : ""}`}
                />
                <span className="hidden xs:inline">
                  {progresso[id]?.status === "concluido"
                    ? "Concluído"
                    : "Marcar como concluído"}
                </span>
                <span className="xs:hidden">
                  {progresso[id]?.status === "concluido"
                    ? "✓"
                    : "marcar como concluído"}
                </span>
              </button>
            </div>
          </div>

          {/* Barra de progresso */}
          {progresso[id] && (
            <div style={{ marginTop: "1rem" }}>
              <div className="h-0.75 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progresso[id].progresso}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <ProtecaoConteudo
        isPreview={metadados?.isPreview}
        previewContent={
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="prose prose-lg max-w-none opacity-60 relative">
              <div
                dangerouslySetInnerHTML={{
                  __html: html.substring(0, 500) + "...",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white pointer-events-none" />
            </div>
          </div>
        }
      >
        {/* TEXTO */}
        <div dangerouslySetInnerHTML={{ __html: html }} />

        {/* Flashcards e Exercícios (abaixo do conteúdo) */}
        {metadados?.flashcards && metadados.flashcards.length > 0 && (
          <div
            style={{
              maxWidth: "1100px",
              width: "100%",
              padding: "2rem 2rem 3rem 2rem",
              margin: "0 auto",
            }}
          >
            <div className="mt-2 pt-8">
              <div
                style={{
                  width: "100%",
                  backgroundColor: "#ffffff",
                  borderRadius: "32px",
                  border: "1px solid #f15a24",
                  padding: "2rem",
                  boxShadow: "0 20px 30px -10px rgba(241, 90, 36, 0.1)",
                }}
              >
                <Flashcard flashcards={metadados.flashcards} />
              </div>
            </div>
          </div>
        )}

        {metadados?.exercicios && metadados.exercicios.length > 0 && (
          <div
            style={{
              maxWidth: "1100px",
              width: "100%",
              padding: "2rem 2rem 3rem 2rem",
              margin: "0 auto",
            }}
          >
            <div className="mt-2 pt-8">
              <div
                style={{
                  width: "100%",
                  backgroundColor: "#ffffff",
                  borderRadius: "32px",
                  border: "1px solid #f15a24",
                  padding: "2rem",
                  boxShadow: "0 20px 30px -10px rgba(241, 90, 36, 0.1)",
                }}
              >
                <Exercicio
                  exercicios={metadados.exercicios}
                  onResponder={handleResponderQuestao}
                />
              </div>
            </div>
          </div>
        )}
      </ProtecaoConteudo>
    </div>
  );
}
