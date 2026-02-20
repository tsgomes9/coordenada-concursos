"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useAcesso } from "@/lib/hooks/useAcesso";
import { useProgresso } from "@/lib/hooks/useProgresso";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Clock,
  Lock,
  Headphones,
  FileText,
  PlayCircle,
  CheckCircle,
  Loader2,
  Users,
  Briefcase,
  DollarSign,
  Sparkles,
  TrendingUp,
  Target,
  GraduationCap,
  Layers,
  MapPin,
  Calendar,
} from "lucide-react";
import { NivelEnsino } from "@/types";
import { formatarNivel, getNivelIcone } from "@/lib/utils/formatadores";

// Interface baseada na estrutura REAL do Firebase
interface NivelInfo {
  nivel: NivelEnsino;
  vagas: number;
  salario: string | number;
}

interface Concurso {
  id: string;
  nome: string;
  banca: string;
  thumbnail: string;
  cor: string;
  descricao: string;
  orgao?: string;
  edital?: string;
  status: "aberto" | "previsto" | "fechado";
  areas?: string[];
  niveis: NivelInfo[]; // ← Array de objetos, não de strings
  stats?: {
    materias: number;
    topicos: number;
    questoes: number;
    horas: number;
  };
  grade?: Record<string, string[]>;
  precoInscricao?: string;
  inscricoes?: {
    inicio: string;
    fim: string;
  };
  provas?: {
    data: string;
  };
  locais?: string[];
  ultimoEdital?: string;
}

interface Materia {
  id: string;
  nome: string;
  icone: string;
  cor: string;
  ordem: number;
}

interface TopicoInfo {
  id: string;
  titulo: string;
  tempoEstimado: number;
  isPreview: boolean;
  audioUrl?: string;
  materiaId: string;
}

interface Progresso {
  concluido: boolean;
  progresso: number;
  ultimoAcesso?: Date;
}

