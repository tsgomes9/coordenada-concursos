"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface FlashcardProps {
  flashcards: Array<{
    frente: string;
    verso: string;
  }>;
}

export function Flashcard({ flashcards }: FlashcardProps) {
  const [indexAtual, setIndexAtual] = useState(0);
  const [virado, setVirado] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const cardAtual = flashcards[indexAtual];
  const totalCards = flashcards.length;

  const proximo = () => {
    if (indexAtual < totalCards - 1) {
      setIndexAtual(indexAtual + 1);
      setVirado(false);
    }
  };

  const anterior = () => {
    if (indexAtual > 0) {
      setIndexAtual(indexAtual - 1);
      setVirado(false);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Cabeçalho simples */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          flexDirection: "row",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
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
            Flashcards
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
            {indexAtual + 1} / {totalCards}
          </span>
        </div>
      </div>

      {/* Card quadrado com animação */}
      <div
        style={{
          marginBottom: "2.5rem",
          maxWidth: isMobile ? "100%" : "400px",
          marginLeft: "auto",
          marginRight: "auto",
          perspective: "1200px",
          width: "100%",
        }}
      >
        <motion.div
          onClick={() => setVirado(!virado)}
          animate={{ rotateY: virado ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{
            width: "100%",
            aspectRatio: "1 / 1",
            transformStyle: "preserve-3d",
            cursor: "pointer",
            position: "relative",
          }}
        >
          {/* Frente do card */}
          <motion.div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              background: "white",
              border: "2px solid #e0e0e0",
              borderRadius: isMobile ? "24px" : "32px",
              padding: isMobile ? "1rem" : "2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                maxWidth: "90%",
                margin: "0 auto",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: isMobile ? "1rem" : "1.3rem",
                  lineHeight: 1.6,
                  color: "#1f1f1f",
                  margin: 0,
                  fontWeight: 600,
                  wordBreak: "break-word",
                }}
              >
                {cardAtual.frente}
              </p>

              <p
                style={{
                  fontSize: isMobile ? "0.8rem" : "0.9rem",
                  color: "#777777",
                  marginTop: isMobile ? "1rem" : "2rem",
                  opacity: 0.7,
                }}
              >
                Clique para ver a resposta
              </p>
            </div>
          </motion.div>

          {/* Verso do card */}
          <motion.div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              background: "#fef1ea",
              border: "2px solid #f15a24",
              borderRadius: isMobile ? "24px" : "32px",
              padding: isMobile ? "1rem" : "2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: "rotateY(180deg)",
              boxShadow: "0 10px 20px rgba(241,90,36,0.1)",
            }}
          >
            <div
              style={{
                maxWidth: "90%",
                margin: "0 auto",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: isMobile ? "1rem" : "1.3rem",
                  lineHeight: 1.6,
                  color: "#1f1f1f",
                  margin: 0,
                  fontWeight: 400,
                  wordBreak: "break-word",
                }}
              >
                {cardAtual.verso}
              </p>

              <p
                style={{
                  fontSize: isMobile ? "0.8rem" : "0.9rem",
                  color: "#999",
                  marginTop: isMobile ? "1rem" : "2rem",
                  opacity: 0.7,
                }}
              >
                Clique para ver a pergunta
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Botões de navegação - RESPONSIVOS */}
      <div
        style={{
          display: "flex",
          gap: isMobile ? "0.5rem" : "1rem",
          justifyContent: "center",
          marginTop: "2rem",
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        {isMobile ? (
          // Layout mobile
          <>
            <button
              onClick={() => setVirado(!virado)}
              style={{
                padding: "1rem",
                background: "#1f1f1f",
                border: "none",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: 600,
                color: "white",
                cursor: "pointer",
                transition: "all 0.2s ease",
                width: "100%",
              }}
            >
              {virado ? "Ver pergunta" : "Ver resposta"}
            </button>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={anterior}
                disabled={indexAtual === 0}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  background: "white",
                  border: "2px solid #e0e0e0",
                  borderRadius: "12px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "#1f1f1f",
                  cursor: indexAtual === 0 ? "not-allowed" : "pointer",
                  opacity: indexAtual === 0 ? 0.5 : 1,
                  transition: "all 0.2s ease",
                }}
              >
                ← Anterior
              </button>

              <button
                onClick={proximo}
                disabled={indexAtual === totalCards - 1}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  background: "white",
                  border: "2px solid #e0e0e0",
                  borderRadius: "12px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "#1f1f1f",
                  cursor:
                    indexAtual === totalCards - 1 ? "not-allowed" : "pointer",
                  opacity: indexAtual === totalCards - 1 ? 0.5 : 1,
                  transition: "all 0.2s ease",
                }}
              >
                Próximo →
              </button>
            </div>
          </>
        ) : (
          // Layout desktop
          <>
            <button
              onClick={anterior}
              disabled={indexAtual === 0}
              style={{
                padding: "1rem 2rem",
                background: "white",
                border: "2px solid #e0e0e0",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: 600,
                color: "#1f1f1f",
                cursor: indexAtual === 0 ? "not-allowed" : "pointer",
                opacity: indexAtual === 0 ? 0.5 : 1,
                transition: "all 0.2s ease",
              }}
            >
              ← Anterior
            </button>

            <button
              onClick={() => setVirado(!virado)}
              style={{
                padding: "1rem 3rem",
                background: "#1f1f1f",
                border: "none",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: 600,
                color: "white",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {virado ? "Ver pergunta" : "Ver resposta"}
            </button>

            <button
              onClick={proximo}
              disabled={indexAtual === totalCards - 1}
              style={{
                padding: "1rem 2rem",
                background: "white",
                border: "2px solid #e0e0e0",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: 600,
                color: "#1f1f1f",
                cursor:
                  indexAtual === totalCards - 1 ? "not-allowed" : "pointer",
                opacity: indexAtual === totalCards - 1 ? 0.5 : 1,
                transition: "all 0.2s ease",
              }}
            >
              Próximo →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
