"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Mail,
  Calendar,
  Award,
  ChevronLeft,
  ChevronRight,
  Loader2,
  UserCheck,
  UserX,
  Trash2,
  Sparkles,
  ChevronDown,
  X,
  TrendingUp,
  Clock,
  Target,
  Flame,
  Activity,
  Zap,
  Coffee,
  Brain,
} from "lucide-react";

interface Usuario {
  id: string;
  email: string;
  nome: string;
  fotoURL?: string;
  createdAt: any;
  subscription: {
    status: "trial" | "active" | "expired" | "cancelled";
    plan: "monthly" | "annual" | null;
    trialEndsAt: any;
    expiresAt: any | null;
  };
  preferences: {
    concursosInteresse: string[];
    metaDiaria: number;
    notificacoes: boolean;
  };
  stats: {
    totalQuestoes: number;
    totalAcertos: number;
    totalTempo: number;
    streak: number;
  };
}

// Componente de Card de Métrica
function MetricCard({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
  delay,
}: {
  icon: any;
  label: string;
  value: string | number;
  subtitle?: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all`}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-8 h-8 text-white/80" />
        <span className="text-3xl font-black">{value}</span>
      </div>
      <p className="text-white/80 text-sm">{label}</p>
      {subtitle && <p className="text-xs text-white/60 mt-2">{subtitle}</p>}
    </motion.div>
  );
}

// Componente de Filtro
function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 cursor-pointer rounded-xl text-sm font-medium transition-all ${
        active
          ? "bg-purple-900 text-white"
          : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 "
      }`}
    >
      {label}
    </button>
  );
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [showFilters, setShowFilters] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const usuariosPorPagina = 10;

  // Estatísticas
  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    trial: 0,
    expirados: 0,
    cancelados: 0,
    questoesTotais: 0,
    tempoTotal: 0,
  });

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      const q = query(collection(db, "usuarios"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Usuario[];

      // Calcular estatísticas
      const ativos = lista.filter(
        (u) => u.subscription?.status === "active",
      ).length;
      const trial = lista.filter(
        (u) => u.subscription?.status === "trial",
      ).length;
      const expirados = lista.filter(
        (u) => u.subscription?.status === "expired",
      ).length;
      const cancelados = lista.filter(
        (u) => u.subscription?.status === "cancelled",
      ).length;

      const questoesTotais = lista.reduce(
        (acc, u) => acc + (u.stats?.totalQuestoes || 0),
        0,
      );
      const tempoTotal = lista.reduce(
        (acc, u) => acc + (u.stats?.totalTempo || 0),
        0,
      );

      setStats({
        total: lista.length,
        ativos,
        trial,
        expirados,
        cancelados,
        questoesTotais,
        tempoTotal,
      });

      setUsuarios(lista);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  const alterarStatusAssinatura = async (
    userId: string,
    novoStatus: "trial" | "active" | "expired" | "cancelled",
  ) => {
    try {
      await updateDoc(doc(db, "usuarios", userId), {
        "subscription.status": novoStatus,
        updatedAt: new Date(),
      });
      carregarUsuarios();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    }
  };

  const deletarUsuario = async (userId: string) => {
    if (!confirm("Tem certeza que deseja deletar este usuário?")) return;

    try {
      await deleteDoc(doc(db, "usuarios", userId));
      carregarUsuarios();
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
    }
  };

  // Filtrar usuários
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const matchesSearch =
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.nome?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filtroStatus === "todos" || usuario.subscription?.status === filtroStatus;
    return matchesSearch && matchesStatus;
  });

  // Paginação
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);
  const usuariosPaginados = usuariosFiltrados.slice(
    (paginaAtual - 1) * usuariosPorPagina,
    paginaAtual * usuariosPorPagina,
  );

  // Resetar página quando filtrar
  useEffect(() => {
    setPaginaAtual(1);
  }, [searchTerm, filtroStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-600";
      case "trial":
        return "bg-blue-100 text-blue-600";
      case "expired":
        return "bg-red-100 text-red-600";
      case "cancelled":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "trial":
        return "Trial";
      case "expired":
        return "Expirado";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  const formatarTempo = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}min`;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full mb-4"
        />
        <p className="text-gray-500">Carregando usuários...</p>
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
                {stats.total} usuários cadastrados
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-2">Usuários</h1>
            {/* <p className="text-purple-200 text-lg max-w-2xl">
              Gerencie todos os usuários da plataforma
            </p> */}
          </div>
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid md:grid-cols-4 gap-6">
        <MetricCard
          icon={Users}
          label="Total de usuários"
          value={stats.total}
          color="from-black to-purple-900"
          delay={0.1}
        />
        <MetricCard
          icon={UserCheck}
          label="Assinantes ativos"
          value={stats.ativos}
          subtitle={`${((stats.ativos / stats.total) * 100).toFixed(1)}% do total`}
          color="from-green-600 to-green-700"
          delay={0.2}
        />
        <MetricCard
          icon={Award}
          label="Em período trial"
          value={stats.trial}
          color="from-blue-600 to-blue-700"
          delay={0.3}
        />
        <MetricCard
          icon={UserX}
          label="Expirados"
          value={stats.expirados}
          color="from-red-600 to-red-900"
          delay={0.4}
        />
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-purple-500 transition-colors" />
            <input
              type="text"
              placeholder="Buscar por email ou nome..."
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
            className="px-6 py-3 cursor-pointer bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2 text-gray-700"
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
                    label="Ativos"
                    active={filtroStatus === "active"}
                    onClick={() => setFiltroStatus("active")}
                  />
                  <FilterChip
                    label="Trial"
                    active={filtroStatus === "trial"}
                    onClick={() => setFiltroStatus("trial")}
                  />
                  <FilterChip
                    label="Expirados"
                    active={filtroStatus === "expired"}
                    onClick={() => setFiltroStatus("expired")}
                  />
                  <FilterChip
                    label="Cancelados"
                    active={filtroStatus === "cancelled"}
                    onClick={() => setFiltroStatus("cancelled")}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lista de Usuários */}
      {usuariosPaginados.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Nenhum usuário encontrado
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? "Tente outros termos de busca"
              : "Aguardando primeiros cadastros"}
          </p>
        </div>
      ) : (
        <>
          {/* Tabela */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Plano
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Progresso
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Cadastro
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usuariosPaginados.map((usuario, index) => (
                  <motion.tr
                    key={usuario.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-purple-50/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                          {usuario.nome?.charAt(0).toUpperCase() ||
                            usuario.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {usuario.nome || "Sem nome"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {usuario.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold ${getStatusColor(usuario.subscription?.status)}`}
                      >
                        {getStatusLabel(usuario.subscription?.status)}
                      </span>
                    </td>

                    <td className="p-4">
                      {usuario.subscription?.plan ? (
                        <span className="text-sm font-medium text-gray-900">
                          {usuario.subscription.plan === "monthly"
                            ? "📅 Mensal"
                            : "📆 Anual"}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-20 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{
                              width: `${
                                usuario.stats?.totalQuestoes
                                  ? Math.min(
                                      (usuario.stats.totalAcertos /
                                        usuario.stats.totalQuestoes) *
                                        100,
                                      100,
                                    )
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                          {usuario.stats?.totalQuestoes || 0} questões
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>
                          {formatarTempo(usuario.stats?.totalTempo || 0)}
                        </span>
                        <Flame className="w-3 h-3 ml-1" />
                        <span>🔥 {usuario.stats?.streak || 0}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <span>
                          {usuario.createdAt?.toDate?.()
                            ? new Date(
                                usuario.createdAt.toDate(),
                              ).toLocaleDateString("pt-BR")
                            : "—"}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex gap-2">
                        <select
                          onChange={(e) =>
                            alterarStatusAssinatura(
                              usuario.id,
                              e.target.value as any,
                            )
                          }
                          value={usuario.subscription?.status}
                          className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                        >
                          <option value="active">Ativar</option>
                          <option value="trial">Trial</option>
                          <option value="expired">Expirar</option>
                          <option value="cancelled">Cancelar</option>
                        </select>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deletarUsuario(usuario.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition text-red-600"
                          title="Excluir usuário"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">
                Mostrando{" "}
                <span className="font-bold text-gray-700">
                  {(paginaAtual - 1) * usuariosPorPagina + 1}
                </span>{" "}
                a{" "}
                <span className="font-bold text-gray-700">
                  {Math.min(
                    paginaAtual * usuariosPorPagina,
                    usuariosFiltrados.length,
                  )}
                </span>{" "}
                de{" "}
                <span className="font-bold text-gray-700">
                  {usuariosFiltrados.length}
                </span>{" "}
                usuários
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
                  {paginaAtual} de {totalPaginas}
                </span>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setPaginaAtual((p) => Math.min(totalPaginas, p + 1))
                  }
                  disabled={paginaAtual === totalPaginas}
                  className="p-2 rounded-xl border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
