"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

interface Concurso {
  id: string;
  nome: string;
  banca: string;
  vagas: number;
  salario: string;
  precoInscricao?: string;
  status: string;
  thumbnail: string;
  orgao?: string;
  nivel?: string;
  descricao?: string;
  areas?: string[];
  cargos?: string[];
  locais?: string[];
  inscricoes?: {
    inicio: string;
    fim: string;
  };
  provas?: {
    data: string;
  };
  edital?: string;
  createdAt?: any;
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
            Concursos
          </h1>
          <p className="text-gray-500 mt-1">
            Total de {concursos.length} concursos cadastrados
          </p>
        </div>
        <Link
          href="/admin/concursos/novo"
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:shadow-lg transition"
        >
          <Plus className="w-5 h-5" />
          Novo Concurso
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome, banca ou órgão..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
          >
            <Tag className="w-4 h-4" />
            <span>Filtros</span>
            <ChevronRight
              className={`w-4 h-4 transition-transform ${
                showFilters ? "rotate-90" : ""
              }`}
            />
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFiltroStatus("todos")}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  filtroStatus === "todos"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFiltroStatus("aberto")}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  filtroStatus === "aberto"
                    ? "bg-green-500 text-white"
                    : "bg-green-50 text-green-600 hover:bg-green-100"
                }`}
              >
                📢 Abertos
              </button>
              <button
                onClick={() => setFiltroStatus("previsto")}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  filtroStatus === "previsto"
                    ? "bg-yellow-500 text-white"
                    : "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                }`}
              >
                📅 Previstos
              </button>
              <button
                onClick={() => setFiltroStatus("fechado")}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  filtroStatus === "fechado"
                    ? "bg-gray-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                🔒 Encerrados
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Concursos */}
      {concursosPaginados.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold text-gray-900 mb-2">
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
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Cadastrar Concurso
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Tabela */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">
                    Concurso
                  </th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">
                    Banca/Órgão
                  </th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">
                    Vagas
                  </th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">
                    Salário
                  </th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">
                    Inscrição
                  </th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {concursosPaginados.map((concurso) => (
                  <tr key={concurso.id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">
                          {concurso.thumbnail || "📚"}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">
                            {concurso.nome}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {concurso.id.substring(0, 8)}...
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
                      <span className="flex items-center gap-1 text-gray-600">
                        <Users className="w-4 h-4" />
                        {concurso.vagas}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="flex items-center gap-1 text-gray-600 font-medium">
                        <DollarSign className="w-4 h-4" />
                        {concurso.salario || "A definir"}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="flex items-center gap-1 text-gray-600">
                        <FileText className="w-4 h-4" />
                        {concurso.precoInscricao || "Grátis"}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(concurso.status)}`}
                      >
                        {getStatusLabel(concurso.status)}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setConcursoVisualizar(concurso);
                            setShowViewModal(true);
                          }}
                          className="p-2 hover:bg-green-100 rounded-lg transition text-green-600"
                          title="Visualizar detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <Link
                          href={`/admin/concursos/${concurso.id}/materias`}
                          className="p-2 hover:bg-orange-100 rounded-lg transition text-orange-600"
                          title="Gerenciar matérias"
                        >
                          <BookOpen className="w-4 h-4" />
                        </Link>

                        <Link
                          href={`/admin/concursos/${concurso.id}/editar`}
                          className="p-2 hover:bg-blue-100 rounded-lg transition text-blue-600"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => {
                            setItemParaExcluir(concurso);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
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
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">
                Mostrando {(paginaAtual - 1) * itensPorPagina + 1} a{" "}
                {Math.min(
                  paginaAtual * itensPorPagina,
                  concursosFiltrados.length,
                )}{" "}
                de {concursosFiltrados.length} concursos
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                  disabled={paginaAtual === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ←
                </button>

                <span className="px-4 py-2 text-sm text-gray-700">
                  {paginaAtual} de {totalPaginas}
                </span>

                <button
                  onClick={() =>
                    setPaginaAtual((p) => Math.min(totalPaginas, p + 1))
                  }
                  disabled={paginaAtual === totalPaginas}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de Visualização */}
      {showViewModal && concursoVisualizar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex justify-between items-center">
                <h3 className="font-display font-bold text-xl text-gray-900">
                  Detalhes do Concurso
                </h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-6 space-y-6">
              {/* Título e ícone */}
              <div className="flex items-center gap-4">
                <span className="text-5xl">
                  {concursoVisualizar.thumbnail || "📚"}
                </span>
                <div>
                  <h2 className="font-display text-2xl font-bold text-gray-900">
                    {concursoVisualizar.nome}
                  </h2>
                  <p className="text-gray-500">{concursoVisualizar.banca}</p>
                </div>
              </div>

              {/* Status e Nível */}
              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(concursoVisualizar.status)}`}
                >
                  {getStatusLabel(concursoVisualizar.status)}
                </span>
                {concursoVisualizar.nivel && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                    Nível:{" "}
                    {concursoVisualizar.nivel === "ambos"
                      ? "Médio/Superior"
                      : concursoVisualizar.nivel === "medio"
                        ? "Médio"
                        : "Superior"}
                  </span>
                )}
              </div>

              {/* Informações principais */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Vagas</p>
                  <p className="text-xl font-bold text-gray-900">
                    {concursoVisualizar.vagas}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Salário</p>
                  <p className="text-xl font-bold text-gray-900">
                    {concursoVisualizar.salario || "A definir"}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Inscrição</p>
                  <p className="text-xl font-bold text-gray-900">
                    {concursoVisualizar.precoInscricao || "Grátis"}
                  </p>
                </div>
              </div>

              {/* Localidades */}
              {concursoVisualizar.locais &&
                concursoVisualizar.locais.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      Localidades
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {concursoVisualizar.locais.map((local, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm flex items-center gap-1"
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
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Datas importantes
                  </h4>
                  <div className="space-y-2">
                    {concursoVisualizar.inscricoes?.inicio && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        <span className="text-gray-600">
                          Início inscrições:
                        </span>
                        <span className="font-medium text-gray-900">
                          {formatarData(concursoVisualizar.inscricoes.inicio)}
                        </span>
                      </div>
                    )}
                    {concursoVisualizar.inscricoes?.fim && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        <span className="text-gray-600">Fim inscrições:</span>
                        <span className="font-medium text-gray-900">
                          {formatarData(concursoVisualizar.inscricoes.fim)}
                        </span>
                      </div>
                    )}
                    {concursoVisualizar.provas?.data && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className="text-gray-600">Data da prova:</span>
                        <span className="font-medium text-gray-900">
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
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Áreas de atuação
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {concursoVisualizar.areas.map((area, index) => (
                        <span
                          key={index}
                          className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Cargos */}
              {concursoVisualizar.cargos &&
                concursoVisualizar.cargos.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Cargos</h4>
                    <div className="flex flex-wrap gap-2">
                      {concursoVisualizar.cargos.map((cargo, index) => (
                        <span
                          key={index}
                          className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm"
                        >
                          {cargo}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Descrição */}
              {concursoVisualizar.descricao && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Descrição</h4>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">
                    {concursoVisualizar.descricao}
                  </p>
                </div>
              )}

              {/* Link do edital */}
              {concursoVisualizar.edital && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Edital</h4>
                  <a
                    href={concursoVisualizar.edital}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:text-orange-600 text-sm flex items-center gap-1"
                  >
                    <FileText className="w-4 h-4" />
                    Ver edital completo
                  </a>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  Fechar
                </button>
                <Link
                  href={`/admin/concursos/${concursoVisualizar.id}/editar`}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition"
                >
                  Editar concurso
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="font-display font-bold text-xl text-gray-900 mb-2">
              Confirmar exclusão
            </h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir o concurso "{itemParaExcluir?.nome}
              "? Esta ação também removerá todas as matérias associadas e não
              pode ser desfeita.
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
