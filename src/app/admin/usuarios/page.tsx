"use client";

import { useState, useEffect } from "react";
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
  MoreVertical,
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

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const usuariosPorPagina = 10;

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
        <h1 className="font-display text-3xl font-bold text-gray-900">
          Usuários
        </h1>
        <p className="text-gray-500 mt-1">
          Gerencie todos os usuários da plataforma
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <Users className="w-8 h-8 text-orange-500 mb-3" />
          <p className="text-2xl font-bold text-gray-900">{usuarios.length}</p>
          <p className="text-sm text-gray-500">Total de usuários</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <UserCheck className="w-8 h-8 text-green-500 mb-3" />
          <p className="text-2xl font-bold text-gray-900">
            {usuarios.filter((u) => u.subscription?.status === "active").length}
          </p>
          <p className="text-sm text-gray-500">Assinantes ativos</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <Award className="w-8 h-8 text-blue-500 mb-3" />
          <p className="text-2xl font-bold text-gray-900">
            {usuarios.filter((u) => u.subscription?.status === "trial").length}
          </p>
          <p className="text-sm text-gray-500">Em trial</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <UserX className="w-8 h-8 text-red-500 mb-3" />
          <p className="text-2xl font-bold text-gray-900">
            {
              usuarios.filter((u) => u.subscription?.status === "expired")
                .length
            }
          </p>
          <p className="text-sm text-gray-500">Expirados</p>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por email ou nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="todos">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="trial">Em trial</option>
              <option value="expired">Expirados</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Usuários */}
      {usuariosPaginados.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold text-gray-900 mb-2">
            Nenhum usuário encontrado
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? "Tente outros termos de busca"
              : "Aguardando primeiros cadastros"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-600">
                  Usuário
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">
                  Plano
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">
                  Progresso
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">
                  Cadastro
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {usuariosPaginados.map((usuario) => (
                <tr
                  key={usuario.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        {usuario.nome?.charAt(0).toUpperCase() ||
                          usuario.email?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {usuario.nome || "Sem nome"}
                        </p>
                        <p className="text-sm text-gray-500">{usuario.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(usuario.subscription?.status)}`}
                    >
                      {getStatusLabel(usuario.subscription?.status)}
                    </span>
                  </td>

                  <td className="p-4">
                    {usuario.subscription?.plan ? (
                      <span className="text-sm text-gray-900">
                        {usuario.subscription.plan === "monthly"
                          ? "Mensal"
                          : "Anual"}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
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
                      <span className="text-xs text-gray-600">
                        {usuario.stats?.totalQuestoes || 0} questões
                      </span>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {usuario.createdAt?.toDate?.()
                        ? new Date(
                            usuario.createdAt.toDate(),
                          ).toLocaleDateString("pt-BR")
                        : "—"}
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
                        className="text-xs border border-gray-300 rounded-lg px-2 py-1"
                      >
                        <option value="active">Ativar</option>
                        <option value="trial">Trial</option>
                        <option value="expired">Expirar</option>
                        <option value="cancelled">Cancelar</option>
                      </select>

                      <button
                        onClick={() => deletarUsuario(usuario.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Mostrando {(paginaAtual - 1) * usuariosPorPagina + 1} a{" "}
                {Math.min(
                  paginaAtual * usuariosPorPagina,
                  usuariosFiltrados.length,
                )}{" "}
                de {usuariosFiltrados.length} usuários
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                  disabled={paginaAtual === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Página {paginaAtual} de {totalPaginas}
                </span>
                <button
                  onClick={() =>
                    setPaginaAtual((p) => Math.min(totalPaginas, p + 1))
                  }
                  disabled={paginaAtual === totalPaginas}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
