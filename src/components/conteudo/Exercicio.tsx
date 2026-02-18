"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ExercicioProps {
  exercicios: Array<{
    pergunta: string;
    alternativas: string[];
    correta: number;
    explicacao: string;
  }>;
  onResponder?: (acertou: boolean, tempo: number) => void;
}

export function Exercicio({ exercicios, onResponder }: ExercicioProps) {
  const [indexAtual, setIndexAtual] = useState(0);
  const [respostaSelecionada, setRespostaSelecionada] = useState<number | null>(
    null,
  );
  const [mostrarExplicacao, setMostrarExplicacao] = useState(false);
  const [acertos, setAcertos] = useState<boolean[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [tempoInicio] = useState(Date.now());

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const exercicioAtual = exercicios[indexAtual];
  const totalExercicios = exercicios.length;

  const verificarResposta = () => {
    if (respostaSelecionada === null) return;

    const acertou = respostaSelecionada === exercicioAtual.correta;
    const tempoGasto = Math.floor((Date.now() - tempoInicio) / 1000); // segundos

    setMostrarExplicacao(true);

    const novosAcertos = [...acertos];
    novosAcertos[indexAtual] = acertou;
    setAcertos(novosAcertos);

    // Registrar resposta
    onResponder?.(acertou, tempoGasto);
  };

  const proximo = () => {
    if (indexAtual < totalExercicios - 1) {
      setIndexAtual(indexAtual + 1);
      setRespostaSelecionada(null);
      setMostrarExplicacao(false);
    }
  };

  const reiniciar = () => {
    setIndexAtual(0);
    setRespostaSelecionada(null);
    setMostrarExplicacao(false);
    setAcertos([]);
  };

  const getStatusLetra = (index: number) => {
    if (!mostrarExplicacao) return { color: "#6b7280" };
    if (index === exercicioAtual.correta)
      return { color: "#10b981", fontWeight: "bold" };
    if (
      index === respostaSelecionada &&
      respostaSelecionada !== exercicioAtual.correta
    ) {
      return { color: "#ef4444", fontWeight: "bold" };
    }
    return { color: "#9ca3af" };
  };

  const getCorBotao = (index: number) => {
    if (!mostrarExplicacao) {
      return respostaSelecionada === index
        ? {
            borderColor: "#f15a24",
            backgroundColor: "#fef1ea",
          }
        : {
            borderColor: "#e0e0e0",
            backgroundColor: "white",
          };
    }
    if (index === exercicioAtual.correta) {
      return {
        borderColor: "#10b981",
        backgroundColor: "#f0fdf4",
      };
    }
    if (
      index === respostaSelecionada &&
      respostaSelecionada !== exercicioAtual.correta
    ) {
      return {
        borderColor: "#ef4444",
        backgroundColor: "#fef2f2",
      };
    }
    return {
      borderColor: "#e0e0e0",
      backgroundColor: "white",
      opacity: 0.5,
    };
  };

  const progresso = ((indexAtual + 1) / totalExercicios) * 100;

  return (
    <div style={{ width: "100%" }}>
      {/* Header com estilo igual aos Flashcards */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? "1rem" : "0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            width: isMobile ? "100%" : "auto",
          }}
        >
          <h3
            style={{
              fontSize: isMobile ? "1.2rem" : "1.5rem",
              fontWeight: 800,
              color: "#1f1f1f",
              borderLeft: "10px solid #f15a24",
              paddingLeft: "1rem",
              margin: 0,
            }}
          >
            Exercícios
          </h3>
          <span
            style={{
              fontSize: "0.9rem",
              color: "#3d3d3d",
              background: "#f8f8f8",
              padding: "0.3rem 1rem",
              borderRadius: "999px",
            }}
          >
            {indexAtual + 1} / {totalExercicios}
          </span>
        </div>

        {/* Score com design clean */}
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span style={{ fontWeight: 600, color: "#1f1f1f" }}>
              {acertos.filter(Boolean).length}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span style={{ fontWeight: 600, color: "#1f1f1f" }}>
              {acertos.filter((a) => a === false).length}
            </span>
          </div>
        </div>
      </div>

      {/* Barra de progresso estilo Flashcards */}
      <div
        style={{
          marginBottom: "2rem",
          height: "2px",
          background: "#f0f0f0",
          borderRadius: "999px",
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progresso}%` }}
          transition={{ duration: 0.3 }}
          style={{
            height: "100%",
            background: "#f15a24",
            borderRadius: "999px",
          }}
        />
      </div>

      {/* Pergunta em destaque com laranja sólido */}
      <div
        style={{
          background: "#f15a24",
          borderRadius: isMobile ? "20px" : "32px",
          padding: isMobile ? "1.5rem" : "2rem",
          marginBottom: "2rem",
        }}
      >
        <p
          style={{
            fontSize: isMobile ? "1rem" : "1.2rem",
            fontWeight: 500,
            color: "white",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          {exercicioAtual.pergunta}
        </p>
      </div>

      {/* Alternativas */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {exercicioAtual.alternativas.map((alt, index) => {
          const estilo = getCorBotao(index);
          const statusLetra = getStatusLetra(index);

          return (
            <motion.button
              key={index}
              onClick={() =>
                !mostrarExplicacao && setRespostaSelecionada(index)
              }
              disabled={mostrarExplicacao}
              whileHover={!mostrarExplicacao ? { scale: 1.02 } : {}}
              whileTap={!mostrarExplicacao ? { scale: 0.98 } : {}}
              style={{
                width: "100%",
                textAlign: "left",
                padding: isMobile ? "1rem" : "1.2rem",
                borderRadius: isMobile ? "12px" : "16px",
                border: "2px solid",
                borderColor: estilo.borderColor,
                backgroundColor: estilo.backgroundColor,
                opacity: estilo.opacity,
                cursor: mostrarExplicacao ? "default" : "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem",
                }}
              >
                <span
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "999px",
                    background: "#f8f8f8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.9rem",
                    color: statusLetra.color,
                    fontWeight: statusLetra.fontWeight === "bold" ? 700 : 400,
                    flexShrink: 0,
                  }}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span
                  style={{
                    flex: 1,
                    color: "#1f1f1f",
                    fontSize: isMobile ? "0.95rem" : "1rem",
                  }}
                >
                  {alt}
                </span>
                {mostrarExplicacao && index === exercicioAtual.correta && (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    style={{ flexShrink: 0 }}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {mostrarExplicacao &&
                  index === respostaSelecionada &&
                  respostaSelecionada !== exercicioAtual.correta && (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2"
                      style={{ flexShrink: 0 }}
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Explicação */}
      <AnimatePresence>
        {mostrarExplicacao && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              background: "#fef1ea",
              borderRadius: isMobile ? "16px" : "24px",
              padding: isMobile ? "1.2rem" : "1.5rem",
              marginBottom: "2rem",
              border: "1px solid rgba(241, 90, 36, 0.2)",
            }}
          >
            <h4
              style={{
                fontWeight: 600,
                color: "#f15a24",
                marginBottom: "0.5rem",
                fontSize: isMobile ? "1rem" : "1.1rem",
              }}
            >
              📖 Explicação
            </h4>
            <p
              style={{
                color: "#1f1f1f",
                margin: 0,
                fontSize: isMobile ? "0.95rem" : "1rem",
                lineHeight: 1.6,
                whiteSpace: "pre-line",
              }}
            >
              {exercicioAtual.explicacao}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botões - layout responsivo igual aos Flashcards */}
      <div
        style={{
          display: "flex",
          gap: isMobile ? "0.5rem" : "1rem",
          justifyContent: "center",
          marginTop: "2rem",
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        {!mostrarExplicacao ? (
          // Antes de verificar
          isMobile ? (
            // Mobile
            <>
              <button
                onClick={verificarResposta}
                disabled={respostaSelecionada === null}
                style={{
                  padding: "1rem",
                  background: "#f15a24",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "white",
                  cursor:
                    respostaSelecionada === null ? "not-allowed" : "pointer",
                  opacity: respostaSelecionada === null ? 0.5 : 1,
                  transition: "all 0.2s ease",
                  width: "100%",
                }}
              >
                Verificar resposta
              </button>
            </>
          ) : (
            // Desktop
            <button
              onClick={verificarResposta}
              disabled={respostaSelecionada === null}
              style={{
                padding: "1rem 3rem",
                background: "#f15a24",
                border: "none",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: 600,
                color: "white",
                cursor:
                  respostaSelecionada === null ? "not-allowed" : "pointer",
                opacity: respostaSelecionada === null ? 0.5 : 1,
                transition: "all 0.2s ease",
              }}
            >
              Verificar resposta
            </button>
          )
        ) : // Depois de verificar
        isMobile ? (
          // Mobile
          <>
            <button
              onClick={proximo}
              disabled={indexAtual === totalExercicios - 1}
              style={{
                padding: "1rem",
                background: "#f15a24",
                border: "none",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: 600,
                color: "white",
                cursor:
                  indexAtual === totalExercicios - 1
                    ? "not-allowed"
                    : "pointer",
                opacity: indexAtual === totalExercicios - 1 ? 0.5 : 1,
                transition: "all 0.2s ease",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              Próxima questão
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {indexAtual === totalExercicios - 1 && (
              <button
                onClick={reiniciar}
                style={{
                  padding: "1rem",
                  background: "white",
                  border: "2px solid #e0e0e0",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "#1f1f1f",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                </svg>
                Recomeçar
              </button>
            )}
          </>
        ) : (
          // Desktop
          <div
            style={{
              display: "flex",
              gap: "1rem",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <button
              onClick={proximo}
              disabled={indexAtual === totalExercicios - 1}
              style={{
                padding: "1rem 3rem",
                background: "#f15a24",
                border: "none",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: 600,
                color: "white",
                cursor:
                  indexAtual === totalExercicios - 1
                    ? "not-allowed"
                    : "pointer",
                opacity: indexAtual === totalExercicios - 1 ? 0.5 : 1,
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              Próxima questão
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {indexAtual === totalExercicios - 1 && (
              <button
                onClick={reiniciar}
                style={{
                  padding: "1rem 2rem",
                  background: "white",
                  border: "2px solid #e0e0e0",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "#1f1f1f",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                </svg>
                Recomeçar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
