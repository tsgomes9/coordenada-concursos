"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
    cor: "from-blue-500 to-blue-600",
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
            cor: data.cor || "from-blue-500 to-blue-600",
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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition mb-4"
      >
        <ChevronLeft className="w-5 h-5" />
        <span>Voltar</span>
      </button>

      <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">
        Editar Conteúdo: {formData.titulo}
      </h1>

      {/* Abas */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setAbaAtiva("conteudo")}
          className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition ${
            abaAtiva === "conteudo"
              ? "text-orange-500 border-b-2 border-orange-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          📝 Conteúdo Principal
        </button>
        <button
          onClick={() => setAbaAtiva("topicos")}
          className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition ${
            abaAtiva === "topicos"
              ? "text-orange-500 border-b-2 border-orange-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          📚 Tópicos Internos
        </button>
        <button
          onClick={() => setAbaAtiva("exercicios")}
          className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition ${
            abaAtiva === "exercicios"
              ? "text-orange-500 border-b-2 border-orange-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          ✍️ Exercícios
        </button>
        <button
          onClick={() => setAbaAtiva("flashcards")}
          className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition ${
            abaAtiva === "flashcards"
              ? "text-orange-500 border-b-2 border-orange-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          🃏 Flashcards
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Aba: Conteúdo Principal */}
        {abaAtiva === "conteudo" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-display font-bold text-gray-900 mb-4">
              Informações Básicas
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Matéria *
                </label>
                <select
                  required
                  value={formData.materia}
                  onChange={(e) =>
                    setFormData({ ...formData, materia: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Selecione</option>
                  {materias.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.icone} {m.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Breve descrição"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="gramatica, ortografia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nível
                </label>
                <select
                  value={formData.nivel}
                  onChange={(e) =>
                    setFormData({ ...formData, nivel: e.target.value as any })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="iniciante">Iniciante</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="avancado">Avançado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tempo (min)
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

              {/* 🔥 CAMPO DE TIPO DE ACESSO */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Acesso
                </label>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipoAcesso"
                      checked={!formData.isPreview}
                      onChange={() =>
                        setFormData({ ...formData, isPreview: false })
                      }
                      className="w-4 h-4 text-orange-500"
                    />
                    <Lock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm"> Assinantes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipoAcesso"
                      checked={formData.isPreview}
                      onChange={() =>
                        setFormData({ ...formData, isPreview: true })
                      }
                      className="w-4 h-4 text-orange-500"
                    />
                    <Unlock className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Grátis (Preview)</span>
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Se for Preview, o conteúdo fica livre para todos. Caso
                  contrário, só assinantes acessam.
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📄 Conteúdo HTML (principal)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Este HTML será salvo como arquivo .html separado
                </p>
                <textarea
                  value={formData.introducao}
                  onChange={(e) =>
                    setFormData({ ...formData, introducao: e.target.value })
                  }
                  rows={15}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-mono text-sm"
                  placeholder="<!DOCTYPE html>\n<html>\n<head>..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Aba: Tópicos Internos */}
        {abaAtiva === "topicos" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display font-bold text-gray-900">
                Tópicos do Conteúdo
              </h2>
              <button
                type="button"
                onClick={adicionarTopico}
                className="flex items-center gap-2 text-orange-500 hover:text-orange-600"
              >
                <Plus className="w-4 h-4" />
                Adicionar Tópico
              </button>
            </div>

            {formData.topicos.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                Nenhum tópico interno adicionado
              </p>
            ) : (
              <div className="space-y-4">
                {formData.topicos.map((topico, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between mb-3">
                      <h3 className="font-medium">Tópico {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removerTopico(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Título do tópico"
                      value={topico.titulo}
                      onChange={(e) =>
                        atualizarTopico(index, "titulo", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
                    />
                    <textarea
                      placeholder="Conteúdo HTML"
                      value={topico.html}
                      onChange={(e) =>
                        atualizarTopico(index, "html", e.target.value)
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Aba: Exercícios */}
        {abaAtiva === "exercicios" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display font-bold text-gray-900">
                Exercícios
              </h2>
              <button
                type="button"
                onClick={adicionarExercicio}
                className="flex items-center gap-2 text-orange-500 hover:text-orange-600"
              >
                <Plus className="w-4 h-4" />
                Adicionar Exercício
              </button>
            </div>

            {formData.exercicios.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                Nenhum exercício adicionado
              </p>
            ) : (
              <div className="space-y-6">
                {formData.exercicios.map((ex, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between mb-3">
                      <h3 className="font-medium">Exercício {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removerExercicio(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <textarea
                      placeholder="Pergunta"
                      value={ex.pergunta}
                      onChange={(e) =>
                        atualizarExercicio(index, "pergunta", e.target.value)
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
                    />

                    <div className="space-y-2 mb-3">
                      {ex.alternativas.map((alt, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <input
                            type="radio"
                            name={`correta-${index}`}
                            checked={ex.correta === i}
                            onChange={() =>
                              atualizarExercicio(index, "correta", i)
                            }
                            className="w-4 h-4 text-orange-500"
                          />
                          <input
                            type="text"
                            placeholder={`Alternativa ${String.fromCharCode(65 + i)}`}
                            value={alt}
                            onChange={(e) =>
                              atualizarAlternativa(index, i, e.target.value)
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      ))}
                    </div>

                    <textarea
                      placeholder="Explicação"
                      value={ex.explicacao}
                      onChange={(e) =>
                        atualizarExercicio(index, "explicacao", e.target.value)
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Aba: Flashcards */}
        {abaAtiva === "flashcards" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display font-bold text-gray-900">
                Flashcards
              </h2>
              <button
                type="button"
                onClick={adicionarFlashcard}
                className="flex items-center gap-2 text-orange-500 hover:text-orange-600"
              >
                <Plus className="w-4 h-4" />
                Adicionar Flashcard
              </button>
            </div>

            {formData.flashcards.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                Nenhum flashcard adicionado
              </p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {formData.flashcards.map((card, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between mb-3">
                      <h3 className="font-medium">Card {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removerFlashcard(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      placeholder="Frente (pergunta)"
                      value={card.frente}
                      onChange={(e) =>
                        atualizarFlashcard(index, "frente", e.target.value)
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                    />
                    <textarea
                      placeholder="Verso (resposta)"
                      value={card.verso}
                      onChange={(e) =>
                        atualizarFlashcard(index, "verso", e.target.value)
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Botões */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
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
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
