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
  deleteDoc,
  updateDoc,
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
  Loader2,
  Search,
  X,
} from "lucide-react";
import { NivelEnsino } from "@/types";

interface Topico {
  id: string;
  titulo: string;
  descricao: string;
  ordem: number;
  tempoEstimado: number;
  isPreview: boolean;
  audioUrl: string;
  conteudoId: string;
  nivel?: NivelEnsino;
}

interface ConteudoCatalogo {
  id: string;
  titulo: string;
  descricao?: string;
  icone?: string;
  materiaId?: string;
  materiaNome?: string;
  tempoEstimado?: number;
  isPreview?: boolean;
  audioUrl?: string;
  nivel?: string;
}

export default function Topicospage() {
  const params = useParams();
  const router = useRouter();
  const concursoId = params.id as string;
  const materiaId = params.materiaId as string;

  const [concurso, setConcurso] = useState<any>(null);
  const [materia, setMateria] = useState<any>(null);
  const [topicos, setTopicos] = useState<Topico[]>([]);
  const [catalogo, setCatalogo] = useState<ConteudoCatalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editandoTopico, setEditandoTopico] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [busca, setBusca] = useState("");
  const [selectedTopico, setSelectedTopico] = useState<ConteudoCatalogo | null>(
    null,
  );

  useEffect(() => {
    async function carregarDados() {
      try {
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
            tempoEstimado: data.tempoEstimado || 30,
            isPreview: data.isPreview || false,
            audioUrl: data.audioUrl || "",
            nivel: data.nivel || "",
          };
        }) as ConteudoCatalogo[];

        // Filtrar apenas conteúdos da matéria atual
        const conteudosDaMateria = catalogoList.filter(
          (item) =>
            item.materiaId === materiaId || item.materiaNome === materia?.nome,
        );

        setCatalogo(conteudosDaMateria);

        // Carregar tópicos da matéria
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
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [concursoId, materiaId, materia?.nome]);

  const handleAddTopico = async () => {
    if (!selectedTopico) return;

    setSaving(true);

    try {
      const novaOrdem = topicos.length + 1;
      const topicoId = selectedTopico.id;

      // Verificar se já existe
      if (topicos.some((t) => t.conteudoId === topicoId)) {
        alert("Este tópico já foi adicionado!");
        return;
      }

      // 1. Salvar metadados no Firebase
      await addDoc(collection(db, "topicos"), {
        concursoId,
        materiaId,
        titulo: selectedTopico.titulo,
        descricao: selectedTopico.descricao || "",
        tempoEstimado: selectedTopico.tempoEstimado || 30,
        isPreview: selectedTopico.isPreview || false,
        audioUrl: selectedTopico.audioUrl || "",
        ordem: novaOrdem,
        conteudoId: topicoId,
        nivel: selectedTopico.nivel || "",
        createdAt: Timestamp.now(),
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

      setShowModal(false);
      setSelectedTopico(null);
      setBusca("");

      alert("✅ Tópico adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar tópico:", error);
      alert("❌ Erro ao adicionar tópico");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveTopico = async (topicoId: string) => {
    if (!confirm("Remover este tópico da matéria?")) return;

    try {
      // Buscar o documento pelo conteudoId
      const topicosQuery = query(
        collection(db, "topicos"),
        where("materiaId", "==", materiaId),
        where("conteudoId", "==", topicoId),
      );
      const topicosSnapshot = await getDocs(topicosQuery);

      if (!topicosSnapshot.empty) {
        await deleteDoc(topicosSnapshot.docs[0].ref);
      }

      // Recarregar lista
      const topicosQuery2 = query(
        collection(db, "topicos"),
        where("materiaId", "==", materiaId),
      );
      const topicosSnapshot2 = await getDocs(topicosQuery2);
      const topicosList = topicosSnapshot2.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Topico[];
      setTopicos(topicosList.sort((a, b) => a.ordem - b.ordem));

      alert("✅ Tópico removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover tópico:", error);
      alert("❌ Erro ao remover tópico");
    }
  };

  const handleEditTopico = async (topico: Topico) => {
    // Por enquanto, apenas mostrar que será implementado
    alert("Funcionalidade de edição em desenvolvimento");
  };

  const conteudosFiltrados = catalogo.filter(
    (item) =>
      busca === "" ||
      item.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      item.descricao?.toLowerCase().includes(busca.toLowerCase()),
  );

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
              Selecione tópicos do catálogo para esta matéria
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedTopico(null);
              setBusca("");
              setShowModal(true);
            }}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:shadow-lg transition"
          >
            <Plus className="w-5 h-5" />
            Adicionar Tópico
          </button>
        </div>
      </div>

      {/* Lista de Tópicos */}
      {topicos.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold text-gray-900 mb-2">
            Nenhum tópico adicionado
          </h3>
          <p className="text-gray-500 mb-6">
            Clique em "Adicionar Tópico" para selecionar conteúdos do catálogo
          </p>
        </div>
      ) : (
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
                  Nível
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
                      <p className="font-medium text-gray-900">
                        {topico.titulo}
                      </p>
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
                    {topico.nivel && (
                      <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                        {topico.nivel}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditTopico(topico)}
                        className="p-2 hover:bg-orange-100 rounded-lg transition text-orange-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveTopico(topico.conteudoId)}
                        className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
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
      )}

      {/* Modal de Seleção de Tópicos */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header do Modal */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display font-bold text-xl text-gray-900">
                  Selecionar Tópico do Catálogo
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
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
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
                    const isSelected = selectedTopico?.id === conteudo.id;
                    const isAlreadyAdded = topicos.some(
                      (t) => t.conteudoId === conteudo.id,
                    );

                    return (
                      <div
                        key={conteudo.id}
                        onClick={() =>
                          !isAlreadyAdded && setSelectedTopico(conteudo)
                        }
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${
                          isAlreadyAdded
                            ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                            : isSelected
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
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400">
                                {conteudo.tempoEstimado} min
                              </span>
                              {conteudo.isPreview && (
                                <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                                  FREE
                                </span>
                              )}
                              {conteudo.nivel && (
                                <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                                  {conteudo.nivel}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {isAlreadyAdded && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                            Já adicionado
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddTopico}
                  disabled={!selectedTopico || saving}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adicionando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Adicionar Tópico
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
