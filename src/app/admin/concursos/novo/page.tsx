"use client";

import { JSX, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Plus,
  X,
  Calendar,
  DollarSign,
  MapPin,
  Briefcase,
  Building2,
  FileText,
  Tag,
  Layers,
  GraduationCap,
  Users,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { estados } from "@/lib/utils/brazil-cities-states";

// 🔥 Tipos definidos localmente
type NivelEnsino =
  | "fundamental"
  | "medio"
  | "tecnico"
  | "superior"
  | "mestrado"
  | "doutorado"
  | "phd";

interface NivelInfo {
  nivel: NivelEnsino;
  vagas: number;
  salario: string | number;
}

// Utilitários locais
const formatarNivel = (nivel: NivelEnsino): string => {
  const mapa: Record<NivelEnsino, string> = {
    fundamental: "Fundamental",
    medio: "Médio",
    tecnico: "Técnico",
    superior: "Superior",
    mestrado: "Mestrado",
    doutorado: "Doutorado",
    phd: "PhD",
  };
  return mapa[nivel] || nivel;
};

const getNivelIcone = (nivel: NivelEnsino) => {
  const icones: Record<NivelEnsino, JSX.Element> = {
    fundamental: <GraduationCap className="w-5 h-5" />,
    medio: <GraduationCap className="w-5 h-5" />,
    tecnico: <Briefcase className="w-5 h-5" />,
    superior: <GraduationCap className="w-5 h-5" />,
    mestrado: <GraduationCap className="w-5 h-5" />,
    doutorado: <GraduationCap className="w-5 h-5" />,
    phd: <GraduationCap className="w-5 h-5" />,
  };
  return icones[nivel] || <GraduationCap className="w-5 h-5" />;
};

export default function NovoConcursoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("dados");

  // Estados para selects de localização
  const [estadoSelecionado, setEstadoSelecionado] = useState("");
  const [cidadeSelecionada, setCidadeSelecionada] = useState("");

  // Dados básicos do concurso
  const [formData, setFormData] = useState({
    nome: "",
    banca: "",
    orgao: "",
    descricao: "",
    thumbnail: "briefcase",
    cor: "from-black to-purple-900",
    status: "aberto" as const,
    edital: "",
    ultimoEdital: new Date().getFullYear().toString(),
    // Campos de inscrição
    precoInscricao: "",
    inscricoes: {
      inicio: "",
      fim: "",
    },
    provas: {
      data: "",
    },
    locais: [] as string[],
    areas: [] as string[],
    niveis: [] as NivelInfo[],
  });

  // Estado para adicionar nova área
  const [novaArea, setNovaArea] = useState("");

  // Estado para adicionar novo nível
  const [novoNivel, setNovoNivel] = useState<NivelEnsino | "">("");
  const [vagasNivel, setVagasNivel] = useState<number>(0);
  const [salario, setSalario] = useState("");
  const [mostrarFormNivel, setMostrarFormNivel] = useState(false);

  // Opções de níveis
  const opcoesNiveis: { value: NivelEnsino; label: string }[] = [
    { value: "fundamental", label: "Fundamental" },
    { value: "medio", label: "Médio" },
    { value: "tecnico", label: "Técnico" },
    { value: "superior", label: "Superior" },
    { value: "mestrado", label: "Mestrado" },
    { value: "doutorado", label: "Doutorado" },
    { value: "phd", label: "PhD" },
  ];

  // Funções para Áreas
  const addArea = () => {
    if (novaArea.trim()) {
      setFormData({
        ...formData,
        areas: [...formData.areas, novaArea.trim()],
      });
      setNovaArea("");
    }
  };

  const removeArea = (index: number) => {
    setFormData({
      ...formData,
      areas: formData.areas.filter((_, i) => i !== index),
    });
  };

  // Funções para Locais
  const adicionarLocal = () => {
    if (cidadeSelecionada) {
      setFormData({
        ...formData,
        locais: [...formData.locais, cidadeSelecionada],
      });
      setCidadeSelecionada("");
      setEstadoSelecionado("");
    }
  };

  const removerLocal = (index: number) => {
    setFormData({
      ...formData,
      locais: formData.locais.filter((_, i) => i !== index),
    });
  };

  // Funções para Níveis
  const adicionarNivel = () => {
    if (!novoNivel) {
      alert("Selecione um nível");
      return;
    }

    if (formData.niveis.some((n) => n.nivel === novoNivel)) {
      alert("Este nível já foi adicionado");
      return;
    }

    const novoNivelInfo: NivelInfo = {
      nivel: novoNivel as NivelEnsino,
      vagas: vagasNivel || 0,
      salario: salario || "A definir",
    };

    setFormData({
      ...formData,
      niveis: [...formData.niveis, novoNivelInfo],
    });

    setNovoNivel("");
    setVagasNivel(0);
    setSalario("");
    setMostrarFormNivel(false);
  };

  const removerNivel = (index: number) => {
    setFormData({
      ...formData,
      niveis: formData.niveis.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.niveis.length === 0) {
        alert("Adicione pelo menos um nível ao concurso");
        setLoading(false);
        return;
      }

      const totalVagas = formData.niveis.reduce(
        (acc, n) => acc + (n.vagas || 0),
        0,
      );

      const concursoData = {
        ...formData,
        stats: {
          vagas: totalVagas,
          materias: 0,
          topicos: 0,
          horas: 0,
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, "concursos"), concursoData);
      console.log("✅ Concurso criado:", docRef.id);

      router.push(`/admin/concursos/${docRef.id}/niveis`);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar concurso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header com gradiente preto/roxo */}
      <div className="bg-gradient-to-r from-black to-purple-900 text-white rounded-2xl p-8 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Novo Concurso</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-2">
              Criar Concurso
            </h1>
          </div>
          <button
            onClick={() => router.back()}
            className="bg-white/10 cursor-pointer hover:bg-white/20 text-white p-3 rounded-xl transition flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
        </div>
      </div>

      {/* Abas */}
      <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-200 flex flex-wrap gap-1">
        <button
          onClick={() => setAbaAtiva("dados")}
          className={`flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            abaAtiva === "dados"
              ? "bg-gradient-to-r from-black to-purple-900 text-white shadow-lg"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <FileText className="w-4 h-4" />
          Dados Básicos
        </button>
        <button
          onClick={() => setAbaAtiva("inscricoes")}
          className={`flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            abaAtiva === "inscricoes"
              ? "bg-gradient-to-r from-black to-purple-900 text-white shadow-lg"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Inscrições
        </button>
        <button
          onClick={() => setAbaAtiva("locais")}
          className={`flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            abaAtiva === "locais"
              ? "bg-gradient-to-r from-black to-purple-900 text-white shadow-lg"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <MapPin className="w-4 h-4" />
          Locais
        </button>
        <button
          onClick={() => setAbaAtiva("niveis")}
          className={`flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            abaAtiva === "niveis"
              ? "bg-gradient-to-r from-black to-purple-900 text-white shadow-lg"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Layers className="w-4 h-4" />
          Níveis
        </button>
        <button
          onClick={() => setAbaAtiva("areas")}
          className={`flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            abaAtiva === "areas"
              ? "bg-gradient-to-r from-black to-purple-900 text-white shadow-lg"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Tag className="w-4 h-4" />
          Áreas
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Aba: Dados Básicos */}
        {abaAtiva === "dados" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Informações Básicas
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Concurso *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                  placeholder="Ex: Polícia Federal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banca *
                </label>
                <input
                  type="text"
                  required
                  value={formData.banca}
                  onChange={(e) =>
                    setFormData({ ...formData, banca: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                  placeholder="Ex: Cebraspe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Órgão
                </label>
                <input
                  type="text"
                  value={formData.orgao}
                  onChange={(e) =>
                    setFormData({ ...formData, orgao: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                  placeholder="Ex: Ministério da Justiça"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as any })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                >
                  <option value="aberto">📢 Aberto</option>
                  <option value="previsto">📅 Previsto</option>
                  <option value="fechado">🔒 Fechado</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  rows={4}
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none resize-none"
                  placeholder="Informações gerais sobre o concurso..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link do Edital
                </label>
                <input
                  type="url"
                  value={formData.edital}
                  onChange={(e) =>
                    setFormData({ ...formData, edital: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Último Edital
                </label>
                <input
                  type="text"
                  value={formData.ultimoEdital}
                  onChange={(e) =>
                    setFormData({ ...formData, ultimoEdital: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                  placeholder="2024"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Aba: Inscrições e Provas */}
        {abaAtiva === "inscricoes" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Inscrições e Provas
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor da Inscrição
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.precoInscricao}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        precoInscricao: e.target.value,
                      })
                    }
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    placeholder="Ex: R$ 130,00"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Deixe em branco se for gratuito
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Início das Inscrições
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      value={formData.inscricoes.inicio}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          inscricoes: {
                            ...formData.inscricoes,
                            inicio: e.target.value,
                          },
                        })
                      }
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fim das Inscrições
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      value={formData.inscricoes.fim}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          inscricoes: {
                            ...formData.inscricoes,
                            fim: e.target.value,
                          },
                        })
                      }
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data da Prova
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={formData.provas.data}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        provas: { data: e.target.value },
                      })
                    }
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Aba: Locais de Prova */}
        {abaAtiva === "locais" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              Locais de Prova
            </h2>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={estadoSelecionado}
                    onChange={(e) => {
                      setEstadoSelecionado(e.target.value);
                      setCidadeSelecionada("");
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                  >
                    <option value="">Selecione um estado</option>
                    {estados.map((est) => (
                      <option key={est.sigla} value={est.sigla}>
                        {est.nome} ({est.sigla})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={cidadeSelecionada}
                      onChange={(e) => setCidadeSelecionada(e.target.value)}
                      disabled={!estadoSelecionado}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Selecione uma cidade</option>
                      {estadoSelecionado &&
                        estados
                          .find((e) => e.sigla === estadoSelecionado)
                          ?.cidades.map((cidade) => (
                            <option
                              key={cidade}
                              value={`${cidade} - ${estadoSelecionado}`}
                            >
                              {cidade}
                            </option>
                          ))}
                    </select>
                    <button
                      type="button"
                      onClick={adicionarLocal}
                      disabled={!cidadeSelecionada}
                      className="px-4 py-3 bg-gradient-to-r from-black to-purple-900 text-white rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.locais.map((local, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 border border-gray-200"
                  >
                    <MapPin className="w-3 h-3 text-purple-500" />
                    {local}
                    <button
                      type="button"
                      onClick={() => removerLocal(index)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
                {formData.locais.length === 0 && (
                  <p className="text-sm text-gray-400 py-2">
                    Nenhum local adicionado (consideraremos todo o Brasil)
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Aba: Níveis e Vagas */}
        {abaAtiva === "niveis" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-600" />
                Níveis e Vagas
              </h2>

              {/* Lista de níveis existentes */}
              {formData.niveis.length > 0 && (
                <div className="space-y-4 mb-8">
                  {formData.niveis.map((nivel, index) => (
                    <div
                      key={nivel.nivel}
                      className="bg-gray-50 rounded-xl p-5 border border-gray-200 flex items-center justify-between group hover:border-purple-200 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-black to-purple-900 rounded-lg flex items-center justify-center text-white">
                          {getNivelIcone(nivel.nivel)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {formatarNivel(nivel.nivel)}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {nivel.vagas} vagas • {nivel.salario}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removerNivel(index)}
                        className="p-2 text-gray-400 hover:text-red-500 transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulário para adicionar novo nível */}
              {mostrarFormNivel ? (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-4">
                    Adicionar Nível
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nível de Ensino
                      </label>
                      <select
                        value={novoNivel}
                        onChange={(e) =>
                          setNovoNivel(e.target.value as NivelEnsino)
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                      >
                        <option value="">Selecione um nível</option>
                        {opcoesNiveis.map((opcao) => (
                          <option key={opcao.value} value={opcao.value}>
                            {opcao.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número de Vagas
                        </label>
                        <input
                          type="number"
                          value={vagasNivel}
                          onChange={(e) =>
                            setVagasNivel(parseInt(e.target.value) || 0)
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                          placeholder="Ex: 100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Salário
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            value={salario}
                            onChange={(e) => setSalario(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                            placeholder="Ex: R$ 3.000,00"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setMostrarFormNivel(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={adicionarNivel}
                      className="px-4 py-2 bg-gradient-to-r from-black to-purple-900 text-white rounded-lg hover:shadow-lg transition"
                    >
                      Adicionar Nível
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setMostrarFormNivel(true)}
                  className="w-full py-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-purple-300 hover:text-purple-600 transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Adicionar nível
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Aba: Áreas de Atuação */}
        {abaAtiva === "areas" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-600" />
              Áreas de Atuação
            </h2>

            <div className="space-y-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={novaArea}
                  onChange={(e) => setNovaArea(e.target.value)}
                  placeholder="Ex: Tecnologia da Informação"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addArea())
                  }
                />
                <button
                  type="button"
                  onClick={addArea}
                  className="px-4 py-3 bg-gradient-to-r from-black to-purple-900 text-white rounded-xl hover:shadow-lg transition"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.areas.map((area, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 border border-gray-200"
                  >
                    <Tag className="w-3 h-3 text-purple-500" />
                    {area}
                    <button
                      type="button"
                      onClick={() => removeArea(index)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
                {formData.areas.length === 0 && (
                  <p className="text-sm text-gray-400 py-2">
                    Nenhuma área adicionada
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Botões de ação */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 cursor-pointer py-3 border border-gray-300 rounded-xl hover:bg-gray-100 transition font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 cursor-pointer bg-gradient-to-r from-black to-purple-900 text-white rounded-xl hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2 font-medium"
          >
            {loading ? "Salvando..." : "Criar Concurso"}
          </button>
        </div>
      </form>
    </div>
  );
}
