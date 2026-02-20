"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  ChevronLeft,
  Loader2,
  Plus,
  Trash2,
  Edit,
  Save,
  BookOpen,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Layers,
} from "lucide-react";
import { NivelEnsino, GradeCurricular, GradeMateria } from "@/types";
import { formatarNivel, getNivelIcone } from "@/lib/utils/formatadores";

interface MateriaCatalogo {
  id: string;
  nome: string;
  icone: string;
  cor: string;
}

interface TopicoInfo {
  id: string;
  titulo: string;
  materiaId: string;
  tempoEstimado: number;
}

export default function GradePage() {
  const params = useParams();
  const router = useRouter();
  const concursoId = params.id as string;
  const nivel = params.nivel as NivelEnsino;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [concurso, setConcurso] = useState<any>(null);
  const [materiasCatalogo, setMateriasCatalogo] = useState<MateriaCatalogo[]>(
    [],
  );
  const [topicos, setTopicos] = useState<Record<string, TopicoInfo[]>>({});
  const [grade, setGrade] = useState<GradeCurricular>({
    id: `${concursoId}_${nivel}`,
    concursoId,
    nivel,
    nome: formatarNivel(nivel),
    materias: [],
  });

  const [materiaEmEdicao, setMateriaEmEdicao] = useState<{
    index?: number;
    id: string;
    nome: string;
    icone: string;
    cor: string;
    nivel: "basico" | "intermediario" | "avancado";
    topicos: string[];
    obrigatoria: boolean;
    peso: number;
  } | null>(null);

  const [topicosDisponiveis, setTopicosDisponiveis] = useState<TopicoInfo[]>(
    [],
  );
  const [buscaTopico, setBuscaTopico] = useState("");

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);

        // Carregar concurso
        const concursoRef = doc(db, "concursos", concursoId);
        const concursoSnap = await getDoc(concursoRef);
        if (concursoSnap.exists()) {
          setConcurso(concursoSnap.data());
        }

        // Carregar matérias do catálogo
        const materiasSnap = await getDocs(collection(db, "materias"));
        const materiasList = materiasSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as MateriaCatalogo[];
        setMateriasCatalogo(materiasList);

        // Carregar grade existente
        const gradeRef = doc(db, "grades", `${concursoId}_${nivel}`);
        const gradeSnap = await getDoc(gradeRef);

        if (gradeSnap.exists()) {
          const gradeData = gradeSnap.data() as GradeCurricular;
          setGrade(gradeData);
        }

        // Carregar todos os tópicos do catálogo
        const topicosSnap = await getDocs(collection(db, "catalogo"));
        const topicosMap: Record<string, TopicoInfo[]> = {};
        const topicosList: TopicoInfo[] = [];

        topicosSnap.docs.forEach((doc) => {
          const data = doc.data();
          const topico = {
            id: doc.id,
            titulo: data.titulo || "",
            materiaId: data.materiaId || "",
            tempoEstimado: data.tempoEstimado || 30,
          };

          if (!topicosMap[data.materiaId]) {
            topicosMap[data.materiaId] = [];
          }
          topicosMap[data.materiaId].push(topico);
          topicosList.push(topico);
        });

        setTopicos(topicosMap);
        setTopicosDisponiveis(topicosList);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [concursoId, nivel]);

  const handleAdicionarMateria = () => {
    setMateriaEmEdicao({
      id: "",
      nome: "",
      icone: "📚",
      cor: "from-orange-500 to-orange-600",
      nivel: "intermediario",
      topicos: [],
      obrigatoria: true,
      peso: 1,
    });
  };

  const handleSalvarMateria = () => {
    if (!materiaEmEdicao) return;
    if (!materiaEmEdicao.nome) {
      alert("Nome da matéria é obrigatório");
      return;
    }

    const materiaData: GradeMateria = {
      id: materiaEmEdicao.id || `materia_${Date.now()}`,
      nome: materiaEmEdicao.nome,
      icone: materiaEmEdicao.icone,
      cor: materiaEmEdicao.cor,
      nivel: materiaEmEdicao.nivel,
      topicos: materiaEmEdicao.topicos,
      obrigatoria: materiaEmEdicao.obrigatoria,
      peso: materiaEmEdicao.peso,
    };

    const novasMaterias = [...grade.materias];
    if (materiaEmEdicao.index !== undefined) {
      // Editar existente
      novasMaterias[materiaEmEdicao.index] = materiaData;
    } else {
      // Adicionar nova
      novasMaterias.push(materiaData);
    }

    setGrade({ ...grade, materias: novasMaterias });
    setMateriaEmEdicao(null);
  };

  const handleRemoverMateria = (index: number) => {
    if (!confirm("Remover esta matéria da grade?")) return;
    const novasMaterias = [...grade.materias];
    novasMaterias.splice(index, 1);
    setGrade({ ...grade, materias: novasMaterias });
  };

  const handleSalvarGrade = async () => {
    setSaving(true);
    try {
      const gradeRef = doc(db, "grades", `${concursoId}_${nivel}`);

      await setDoc(
        gradeRef,
        {
          ...grade,
          updatedAt: Timestamp.now(),
        },
        { merge: true },
      );

      router.push(`/admin/concursos/${concursoId}/niveis`);
    } catch (error) {
      console.error("Erro ao salvar grade:", error);
      alert("Erro ao salvar grade");
    } finally {
      setSaving(false);
    }
  };

  const topicosFiltrados = topicosDisponiveis.filter((t) =>
    t.titulo.toLowerCase().includes(buscaTopico.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Voltar para níveis</span>
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{getNivelIcone(nivel)}</span>
              <h1 className="font-display text-3xl font-bold text-gray-900">
                {formatarNivel(nivel)}
              </h1>
            </div>
            <p className="text-gray-500">{concurso?.nome} • Grade curricular</p>
          </div>

          <button
            onClick={handleSalvarGrade}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salvar Grade
              </>
            )}
          </button>
        </div>
      </div>

      {/* Lista de matérias */}
      <div className="space-y-4 mb-8">
        {grade.materias.map((materia, index) => (
          <div
            key={materia.id}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            {/* Cabeçalho da matéria */}
            <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                  <span className="text-3xl">{materia.icone}</span>
                  <div>
                    <h3 className="font-display font-bold text-xl text-gray-900">
                      {materia.nome}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          materia.nivel === "basico"
                            ? "bg-green-100 text-green-600"
                            : materia.nivel === "intermediario"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-red-100 text-red-600"
                        }`}
                      >
                        {materia.nivel === "basico"
                          ? "Básico"
                          : materia.nivel === "intermediario"
                            ? "Intermediário"
                            : "Avançado"}
                      </span>
                      <span className="text-sm text-gray-500">
                        Peso: {materia.peso}
                      </span>
                      <span
                        className={`text-sm ${materia.obrigatoria ? "text-orange-500" : "text-gray-400"}`}
                      >
                        {materia.obrigatoria ? "Obrigatória" : "Optativa"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setMateriaEmEdicao({
                        index,
                        id: materia.id,
                        nome: materia.nome,
                        icone: materia.icone,
                        cor: materia.cor,
                        nivel: materia.nivel,
                        topicos: materia.topicos,
                        obrigatoria: materia.obrigatoria,
                        peso: materia.peso,
                      })
                    }
                    className="p-2 text-gray-400 hover:text-orange-500 transition"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleRemoverMateria(index)}
                    className="p-2 text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de tópicos */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-700">
                  Tópicos ({materia.topicos.length})
                </h4>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {materia.topicos.map((topicoId) => {
                  const topico = topicosDisponiveis.find(
                    (t) => t.id === topicoId,
                  );
                  return topico ? (
                    <div
                      key={topicoId}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {topico.titulo}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {topico.tempoEstimado} min
                      </p>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Botão adicionar matéria */}
        <button
          onClick={handleAdicionarMateria}
          className="w-full py-6 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 hover:border-orange-300 hover:text-orange-500 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Adicionar matéria
        </button>
      </div>

      {/* Modal de edição de matéria */}
      {materiaEmEdicao && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-display font-bold text-xl text-gray-900">
                {materiaEmEdicao.index !== undefined ? "Editar" : "Nova"}{" "}
                Matéria
              </h3>
            </div>

            <div className="p-6 space-y-4">
              {/* Dados básicos */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Matéria
                  </label>
                  <select
                    value={materiaEmEdicao.id}
                    onChange={(e) => {
                      const materia = materiasCatalogo.find(
                        (m) => m.id === e.target.value,
                      );
                      setMateriaEmEdicao({
                        ...materiaEmEdicao,
                        id: e.target.value,
                        nome: materia?.nome || "",
                        icone: materia?.icone || "📚",
                        cor: materia?.cor || "from-orange-500 to-orange-600",
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Selecione uma matéria</option>
                    {materiasCatalogo.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.icone} {m.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nível da matéria
                  </label>
                  <select
                    value={materiaEmEdicao.nivel}
                    onChange={(e) =>
                      setMateriaEmEdicao({
                        ...materiaEmEdicao,
                        nivel: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="basico">Básico</option>
                    <option value="intermediario">Intermediário</option>
                    <option value="avancado">Avançado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Peso
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={materiaEmEdicao.peso}
                    onChange={(e) =>
                      setMateriaEmEdicao({
                        ...materiaEmEdicao,
                        peso: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={materiaEmEdicao.obrigatoria}
                      onChange={(e) =>
                        setMateriaEmEdicao({
                          ...materiaEmEdicao,
                          obrigatoria: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">
                      Matéria obrigatória
                    </span>
                  </label>
                </div>
              </div>

              {/* Seleção de tópicos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tópicos da matéria
                </label>

                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Buscar tópicos..."
                    value={buscaTopico}
                    onChange={(e) => setBuscaTopico(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                  {topicosFiltrados.map((topico) => (
                    <label
                      key={topico.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                    >
                      <input
                        type="checkbox"
                        checked={materiaEmEdicao.topicos.includes(topico.id)}
                        onChange={(e) => {
                          const novosTopicos = e.target.checked
                            ? [...materiaEmEdicao.topicos, topico.id]
                            : materiaEmEdicao.topicos.filter(
                                (id) => id !== topico.id,
                              );
                          setMateriaEmEdicao({
                            ...materiaEmEdicao,
                            topicos: novosTopicos,
                          });
                        }}
                        className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {topico.titulo}
                        </p>
                        <p className="text-xs text-gray-500">
                          {topico.tempoEstimado} min
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setMateriaEmEdicao(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarMateria}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              >
                Salvar Matéria
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
