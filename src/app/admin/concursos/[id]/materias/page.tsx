"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Plus,
  BookOpen,
  Search,
  X,
  ChevronRight,
  Loader2,
  Layers,
  GraduationCap,
  Sparkles,
  FileText,
  Tag,
  Check,
} from "lucide-react";

// Tipos baseados na estrutura do Firebase
type NivelEnsino =
  | "fundamental"
  | "medio"
  | "tecnico"
  | "superior"
  | "mestrado"
  | "doutorado"
  | "phd";

interface NivelInfo {
  nivel: NivelEnsino;
  vagas: number;
  salario: string | number;
}

interface Concurso {
  id: string;
  nome: string;
  banca?: string;
  orgao?: string;
  niveis?: NivelInfo[];
  grade?: Record<string, string[]>;
}

interface ConteudoCatalogo {
  id: string;
  titulo: string;
  descricao?: string;
  icone?: string;
  materiaId?: string;
  materiaNome?: string;
  nivel?: string;
}

interface Materia {
  id: string;
  nome: string;
  icone: string;
  cor: string;
  ordem?: number;
}

interface GradeMateria {
  id: string;
  nome: string;
  icone: string;
  cor: string;
  nivel?: string;
  obrigatoria?: boolean;
  peso?: number;
  topicos: string[];
}

interface GradePorNivel {
  [nivel: string]: Record<string, string[]>;
}

// Utilitários
const formatarNivel = (nivel: NivelEnsino): string => {
  const mapa: Record<NivelEnsino, string> = {
    fundamental: "Fundamental",
    medio: "Médio",
    tecnico: "Técnico",
    superior: "Superior",
    mestrado: "Mestrado",
    doutorado: "Doutorado",
    phd: "PhD",
  };
  return mapa[nivel] || nivel;
};

const getNivelIcone = (nivel: NivelEnsino) => {
  const icones: Record<NivelEnsino, JSX.Element> = {
    fundamental: <GraduationCap className="w-5 h-5" />,
    medio: <GraduationCap className="w-5 h-5" />,
    tecnico: <GraduationCap className="w-5 h-5" />,
    superior: <GraduationCap className="w-5 h-5" />,
    mestrado: <GraduationCap className="w-5 h-5" />,
    doutorado: <GraduationCap className="w-5 h-5" />,
    phd: <GraduationCap className="w-5 h-5" />,
  };
  return icones[nivel] || <GraduationCap className="w-5 h-5" />;
};

