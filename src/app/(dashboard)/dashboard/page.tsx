"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/contexts/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useProgresso } from "@/lib/hooks/useProgresso";
import {
  BookOpen,
  Target,
  Clock,
  TrendingUp,
  Calendar,
  FileText,
  Headphones,
  Award,
  Zap,
  Rocket,
  Sparkles,
  ArrowRight,
  PlayCircle,
  GraduationCap,
  CheckCircle,
  ChevronRight,
  Medal,
  Coffee,
  Brain,
  Flame,
  Loader2,
  Users,
  BarChart,
} from "lucide-react";

interface UserData {
  uid: string;
  nome: string;
  email: string;
  subscription: {
    status: string;
    plan: string | null;
    trialEndsAt: any;
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

interface Concurso {
  id: string;
  nome: string;
  thumbnail: string;
  cor: string;
}

interface TopicoProgresso {
  id: string;
  titulo: string;
  materia: string;
  progresso: number;
  concluido: boolean;
  ultimoAcesso?: Date;
}

// Componente de Card de Ação
function ActionCard({
  icon: Icon,
  title,
  description,
  href,
  color,
  delay,
}: any) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay,
        duration: 0.3,
        ease: "easeOut",
      }}
      whileHover={{
        y: -2,
        scale: 1.01,
        transition: { duration: 0.15 },
      }}
      onClick={() => router.push(href)}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-orange-100/50 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center group-hover:scale-105 transition duration-150`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-orange-500 group-hover:translate-x-1 transition duration-150" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </motion.div>
  );
}

// Componente de Conquista
function AchievementItem({ title, unlocked, index, description }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.1 }}
      className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-orange-100/50"
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          unlocked ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
        }`}
      >
        {unlocked ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <Medal className="w-5 h-5" />
        )}
      </div>
      <div className="flex-1">
        <p
          className={`text-sm font-medium ${unlocked ? "text-gray-900" : "text-gray-400"}`}
        >
          {title}
        </p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
    </motion.div>
  );
}

// Componente de Meta Sugerida
function SuggestedGoal({ icon: Icon, title, time, color, onClick }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-orange-100 hover:border-orange-300 transition w-full"
    >
      <div
        className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 text-left">
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{time} por dia</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </motion.button>
  );
}

