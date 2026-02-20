"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Sparkles,
  Filter,
  ChevronDown,
  X,
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

// Componente de Filtro Animado
function FilterChip({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
        active
          ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
          : "bg-white text-gray-600 hover:bg-purple-50 border border-gray-200 shadow-sm hover:shadow-md"
      }`}
    >
      {icon && <span>{icon}</span>}
      {label}
    </motion.button>
  );
}

export default function CatalogoPage() {
  const [conteudos, setConteudos] = useState<Conteudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroMateria, setFiltroMateria] = useState("todas");
  const [filtroNivel, setFiltroNivel] = useState("todos");
  const [materias, setMaterias] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 15;

  // Estatísticas
  const [stats, setStats] = useState({
    total: 0,
    preview: 0,
    premium: 0,
  });

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

      // Calcular estatísticas
      const preview = lista.filter((item) => item.isPreview).length;
      const premium = lista.filter((item) => !item.isPreview).length;

      setStats({
        total: lista.length,
        preview,
        premium,
      });

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

    const matchesNivel =
      filtroNivel === "todos" || conteudo.nivel === filtroNivel;

    return matchesSearch && matchesMateria && matchesNivel;
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
  }, [searchTerm, filtroMateria, filtroNivel]);

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
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full mb-4"
        />
        <p className="text-gray-500">Carregando catálogo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header com gradiente preto/roxo */}
      <div className="bg-gradient-to-r from-black to-purple-900 text-white rounded-2xl p-8 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">
                {stats.total} conteúdos no catálogo
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-2">
              Catálogo de Conteúdos
            </h1>
            <p className="text-purple-200 text-lg max-w-2xl">
              Gerencie todos os conteúdos educacionais da plataforma
            </p>
          </div>
          <Link
            href="/admin/catalogo/novo"
            className="bg-white text-purple-900 px-6 py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Conteúdo
          </Link>
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6  shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <BookOpen className="w-8 h-8 text-orange-400" />
            <span className="text-3xl font-black">{stats.total}</span>
          </div>
          <p className=" text-sm">Total de conteúdos</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Unlock className="w-8 h-8 text-green-500" />
            <span className="text-3xl font-black text-gray-900">
              {stats.preview}
            </span>
          </div>
          <p className="text-gray-500 text-sm">Conteúdos gratuitos</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Lock className="w-8 h-8 text-purple-500" />
            <span className="text-3xl font-black text-gray-900">
              {stats.premium}
            </span>
          </div>
          <p className="text-gray-500 text-sm">Conteúdos premium</p>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-purple-500 transition-colors" />
            <input
              type="text"
              placeholder="Buscar por título, descrição ou tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none text-gray-900 placeholder-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 text-gray-700"
          >
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filtros</span>
            <motion.div
              animate={{ rotate: showFilters ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.button>
        </div>

        {/* Filtros expandidos */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-gray-500 mb-2">
                      Matéria
                    </label>
                    <select
                      value={filtroMateria}
                      onChange={(e) => setFiltroMateria(e.target.value)}
                      className="w-full cursor-pointer px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    >
                      <option value="todas">Todas as matérias</option>
                      {materias.map((materia) => (
                        <option key={materia} value={materia}>
                          {materia}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-gray-500 mb-2">
                      Nível
                    </label>
                    <select
                      value={filtroNivel}
                      onChange={(e) => setFiltroNivel(e.target.value)}
                      className="w-full cursor-pointer px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    >
                      <option value="todos">Todos os níveis</option>
                      <option value="iniciante">Iniciante</option>
                      <option value="intermediario">Intermediário</option>
                      <option value="avancado">Avançado</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lista de Conteúdos */}
      {conteudosPaginados.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Nenhum conteúdo encontrado
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filtroMateria !== "todas" || filtroNivel !== "todos"
              ? "Tente outros filtros de busca"
              : "Comece criando seu primeiro conteúdo"}
          </p>
          {!searchTerm &&
            filtroMateria === "todas" &&
            filtroNivel === "todos" && (
              <Link
                href="/admin/catalogo/novo"
                className="bg-gradient-to-r from-black to-purple-900 text-white px-6 py-3 rounded-xl inline-flex items-center gap-2 font-bold hover:shadow-lg transition"
              >
                <Plus className="w-5 h-5" />
                Criar Primeiro Conteúdo
              </Link>
            )}
        </div>
      ) : (
        <>
          {/* Tabela */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Conteúdo
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Matéria
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Nível
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Tempo
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Acesso
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {conteudosPaginados.map((conteudo, index) => (
                  <motion.tr
                    key={conteudo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-purple-50/30 transition-colors"
                  >
                    <td className="p-4">
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
                    </td>

                    <td className="p-4">
                      <span className="text-sm text-gray-600">
                        {conteudo.materiaNome}
                      </span>
                    </td>

                    <td className="p-4">
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

                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getNivelColor(
                          conteudo.nivel,
                        )}`}
                      >
                        {conteudo.nivel}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-3 h-3 text-gray-600" />
                        </div>
                        <span className="text-sm text-gray-700">
                          {conteudo.tempoEstimado} min
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      {conteudo.isPreview ? (
                        <span className="flex items-center gap-1 text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full w-fit">
                          <Unlock className="w-3 h-3" />
                          FREE
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full w-fit">
                          <Lock className="w-3 h-3" />
                          Premium
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/catalogo/${conteudo.id}/editar`}
                          className="p-2 hover:bg-purple-100 rounded-lg transition text-purple-600"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        <Link
                          href={`/materia/${conteudo.materiaSlug || conteudo.materiaId}/topico/${conteudo.id}`}
                          target="_blank"
                          className="p-2 hover:bg-blue-100 rounded-lg transition text-blue-600"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => {
                            setItemParaExcluir(conteudo);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {totalPaginasFiltradas > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">
                Mostrando{" "}
                <span className="font-bold text-gray-700">
                  {(paginaAtual - 1) * itensPorPagina + 1}
                </span>{" "}
                a{" "}
                <span className="font-bold text-gray-700">
                  {Math.min(
                    paginaAtual * itensPorPagina,
                    conteudosFiltrados.length,
                  )}
                </span>{" "}
                de{" "}
                <span className="font-bold text-gray-700">
                  {conteudosFiltrados.length}
                </span>{" "}
                conteúdos
              </p>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                  disabled={paginaAtual === 1}
                  className="p-2 rounded-xl border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </motion.button>

                <span className="px-4 py-2 text-sm font-bold text-gray-700 bg-purple-50 rounded-xl">
                  {paginaAtual} de {totalPaginasFiltradas}
                </span>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setPaginaAtual((p) =>
                      Math.min(totalPaginasFiltradas, p + 1),
                    )
                  }
                  disabled={paginaAtual === totalPaginasFiltradas}
                  className="p-2 rounded-xl border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Confirmar exclusão
            </h3>
            <p className="text-gray-500 text-center mb-6">
              Tem certeza que deseja excluir o conteúdo{" "}
              <span className="font-bold text-gray-900">
                "{itemParaExcluir?.titulo}"
              </span>
              ? Esta ação não pode ser desfeita.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setItemParaExcluir(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
              >
                Sim, excluir
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
