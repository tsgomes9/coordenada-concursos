"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useProgresso } from "@/lib/hooks/useProgresso";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  BookOpen,
  Clock,
  Target,
  PlayCircle,
  ChevronRight,
  CheckCircle,
  Loader2,
  Calendar,
  Flame,
  Award,
  Sparkles,
  BarChart3,
  TrendingUp,
} from "lucide-react";

interface Concurso {
  id: string;
  nome: string;
  thumbnail: string;
  cor: string;
  grade?: Record<string, string[]>;
}

interface TopicoEstudo {
  id: string;
  titulo: string;
  materia: string;
  materiaSlug: string;
  concursoId: string;
  concursoNome: string;
  progresso: number;
  tempoGasto: number;
  ultimoAcesso?: Date;
  status: string;
  isPreview?: boolean;
}

interface CatalogoData {
  titulo?: string;
  materiaNome?: string;
  materiaSlug?: string;
  isPreview?: boolean;
}

export default function EstudosPage() {
  const { user } = useAuth();
  const { estatisticas, progresso, loading: loadingProgresso } = useProgresso();

  const [topicosRecentes, setTopicosRecentes] = useState<TopicoEstudo[]>([]);
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [progressoConcursos, setProgressoConcursos] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(true);
  const [metaDiaria, setMetaDiaria] = useState(120);
  const [tempoEstudadoHoje, setTempoEstudadoHoje] = useState(0);
  const [tempoTotalFormatado, setTempoTotalFormatado] = useState({
    horas: 0,
    minutos: 0,
  });

  useEffect(() => {
    async function carregarDados() {
      if (!user) return;

      try {
        setLoading(true);

        // Buscar dados do usuário para meta diária e favoritos
        const userRef = doc(db, "usuarios", user.uid);
        const userSnap = await getDoc(userRef);

        let userFavoritos: string[] = [];

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setMetaDiaria(userData.preferences?.metaDiaria || 60);
          userFavoritos = userData.preferences?.concursosInteresse || [];
        }

        // Buscar todos os concursos
        const concursosQuery = query(collection(db, "concursos"));
        const concursosSnap = await getDocs(concursosQuery);
        const todosConcursos = concursosSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Concurso[];

        // 🔥 CALCULAR PROGRESSO POR CONCURSO
        const progressoPorConcurso: Record<
          string,
          { total: number; concluidos: number; progresso: number }
        > = {};

        todosConcursos.forEach((concurso) => {
          const grade = concurso.grade || {};
          const topicosIds = Object.values(grade).flat() as string[];

          if (topicosIds.length > 0) {
            let concluidos = 0;

            topicosIds.forEach((topicoId) => {
              const prog = progresso[topicoId];
              if (prog && prog.status === "concluido") {
                concluidos++;
              }
            });

            progressoPorConcurso[concurso.id] = {
              total: topicosIds.length,
              concluidos,
              progresso: Math.round((concluidos / topicosIds.length) * 100),
            };
          } else {
            progressoPorConcurso[concurso.id] = {
              total: 0,
              concluidos: 0,
              progresso: 0,
            };
          }
        });

        // 🔥 FILTRAR CONCURSOS: favoritos OU com progresso > 0
        const concursosParaMostrar = todosConcursos.filter((concurso) => {
          const temProgresso =
            (progressoPorConcurso[concurso.id]?.progresso || 0) > 0;
          const ehFavorito = userFavoritos.includes(concurso.id);
          return temProgresso || ehFavorito;
        });

        setConcursos(concursosParaMostrar);

        // 🔥 MAPA DE PROGRESSO APENAS PARA OS CONCURSOS QUE VAMOS MOSTRAR
        const progressoCalc: Record<string, number> = {};
        concursosParaMostrar.forEach((concurso) => {
          progressoCalc[concurso.id] =
            progressoPorConcurso[concurso.id]?.progresso || 0;
        });
        setProgressoConcursos(progressoCalc);

        // Buscar TODO o progresso do usuário (questões E tópicos)
        const progressoQuery = query(
          collection(db, "progresso"),
          where("userId", "==", user.uid),
        );
        const progressoSnap = await getDocs(progressoQuery);

        const topicosData: TopicoEstudo[] = [];
        let totalTempoCalculado = 0;
        let questoesAcertadas = 0;
        let questoesTotais = 0;

        for (const docProgresso of progressoSnap.docs) {
          const data = docProgresso.data();
          const topicoId = data.conteudoId;
          const tempoGasto = data.tempoGasto || 0;

          // Somar tempo total
          totalTempoCalculado += tempoGasto;

          // Se for questão, contar acertos
          if (data.tipo === "questao") {
            questoesTotais++;
            if (data.acertou) {
              questoesAcertadas++;
            }
          }

          // Se for tópico, adicionar à lista de estudos
          if (data.tipo === "topico") {
            // Buscar metadados do tópico no catálogo
            const topicoRef = doc(db, "catalogo", topicoId);
            const topicoSnap = await getDoc(topicoRef);

            if (topicoSnap.exists()) {
              const topicoData = topicoSnap.data() as CatalogoData;

              topicosData.push({
                id: topicoId,
                titulo: topicoData.titulo || "Tópico",
                materia: topicoData.materiaNome || "Geral",
                materiaSlug: topicoData.materiaSlug || "geral",
                concursoId: data.concursoId || "geral",
                concursoNome:
                  todosConcursos.find((c) => c.id === data.concursoId)?.nome ||
                  "Concurso",
                progresso: data.progresso || 0,
                tempoGasto: tempoGasto,
                ultimoAcesso: data.ultimoAcesso?.toDate(),
                status: data.status || "nao_iniciado",
                isPreview: topicoData.isPreview,
              });
            }
          }
        }

        // Formatar tempo total
        const horas = Math.floor(totalTempoCalculado / 60);
        const minutos = totalTempoCalculado % 60;
        setTempoTotalFormatado({ horas, minutos });

        // Ordenar por último acesso e pegar os mais recentes
        topicosData.sort((a, b) => {
          const dataA = a.ultimoAcesso?.getTime() || 0;
          const dataB = b.ultimoAcesso?.getTime() || 0;
          return dataB - dataA;
        });

        setTopicosRecentes(topicosData.slice(0, 5));

        // Calcular tempo estudado hoje
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const tempoHoje = topicosData
          .filter((t) => t.ultimoAcesso && t.ultimoAcesso >= hoje)
          .reduce((acc, t) => acc + (t.tempoGasto || 0), 0);

        setTempoEstudadoHoje(tempoHoje);
      } catch (error) {
        console.error("Erro ao carregar dados de estudo:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [user, progresso]);

  const progressoHoje = Math.min(
    Math.round((tempoEstudadoHoje / metaDiaria) * 100),
    100,
  );
  const topicosEmAndamento = topicosRecentes.filter(
    (t) => t.status === "em_andamento" && t.progresso > 0 && t.progresso < 100,
  );

  if (loading || loadingProgresso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header com gradiente */}
      <div className="flex items-center justify-between bg-gradient-to-r from-black to-orange-900 text-white p-8 rounded-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-black mb-2">
              Meus Estudos
            </h1>
            <p className="text-orange-100 text-lg max-w-2xl">
              Acompanhe seu progresso e continue de onde parou
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-orange-200" />
              <span className="text-3xl font-black">
                {tempoTotalFormatado.horas}h
              </span>
            </div>
            <p className="text-orange-100 text-sm">Tempo total estudado</p>
            <p className="text-2xl font-bold mt-1">
              {tempoTotalFormatado.minutos} minutos
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-green-200" />
              <span className="text-3xl font-black">
                {estatisticas.topicosConcluidos}
              </span>
            </div>
            <p className="text-green-100 text-sm">Tópicos concluídos</p>
            <p className="text-2xl font-bold mt-1">
              {topicosEmAndamento.length} em andamento
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <Flame className="w-8 h-8 text-blue-200" />
              <span className="text-3xl font-black">{estatisticas.streak}</span>
            </div>
            <p className="text-blue-100 text-sm">Dias seguidos</p>
            <p className="text-2xl font-bold mt-1">
              {estatisticas.streak >= 7
                ? "🔥 Meta atingida!"
                : `Faltam ${7 - estatisticas.streak}`}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-purple-200" />
              <span className="text-3xl font-black">
                {estatisticas.questoesAcertadas}
              </span>
            </div>
            <p className="text-purple-100 text-sm">Questões acertadas</p>
            <p className="text-2xl font-bold mt-1">
              {estatisticas.totalQuestoes > 0
                ? `${Math.round((estatisticas.questoesAcertadas / estatisticas.totalQuestoes) * 100)}% acerto`
                : "0% acerto"}
            </p>
          </motion.div>
        </div>

        {/* Progresso Diário */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-8 shadow-xl border border-orange-100 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-2 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-orange-500" />
                Meta de hoje
              </h2>
              <p className="text-gray-500">
                {tempoEstudadoHoje} minutos estudados de {metaDiaria} minutos
              </p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-black text-orange-500">
                {progressoHoje}%
              </span>
              <p className="text-sm text-gray-500">concluído</p>
            </div>
          </div>

          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500"
              style={{ width: `${progressoHoje}%` }}
            />
          </div>
        </motion.div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Esquerda - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Continue Estudando */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl p-8 shadow-xl border border-orange-100"
            >
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <PlayCircle className="w-6 h-6 text-orange-500" />
                Continue estudando
              </h2>

              {topicosRecentes.length > 0 ? (
                <div className="space-y-4">
                  {topicosRecentes.map((topico) => (
                    <Link
                      key={topico.id}
                      href={`/materia/${topico.materiaSlug}/topico/${topico.id}`}
                      className="block p-5 hover:bg-orange-50 rounded-xl transition-all group border border-gray-100 hover:border-orange-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition">
                            {topico.titulo}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {topico.materia} • {topico.concursoNome}
                          </p>
                        </div>
                        <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition" />
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500"
                            style={{ width: `${topico.progresso}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-700">
                          {topico.progresso}%
                        </span>
                        {topico.status === "concluido" && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      {topico.isPreview && (
                        <span className="inline-block mt-2 text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                          Conteúdo gratuito
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-orange-50 rounded-xl">
                  <BookOpen className="w-16 h-16 text-orange-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Nenhum estudo em andamento
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Comece agora mesmo sua jornada de estudos
                  </p>
                  <Link
                    href="/concursos"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition"
                  >
                    Explorar concursos
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Estatísticas Detalhadas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-2xl p-8 shadow-xl border border-orange-100"
            >
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-orange-500" />
                Estatísticas detalhadas
              </h2>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-5 bg-gradient-to-br from-orange-50 to-white rounded-xl border border-orange-100">
                  <p className="text-sm text-gray-500 mb-2">Tópicos totais</p>
                  <p className="text-3xl font-black text-gray-900">
                    {estatisticas.totalTopicos}
                  </p>
                </div>
                <div className="p-5 bg-gradient-to-br from-orange-50 to-white rounded-xl border border-orange-100">
                  <p className="text-sm text-gray-500 mb-2">Em andamento</p>
                  <p className="text-3xl font-black text-orange-500">
                    {estatisticas.topicosEmAndamento}
                  </p>
                </div>
                <div className="p-5 bg-gradient-to-br from-orange-50 to-white rounded-xl border border-orange-100">
                  <p className="text-sm text-gray-500 mb-2">Questões totais</p>
                  <p className="text-3xl font-black text-gray-900">
                    {estatisticas.totalQuestoes}
                  </p>
                </div>
                <div className="p-5 bg-gradient-to-br from-orange-50 to-white rounded-xl border border-orange-100">
                  <p className="text-sm text-gray-500 mb-2">Taxa de acerto</p>
                  <p className="text-3xl font-black text-green-500">
                    {estatisticas.totalQuestoes > 0
                      ? Math.round(
                          (estatisticas.questoesAcertadas /
                            estatisticas.totalQuestoes) *
                            100,
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Coluna Direita - 1/3 */}
          <div className="space-y-6">
            {/* Progresso por Concurso */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl p-8 shadow-xl border border-orange-100"
            >
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-orange-500" />
                Seus concursos
              </h2>

              {concursos.length > 0 ? (
                <div className="space-y-6">
                  {concursos.slice(0, 3).map((concurso) => (
                    <Link
                      key={concurso.id}
                      href={`/concurso/${concurso.id}`}
                      className="block p-4 hover:bg-orange-50 rounded-xl transition-all group border border-gray-100"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">
                          {concurso.thumbnail || "📚"}
                        </span>
                        <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition">
                          {concurso.nome}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                            style={{
                              width: `${progressoConcursos[concurso.id] || 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-700">
                          {progressoConcursos[concurso.id] || 0}%
                        </span>
                      </div>
                    </Link>
                  ))}

                  {concursos.length > 3 && (
                    <Link
                      href="/concursos"
                      className="block text-center text-sm font-bold text-orange-500 hover:text-orange-600 mt-4"
                    >
                      Ver todos os concursos →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 bg-orange-50 rounded-xl">
                  <BookOpen className="w-16 h-16 text-orange-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Nenhum concurso em andamento
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Comece a estudar ou favorite concursos para acompanhar aqui
                  </p>
                  <Link
                    href="/concursos"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition"
                  >
                    Explorar concursos
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Conquista Recente */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 text-white shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-8 h-8 text-orange-200" />
                <h3 className="text-xl font-black">Próxima conquista</h3>
              </div>

              <p className="text-orange-100 text-lg mb-4">
                {estatisticas.streak >= 7
                  ? "🔥 Você é imbatível!"
                  : `${7 - estatisticas.streak} dias para o fogo`}
              </p>

              <div className="h-3 bg-white/20 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${(estatisticas.streak / 7) * 100}%` }}
                />
              </div>

              <p className="text-sm text-orange-100 font-bold">
                {estatisticas.streak} de 7 dias
              </p>
            </motion.div>

            {/* Dica Rápida */}
            {/* <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-br from-black to-purple-900 rounded-2xl p-8 text-white shadow-xl"
            >
              <h3 className="text-xl font-black mb-3">💡 Dica do dia</h3>
              <p className="text-purple-100 text-lg leading-relaxed">
                Estude um pouco todos os dias. A consistência é mais importante
                que a quantidade!
              </p>
            </motion.div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