// Componente de Card de Concurso
function ConcursoCard({
  concurso,
  progresso,
}: {
  concurso: Concurso;
  progresso: number;
}) {
  return (
    <Link href={`/concurso/${concurso.id}`}>
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all"
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{concurso.thumbnail || "📚"}</span>
          <h4 className="font-medium text-gray-900">{concurso.nome}</h4>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
              style={{ width: `${progresso}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{progresso}%</span>
        </div>
      </motion.div>
    </Link>
  );
}

export default function DashboardPage() {
  const { user, userName } = useAuth();
  const router = useRouter();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [topicosRecentes, setTopicosRecentes] = useState<TopicoProgresso[]>([]);

  // 🔥 Usar o hook de progresso
  const { estatisticas, progresso, loading: loadingProgresso } = useProgresso();

  useEffect(() => {
    async function carregarDadosDashboard() {
      if (!user) return;

      try {
        // 🔥 Buscar dados do usuário
        const userRef = doc(db, "usuarios", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data() as UserData;
          setUserData(data);

          // 🔥 Buscar concursos de interesse
          if (data.preferences?.concursosInteresse?.length > 0) {
            const concursosQuery = query(
              collection(db, "concursos"),
              where(
                "__name__",
                "in",
                data.preferences.concursosInteresse.slice(0, 5),
              ),
            );
            const concursosSnap = await getDocs(concursosQuery);
            const concursosList = concursosSnap.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Concurso[];
            setConcursos(concursosList);
          }

          // 🔥 Buscar tópicos recentes do progresso
          const progressoQuery = query(
            collection(db, "progresso"),
            where("userId", "==", user.uid),
            where("tipo", "==", "topico"),
          );
          const progressoSnap = await getDocs(progressoQuery);

          const recentes: TopicoProgresso[] = [];
          progressoSnap.docs.forEach((doc) => {
            const data = doc.data();
            if (data.status === "em_andamento" && data.progresso > 0) {
              recentes.push({
                id: data.conteudoId,
                titulo: data.titulo || "Tópico",
                materia: data.materia || "geral",
                progresso: data.progresso,
                concluido: data.status === "concluido",
                ultimoAcesso: data.ultimoAcesso?.toDate(),
              });
            }
          });

          // Ordenar por último acesso
          recentes.sort(
            (a, b) =>
              (b.ultimoAcesso?.getTime() || 0) -
              (a.ultimoAcesso?.getTime() || 0),
          );

          setTopicosRecentes(recentes.slice(0, 5));
        }
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarDadosDashboard();
  }, [user]);

  const handleSetMeta = async (minutos: number) => {
    // TODO: Salvar meta no Firestore
    router.push(`/dashboard/metas?time=${minutos}`);
  };

  if (loading || loadingProgresso) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  // 🔥 Verificar se é primeiro acesso (não tem preferências)
  const isPrimeiroAcesso = !userData?.preferences?.concursosInteresse?.length;

  if (isPrimeiroAcesso) {
    return (
      <div className="space-y-8">
        {/* Header de Boas-vindas Especial */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">
              Bem-vindo à Coordenada Concursos!
            </span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Olá,{" "}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              {userName || "Futuro Aprovado"}
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl">
            Estamos felizes em ter você aqui. Vamos preparar tudo para você
            começar sua jornada rumo à aprovação! 🚀
          </p>
        </motion.div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna da Esquerda - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cards de Ação Rápida */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-orange-500" />
                Primeiros passos
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ActionCard
                  icon={GraduationCap}
                  title="Escolher concursos"
                  description="Selecione os concursos que você quer estudar"
                  href="../../concursos"
                  color="bg-blue-500"
                  delay={0.2}
                />
                <ActionCard
                  icon={Target}
                  title="Definir meta diária"
                  description="Estabeleça quanto tempo quer estudar por dia"
                  href="/dashboard/metas"
                  color="bg-orange-500"
                  delay={0.3}
                />
              </div>
            </motion.div>

            {/* Sugestão de Meta Diária */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold">Qual sua meta diária?</h3>
              </div>

              <p className="text-orange-100 text-sm mb-4">
                Defina quanto tempo você quer estudar por dia. Comece com uma
                meta realista e aumente gradualmente.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <SuggestedGoal
                  icon={Coffee}
                  title="Iniciante"
                  time="30 min"
                  color="bg-green-500"
                  onClick={() => handleSetMeta(30)}
                />
                <SuggestedGoal
                  icon={Brain}
                  title="Recomendado"
                  time="1 hora"
                  color="bg-blue-500"
                  onClick={() => handleSetMeta(60)}
                />
                <SuggestedGoal
                  icon={Zap}
                  title="Avançado"
                  time="2 horas"
                  color="bg-orange-500"
                  onClick={() => handleSetMeta(120)}
                />
                <SuggestedGoal
                  icon={Flame}
                  title="Intensivo"
                  time="3 horas"
                  color="bg-red-500"
                  onClick={() => handleSetMeta(180)}
                />
              </div>
            </motion.div>
          </div>

          {/* Coluna da Direita - 1/3 */}
          <div className="space-y-6">
            {/* Conquistas Iniciais */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-orange-100/50"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Medal className="w-5 h-5 text-orange-500" />
                Sua jornada começa aqui
              </h3>

              <div className="space-y-2">
                <AchievementItem
                  title="Criou sua conta"
                  description="Primeiro passo dado!"
                  unlocked={true}
                  index={0}
                />
                <AchievementItem
                  title="Escolher concursos"
                  description="Selecione seus concursos"
                  unlocked={false}
                  index={1}
                />
                <AchievementItem
                  title="Definir meta de estudos"
                  description="Estabeleça sua rotina"
                  unlocked={false}
                  index={2}
                />
              </div>
            </motion.div>

            {/* Dica Especial */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold">Dica de ouro</h3>
              </div>

              <p className="text-sm text-white/90 mb-4">
                Comece escolhendo os concursos que mais te interessam. Isso vai
                personalizar todo o conteúdo para você!
              </p>

              <Link
                href="/dashboard/concursos"
                className="inline-flex items-center gap-2 text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
              >
                Escolher agora
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Footer com Estatísticas da Plataforma */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-orange-100/50"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-orange-600">+5k</p>
              <p className="text-xs text-gray-500">Questões</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">+50</p>
              <p className="text-xs text-gray-500">Concursos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">+100</p>
              <p className="text-xs text-gray-500">Podcasts</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">92%</p>
              <p className="text-xs text-gray-500">Aprovação</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // 🔥 Dashboard com dados reais do progresso
  return (
    <div className="space-y-8">
      {/* Header com dados do usuário */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Olá,{" "}
          <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
            {userData?.nome || userName || "Aluno"}
          </span>{" "}
          👋
        </h1>
        <p className="text-gray-500">
          {estatisticas.streak > 0
            ? `🔥 Você está estudando há ${estatisticas.streak} dias seguidos!`
            : "Continue seus estudos de onde parou"}
        </p>
      </motion.div>

      {/* Stats Grid com dados reais do progresso */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <BarChart className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {estatisticas.topicosConcluidos}
              </p>
              <p className="text-sm text-gray-500">Tópicos concluídos</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Em andamento</span>
              <span className="font-medium text-orange-500">
                {estatisticas.topicosEmAndamento}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {Math.floor(estatisticas.tempoTotal / 60)}h
                {estatisticas.tempoTotal % 60}m
              </p>
              <p className="text-sm text-gray-500">Tempo estudado</p>
            </div>
          </div>
          {userData?.preferences?.metaDiaria && (
            <p className="mt-4 text-sm text-gray-500">
              Meta diária: {userData.preferences.metaDiaria} minutos
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {estatisticas.questoesAcertadas}
              </p>
              <p className="text-sm text-gray-500">Questões acertadas</p>
            </div>
          </div>
          {estatisticas.totalQuestoes > 0 && (
            <p className="mt-4 text-sm text-gray-500">
              Taxa de acerto:{" "}
              {Math.round(
                (estatisticas.questoesAcertadas / estatisticas.totalQuestoes) *
                  100,
              )}
              %
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Flame className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {estatisticas.streak}
              </p>
              <p className="text-sm text-gray-500">Dias seguidos</p>
            </div>
          </div>
          {estatisticas.streak > 0 && (
            <p className="mt-4 text-sm text-orange-500 font-medium">
              🎯 Continue assim!
            </p>
          )}
        </motion.div>
      </div>

      {/* Grid Principal com duas colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Seus Concursos */}
          {concursos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-orange-500" />
                Seus concursos
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {concursos.map((concurso, index) => (
                  <ConcursoCard
                    key={concurso.id}
                    concurso={concurso}
                    progresso={
                      estatisticas.porConcurso[concurso.id]?.progresso || 0
                    }
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Continue Estudando */}
          {topicosRecentes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Continue estudando
              </h2>
              <div className="space-y-3">
                {topicosRecentes.map((topico) => (
                  <Link
                    key={topico.id}
                    href={`/materia/${topico.materia}/topico/${topico.id}`}
                    className="block p-3 hover:bg-orange-50 rounded-xl transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">
                        {topico.titulo}
                      </p>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full"
                          style={{ width: `${topico.progresso}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {topico.progresso}%
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Coluna Direita - 1/3 */}
        <div className="space-y-6">
          {/* Próximos Passos */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-orange-100/50"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-orange-500" />
              Próximos passos
            </h3>

            <div className="space-y-2">
              <AchievementItem
                title="Estudar primeiro tópico"
                description="Comece sua jornada"
                unlocked={estatisticas.topicosConcluidos > 0}
                index={0}
              />
              <AchievementItem
                title="Resolver 10 questões"
                description="Pratique o conteúdo"
                unlocked={estatisticas.totalQuestoes >= 10}
                index={1}
              />
              <AchievementItem
                title="Manter streak de 3 dias"
                description="Estude diariamente"
                unlocked={estatisticas.streak >= 3}
                index={2}
              />
            </div>
          </motion.div>

          {/* Ações Rápidas */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl"
          >
            <h3 className="text-lg font-semibold mb-3">Ações rápidas</h3>
            <div className="space-y-2">
              <Link
                href="/concursos"
                className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition"
              >
                <span>Ver todos os concursos</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => router.push("/dashboard/metas")}
                className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition w-full text-left"
              >
                <span>Ajustar meta diária</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