export default function MateriasPage() {
  const params = useParams();
  const router = useRouter();
  const concursoId = params.id as string;

  const [concurso, setConcurso] = useState<Concurso | null>(null);
  const [catalogo, setCatalogo] = useState<ConteudoCatalogo[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [gradePorNivel, setGradePorNivel] = useState<GradePorNivel>({});
  const [niveis, setNiveis] = useState<NivelEnsino[]>([]);
  const [nivelSelecionado, setNivelSelecionado] = useState<NivelEnsino | "">(
    "",
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [materiaSelecionada, setMateriaSelecionada] = useState("");
  const [busca, setBusca] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);

        // Carregar matérias do Firebase
        const materiasSnapshot = await getDocs(collection(db, "materias"));
        const materiasList = materiasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Materia[];
        setMaterias(
          materiasList.sort((a, b) => (a.ordem || 0) - (b.ordem || 0)),
        );

        // Carregar concurso
        const concursoDoc = await getDoc(doc(db, "concursos", concursoId));
        if (concursoDoc.exists()) {
          const data = concursoDoc.data();
          setConcurso({ id: concursoDoc.id, ...data } as Concurso);

          // Extrair níveis do array de objetos
          if (data.niveis && Array.isArray(data.niveis)) {
            const niveisList = data.niveis.map((item: NivelInfo) => item.nivel);
            setNiveis(niveisList);

            // Se tiver níveis, selecionar o primeiro
            if (niveisList.length > 0) {
              setNivelSelecionado(niveisList[0]);
            }
          }

          // Carregar grades por nível
          const grades: GradePorNivel = {};

          // Tenta carregar do campo grade (formato antigo)
          if (data.grade) {
            grades["default"] = data.grade;
          }

          // Se tiver níveis, tenta carregar grades específicas
          if (data.niveis && Array.isArray(data.niveis)) {
            for (const item of data.niveis) {
              const nivel = item.nivel;
              const gradeRef = doc(db, "grades", `${concursoId}_${nivel}`);
              const gradeSnap = await getDoc(gradeRef);

              if (gradeSnap.exists()) {
                const gradeData = gradeSnap.data();
                // Converter array de matérias para o formato Record<string, string[]>
                const gradeMap: Record<string, string[]> = {};
                if (gradeData.materias && Array.isArray(gradeData.materias)) {
                  gradeData.materias.forEach((m: GradeMateria) => {
                    if (m.id && m.topicos) {
                      gradeMap[m.id] = m.topicos;
                    }
                  });
                }
                grades[nivel] = gradeMap;
              }
            }
          }

          setGradePorNivel(grades);
        }

        // Carregar catálogo de conteúdos
        const catalogoSnapshot = await getDocs(collection(db, "catalogo"));
        const catalogoList = catalogoSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            titulo: data.titulo || "",
            descricao: data.descricao || "",
            icone: data.icone || "📚",
            materiaId: data.materiaId || data.materia || "",
            materiaNome: data.materiaNome || "",
            nivel: data.nivel || "",
          };
        }) as ConteudoCatalogo[];

        setCatalogo(catalogoList);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setFeedback({
          type: "error",
          message: "Erro ao carregar dados. Tente novamente.",
        });
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [concursoId]);

  const getGradeAtual = (): Record<string, string[]> => {
    if (!nivelSelecionado) return gradePorNivel["default"] || {};
    return gradePorNivel[nivelSelecionado] || gradePorNivel["default"] || {};
  };

  const mostrarFeedback = (tipo: "success" | "error", mensagem: string) => {
    setFeedback({ type: tipo, message: mensagem });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAddTopico = async (conteudoId: string) => {
    try {
      setSaving(true);
      const gradeAtual = getGradeAtual();
      const novaGrade = { ...gradeAtual };

      if (!novaGrade[materiaSelecionada]) {
        novaGrade[materiaSelecionada] = [];
      }

      if (!novaGrade[materiaSelecionada].includes(conteudoId)) {
        novaGrade[materiaSelecionada].push(conteudoId);

        // Se tem nível selecionado, salvar na grade específica
        if (nivelSelecionado) {
          const gradeRef = doc(
            db,
            "grades",
            `${concursoId}_${nivelSelecionado}`,
          );

          // Buscar grade atual do nível
          const gradeSnap = await getDoc(gradeRef);

          let materiasExistentes: GradeMateria[] = [];

          if (gradeSnap.exists()) {
            const gradeData = gradeSnap.data();
            materiasExistentes = gradeData.materias || [];
          }

          // Atualizar ou adicionar a matéria
          const materiaIndex = materiasExistentes.findIndex(
            (m: GradeMateria) => m.id === materiaSelecionada,
          );

          const materiaInfo = materias.find((m) => m.id === materiaSelecionada);

          if (materiaIndex >= 0) {
            materiasExistentes[materiaIndex].topicos =
              novaGrade[materiaSelecionada];
          } else {
            materiasExistentes.push({
              id: materiaSelecionada,
              nome: materiaInfo?.nome || "",
              icone: materiaInfo?.icone || "📚",
              cor: materiaInfo?.cor || "from-black to-purple-900",
              nivel: nivelSelecionado,
              topicos: novaGrade[materiaSelecionada],
              obrigatoria: true,
              peso: 1,
            });
          }

          await setDoc(
            gradeRef,
            {
              id: `${concursoId}_${nivelSelecionado}`,
              concursoId,
              nivel: nivelSelecionado,
              materias: materiasExistentes,
              updatedAt: new Date(),
            },
            { merge: true },
          );

          setGradePorNivel({
            ...gradePorNivel,
            [nivelSelecionado]: novaGrade,
          });

          mostrarFeedback("success", "Tópico adicionado com sucesso!");
        } else {
          // Salvar no campo grade do concurso (formato antigo)
          await updateDoc(doc(db, "concursos", concursoId), {
            grade: novaGrade,
            updatedAt: new Date(),
          });

          setGradePorNivel({
            ...gradePorNivel,
            default: novaGrade,
          });

          mostrarFeedback("success", "Tópico adicionado com sucesso!");
        }
      }
    } catch (error) {
      console.error("Erro ao adicionar tópico:", error);
      mostrarFeedback("error", "Erro ao adicionar tópico");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveTopico = async (materia: string, conteudoId: string) => {
    try {
      setSaving(true);
      const gradeAtual = getGradeAtual();
      const novaGrade = { ...gradeAtual };

      novaGrade[materia] = novaGrade[materia].filter((id) => id !== conteudoId);

      if (novaGrade[materia].length === 0) {
        delete novaGrade[materia];
      }

      if (nivelSelecionado) {
        // Atualizar na grade do nível
        const gradeRef = doc(db, "grades", `${concursoId}_${nivelSelecionado}`);
        const gradeSnap = await getDoc(gradeRef);

        if (gradeSnap.exists()) {
          const gradeData = gradeSnap.data();
          const materiasExistentes = gradeData.materias || [];
          const materiaIndex = materiasExistentes.findIndex(
            (m: GradeMateria) => m.id === materia,
          );

          if (materiaIndex >= 0) {
            if (novaGrade[materia]) {
              materiasExistentes[materiaIndex].topicos = novaGrade[materia];
            } else {
              materiasExistentes.splice(materiaIndex, 1);
            }

            await updateDoc(gradeRef, {
              materias: materiasExistentes,
              updatedAt: new Date(),
            });
          }
        }

        setGradePorNivel({
          ...gradePorNivel,
          [nivelSelecionado]: novaGrade,
        });

        mostrarFeedback("success", "Tópico removido com sucesso!");
      } else {
        // Salvar no campo grade do concurso
        await updateDoc(doc(db, "concursos", concursoId), {
          grade: novaGrade,
          updatedAt: new Date(),
        });

        setGradePorNivel({
          ...gradePorNivel,
          default: novaGrade,
        });

        mostrarFeedback("success", "Tópico removido com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao remover tópico:", error);
      mostrarFeedback("error", "Erro ao remover tópico");
    } finally {
      setSaving(false);
    }
  };

  // Filtrar conteúdos do catálogo por matéria e busca
  const conteudosFiltrados = catalogo.filter(
    (item) =>
      (item.materiaId === materiaSelecionada ||
        item.materiaNome === materiaSelecionada) &&
      (busca === "" || item.titulo.toLowerCase().includes(busca.toLowerCase())),
  );

  const gradeAtual = getGradeAtual();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header com gradiente preto/roxo */}
      <div className="bg-gradient-to-r from-black to-purple-900 text-white rounded-2xl p-8 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Grade Curricular</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-2">
              {concurso?.nome}
            </h1>
            <p className="text-white/80 text-lg">
              Selecione os conteúdos do catálogo que caem neste concurso
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="bg-white/10 cursor-pointer hover:bg-white/20 text-white p-3 rounded-xl transition flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-100 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 ${
              feedback.type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white`}
          >
            {feedback.type === "success" ? (
              <Check className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seletor de Níveis */}
      {niveis.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Selecione o nível de ensino
          </label>
          <div className="flex flex-wrap gap-2">
            {niveis.map((nivel) => (
              <button
                key={nivel}
                onClick={() => setNivelSelecionado(nivel)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
                  nivelSelecionado === nivel
                    ? "bg-gradient-to-r from-black to-purple-900 text-white shadow-lg"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span
                  className={
                    nivelSelecionado === nivel
                      ? "text-white"
                      : "text-purple-600"
                  }
                >
                  {getNivelIcone(nivel)}
                </span>
                {formatarNivel(nivel)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid de Matérias */}
      {materias.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-lg"
        >
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-bold text-xl text-gray-900 mb-2">
            Nenhuma matéria cadastrada
          </h3>
          <p className="text-gray-500 mb-6">
            Primeiro você precisa cadastrar matérias no sistema
          </p>
          <Link
            href="/admin/materias"
            className="bg-gradient-to-r from-black to-purple-900 text-white px-6 py-3 rounded-xl inline-flex items-center gap-2 hover:shadow-lg transition"
          >
            <Plus className="w-5 h-5" />
            Gerenciar Matérias
          </Link>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {materias.map((materia, index) => {
            const topicosSelecionados = gradeAtual[materia.id]?.length || 0;

            return (
              <motion.div
                key={materia.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition cursor-pointer group"
                onClick={() => {
                  setMateriaSelecionada(materia.id);
                  setBusca("");
                  setShowModal(true);
                }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${materia.cor || "from-black to-purple-900"} rounded-xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition`}
                  >
                    {materia.icone}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">
                      {materia.nome}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Layers className="w-4 h-4" />
                      {topicosSelecionados} tópico
                      {topicosSelecionados !== 1 ? "s" : ""} selecionado
                      {topicosSelecionados !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {gradeAtual[materia.id] &&
                  gradeAtual[materia.id].length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        Tópicos que caem:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {gradeAtual[materia.id].slice(0, 3).map((id) => {
                          const conteudo = catalogo.find((c) => c.id === id);
                          return (
                            conteudo && (
                              <span
                                key={id}
                                className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                              >
                                {conteudo.titulo.length > 12
                                  ? conteudo.titulo.substring(0, 12) + "..."
                                  : conteudo.titulo}
                              </span>
                            )
                          );
                        })}
                        {gradeAtual[materia.id].length > 3 && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            +{gradeAtual[materia.id].length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                <div className="mt-4 flex justify-end">
                  <span className="text-sm text-purple-600 group-hover:translate-x-1 transition flex items-center gap-1">
                    Selecionar tópicos
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Modal de Seleção */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header do Modal */}
              <div className="bg-gradient-to-r from-black to-purple-900 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-xl">Selecionar tópicos</h3>
                    <p className="text-white/80 text-sm mt-1">
                      {materias.find((m) => m.id === materiaSelecionada)?.nome}
                      {nivelSelecionado && (
                        <span className="ml-2 inline-flex items-center gap-1">
                          {getNivelIcone(nivelSelecionado)}
                          {formatarNivel(nivelSelecionado)}
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Busca */}
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar tópicos..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 outline-none"
                  />
                </div>
              </div>

              {/* Lista de Conteúdos */}
              <div className="p-6 overflow-y-auto max-h-[50vh]">
                {conteudosFiltrados.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {busca
                        ? "Nenhum tópico encontrado com essa busca"
                        : "Nenhum conteúdo cadastrado para esta matéria"}
                    </p>
                    <Link
                      href="/admin/catalogo/novo"
                      className="text-purple-600 text-sm hover:underline mt-2 inline-block"
                    >
                      Criar novo conteúdo no catálogo
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conteudosFiltrados.map((conteudo) => {
                      const isSelected = gradeAtual[
                        materiaSelecionada
                      ]?.includes(conteudo.id);

                      return (
                        <motion.div
                          key={conteudo.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 transition ${
                            isSelected
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 hover:border-purple-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">
                              {conteudo.icone || "📚"}
                            </span>
                            <div>
                              <p className="font-medium text-gray-900">
                                {conteudo.titulo}
                              </p>
                              {conteudo.descricao && (
                                <p className="text-sm text-gray-500 line-clamp-1">
                                  {conteudo.descricao}
                                </p>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              isSelected
                                ? handleRemoveTopico(
                                    materiaSelecionada,
                                    conteudo.id,
                                  )
                                : handleAddTopico(conteudo.id)
                            }
                            disabled={saving}
                            className={`p-2 rounded-lg transition ${
                              isSelected
                                ? "text-red-500 hover:bg-red-50"
                                : "text-purple-600 hover:bg-purple-50"
                            } disabled:opacity-50`}
                          >
                            {saving ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : isSelected ? (
                              <X className="w-5 h-5" />
                            ) : (
                              <Plus className="w-5 h-5" />
                            )}
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-600" />
                    {gradeAtual[materiaSelecionada]?.length || 0} tópicos
                    selecionados
                  </span>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 bg-gradient-to-r from-black to-purple-900 text-white rounded-lg hover:shadow-lg transition"
                  >
                    Concluir
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resumo da Grade */}
      {materias.length > 0 && Object.keys(gradeAtual).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
        >
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-purple-600" />
            <h2 className="font-bold text-xl text-gray-900">
              Grade Curricular do Concurso
              {nivelSelecionado && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({formatarNivel(nivelSelecionado)})
                </span>
              )}
            </h2>
          </div>

          <div className="space-y-6">
            {Object.entries(gradeAtual).map(([materiaId, topicos]) => {
              const materiaInfo = materias.find((m) => m.id === materiaId);
              if (!materiaInfo) return null;

              return (
                <div
                  key={materiaId}
                  className="border-b border-gray-100 pb-6 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-8 h-8 bg-gradient-to-br ${materiaInfo.cor || "from-black to-purple-900"} rounded-lg flex items-center justify-center text-white`}
                    >
                      {materiaInfo.icone}
                    </div>
                    <h3 className="font-medium text-gray-900">
                      {materiaInfo.nome}
                    </h3>
                    <span className="text-sm text-gray-500 ml-auto">
                      {topicos.length} tópico{topicos.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-11">
                    {topicos.map((id) => {
                      const conteudo = catalogo.find((c) => c.id === id);
                      return (
                        conteudo && (
                          <span
                            key={id}
                            className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 group"
                          >
                            <span>{conteudo.icone || "📚"}</span>
                            {conteudo.titulo}
                            <button
                              onClick={() => handleRemoveTopico(materiaId, id)}
                              disabled={saving}
                              className="text-gray-400 hover:text-red-500 transition ml-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </span>
                        )
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