export default function ConcursoDetalhePage() {
  const params = useParams();
  const { user } = useAuth();
  const concursoId = params.id as string;

  // Estado para nível selecionado (apenas para filtrar a grade)
  const [nivelSelecionado, setNivelSelecionado] = useState<NivelEnsino | "">(
    "",
  );

  const [concurso, setConcurso] = useState<Concurso | null>(null);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [topicosPorMateria, setTopicosPorMateria] = useState<
    Record<string, TopicoInfo[]>
  >({});
  const [progresso, setProgresso] = useState<Record<string, Progresso>>({});
  const [loading, setLoading] = useState(true);
  const [loadingGrade, setLoadingGrade] = useState(false);
  const [materiaExpandida, setMateriaExpandida] = useState<string | null>(null);
  const [proximoTopico, setProximoTopico] = useState<{
    materia: string;
    topico: string;
    titulo: string;
    progresso: number;
  } | null>(null);
  const [ultimoTopico, setUltimoTopico] = useState<{
    materia: string;
    topico: string;
    titulo: string;
  } | null>(null);

  const { nivelAcesso } = useAcesso();
  const {
    progresso: progressoReal,
    loading: loadingProgresso,
    getProgressoPorConcurso,
    isTopicoConcluido,
  } = useProgresso();

  // Função para encontrar o próximo tópico a estudar
  const encontrarProximoTopico = () => {
    const topicosArray = Object.values(topicosPorMateria).flat();

    // 1. Procurar tópicos em andamento (progresso > 0 e < 100)
    const topicosEmAndamento = topicosArray
      .map((t) => ({ ...t, prog: progresso[t.id] }))
      .filter((t) => t.prog && t.prog.progresso > 0 && t.prog.progresso < 100)
      .sort((a, b) => {
        const dataA = a.prog?.ultimoAcesso?.getTime() || 0;
        const dataB = b.prog?.ultimoAcesso?.getTime() || 0;
        return dataB - dataA;
      });

    if (topicosEmAndamento.length > 0) {
      return {
        materia: topicosEmAndamento[0].materiaId,
        topico: topicosEmAndamento[0].id,
        titulo: topicosEmAndamento[0].titulo,
        progresso: topicosEmAndamento[0].prog?.progresso || 0,
      };
    }

    // 2. Se não há em andamento, procurar tópicos não iniciados
    const topicosNaoIniciados = topicosArray.filter(
      (t) => !progresso[t.id] || progresso[t.id].progresso === 0,
    );

    if (topicosNaoIniciados.length > 0) {
      return {
        materia: topicosNaoIniciados[0].materiaId,
        topico: topicosNaoIniciados[0].id,
        titulo: topicosNaoIniciados[0].titulo,
        progresso: 0,
      };
    }

    return null;
  };

  // Calcular total de vagas a partir dos níveis
  const calcularTotalVagas = () => {
    if (!concurso?.niveis || concurso.niveis.length === 0) return 0;
    return concurso.niveis.reduce((acc, nivel) => acc + (nivel.vagas || 0), 0);
  };

  // Obter faixa salarial
  const obterFaixaSalarial = () => {
    if (!concurso?.niveis || concurso.niveis.length === 0) return "A definir";

    const salarios = concurso.niveis
      .map((n) => {
        if (typeof n.salario === "string") {
          const match = n.salario.match(/[\d.,]+/);
          if (match) {
            return parseFloat(match[0].replace(/\./g, "").replace(",", "."));
          }
        } else if (typeof n.salario === "number") {
          return n.salario;
        }
        return null;
      })
      .filter((s) => s !== null) as number[];

    if (salarios.length > 0) {
      const min = Math.min(...salarios);
      const max = Math.max(...salarios);
      if (min === max) {
        return `R$ ${min.toFixed(2).replace(".", ",")}`;
      }
      return `R$ ${min.toFixed(2).replace(".", ",")} - R$ ${max.toFixed(2).replace(".", ",")}`;
    }
    return "A definir";
  };

  // Carregar dados do concurso
  useEffect(() => {
    async function carregarDados() {
      if (!concursoId) return;

      try {
        setLoading(true);

        const concursoRef = doc(db, "concursos", concursoId);
        const concursoSnap = await getDoc(concursoRef);

        if (!concursoSnap.exists()) {
          console.error("Concurso não encontrado");
          setConcurso(null);
          setLoading(false);
          return;
        }

        const concursoData = {
          id: concursoSnap.id,
          ...concursoSnap.data(),
        } as Concurso;
        setConcurso(concursoData);

        // Se tem níveis e nenhum selecionado, selecionar o primeiro
        if (
          concursoData.niveis &&
          concursoData.niveis.length > 0 &&
          !nivelSelecionado
        ) {
          setNivelSelecionado(concursoData.niveis[0].nivel);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do concurso:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [concursoId]);

  // Carregar grade do nível selecionado
  useEffect(() => {
    async function carregarGradeDoNivel() {
      if (!concurso || !nivelSelecionado) return;

      try {
        setLoadingGrade(true);
        setMateriaExpandida(null); // Fecha todas as matérias ao trocar de nível

        // Buscar grade do nível
        const gradeRef = doc(db, "grades", `${concursoId}_${nivelSelecionado}`);
        const gradeSnap = await getDoc(gradeRef);

        let materiasIds: string[] = [];
        let gradeData: Record<string, string[]> = {};

        if (gradeSnap.exists()) {
          const data = gradeSnap.data();
          // Converter array de matérias para o formato antigo
          if (data.materias && Array.isArray(data.materias)) {
            // 🔥 FILTRAR itens vazios ou inválidos
            const materiasValidas = data.materias.filter(
              (m: any) => m && m.id && typeof m.id === "string" && m.id !== "",
            );

            materiasValidas.forEach((m: any) => {
              if (m.id) {
                gradeData[m.id] = m.topicos || [];
                materiasIds.push(m.id);
              }
            });
          }
        } else {
          // Fallback para o formato antigo
          gradeData = concurso.grade || {};
          materiasIds = Object.keys(gradeData).filter(
            (id) => id && id !== "undefined" && id !== "",
          );
        }

        // 🔥 SE NÃO TIVER MATÉRIAS, MOSTRA VAZIO
        if (materiasIds.length === 0) {
          setMaterias([]);
          setTopicosPorMateria({});
          setLoadingGrade(false);
          return;
        }

        // Buscar matérias
        const materiasQuery = query(
          collection(db, "materias"),
          where("__name__", "in", materiasIds.slice(0, 10)),
        );
        const materiasSnap = await getDocs(materiasQuery);

        const materiasList = materiasSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Materia[];

        materiasList.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
        setMaterias(materiasList);

        // Buscar tópicos
        const topicosTemp: Record<string, TopicoInfo[]> = {};

        for (const materiaId of materiasIds) {
          // 🔥 VERIFICAÇÃO DE SEGURANÇA
          if (!materiaId || materiaId === "undefined" || materiaId === "") {
            console.warn(`⚠️ Ignorando materiaId inválido: ${materiaId}`);
            continue;
          }

          const topicosIds = gradeData[materiaId] || [];

          if (!topicosIds || topicosIds.length === 0) {
            topicosTemp[materiaId] = [];
            continue;
          }

          // 🔥 FILTRAR IDs INVÁLIDOS
          const topicosValidos = topicosIds.filter(
            (id: string) => id && id !== "undefined" && id !== "",
          );

          if (topicosValidos.length === 0) {
            topicosTemp[materiaId] = [];
            continue;
          }

          const topicosQuery = query(
            collection(db, "catalogo"),
            where("id", "in", topicosValidos.slice(0, 10)),
          );
          const topicosSnap = await getDocs(topicosQuery);

          topicosTemp[materiaId] = topicosSnap.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              titulo: data.titulo || "",
              tempoEstimado: data.tempoEstimado || 30,
              isPreview: data.isPreview || false,
              audioUrl: data.audioUrl,
              materiaId: materiaId,
            };
          }) as TopicoInfo[];
        }

        setTopicosPorMateria(topicosTemp);

        // Carregar progresso real
        if (user && progressoReal) {
          const progressoMap: Record<string, Progresso> = {};
          const progressoDoConcurso = getProgressoPorConcurso(concursoId); // ← NOVO

          Object.keys(topicosTemp).forEach((materiaId) => {
            topicosTemp[materiaId].forEach((topico) => {
              const prog = progressoDoConcurso[topico.id];
              if (prog) {
                progressoMap[topico.id] = {
                  concluido: prog.status === "concluido",
                  progresso: prog.progresso,
                  ultimoAcesso: prog.ultimoAcesso,
                };
              }
            });
          });

          setProgresso(progressoMap);

          // Encontrar próximo tópico
          const proximo = encontrarProximoTopico();
          setProximoTopico(proximo);

          // Encontrar último tópico estudado
          const topicosArray = Object.values(topicosTemp).flat();
          const topicosComProgresso = topicosArray
            .map((t) => ({ ...t, prog: progressoReal[t.id] }))
            .filter(
              (t) => t.prog && t.prog.progresso > 0 && t.prog.progresso < 100,
            )
            .sort((a, b) => {
              const dataA = a.prog?.ultimoAcesso?.getTime() || 0;
              const dataB = b.prog?.ultimoAcesso?.getTime() || 0;
              return dataB - dataA;
            });

          if (topicosComProgresso.length > 0) {
            const ultimo = topicosComProgresso[0];
            setUltimoTopico({
              materia: ultimo.materiaId,
              topico: ultimo.id,
              titulo: ultimo.titulo,
            });
          }
        }
      } catch (error) {
        console.error("Erro ao carregar grade do nível:", error);
      } finally {
        setLoadingGrade(false);
      }
    }

    carregarGradeDoNivel();
  }, [concurso, nivelSelecionado, user, progressoReal, concursoId]);

  // Recalcular próximo tópico quando progresso mudar
  useEffect(() => {
    if (Object.keys(topicosPorMateria).length > 0) {
      const proximo = encontrarProximoTopico();
      setProximoTopico(proximo);
    }
  }, [progresso, topicosPorMateria]);

  const totalTopicos = Object.values(topicosPorMateria).flat().length;
  const topicosConcluidos = Object.values(topicosPorMateria)
    .flat()
    .filter((t) => progresso[t.id]?.concluido).length;

  const progressoTotal =
    totalTopicos > 0 ? Math.round((topicosConcluidos / totalTopicos) * 100) : 0;

  const calcularProgressoMateria = (materiaId: string): number => {
    const topicos = topicosPorMateria[materiaId] || [];
    if (topicos.length === 0) return 0;

    const concluidos = topicos.filter((t) => progresso[t.id]?.concluido).length;
    return Math.round((concluidos / topicos.length) * 100);
  };

  const gerarSlug = (texto: string) => {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-");
  };

  // Handler para mudar de nível (agora só filtra a grade)
  const handleNivelChange = (nivel: NivelEnsino) => {
    console.log("🔵 Filtrando grade para nível:", nivel);
    setNivelSelecionado(nivel);
  };

  if (loading || loadingProgresso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-orange-200/30 blur-xl animate-pulse" />
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin relative" />
        </div>
      </div>
    );
  }

  if (!concurso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Concurso não encontrado
          </h2>
          <p className="text-gray-500 mb-6">
            O concurso que você está procurando não existe ou foi removido.
          </p>
          <Link
            href="/concursos"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition shadow-lg shadow-orange-200"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar para concursos
          </Link>
        </div>
      </div>
    );
  }

  const totalVagas = calcularTotalVagas();
  const faixaSalarial = obterFaixaSalarial();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header Moderno */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/concursos"
                className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gray-100 text-gray-600 hover:bg-orange-500 hover:text-white transition-all duration-300 group"
              >
                <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5 transition-transform group-hover:-translate-x-0.5" />
              </Link>
              <div className="min-w-0">
                <span className="text-xs lg:text-sm font-medium text-orange-500 block truncate">
                  {concurso.banca}
                </span>
                <h1 className="font-display text-base lg:text-xl font-bold text-gray-900 truncate max-w-[200px] sm:max-w-[300px] lg:max-w-none">
                  {concurso.nome}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Hero Section Modernizada */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 lg:mb-8"
        >
          <div className="relative bg-white rounded-2xl lg:rounded-3xl shadow-xl overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-500/5" />
            <div className="absolute top-0 right-0 w-48 lg:w-64 h-48 lg:h-64 bg-orange-500 rounded-full blur-3xl opacity-10" />
            <div className="absolute bottom-0 left-0 w-48 lg:w-64 h-48 lg:h-64 bg-orange-500 rounded-full blur-3xl opacity-10" />

            <div className="relative p-4 lg:p-8">
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Left Column - Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-3 lg:gap-4 mb-4 lg:mb-6">
                    <div>
                      <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4 leading-tight">
                        {concurso.nome}
                      </h1>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-2 mb-4 lg:mb-6">
                    <span className="inline-flex items-center px-3 lg:px-4 py-1.5 lg:py-2 bg-orange-50 text-gray-800 rounded-xl text-xs lg:text-sm font-medium w-full sm:w-auto">
                      {concurso.banca}
                    </span>

                    {concurso.orgao && (
                      <span className="inline-flex items-center gap-1 px-3 lg:px-4 py-1.5 lg:py-2 bg-gray-100 text-gray-600 rounded-xl text-xs lg:text-sm font-medium w-full sm:w-auto">
                        <Briefcase className="w-3 h-3 lg:w-4 lg:h-4" />
                        {concurso.orgao}
                      </span>
                    )}

                    {totalVagas > 0 && (
                      <span className="inline-flex items-center gap-1 px-3 lg:px-4 py-1.5 lg:py-2 bg-gray-100 text-gray-600 rounded-xl text-xs lg:text-sm font-medium w-full sm:w-auto">
                        <Users className="w-3 h-3 lg:w-4 lg:h-4" />
                        {totalVagas} {totalVagas === 1 ? "vaga" : "vagas"}
                      </span>
                    )}

                    {/* {faixaSalarial !== "A definir" && (
                      <span className="inline-flex items-center gap-1 px-3 lg:px-4 py-1.5 lg:py-2 bg-gray-100 text-gray-600 rounded-xl text-xs lg:text-sm font-medium w-full sm:w-auto">
                        <DollarSign className="w-3 h-3 lg:w-4 lg:h-4" />
                        {faixaSalarial}
                      </span>
                    )} */}

                    {/* {concurso.precoInscricao && (
                      <span className="inline-flex items-center gap-1 px-3 lg:px-4 py-1.5 lg:py-2 bg-gray-100 text-gray-600 rounded-xl text-xs lg:text-sm font-medium w-full sm:w-auto">
                        <FileText className="w-3 h-3 lg:w-4 lg:h-4" />
                        Valor da Inscrição: R$ {concurso.precoInscricao}
                      </span>
                    )} */}

                    {concurso.status && (
                      <span
                        className={`inline-flex items-center gap-1 px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl text-xs lg:text-sm font-medium w-full sm:w-auto ${
                          concurso.status === "aberto"
                            ? "bg-green-50 text-green-600"
                            : concurso.status === "previsto"
                              ? "bg-yellow-50 text-yellow-600"
                              : "bg-gray-50 text-gray-600"
                        }`}
                      >
                        {concurso.status === "aberto"
                          ? "📢"
                          : concurso.status === "previsto"
                            ? "📅"
                            : "📌"}
                        <span>
                          {concurso.status === "aberto"
                            ? "Inscrições abertas"
                            : concurso.status === "previsto"
                              ? "Edital previsto"
                              : "Concurso encerrado"}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Datas importantes */}
                  {/* {(concurso.inscricoes?.inicio ||
                    concurso.inscricoes?.fim ||
                    concurso.provas?.data) && (
                    <div className="flex flex-wrap gap-4 mb-4">
                      {concurso.inscricoes?.inicio && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Calendar className="w-3 h-3" />
                          Início:{" "}
                          {new Date(
                            concurso.inscricoes.inicio,
                          ).toLocaleDateString("pt-BR")}
                        </div>
                      )}
                      {concurso.inscricoes?.fim && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Calendar className="w-3 h-3" />
                          Fim:{" "}
                          {new Date(concurso.inscricoes.fim).toLocaleDateString(
                            "pt-BR",
                          )}
                        </div>
                      )}
                      {concurso.provas?.data && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Calendar className="w-3 h-3" />
                          Prova:{" "}
                          {new Date(concurso.provas.data).toLocaleDateString(
                            "pt-BR",
                          )}
                        </div>
                      )}
                    </div>
                  )} */}

                  {/* Locais */}
                  {concurso.locais && concurso.locais.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {concurso.locais.slice(0, 3).map((local, index) => (
                        <span
                          key={index}
                          className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg"
                        >
                          <MapPin className="w-3 h-3" />
                          {local}
                        </span>
                      ))}
                      {concurso.locais.length > 3 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                          +{concurso.locais.length - 3} locais
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
                    {[
                      {
                        icon: Layers,
                        label: "Matérias",
                        value: materias.length,
                        color: "from-orange-500 to-orange-600",
                      },
                      {
                        icon: GraduationCap,
                        label: "Tópicos",
                        value: totalTopicos,
                        color: "from-blue-500 to-blue-600",
                      },
                      {
                        icon: Target,
                        label: "Concluídos",
                        value: topicosConcluidos,
                        color: "from-green-500 to-green-600",
                      },
                      {
                        icon: Clock,
                        label: "Estimado",
                        value: `${concurso.stats?.horas ?? 0}h`,
                        color: "from-purple-500 to-purple-600",
                      },
                    ].map((stat, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-gray-50 to-white rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-gray-100 hover:shadow-lg transition-all duration-300 group"
                      >
                        <div
                          className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-gradient-to-r ${stat.color} bg-opacity-10 flex items-center justify-center mb-2 lg:mb-3 group-hover:scale-110 transition-transform duration-300`}
                        >
                          <stat.icon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                        </div>
                        <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-0.5 lg:mb-1">
                          {stat.value}
                        </div>
                        <div className="text-xs lg:text-sm text-gray-500">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Áreas de Atuação */}
                  {concurso.areas && concurso.areas.length > 0 && (
                    <div className="mt-4 lg:mt-6 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-500">
                        <Layers className="w-3 h-3 lg:w-4 lg:h-4" />
                        <span className="font-medium">Áreas:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 lg:gap-2">
                        {concurso.areas.map((area, index) => (
                          <span
                            key={index}
                            className="px-2 lg:px-3 py-1 bg-orange-700 text-white rounded-lg text-xs lg:text-sm font-medium border border-orange-100"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Descrição do Concurso */}
                  {concurso.descricao && (
                    <div className="prose prose-sm lg:prose-lg max-w-none mt-4">
                      <h2 className="text-2xl md:text-2xl font-black text-gray-900 mb-4 leading-tight">
                        Sobre o concurso
                      </h2>
                      <p className="text-sm lg:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {concurso.descricao}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Column - Progress */}
                <div className="lg:w-80">
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl lg:rounded-2xl p-5 lg:p-6 text-white">
                    <h2 className="text-2xl md:text-2xl font-bold text-gray-100 mb-4 leading-tight">
                      <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-orange-400" />
                      Seu progresso
                    </h2>

                    <div className="relative mb-4 lg:mb-6">
                      <div className="w-24 h-24 lg:w-32 lg:h-32 mx-auto relative">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle
                            className="text-gray-700"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                            r="42"
                            cx="50"
                            cy="50"
                          />
                          <circle
                            className="text-orange-500"
                            strokeWidth="8"
                            strokeDasharray={263.9}
                            strokeDashoffset={
                              263.9 * (1 - progressoTotal / 100)
                            }
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="42"
                            cx="50"
                            cy="50"
                            style={{ transition: "stroke-dashoffset 0.5s" }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl lg:text-3xl font-bold">
                              {progressoTotal}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 lg:space-y-3">
                      <div className="flex items-center justify-between text-xs lg:text-sm">
                        <span className="text-gray-400">Tópicos restantes</span>
                        <span className="font-semibold">
                          {totalTopicos - topicosConcluidos}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs lg:text-sm">
                        <span className="text-gray-400">Tempo estimado</span>
                        <span className="font-semibold">
                          {concurso.stats?.horas || 0}h
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs lg:text-sm">
                        <span className="text-gray-400">Meta diária</span>
                        <span className="font-semibold">2 tópicos</span>
                      </div>
                    </div>

                    <div className="mt-4 lg:mt-6 pt-4 lg:pt-6 border-t border-gray-700">
                      {proximoTopico ? (
                        <Link
                          href={`/materia/${gerarSlug(
                            materias.find((m) => m.id === proximoTopico.materia)
                              ?.nome || "",
                          )}/topico/${proximoTopico.topico}?concurso=${concursoId}`}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 lg:py-3 px-3 lg:px-4 rounded-xl text-sm lg:text-base font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25"
                        >
                          <PlayCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                          {proximoTopico.progresso > 0
                            ? "Continuar estudos"
                            : "Começar a estudar"}
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="w-full bg-gray-600 text-white py-2.5 lg:py-3 px-3 lg:px-4 rounded-xl text-sm lg:text-base font-medium flex items-center justify-center gap-2 cursor-not-allowed opacity-50"
                        >
                          <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                          Concluído
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Área de Estudo */}
        <div className="mt-8 lg:mt-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 lg:mb-6">
            <h2 className="text-2xl md:text-2xl font-display font-black text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-orange-500" />
              Conteúdo programático
            </h2>

            {/* Seletor de Níveis - AGORA DENTRO DA ÁREA DE CONTEÚDO */}
            {concurso.niveis && concurso.niveis.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {concurso.niveis.map((item) => (
                  <button
                    key={item.nivel}
                    onClick={() => handleNivelChange(item.nivel)}
                    className={`px-4 py-2 rounded-xl font-medium text-xs lg:text-sm transition-all whitespace-nowrap flex items-center gap-1 ${
                      nivelSelecionado === item.nivel
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                        : "bg-white text-gray-600 hover:bg-orange-50 border border-gray-200"
                    }`}
                  >
                    {getNivelIcone(item.nivel)}
                    {formatarNivel(item.nivel)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Loading indicator para a grade */}
          {loadingGrade && (
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-orange-200/30 blur-xl animate-pulse" />
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin relative" />
              </div>
            </div>
          )}

          {/* Lista de Matérias */}
          {!loadingGrade && materias.length > 0 ? (
            <div className="space-y-2 lg:space-y-3">
              {materias.map((materia) => {
                const topicos = topicosPorMateria[materia.id] || [];
                const topicosConcluidosMateria = topicos.filter(
                  (t) => progresso[t.id]?.concluido,
                ).length;
                const progressoMateria = calcularProgressoMateria(materia.id);

                return (
                  <motion.div
                    key={materia.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl lg:rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden"
                  >
                    {/* Cabeçalho da Matéria */}
                    <button
                      onClick={() =>
                        setMateriaExpandida(
                          materiaExpandida === materia.id ? null : materia.id,
                        )
                      }
                      className="w-full p-4 lg:p-6 flex items-center justify-between hover:bg-gray-50/50 transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-3 lg:gap-4 min-w-0">
                        <div
                          className={`w-10 h-10 lg:w-14 lg:h-14 bg-gradient-to-br ${materia.cor || "from-orange-500 to-orange-600"} rounded-xl flex items-center justify-center text-white text-xl lg:text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
                        >
                          {materia.icone || "📚"}
                        </div>
                        <div className="text-left min-w-0">
                          <h3 className="font-display font-bold text-gray-900 text-sm lg:text-lg mb-0.5 lg:mb-1 truncate">
                            {materia.nome}
                          </h3>
                          <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-3">
                            <span className="text-xs lg:text-sm text-gray-500">
                              {topicosConcluidosMateria} de {topicos.length}{" "}
                              tópicos
                            </span>
                            <span className="hidden lg:block w-1 h-1 bg-gray-300 rounded-full" />
                            <span className="text-xs lg:text-sm text-orange-500 font-medium">
                              {progressoMateria}% completo
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 lg:gap-6 flex-shrink-0">
                        {/* Mini progress bar */}
                        <div className="hidden sm:block w-16 lg:w-24 h-1.5 lg:h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${progressoMateria}%` }}
                          />
                        </div>

                        <div
                          className={`w-6 h-6 lg:w-8 lg:h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-orange-500 transition-all duration-300 ${
                            materiaExpandida === materia.id
                              ? "bg-orange-500 rotate-90"
                              : ""
                          }`}
                        >
                          <ChevronRight
                            className={`w-4 h-4 lg:w-5 lg:h-5 transition-all duration-300 ${
                              materiaExpandida === materia.id
                                ? "text-white rotate-90"
                                : "text-gray-400"
                            }`}
                          />
                        </div>
                      </div>
                    </button>

                    {/* Lista de Tópicos */}
                    <AnimatePresence>
                      {materiaExpandida === materia.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-100"
                        >
                          {topicos.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                              {topicos.map((topico) => (
                                <Link
                                  key={topico.id}
                                  href={`/materia/${gerarSlug(materia.nome)}/topico/${topico.id}?concurso=${concursoId}`}
                                  className="block group"
                                >
                                  <div className="p-3 lg:p-4 hover:bg-orange-50/50 transition-all duration-300">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3 lg:gap-4 min-w-0">
                                        {/* Status Indicator */}
                                        <div className="relative flex-shrink-0">
                                          {progresso[topico.id]?.concluido ? (
                                            <div className="w-6 h-6 lg:w-8 lg:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                              <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" />
                                            </div>
                                          ) : (
                                            <div
                                              className={`w-6 h-6 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center ${
                                                topico.isPreview
                                                  ? "bg-green-100"
                                                  : nivelAcesso.podeAcessarConteudo
                                                    ? "bg-blue-100"
                                                    : "bg-gray-100"
                                              }`}
                                            >
                                              {topico.isPreview ? (
                                                <Sparkles className="w-3 h-3 lg:w-4 lg:h-4 text-green-600" />
                                              ) : nivelAcesso.podeAcessarConteudo ? (
                                                <FileText className="w-3 h-3 lg:w-4 lg:h-4 text-blue-600" />
                                              ) : (
                                                <Lock className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" />
                                              )}
                                            </div>
                                          )}
                                        </div>

                                        {/* Info do tópico */}
                                        <div className="min-w-0">
                                          <p className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors text-xs lg:text-sm truncate">
                                            {topico.titulo}
                                          </p>
                                          <div className="flex items-center gap-2 lg:gap-3 mt-0.5 lg:mt-1">
                                            <span className="text-2xs lg:text-xs text-gray-500 flex items-center gap-0.5 lg:gap-1 whitespace-nowrap">
                                              <Clock className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                                              {topico.tempoEstimado || 30} min
                                            </span>
                                            <span className="text-2xs lg:text-xs text-gray-500 flex items-center gap-0.5 lg:gap-1 whitespace-nowrap">
                                              <FileText className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                                              Texto
                                            </span>
                                            {topico.audioUrl && (
                                              <span className="text-2xs lg:text-xs text-gray-500 flex items-center gap-0.5 lg:gap-1 whitespace-nowrap">
                                                <Headphones className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                                                Áudio
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
                                        {topico.isPreview && (
                                          <span className="text-2xs lg:text-xs bg-green-100 text-green-600 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-lg font-medium whitespace-nowrap">
                                            Grátis
                                          </span>
                                        )}
                                        <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                                          <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400 group-hover:text-white" />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <div className="p-6 lg:p-8 text-center">
                              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 lg:mb-3">
                                <BookOpen className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400" />
                              </div>
                              <p className="text-sm lg:text-base text-gray-500 font-medium">
                                Nenhum tópico cadastrado
                              </p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            !loadingGrade && (
              <div className="text-center py-12 lg:py-16 bg-white rounded-xl lg:rounded-2xl border border-gray-100">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                  <BookOpen className="w-8 h-8 lg:w-10 lg:h-10 text-orange-300" />
                </div>
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-1 lg:mb-2">
                  Nenhuma matéria cadastrada para este nível
                </h3>
                <p className="text-sm lg:text-base text-gray-500 max-w-md mx-auto px-4">
                  Este nível ainda não possui matérias definidas.
                </p>
              </div>
            )
          )}
        </div>

        {/* Continue Studying Banner */}
        {ultimoTopico && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 lg:mt-8"
          >
            <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl lg:rounded-2xl overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 bg-grid-white/10" />
              <div className="absolute -right-20 -top-20 w-48 lg:w-64 h-48 lg:h-64 bg-white/10 rounded-full blur-3xl" />

              <div className="relative p-4 lg:p-8">
                <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6">
                  <div className="w-12 h-12 lg:w-20 lg:h-20 bg-white/20 rounded-xl lg:rounded-2xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <PlayCircle className="w-6 h-6 lg:w-10 lg:h-10 text-white" />
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-orange-100 mb-1 lg:mb-2">
                      <Sparkles className="w-3 h-3 lg:w-4 lg:h-4" />
                      <span className="text-xs lg:text-sm font-medium">
                        Continue de onde parou
                      </span>
                    </div>
                    <h3 className="text-white font-display font-bold text-sm lg:text-xl mb-0.5 lg:mb-1 truncate max-w-[200px] sm:max-w-none">
                      {ultimoTopico.titulo}
                    </h3>
                    <p className="text-orange-100 text-2xs lg:text-sm">
                      Você estava estudando este tópico • Continue seu progresso
                    </p>
                  </div>

                  <Link
                    href={`/materia/${gerarSlug(
                      materias.find((m) => m.id === ultimoTopico.materia)
                        ?.nome || "",
                    )}/topico/${ultimoTopico.topico}?concurso=${concursoId}`}
                    className="bg-white text-orange-600 px-4 lg:px-8 py-2 lg:py-4 rounded-lg lg:rounded-xl text-xs lg:text-base font-medium hover:bg-orange-50 transition-all duration-300 shadow-lg flex items-center gap-1 lg:gap-2 group/btn flex-shrink-0"
                  >
                    Continuar
                    <ChevronRight className="w-3 h-3 lg:w-5 lg:h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
