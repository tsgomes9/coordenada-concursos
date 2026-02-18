"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import Link from "next/link";
import {
  ChevronLeft,
  Plus,
  Edit,
  Trash2,
  FileText,
  Headphones,
  Clock,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  GripVertical,
  Save,
} from "lucide-react";

interface Topico {
  id: string;
  titulo: string;
  descricao: string;
  ordem: number;
  tempoEstimado: number;
  isPreview: boolean;
  audioUrl: string;
  conteudoId: string; // ID para o JSON
}

export default function Topicospage() {
  const params = useParams();
  const router = useRouter();
  const concursoId = params.id as string;
  const materiaId = params.materiaId as string;

  const [concurso, setConcurso] = useState<any>(null);
  const [materia, setMateria] = useState<any>(null);
  const [topicos, setTopicos] = useState<Topico[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editandoTopico, setEditandoTopico] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Estado do formulário
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    tempoEstimado: 30,
    isPreview: false,
    audioUrl: "",
    introducao: "",
    topicos: [] as any[],
    exercicios: [] as any[],
    flashcards: [] as any[],
  });

  // Estado para abas do conteúdo
  const [abaAtiva, setAbaAtiva] = useState("conteudo");

  useEffect(() => {
    async function carregarDados() {
      // Carregar concurso
      const concursoDoc = await getDoc(doc(db, "concursos", concursoId));
      if (concursoDoc.exists()) {
        setConcurso({ id: concursoDoc.id, ...concursoDoc.data() });
      }

      // Carregar matéria
      const materiaDoc = await getDoc(doc(db, "materias", materiaId));
      if (materiaDoc.exists()) {
        setMateria({ id: materiaDoc.id, ...materiaDoc.data() });
      }

      // Carregar tópicos
      const topicosQuery = query(
        collection(db, "topicos"),
        where("materiaId", "==", materiaId),
      );
      const topicosSnapshot = await getDocs(topicosQuery);
      const topicosList = topicosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Topico[];

      setTopicos(topicosList.sort((a, b) => a.ordem - b.ordem));
      setLoading(false);
    }

    carregarDados();
  }, [concursoId, materiaId]);

  const handleAddTopico = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const novaOrdem = topicos.length + 1;
      const topicoId = `${materia?.nome?.toLowerCase().replace(/\s+/g, "-")}-${formData.titulo.toLowerCase().replace(/\s+/g, "-")}`;

      // 1. Salvar metadados no Firebase
      const docRef = await addDoc(collection(db, "topicos"), {
        concursoId,
        materiaId,
        titulo: formData.titulo,
        descricao: formData.descricao,
        tempoEstimado: formData.tempoEstimado,
        isPreview: formData.isPreview,
        audioUrl: formData.audioUrl || "",
        ordem: novaOrdem,
        conteudoId: topicoId,
        createdAt: Timestamp.now(),
      });

      // 2. Salvar conteúdo completo no JSON (via API)
      const response = await fetch("/api/salvar-conteudo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: topicoId,
          materia: materia?.nome,
          titulo: formData.titulo,
          introducao: formData.introducao,
          topicos: formData.topicos,
          exercicios: formData.exercicios,
          flashcards: formData.flashcards,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar arquivo JSON");
      }

      // Limpar formulário
      setShowForm(false);
      setFormData({
        titulo: "",
        descricao: "",
        tempoEstimado: 30,
        isPreview: false,
        audioUrl: "",
        introducao: "",
        topicos: [],
        exercicios: [],
        flashcards: [],
      });

      // Recarregar lista
      const topicosQuery = query(
        collection(db, "topicos"),
        where("materiaId", "==", materiaId),
      );
      const topicosSnapshot = await getDocs(topicosQuery);
      const topicosList = topicosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Topico[];
      setTopicos(topicosList.sort((a, b) => a.ordem - b.ordem));

      alert("✅ Tópico salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar tópico:", error);
      alert("❌ Erro ao adicionar tópico");
    } finally {
      setSaving(false);
    }
  };

  // Funções auxiliares para adicionar itens
  const addTopicoConteudo = () => {
    setFormData({
      ...formData,
      topicos: [
        ...formData.topicos,
        { id: Date.now().toString(), titulo: "", html: "" },
      ],
    });
  };

  const addExercicio = () => {
    setFormData({
      ...formData,
      exercicios: [
        ...formData.exercicios,
        {
          id: Date.now().toString(),
          pergunta: "",
          alternativas: ["", "", "", ""],
          correta: 0,
          explicacao: "",
        },
      ],
    });
  };

  const addFlashcard = () => {
    setFormData({
      ...formData,
      flashcards: [
        ...formData.flashcards,
        { id: Date.now().toString(), frente: "", verso: "" },
      ],
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
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
          <span>Voltar para matérias</span>
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-orange-500 font-medium">
                {concurso?.nome}
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold text-gray-900">
              {materia?.nome}
            </h1>
            <p className="text-gray-500 mt-1">
              Gerencie os tópicos desta matéria
            </p>
          </div>

          <button
            onClick={() => {
              setEditandoTopico(null);
              setFormData({
                titulo: "",
                descricao: "",
                tempoEstimado: 30,
                isPreview: false,
                audioUrl: "",
                introducao: "",
                topicos: [],
                exercicios: [],
                flashcards: [],
              });
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:shadow-lg transition"
          >
            <Plus className="w-5 h-5" />
            Novo Tópico
          </button>
        </div>
      </div>

      {/* Formulário de Novo Tópico */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="font-display font-bold text-gray-900 mb-4">
            {editandoTopico ? "Editar Tópico" : "Novo Tópico"}
          </h3>

          <form onSubmit={handleAddTopico} className="space-y-4">
            {/* Abas */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                type="button"
                onClick={() => setAbaAtiva("conteudo")}
                className={`px-4 py-2 font-medium text-sm ${
                  abaAtiva === "conteudo"
                    ? "text-orange-500 border-b-2 border-orange-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Conteúdo Principal
              </button>
              <button
                type="button"
                onClick={() => setAbaAtiva("topicos")}
                className={`px-4 py-2 font-medium text-sm ${
                  abaAtiva === "topicos"
                    ? "text-orange-500 border-b-2 border-orange-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Tópicos Internos
              </button>
              <button
                type="button"
                onClick={() => setAbaAtiva("exercicios")}
                className={`px-4 py-2 font-medium text-sm ${
                  abaAtiva === "exercicios"
                    ? "text-orange-500 border-b-2 border-orange-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Exercícios
              </button>
              <button
                type="button"
                onClick={() => setAbaAtiva("flashcards")}
                className={`px-4 py-2 font-medium text-sm ${
                  abaAtiva === "flashcards"
                    ? "text-orange-500 border-b-2 border-orange-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Flashcards
              </button>
            </div>

            {/* Aba: Conteúdo Principal */}
            {abaAtiva === "conteudo" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título do Tópico *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.titulo}
                    onChange={(e) =>
                      setFormData({ ...formData, titulo: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Ex: Uso da Crase"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) =>
                      setFormData({ ...formData, descricao: e.target.value })
                    }
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Breve descrição do conteúdo..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tempo estimado (minutos)
                    </label>
                    <input
                      type="number"
                      value={formData.tempoEstimado}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tempoEstimado: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de acesso
                    </label>
                    <div className="flex items-center gap-4 mt-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={!formData.isPreview}
                          onChange={() =>
                            setFormData({ ...formData, isPreview: false })
                          }
                          className="text-orange-500 focus:ring-orange-500"
                        />
                        <Lock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">Assinantes</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={formData.isPreview}
                          onChange={() =>
                            setFormData({ ...formData, isPreview: true })
                          }
                          className="text-orange-500 focus:ring-orange-500"
                        />
                        <Unlock className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Grátis (Preview)</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL do Áudio (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.audioUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, audioUrl: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="/audios/portugues/crases.mp3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Introdução (HTML)
                  </label>
                  <textarea
                    value={formData.introducao}
                    onChange={(e) =>
                      setFormData({ ...formData, introducao: e.target.value })
                    }
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-mono text-sm"
                    placeholder="<p>Texto introdutório...</p>"
                  />
                </div>
              </div>
            )}

            {/* Aba: Tópicos Internos */}
            {abaAtiva === "topicos" && (
              <div className="space-y-4">
                {formData.topicos.map((topico, index) => (
                  <div key={topico.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium">Tópico {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => {
                          const novos = [...formData.topicos];
                          novos.splice(index, 1);
                          setFormData({ ...formData, topicos: novos });
                        }}
                        className="text-red-500 text-sm"
                      >
                        Remover
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Título do tópico"
                      value={topico.titulo}
                      onChange={(e) => {
                        const novos = [...formData.topicos];
                        novos[index].titulo = e.target.value;
                        setFormData({ ...formData, topicos: novos });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                    />
                    <textarea
                      placeholder="Conteúdo HTML"
                      value={topico.html}
                      onChange={(e) => {
                        const novos = [...formData.topicos];
                        novos[index].html = e.target.value;
                        setFormData({ ...formData, topicos: novos });
                      }}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTopicoConteudo}
                  className="text-orange-500 text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar tópico
                </button>
              </div>
            )}

            {/* Aba: Exercícios */}
            {abaAtiva === "exercicios" && (
              <div className="space-y-4">
                {formData.exercicios.map((ex, index) => (
                  <div key={ex.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium">Exercício {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => {
                          const novos = [...formData.exercicios];
                          novos.splice(index, 1);
                          setFormData({ ...formData, exercicios: novos });
                        }}
                        className="text-red-500 text-sm"
                      >
                        Remover
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Pergunta"
                      value={ex.pergunta}
                      onChange={(e) => {
                        const novos = [...formData.exercicios];
                        novos[index].pergunta = e.target.value;
                        setFormData({ ...formData, exercicios: novos });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                    />
                    {ex.alternativas.map((alt: string, i: number) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          type="radio"
                          name={`correta-${ex.id}`}
                          checked={ex.correta === i}
                          onChange={() => {
                            const novos = [...formData.exercicios];
                            novos[index].correta = i;
                            setFormData({ ...formData, exercicios: novos });
                          }}
                        />
                        <input
                          type="text"
                          placeholder={`Alternativa ${String.fromCharCode(65 + i)}`}
                          value={alt}
                          onChange={(e) => {
                            const novos = [...formData.exercicios];
                            novos[index].alternativas[i] = e.target.value;
                            setFormData({ ...formData, exercicios: novos });
                          }}
                          className="flex-1 px-3 py-1 border border-gray-300 rounded-lg"
                        />
                      </div>
                    ))}
                    <textarea
                      placeholder="Explicação"
                      value={ex.explicacao}
                      onChange={(e) => {
                        const novos = [...formData.exercicios];
                        novos[index].explicacao = e.target.value;
                        setFormData({ ...formData, exercicios: novos });
                      }}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addExercicio}
                  className="text-orange-500 text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar exercício
                </button>
              </div>
            )}

            {/* Aba: Flashcards */}
            {abaAtiva === "flashcards" && (
              <div className="space-y-4">
                {formData.flashcards.map((card, index) => (
                  <div key={card.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium">Flashcard {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => {
                          const novos = [...formData.flashcards];
                          novos.splice(index, 1);
                          setFormData({ ...formData, flashcards: novos });
                        }}
                        className="text-red-500 text-sm"
                      >
                        Remover
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Frente"
                      value={card.frente}
                      onChange={(e) => {
                        const novos = [...formData.flashcards];
                        novos[index].frente = e.target.value;
                        setFormData({ ...formData, flashcards: novos });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                    />
                    <textarea
                      placeholder="Verso"
                      value={card.verso}
                      onChange={(e) => {
                        const novos = [...formData.flashcards];
                        novos[index].verso = e.target.value;
                        setFormData({ ...formData, flashcards: novos });
                      }}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFlashcard}
                  className="text-orange-500 text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar flashcard
                </button>
              </div>
            )}

            {/* Botões do formulário */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar Tópico
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Tópicos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-16 p-4 text-center">#</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">
                Tópico
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">
                Tempo
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">
                Acesso
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">
                Áudio
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">
                JSON
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {topicos.map((topico, index) => (
              <tr
                key={topico.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="p-4 text-center text-gray-500">
                  <GripVertical className="w-4 h-4 inline text-gray-400" />
                  {topico.ordem}
                </td>
                <td className="p-4">
                  <div>
                    <p className="font-medium text-gray-900">{topico.titulo}</p>
                    {topico.descricao && (
                      <p className="text-sm text-gray-500">
                        {topico.descricao}
                      </p>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {topico.tempoEstimado} min
                  </span>
                </td>
                <td className="p-4">
                  {topico.isPreview ? (
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      <Eye className="w-4 h-4" />
                      Grátis
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm text-gray-400">
                      <EyeOff className="w-4 h-4" />
                      Assinantes
                    </span>
                  )}
                </td>
                <td className="p-4">
                  {topico.audioUrl ? (
                    <span className="flex items-center gap-1 text-sm text-orange-500">
                      <Headphones className="w-4 h-4" />
                      Sim
                    </span>
                  ) : (
                    <span className="text-sm text-gray-300">Não</span>
                  )}
                </td>
                <td className="p-4">
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                    {topico.conteudoId}.json
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        // Carregar dados para edição
                        setEditandoTopico(topico);
                        // Aqui você carregaria o JSON também
                        setShowForm(true);
                      }}
                      className="p-2 hover:bg-orange-100 rounded-lg transition text-orange-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <Link
                      href={`/materia/${materia?.nome?.toLowerCase().replace(/\s+/g, "-")}/topico/${topico.conteudoId}`}
                      target="_blank"
                      className="p-2 hover:bg-blue-100 rounded-lg transition text-blue-600"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
