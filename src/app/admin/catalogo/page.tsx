"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import Link from "next/link";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  BookOpen,
  Clock,
  Tag,
  Lock,
  Unlock,
} from "lucide-react";

interface Conteudo {
  id: string;
  materiaId: string;
  materiaNome: string;
  materiaSlug?: string;
  titulo: string;
  descricao: string;
  tags: string[];
  nivel: string;
  tempoEstimado: number;
  icone: string;
  isPreview?: boolean;
  updatedAt?: any;
}

export default function CatalogoPage() {
  const [conteudos, setConteudos] = useState<Conteudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroMateria, setFiltroMateria] = useState("todas");
  const [materias, setMaterias] = useState<string[]>([]);

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 15;

  // Modal de confirmação para exclusão
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemParaExcluir, setItemParaExcluir] = useState<Conteudo | null>(null);

  useEffect(() => {
    carregarConteudos();
  }, []);

  const carregarConteudos = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "catalogo"));
      const lista = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          materiaId: data.materiaId || data.materia || "",
          materiaNome: data.materiaNome || data.materia || "Não definido",
          materiaSlug: data.materiaSlug || "",
          titulo: data.titulo || "",
          descricao: data.descricao || "",
          tags: data.tags || [],
          nivel: data.nivel || "intermediario",
          tempoEstimado: data.tempoEstimado || 30,
          icone: data.icone || "📚",
          isPreview: data.isPreview || false,
          updatedAt: data.updatedAt,
        };
      }) as Conteudo[];

      // Ordenar por data (mais recente primeiro)
      lista.sort((a, b) => {
        if (a.updatedAt && b.updatedAt) {
          return b.updatedAt.toDate() - a.updatedAt.toDate();
        }
        return 0;
      });

      // Extrair matérias únicas para o filtro
      const materiasUnicas = [
        ...new Set(lista.map((item) => item.materiaNome)),
      ];
      setMaterias(materiasUnicas);

      setConteudos(lista);
    } catch (error) {
      console.error("Erro ao carregar catálogo:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!itemParaExcluir) return;

    try {
      await deleteDoc(doc(db, "catalogo", itemParaExcluir.id));
      setShowDeleteModal(false);
      setItemParaExcluir(null);
      carregarConteudos(); // Recarregar lista
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir conteúdo");
    }
  };

  // Filtrar conteúdos
  const conteudosFiltrados = conteudos.filter((conteudo) => {
    const matchesSearch =
      conteudo.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conteudo.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conteudo.tags?.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesMateria =
      filtroMateria === "todas" || conteudo.materiaNome === filtroMateria;

    return matchesSearch && matchesMateria;
  });

  // Paginação
  const totalPaginasFiltradas = Math.ceil(
    conteudosFiltrados.length / itensPorPagina,
  );
  const conteudosPaginados = conteudosFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina,
  );

  // Resetar página quando filtrar
  useEffect(() => {
    setPaginaAtual(1);
  }, [searchTerm, filtroMateria]);

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case "iniciante":
        return "bg-green-100 text-green-600";
      case "intermediario":
        return "bg-yellow-100 text-yellow-600";
      case "avancado":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
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
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">
            Catálogo de Conteúdos
          </h1>
          <p className="text-gray-500 mt-1">
            Total de {conteudos.length} conteúdos cadastrados
          </p>
        </div>
        <Link
          href="/admin/catalogo/novo"
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Conteúdo
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por título, descrição ou tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <select
            value={filtroMateria}
            onChange={(e) => setFiltroMateria(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 min-w-[200px]"
          >
            <option value="todas">Todas as matérias</option>
            {materias.map((materia) => (
              <option key={materia} value={materia}>
                {materia}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Conteúdos */}
      {conteudosPaginados.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold text-gray-900 mb-2">
            Nenhum conteúdo encontrado
          </h3>
          <p className="text-gray-500">
            {searchTerm || filtroMateria !== "todas"
              ? "Tente outros filtros de busca"
              : "Comece criando seu primeiro conteúdo"}
          </p>
        </div>
      ) : (
        <>
          {/* Tabela Compacta */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">
                    Conteúdo
                  </th>
                  <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">
                    Matéria
                  </th>
                  <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">
                    Tags
                  </th>
                  <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">
                    Nível
                  </th>
                  <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">
                    Tempo
                  </th>
                  <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">
                    Acesso
                  </th>
                  <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {conteudosPaginados.map((conteudo) => (
                  <tr key={conteudo.id} className="hover:bg-gray-50 transition">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            {conteudo.titulo}
                          </p>
                          {conteudo.descricao && (
                            <p className="text-xs text-gray-500 line-clamp-1">
                              {conteudo.descricao}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="text-sm text-gray-600">
                        {conteudo.materiaNome}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {conteudo.tags?.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {conteudo.tags?.length > 2 && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                            +{conteudo.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getNivelColor(conteudo.nivel)}`}
                      >
                        {conteudo.nivel}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {conteudo.tempoEstimado} min
                      </span>
                    </td>

                    <td className="p-3">
                      {conteudo.isPreview ? (
                        <span className="flex items-center gap-1 text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                          <Unlock className="w-3 h-3" />
                          FREE
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                          <Lock className="w-3 h-3" />
                          Premium
                        </span>
                      )}
                    </td>

                    <td className="p-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/catalogo/${conteudo.id}/editar`}
                          className="p-1.5 hover:bg-orange-100 rounded-lg transition text-orange-600"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        <Link
                          href={`/materia/${conteudo.materiaSlug || conteudo.materiaId}/topico/${conteudo.id}`}
                          target="_blank"
                          className="p-1.5 hover:bg-blue-100 rounded-lg transition text-blue-600"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => {
                            setItemParaExcluir(conteudo);
                            setShowDeleteModal(true);
                          }}
                          className="p-1.5 hover:bg-red-100 rounded-lg transition text-red-600"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {totalPaginasFiltradas > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">
                Mostrando {(paginaAtual - 1) * itensPorPagina + 1} a{" "}
                {Math.min(
                  paginaAtual * itensPorPagina,
                  conteudosFiltrados.length,
                )}{" "}
                de {conteudosFiltrados.length} conteúdos
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                  disabled={paginaAtual === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <span className="px-4 py-2 text-sm text-gray-700">
                  Página {paginaAtual} de {totalPaginasFiltradas}
                </span>

                <button
                  onClick={() =>
                    setPaginaAtual((p) =>
                      Math.min(totalPaginasFiltradas, p + 1),
                    )
                  }
                  disabled={paginaAtual === totalPaginasFiltradas}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="font-display font-bold text-xl text-gray-900 mb-2">
              Confirmar exclusão
            </h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir o conteúdo "
              {itemParaExcluir?.titulo}"? Esta ação não pode ser desfeita.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setItemParaExcluir(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
