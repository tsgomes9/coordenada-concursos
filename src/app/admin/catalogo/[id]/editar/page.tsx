"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  doc,
  getDoc,
  updateDoc,
  Timestamp,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  ChevronLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  Lock,
  Unlock,
  BookOpen,
  FileText,
  Headphones,
  Zap,
  Tag,
  Clock,
  Sparkles,
  Layers,
  HelpCircle,
} from "lucide-react";

interface Materia {
  id: string;
  nome: string;
  icone: string;
}

interface TopicoInterno {
  titulo: string;
  html: string;
}

interface Exercicio {
  pergunta: string;
  alternativas: string[];
  correta: number;
  explicacao: string;
}

interface Flashcard {
  frente: string;
  verso: string;
}

export default function EditarConteudoPage() {
  const params = useParams();
  const router = useRouter();
  const conteudoId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [abaAtiva, setAbaAtiva] = useState("conteudo");

  const [formData, setFormData] = useState({
    materia: "",
    titulo: "",
    descricao: "",
    tags: "",
    nivel: "intermediario" as "iniciante" | "intermediario" | "avancado",
    tempoEstimado: 45,
    icone: "📚",
    cor: "from-purple-500 to-purple-600",
    isPreview: false,
    introducao: "",
    topicos: [] as TopicoInterno[],
    exercicios: [] as Exercicio[],
    flashcards: [] as Flashcard[],
  });

  useEffect(() => {
    async function carregarDados() {
      try {
        // Carregar matérias
        const materiasSnapshot = await getDocs(collection(db, "materias"));
        const materiasList = materiasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Materia[];
        setMaterias(materiasList);

        // Buscar conteúdo pelo document ID
        const docRef = doc(db, "catalogo", conteudoId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          // Buscar JSON para pegar HTML, flashcards e exercícios
          let introducao = data.introducao || "";
          let topicos: TopicoInterno[] = [];
          let exercicios: Exercicio[] = [];
          let flashcards: Flashcard[] = [];

          try {
            const jsonRes = await fetch(
              `/data/conteudo/${data.materiaSlug || data.materia}/${conteudoId}.json`,
            );
            if (jsonRes.ok) {
              const jsonData = await jsonRes.json();
              introducao = jsonData.introducao || "";
              topicos = jsonData.topicos || [];
              exercicios = jsonData.exercicios || [];
              flashcards = jsonData.flashcards || [];
            }
          } catch (error) {
            console.log("JSON não encontrado, usando dados do Firebase");
          }

          setFormData({
            materia: data.materia || data.materiaId || "",
            titulo: data.titulo || "",
            descricao: data.descricao || "",
            tags: data.tags?.join(", ") || "",
            nivel: data.nivel || "intermediario",
            tempoEstimado: data.tempoEstimado || 45,
            icone: data.icone || "📚",
            cor: data.cor || "from-purple-500 to-purple-600",
            isPreview: data.isPreview || false,
            introducao: introducao,
            topicos: topicos,
            exercicios: exercicios,
            flashcards: flashcards,
          });
        } else {
          alert("Conteúdo não encontrado");
          router.push("/admin/catalogo");
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        alert("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [conteudoId, router]);

  // Funções para Tópicos Internos
  const adicionarTopico = () => {
    setFormData({
      ...formData,
      topicos: [...formData.topicos, { titulo: "", html: "" }],
    });
  };

  const removerTopico = (index: number) => {
    const novos = [...formData.topicos];
    novos.splice(index, 1);
    setFormData({ ...formData, topicos: novos });
  };

  const atualizarTopico = (
    index: number,
    campo: keyof TopicoInterno,
    valor: string,
  ) => {
    const novos = [...formData.topicos];
    novos[index][campo] = valor;
    setFormData({ ...formData, topicos: novos });
  };

  // Funções para Exercícios
  const adicionarExercicio = () => {
    setFormData({
      ...formData,
      exercicios: [
        ...formData.exercicios,
        {
          pergunta: "",
          alternativas: ["", "", "", ""],
          correta: 0,
          explicacao: "",
        },
      ],
    });
  };

  const removerExercicio = (index: number) => {
    const novos = [...formData.exercicios];
    novos.splice(index, 1);
    setFormData({ ...formData, exercicios: novos });
  };

  const atualizarExercicio = (
    index: number,
    campo: keyof Exercicio,
    valor: string | number | string[],
  ) => {
    const novos = [...formData.exercicios];

    switch (campo) {
      case "correta":
        novos[index][campo] = valor as number;
        break;
      case "alternativas":
        novos[index][campo] = valor as string[];
        break;
      default:
        novos[index][campo] = valor as string;
    }

    setFormData({ ...formData, exercicios: novos });
  };

  const atualizarAlternativa = (
    exIndex: number,
    altIndex: number,
    valor: string,
  ) => {
    const novos = [...formData.exercicios];
    novos[exIndex].alternativas[altIndex] = valor;
    setFormData({ ...formData, exercicios: novos });
  };

  // Funções para Flashcards
  const adicionarFlashcard = () => {
    setFormData({
      ...formData,
      flashcards: [...formData.flashcards, { frente: "", verso: "" }],
    });
  };

  const removerFlashcard = (index: number) => {
    const novos = [...formData.flashcards];
    novos.splice(index, 1);
    setFormData({ ...formData, flashcards: novos });
  };

  const atualizarFlashcard = (
    index: number,
    campo: keyof Flashcard,
    valor: string,
  ) => {
    const novos = [...formData.flashcards];
    novos[index][campo] = valor;
    setFormData({ ...formData, flashcards: novos });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const materiaSelecionada = materias.find(
        (m) => m.id === formData.materia,
      );

      // Gerar slugs
      const materiaSlug =
        materiaSelecionada?.nome
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^\w\s]/gi, "")
          .replace(/\s+/g, "-") || "";

      // Atualizar Firebase
      const docRef = doc(db, "catalogo", conteudoId);
      await updateDoc(docRef, {
        materia: formData.materia,
        materiaNome: materiaSelecionada?.nome,
        materiaSlug: materiaSlug,
        titulo: formData.titulo,
        descricao: formData.descricao,
        tags: formData.tags.split(",").map((t) => t.trim()),
        nivel: formData.nivel,
        tempoEstimado: formData.tempoEstimado,
        icone: formData.icone,
        cor: formData.cor,
        isPreview: formData.isPreview,
        updatedAt: Timestamp.now(),
      });

      // Atualizar HTML e JSON via API
      const response = await fetch("/api/salvar-conteudo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: conteudoId,
          materia: materiaSelecionada?.nome,
          materiaSlug: materiaSlug,
          titulo: formData.titulo,
          isPreview: formData.isPreview,
          introducao: formData.introducao,
          topicos: formData.topicos,
          exercicios: formData.exercicios,
          flashcards: formData.flashcards,
        }),
      });

      if (!response.ok) throw new Error("Erro ao salvar arquivos");

      router.push("/admin/catalogo");
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao salvar conteúdo");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full mb-4"
        />
        <p className="text-gray-500">Carregando conteúdo...</p>
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
              <span className="text-sm font-medium">Editar Conteúdo</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-2">
              {formData.titulo}
            </h1>
            <p className="text-purple-200 text-lg max-w-2xl">
              Edição de informações de tópicos no catálogo
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="bg-white/10 hover:bg-white/20 cursor-pointer text-white p-3 rounded-xl transition flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
        </div>
      </div>

      {/* Abas */}
      <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-200 flex flex-wrap gap-1">
        <button
          onClick={() => setAbaAtiva("conteudo")}
          className={`flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            abaAtiva === "conteudo"
              ? "bg-gradient-to-r from-black to-purple-900 text-white shadow-lg"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Conteúdo
        </button>
        <button
          onClick={() => setAbaAtiva("topicos")}
          className={`flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            abaAtiva === "topicos"
              ? "bg-gradient-to-r from-black to-purple-900 text-white shadow-lg"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Layers className="w-4 h-4" />
          Tópicos
        </button>
        <button
          onClick={() => setAbaAtiva("exercicios")}
          className={`flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            abaAtiva === "exercicios"
              ? "bg-gradient-to-r from-black to-purple-900 text-white shadow-lg"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Exercícios
        </button>
        <button
          onClick={() => setAbaAtiva("flashcards")}
          className={`flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            abaAtiva === "flashcards"
              ? "bg-gradient-to-r from-black to-purple-900 text-white shadow-lg"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Zap className="w-4 h-4" />
          Flashcards
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Aba: Conteúdo Principal */}
        {abaAtiva === "conteudo" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              Informações Básicas
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matéria *
                </label>
                <select
                  required
                  value={formData.materia}
                  onChange={(e) =>
                    setFormData({ ...formData, materia: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                >
                  <option value="">Selecione uma matéria</option>
                  {materias.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.icone} {m.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={(e) =>
                    setFormData({ ...formData, titulo: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                  placeholder="Ex: Uso da Crase"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <input
                  type="text"
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                  placeholder="Breve descrição do conteúdo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    placeholder="gramatica, ortografia"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nível
                </label>
                <select
                  value={formData.nivel}
                  onChange={(e) =>
                    setFormData({ ...formData, nivel: e.target.value as any })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                >
                  <option value="iniciante">🌱 Iniciante</option>
                  <option value="intermediario">📚 Intermediário</option>
                  <option value="avancado">🔥 Avançado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tempo Estimado
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={formData.tempoEstimado}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tempoEstimado: parseInt(e.target.value),
                      })
                    }
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    placeholder="45"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de Acesso
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="tipoAcesso"
                      checked={!formData.isPreview}
                      onChange={() =>
                        setFormData({ ...formData, isPreview: false })
                      }
                      className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Assinantes</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="tipoAcesso"
                      checked={formData.isPreview}
                      onChange={() =>
                        setFormData({ ...formData, isPreview: true })
                      }
                      className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="flex items-center gap-2">
                      <Unlock className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">
                        Grátis (Preview)
                      </span>
                    </div>
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  Se for Preview, o conteúdo fica livre para todos. Caso
                  contrário, só assinantes acessam.
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conteúdo HTML
                </label>
                <p className="text-xs text-gray-400 mb-3">
                  Este HTML será salvo como arquivo .html separado
                </p>
                <textarea
                  value={formData.introducao}
                  onChange={(e) =>
                    setFormData({ ...formData, introducao: e.target.value })
                  }
                  rows={15}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none font-mono text-sm bg-gray-50"
                  placeholder="<!DOCTYPE html>\n<html>\n<head>\n  <title>Meu Conteúdo</title>\n</head>\n<body>\n  <h1>Olá, mundo!</h1>\n</body>\n</html>"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Aba: Tópicos Internos */}
        {abaAtiva === "topicos" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-600" />
                Tópicos Internos
              </h2>
              <button
                type="button"
                onClick={adicionarTopico}
                className="px-4 py-2 bg-gradient-to-r from-black to-purple-900 text-white rounded-xl hover:shadow-lg transition flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Adicionar Tópico
              </button>
            </div>

            {formData.topicos.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  Nenhum tópico interno adicionado
                </p>
                <button
                  type="button"
                  onClick={adicionarTopico}
                  className="mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar primeiro tópico
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.topicos.map((topico, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-xl p-6 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">
                        Tópico {index + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removerTopico(index)}
                        className="p-2 text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Título do Tópico
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Introdução ao tema"
                          value={topico.titulo}
                          onChange={(e) =>
                            atualizarTopico(index, "titulo", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Conteúdo HTML
                        </label>
                        <textarea
                          placeholder="<p>Conteúdo do tópico...</p>"
                          value={topico.html}
                          onChange={(e) =>
                            atualizarTopico(index, "html", e.target.value)
                          }
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none font-mono text-sm bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Aba: Exercícios */}
        {abaAtiva === "exercicios" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-600" />
                Exercícios
              </h2>
              <button
                type="button"
                onClick={adicionarExercicio}
                className="px-4 py-2 bg-gradient-to-r from-black to-purple-900 text-white rounded-xl hover:shadow-lg transition flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Adicionar Exercício
              </button>
            </div>

            {formData.exercicios.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhum exercício adicionado</p>
                <button
                  type="button"
                  onClick={adicionarExercicio}
                  className="mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar primeiro exercício
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {formData.exercicios.map((ex, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-xl p-6 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">
                        Exercício {index + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removerExercicio(index)}
                        className="p-2 text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pergunta
                        </label>
                        <textarea
                          placeholder="Digite a pergunta do exercício..."
                          value={ex.pergunta}
                          onChange={(e) =>
                            atualizarExercicio(
                              index,
                              "pergunta",
                              e.target.value,
                            )
                          }
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Alternativas
                        </label>
                        <div className="space-y-2">
                          {ex.alternativas.map((alt, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <input
                                type="radio"
                                name={`correta-${index}`}
                                checked={ex.correta === i}
                                onChange={() =>
                                  atualizarExercicio(index, "correta", i)
                                }
                                className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                              />
                              <input
                                type="text"
                                placeholder={`Alternativa ${String.fromCharCode(65 + i)}`}
                                value={alt}
                                onChange={(e) =>
                                  atualizarAlternativa(index, i, e.target.value)
                                }
                                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Explicação
                        </label>
                        <textarea
                          placeholder="Explique por que a resposta correta é essa..."
                          value={ex.explicacao}
                          onChange={(e) =>
                            atualizarExercicio(
                              index,
                              "explicacao",
                              e.target.value,
                            )
                          }
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Aba: Flashcards */}
        {abaAtiva === "flashcards" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                Flashcards
              </h2>
              <button
                type="button"
                onClick={adicionarFlashcard}
                className="px-4 py-2 bg-gradient-to-r from-black to-purple-900 text-white rounded-xl hover:shadow-lg transition flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Adicionar Flashcard
              </button>
            </div>

            {formData.flashcards.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhum flashcard adicionado</p>
                <button
                  type="button"
                  onClick={adicionarFlashcard}
                  className="mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar primeiro flashcard
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {formData.flashcards.map((card, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-xl p-5 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">
                        Flashcard {index + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removerFlashcard(index)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Frente (pergunta)
                        </label>
                        <textarea
                          placeholder="O que é crase?"
                          value={card.frente}
                          onChange={(e) =>
                            atualizarFlashcard(index, "frente", e.target.value)
                          }
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Verso (resposta)
                        </label>
                        <textarea
                          placeholder="Fusão da preposição 'a' com o artigo 'a'..."
                          value={card.verso}
                          onChange={(e) =>
                            atualizarFlashcard(index, "verso", e.target.value)
                          }
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Botões de ação */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-100 transition font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-black to-purple-900 text-white rounded-xl hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2 font-medium"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
