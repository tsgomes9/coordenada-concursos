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
  BookOpen,
  Calendar,
  DollarSign,
  ChevronRight,
  Search,
  Loader2,
  Briefcase,
  Users,
  Eye,
  X,
  Clock,
  MapPin,
  Award,
  Tag,
  FileText,
  TrendingUp,
  Sparkles,
  ChevronDown,
  Filter,
  Layers,
} from "lucide-react";
import router from "next/router";

interface NivelInfo {
  nivel: string;
  vagas: number;
  salario: string | number;
}

interface Concurso {
  id: string;
  nome: string;
  banca: string;
  orgao?: string;
  thumbnail: string;
  cor: string;
  descricao?: string;
  status: string;
  edital?: string;
  ultimoEdital?: string;
  precoInscricao?: string;
  inscricoes?: {
    inicio: string;
    fim: string;
  };
  provas?: {
    data: string;
  };
  locais?: string[];
  areas?: string[];
  niveis: NivelInfo[];
  stats?: {
    vagas: number;
    materias: number;
    topicos: number;
    horas: number;
  };
  createdAt?: any;
  updatedAt?: any;
}

// Componente de Card de Métrica
function MetricCard({ icon: Icon, label, value, color, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-lg`}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-8 h-8 text-white/80" />
        <span className="text-3xl font-black">{value}</span>
      </div>
      <p className="text-white/80 text-sm">{label}</p>
    </motion.div>
  );
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
    <button
      onClick={onClick}
      className={`px-4 cursor-pointer py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
        active
          ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
          : "bg-white text-gray-600 hover:bg-orange-50 border border-gray-200 shadow-sm hover:shadow-md"
      }`}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
}

export default function ConcursosPage() {
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [itemParaExcluir, setItemParaExcluir] = useState<Concurso | null>(null);
  const [concursoVisualizar, setConcursoVisualizar] = useState<Concurso | null>(
    null,
  );

  // Filtros adicionais
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [showFilters, setShowFilters] = useState(false);

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  // Estatísticas
  const [stats, setStats] = useState({
    total: 0,
    abertos: 0,
    previstos: 0,
    fechados: 0,
    totalVagas: 0,
  });

  useEffect(() => {
    carregarConcursos();
  }, []);

  const carregarConcursos = async () => {
    try {
      const snapshot = await getDocs(collection(db, "concursos"));
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Concurso[];

      // Ordenar por data de criação (mais recente primeiro)
      lista.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.toDate() - a.createdAt.toDate();
        }
        return 0;
      });

      // Calcular estatísticas
      const abertos = lista.filter((c) => c.status === "aberto").length;
      const previstos = lista.filter((c) => c.status === "previsto").length;
      const fechados = lista.filter((c) => c.status === "fechado").length;
      const totalVagas = lista.reduce((acc, c) => {
        if (c.niveis && c.niveis.length > 0) {
          return acc + c.niveis.reduce((sum, n) => sum + (n.vagas || 0), 0);
        }
        return acc + (c.stats?.vagas || 0);
      }, 0);

      setStats({
        total: lista.length,
        abertos,
        previstos,
        fechados,
        totalVagas,
      });

      setConcursos(lista);
    } catch (error) {
      console.error("Erro ao carregar:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!itemParaExcluir) return;

    try {
      await deleteDoc(doc(db, "concursos", itemParaExcluir.id));
      setShowDeleteModal(false);
      setItemParaExcluir(null);
      carregarConcursos();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir concurso");
    }
  };

  // Calcular total de vagas a partir dos níveis
  const calcularTotalVagas = (concurso: Concurso) => {
    if (concurso.niveis && concurso.niveis.length > 0) {
      return concurso.niveis.reduce(
        (acc, nivel) => acc + (nivel.vagas || 0),
        0,
      );
    }
    return concurso.stats?.vagas || 0;
  };

  // Obter faixa salarial
  const obterFaixaSalarial = (concurso: Concurso) => {
    if (concurso.niveis && concurso.niveis.length > 0) {
      const salarios = concurso.niveis
        .map((n) =>
          typeof n.salario === "string"
            ? parseFloat(n.salario.replace(/[^\d,]/g, "").replace(",", "."))
            : n.salario,
        )
        .filter((s) => !isNaN(s));

      if (salarios.length > 0) {
        const min = Math.min(...salarios);
        const max = Math.max(...salarios);
        if (min === max) {
          return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(min);
        }
        return `${new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(min)} - ${new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(max)}`;
      }
    }
    return "A definir";
  };

  // Filtrar concursos
  const concursosFiltrados = concursos.filter((concurso) => {
    const matchesSearch =
      concurso.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concurso.banca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concurso.orgao?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filtroStatus === "todos" || concurso.status === filtroStatus;

    return matchesSearch && matchesStatus;
  });

  // Paginação
  const totalPaginas = Math.ceil(concursosFiltrados.length / itensPorPagina);
  const concursosPaginados = concursosFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina,
  );

  // Resetar página quando filtrar
  useEffect(() => {
    setPaginaAtual(1);
  }, [searchTerm, filtroStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aberto":
        return "bg-green-100 text-green-600";
      case "previsto":
        return "bg-yellow-100 text-yellow-600";
      case "fechado":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "aberto":
        return "📢 Inscrições abertas";
      case "previsto":
        return "📅 Edital previsto";
      case "fechado":
        return "🔒 Concurso encerrado";
      default:
        return status;
    }
  };

  const formatarData = (data: string) => {
    if (!data) return "Não informada";
    return new Date(data).toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full mb-4"
        />
        <p className="text-gray-500">Carregando concursos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-r from-black to-purple-900 text-white rounded-2xl p-8 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">
                {stats.total} concursos cadastrados
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-2">
              Gestão de Concursos
            </h1>
          </div>
          <Link
            href="/admin/concursos/novo"
            className="bg-white text-purple-900 px-6 py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Concurso
          </Link>
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={Briefcase}
          label="Total de Concursos"
          value={stats.total}
          color="from-orange-500 to-orange-600"
          delay={0.1}
        />
        <MetricCard
          icon={Users}
          label="Vagas Totais"
          value={stats.totalVagas}
          color="from-blue-500 to-blue-600"
          delay={0.2}
        />
        <MetricCard
          icon={TrendingUp}
          label="Inscrições Abertas"
          value={stats.abertos}
          color="from-green-500 to-green-600"
          delay={0.3}
        />
        <MetricCard
          icon={Calendar}
          label="Editais Previstos"
          value={stats.previstos}
          color="from-purple-500 to-purple-600"
          delay={0.4}
        />
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-orange-500 transition-colors" />
            <input
              type="text"
              placeholder="Buscar concurso por nome, banca ou órgão..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none text-gray-900 placeholder-gray-400"
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
            className="px-6 py-3 bg-white border border-gray-200 rounded-xl hover:bg-orange-50 transition-all flex items-center gap-2 text-gray-700"
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
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    label="Todos"
                    active={filtroStatus === "todos"}
                    onClick={() => setFiltroStatus("todos")}
                  />
                  <FilterChip
                    label="Inscrições abertas"
                    active={filtroStatus === "aberto"}
                    onClick={() => setFiltroStatus("aberto")}
                    icon="📢"
                  />
                  <FilterChip
                    label="Editais previstos"
                    active={filtroStatus === "previsto"}
                    onClick={() => setFiltroStatus("previsto")}
                    icon="📅"
                  />
                  <FilterChip
                    label="Concursos encerrados"
                    active={filtroStatus === "fechado"}
                    onClick={() => setFiltroStatus("fechado")}
                    icon="🔒"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lista de Concursos */}
      {concursosPaginados.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Nenhum concurso encontrado
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filtroStatus !== "todos"
              ? "Tente outros termos de busca ou filtros"
              : "Comece cadastrando seu primeiro concurso"}
          </p>
          {!searchTerm && filtroStatus === "todos" && (
            <Link
              href="/admin/concursos/novo"
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl inline-flex items-center gap-2 font-bold hover:shadow-lg transition"
            >
              <Plus className="w-5 h-5" />
              Cadastrar Concurso
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Tabela com design melhorado */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Concurso
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Banca/Órgão
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Vagas
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Salário
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Inscrição
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {concursosPaginados.map((concurso, index) => {
                  const totalVagas = calcularTotalVagas(concurso);
                  const faixaSalarial = obterFaixaSalarial(concurso);

                  return (
                    <motion.tr
                      key={concurso.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-orange-50/30 transition-colors group"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            {concurso.thumbnail || "📚"}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              {concurso.nome}
                            </p>
                            <p className="text-xs text-gray-400">
                              ID: {concurso.id.substring(0, 6)}...
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <p className="font-medium text-gray-900">
                          {concurso.banca}
                        </p>
                        {concurso.orgao && (
                          <p className="text-xs text-gray-500">
                            {concurso.orgao}
                          </p>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-3 h-3 text-blue-600" />
                          </div>
                          <span className="font-bold text-gray-900">
                            {totalVagas}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="font-medium text-gray-900 text-sm">
                            {faixaSalarial}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-3 h-3 text-purple-600" />
                          </div>
                          <span className="text-sm text-gray-600">
                            {concurso.precoInscricao || "Grátis"}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold ${getStatusColor(
                            concurso.status,
                          )}`}
                        >
                          {getStatusLabel(concurso.status)}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setConcursoVisualizar(concurso);
                              setShowViewModal(true);
                            }}
                            className="p-2 hover:bg-green-100 rounded-xl transition text-green-600"
                            title="Visualizar detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              router.push(
                                `/admin/concursos/${concurso.id}/materias`,
                              )
                            }
                            className="p-2 hover:bg-orange-100 rounded-xl transition text-orange-600"
                            title="Gerenciar matérias"
                          >
                            <BookOpen className="w-4 h-4" />
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              router.push(
                                `/admin/concursos/${concurso.id}/editar`,
                              )
                            }
                            className="p-2 hover:bg-blue-100 rounded-xl transition text-blue-600"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setItemParaExcluir(concurso);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 hover:bg-red-100 rounded-xl transition text-red-600"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {totalPaginas > 1 && (
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
                    concursosFiltrados.length,
                  )}
                </span>{" "}
                de{" "}
                <span className="font-bold text-gray-700">
                  {concursosFiltrados.length}
                </span>{" "}
                concursos
              </p>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                  disabled={paginaAtual === 1}
                  className="p-2 rounded-xl border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-50 transition"
                >
                  ←
                </motion.button>

                <span className="px-4 py-2 text-sm font-bold text-gray-700 bg-orange-50 rounded-xl">
                  {paginaAtual} de {totalPaginas}
                </span>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setPaginaAtual((p) => Math.min(totalPaginas, p + 1))
                  }
                  disabled={paginaAtual === totalPaginas}
                  className="p-2 rounded-xl border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-50 transition"
                >
                  →
                </motion.button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de Visualização */}
      {showViewModal && concursoVisualizar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Header com gradiente */}
            <div className="bg-gradient-to-r from-red-800 to-purple-900 p-6 text-white sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">
                    {concursoVisualizar.thumbnail || "📚"}
                  </span>
                  <div>
                    <h2 className="text-2xl font-black">
                      {concursoVisualizar.nome}
                    </h2>
                    <p className="text-orange-100 text-sm">
                      {concursoVisualizar.banca}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-6 space-y-6">
              {/* Status e informações rápidas */}
              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${getStatusColor(
                    concursoVisualizar.status,
                  )}`}
                >
                  {getStatusLabel(concursoVisualizar.status)}
                </span>
                {concursoVisualizar.orgao && (
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                    {concursoVisualizar.orgao}
                  </span>
                )}
              </div>

              {/* Informações principais */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-4 border border-orange-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Users className="w-3 h-3 text-orange-600" />
                    </div>
                    <p className="text-xs text-gray-500">Vagas</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {calcularTotalVagas(concursoVisualizar)}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-4 border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-3 h-3 text-green-600" />
                    </div>
                    <p className="text-xs text-gray-500">Salário</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {obterFaixaSalarial(concursoVisualizar)}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-3 h-3 text-purple-600" />
                    </div>
                    <p className="text-xs text-gray-500">Inscrição</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {concursoVisualizar.precoInscricao || "Grátis"}
                  </p>
                </div>
              </div>

              {/* Localidades */}
              {concursoVisualizar.locais &&
                concursoVisualizar.locais.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border border-blue-100">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      Locais de prova
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {concursoVisualizar.locais.map((local, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"
                        >
                          <MapPin className="w-3 h-3" />
                          {local}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Datas */}
              {(concursoVisualizar.inscricoes?.inicio ||
                concursoVisualizar.inscricoes?.fim ||
                concursoVisualizar.provas?.data) && (
                <div className="bg-gradient-to-br from-yellow-50 to-white rounded-xl p-4 border border-yellow-100">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-yellow-600" />
                    Datas importantes
                  </h4>
                  <div className="space-y-2">
                    {concursoVisualizar.inscricoes?.inicio && (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-500 w-28">Início:</span>
                        <span className="font-bold text-gray-900">
                          {formatarData(concursoVisualizar.inscricoes.inicio)}
                        </span>
                      </div>
                    )}
                    {concursoVisualizar.inscricoes?.fim && (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-500 w-28">Fim:</span>
                        <span className="font-bold text-gray-900">
                          {formatarData(concursoVisualizar.inscricoes.fim)}
                        </span>
                      </div>
                    )}
                    {concursoVisualizar.provas?.data && (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-500 w-28">Prova:</span>
                        <span className="font-bold text-gray-900">
                          {formatarData(concursoVisualizar.provas.data)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Áreas de atuação */}
              {concursoVisualizar.areas &&
                concursoVisualizar.areas.length > 0 && (
                  <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-4 border border-orange-100">
                    <h4 className="font-bold text-gray-900 mb-3">Áreas</h4>
                    <div className="flex flex-wrap gap-2">
                      {concursoVisualizar.areas.map((area, index) => (
                        <span
                          key={index}
                          className="bg-orange-100 text-orange-600 px-3 py-1.5 rounded-lg text-sm font-medium"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Níveis e Vagas */}
              {concursoVisualizar.niveis &&
                concursoVisualizar.niveis.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-900">Níveis</h4>
                    {concursoVisualizar.niveis.map((nivel, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {nivel.nivel === "fundamental" && "📘"}
                              {nivel.nivel === "medio" && "📗"}
                              {nivel.nivel === "tecnico" && "🔧"}
                              {nivel.nivel === "superior" && "🎓"}
                              {nivel.nivel === "mestrado" && "📜"}
                              {nivel.nivel === "doutorado" && "🏛️"}
                              {nivel.nivel === "phd" && "⚗️"}
                            </span>
                            <div>
                              <p className="font-bold text-gray-900">
                                {nivel.nivel === "fundamental" && "Fundamental"}
                                {nivel.nivel === "medio" && "Médio"}
                                {nivel.nivel === "tecnico" && "Técnico"}
                                {nivel.nivel === "superior" && "Superior"}
                                {nivel.nivel === "mestrado" && "Mestrado"}
                                {nivel.nivel === "doutorado" && "Doutorado"}
                                {nivel.nivel === "phd" && "PhD"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {nivel.vagas}{" "}
                                {nivel.vagas === 1 ? "vaga" : "vagas"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-orange-600">
                              {typeof nivel.salario === "number"
                                ? new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  }).format(nivel.salario)
                                : `R$ ${nivel.salario}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              {/* Descrição */}
              {concursoVisualizar.descricao && (
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-2">Descrição</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {concursoVisualizar.descricao}
                  </p>
                </div>
              )}

              {/* Link do edital */}
              {concursoVisualizar.edital && (
                <a
                  href={concursoVisualizar.edital}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-4 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition"
                >
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">Ver edital completo</span>
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </a>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-white transition font-medium"
                >
                  Fechar
                </button>
                <Link
                  href={`/admin/concursos/${concursoVisualizar.id}/editar`}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:shadow-lg transition"
                >
                  Editar concurso
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
              Tem certeza que deseja excluir o concurso{" "}
              <span className="font-bold text-gray-900">
                "{itemParaExcluir?.nome}"
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
