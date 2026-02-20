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
import {
  ChevronLeft,
  Plus,
  BookOpen,
  Search,
  X,
  ChevronRight,
  Loader2,
  Layers,
} from "lucide-react";
import { NivelEnsino } from "@/types";
import { formatarNivel, getNivelIcone } from "@/lib/utils/formatadores";

// Interfaces baseadas na estrutura REAL do Firebase
interface NivelInfo {
  nivel: NivelEnsino;
  vagas: number;
  salario: string | number;
}

interface Concurso {
  id: string;
  nome: string;
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
  const [materiaSelecionada, setMateriaSelecionada] = useState("");
  const [busca, setBusca] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      try {
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

  const handleAddTopico = async (conteudoId: string) => {
    try {
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
            // Se existe, pega os dados
            const gradeData = gradeSnap.data();
            materiasExistentes = gradeData.materias || [];
          } else {
            console.log(`🆕 Criando nova grade para ${nivelSelecionado}`);
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
              cor: materiaInfo?.cor || "from-orange-500 to-orange-600",
              nivel: "intermediario",
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

          console.log(`✅ Grade ${nivelSelecionado} salva com sucesso!`);
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
        }
      }
    } catch (error) {
      console.error("Erro ao adicionar tópico:", error);
      alert("Erro ao adicionar tópico");
    }
  };

  const handleRemoveTopico = async (materia: string, conteudoId: string) => {
    try {
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
      }
    } catch (error) {
      console.error("Erro ao remover tópico:", error);
      alert("Erro ao remover tópico");
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
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>

        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">
            {concurso?.nome}
          </h1>
          <p className="text-gray-500 mt-1">
            Selecione os conteúdos do catálogo que caem neste concurso
          </p>
        </div>
      </div>

      {/* Seletor de Níveis */}
      {niveis.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecione o nível de ensino
          </label>
          <div className="flex flex-wrap gap-2">
            {niveis.map((nivel) => (
              <button
                key={nivel}
                onClick={() => setNivelSelecionado(nivel)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                  nivelSelecionado === nivel
                    ? "bg-orange-500 text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-orange-50"
                }`}
              >
                <span>{getNivelIcone(nivel)}</span>
                {formatarNivel(nivel)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid de Matérias */}
      {materias.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 mb-8">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold text-gray-900 mb-2">
            Nenhuma matéria cadastrada
          </h3>
          <p className="text-gray-500 mb-6">
            Primeiro você precisa cadastrar matérias no sistema
          </p>
          <Link
            href="/admin/materias"
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Gerenciar Matérias
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {materias.map((materia) => {
            const topicosSelecionados = gradeAtual[materia.id]?.length || 0;

            return (
              <div
                key={materia.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer"
                onClick={() => {
                  setMateriaSelecionada(materia.id);
                  setBusca("");
                  setShowModal(true);
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{materia.icone}</span>
                  <div>
                    <h3 className="font-display font-bold text-gray-900">
                      {materia.nome}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {topicosSelecionados} tópicos selecionados
                    </p>
                  </div>
                </div>

                {gradeAtual[materia.id] &&
                  gradeAtual[materia.id].length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">
                        Tópicos que caem:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {gradeAtual[materia.id].slice(0, 3).map((id) => {
                          const conteudo = catalogo.find((c) => c.id === id);
                          return (
                            conteudo && (
                              <span
                                key={id}
                                className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full"
                              >
                                {conteudo.titulo.length > 15
                                  ? conteudo.titulo.substring(0, 15) + "..."
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
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Seleção */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header do Modal */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display font-bold text-xl text-gray-900">
                  Selecionar tópicos de{" "}
                  {materias.find((m) => m.id === materiaSelecionada)?.nome}
                  {nivelSelecionado && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({formatarNivel(nivelSelecionado)})
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar tópicos..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                    className="text-orange-500 text-sm hover:underline mt-2 inline-block"
                  >
                    Criar novo conteúdo no catálogo
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {conteudosFiltrados.map((conteudo) => {
                    const isSelected = gradeAtual[materiaSelecionada]?.includes(
                      conteudo.id,
                    );

                    return (
                      <div
                        key={conteudo.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          isSelected
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-orange-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {conteudo.icone || "📚"}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900">
                              {conteudo.titulo}
                            </p>
                            {conteudo.descricao && (
                              <p className="text-sm text-gray-500">
                                {conteudo.descricao}
                              </p>
                            )}
                          </div>
                        </div>

                        {isSelected ? (
                          <button
                            onClick={() =>
                              handleRemoveTopico(
                                materiaSelecionada,
                                conteudo.id,
                              )
                            }
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddTopico(conteudo.id)}
                            className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {gradeAtual[materiaSelecionada]?.length || 0} tópicos
                  selecionados
                  {nivelSelecionado && (
                    <span className="ml-1 text-gray-400">
                      ({formatarNivel(nivelSelecionado)})
                    </span>
                  )}
                </span>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg"
                >
                  Concluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumo da Grade */}
      {materias.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-display font-bold text-gray-900 mb-4">
            Grade Curricular do Concurso
            {nivelSelecionado && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({formatarNivel(nivelSelecionado)})
              </span>
            )}
          </h2>

          {Object.keys(gradeAtual).length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum tópico selecionado ainda. Clique em uma matéria para
              adicionar.
            </p>
          ) : (
            <div className="space-y-4">
              {Object.entries(gradeAtual).map(([materiaId, topicos]) => {
                const materiaInfo = materias.find((m) => m.id === materiaId);
                if (!materiaInfo) return null;

                return (
                  <div
                    key={materiaId}
                    className="border-b border-gray-100 pb-4 last:border-0"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{materiaInfo.icone}</span>
                      <h3 className="font-medium text-gray-900">
                        {materiaInfo.nome}
                      </h3>
                      <span className="text-sm text-gray-500 ml-auto">
                        {topicos.length} tópicos
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {topicos.map((id) => {
                        const conteudo = catalogo.find((c) => c.id === id);
                        return (
                          conteudo && (
                            <span
                              key={id}
                              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                            >
                              {conteudo.titulo}
                              <button
                                onClick={() =>
                                  handleRemoveTopico(materiaId, id)
                                }
                                className="text-gray-400 hover:text-red-500"
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
          )}
        </div>
      )}
    </div>
  );
}
