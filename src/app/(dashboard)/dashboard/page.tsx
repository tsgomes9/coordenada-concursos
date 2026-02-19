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
  updateDoc,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useProgresso } from "@/lib/hooks/useProgresso";
import { estados } from "@/lib/utils/brazil-cities-states";
import {
  TrendingUp,
  Clock,
  Target,
  Flame,
  MapPin,
  Calendar,
  BookOpen,
  Brain,
  Sparkles,
  Trophy,
  Zap,
  Rocket,
  Coffee,
  ChevronRight,
  PlayCircle,
  Award,
  BarChart3,
  CheckCircle2,
  Circle,
  Star,
  Users,
  GraduationCap,
  Filter,
  Plus,
  AlertCircle,
  X,
  Settings,
} from "lucide-react";

// Interfaces (mantidas iguais)
interface UserData {
  uid: string;
  nome: string;
  email: string;
  fotoURL?: string;
  estado?: string;
  cidade?: string;
  cidadesInteresse?: string[];
  subscription: {
    status: string;
    plan: string | null;
    trialEndsAt: Timestamp | null;
  };
  preferences: {
    concursosInteresse: string[];
    metaDiaria: number;
    notificacoes: boolean;
    estilosAprendizado?: string[];
    areasInteresse?: string[];
    onboardingCompleto: boolean;
  };
  stats: {
    totalQuestoes: number;
    totalAcertos: number;
    totalTempo: number;
    streak: number;
    ultimoAcesso: Timestamp;
  };
}

interface Concurso {
  id: string;
  nome: string;
  orgao: string;
  banca: string;
  thumbnail: string;
  cor: string;
  vagas: number;
  locais: string[];
  status: "aberto" | "previsto" | "encerrado";
  inscricoes: {
    inicio: string;
    fim: string;
  };
  provas: {
    data: string;
  };
  areas: string[];
  nivel: string;
}

interface TopicoEmAndamento {
  id: string;
  titulo: string;
  materia: string;
  materiaSlug: string;
  progresso: number;
  ultimoAcesso: Date;
  concursoId?: string;
  concursoNome?: string;
}

// MODAL DE CONFIGURAÇÃO DE LOCALIZAÇÃO
function LocationModal({
  isOpen,
  onClose,
  userData,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  userData: UserData | null;
  onSave: (
    estado: string,
    cidade: string,
    cidadesInteresse: string[],
  ) => Promise<void>;
}) {
  const [estado, setEstado] = useState(userData?.estado || "");
  const [cidade, setCidade] = useState(userData?.cidade || "");
  const [cidadesInteresse, setCidadesInteresse] = useState<string[]>(
    userData?.cidadesInteresse || [],
  );
  const [estadoInteresse, setEstadoInteresse] = useState("");
  const [cidadeInteresse, setCidadeInteresse] = useState("");
  const [saving, setSaving] = useState(false);

  // Resetar quando abrir com novos dados
  useEffect(() => {
    if (isOpen) {
      setEstado(userData?.estado || "");
      setCidade(userData?.cidade || "");
      setCidadesInteresse(userData?.cidadesInteresse || []);
    }
  }, [isOpen, userData]);

  const cidadesDoEstado = estado
    ? estados.find((e) => e.sigla === estado)?.cidades || []
    : [];

  const cidadesDoEstadoInteresse = estadoInteresse
    ? estados.find((e) => e.sigla === estadoInteresse)?.cidades || []
    : [];

  const adicionarCidadeInteresse = () => {
    if (cidadeInteresse && estadoInteresse) {
      const cidadeFormatada = `${cidadeInteresse} - ${estadoInteresse}`;
      if (!cidadesInteresse.includes(cidadeFormatada)) {
        setCidadesInteresse([...cidadesInteresse, cidadeFormatada]);
        setCidadeInteresse("");
        setEstadoInteresse("");
      }
    }
  };

  const removerCidadeInteresse = (cidade: string) => {
    setCidadesInteresse(cidadesInteresse.filter((c) => c !== cidade));
  };

  const handleSave = async () => {
    if (!estado) {
      alert("Selecione seu estado");
      return;
    }

    setSaving(true);
    await onSave(estado, cidade, cidadesInteresse);
    setSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                Configurar localização
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Defina onde você quer prestar os concursos
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Estado principal (obrigatório) */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Seu estado <span className="text-red-500">*</span>
            </label>
            <select
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value);
                setCidade("");
              }}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white"
            >
              <option value="">Selecione um estado</option>
              {estados.map((est) => (
                <option key={est.sigla} value={est.sigla}>
                  {est.nome} ({est.sigla})
                </option>
              ))}
            </select>
          </div>

          {/* Cidade principal (opcional) */}
          {estado && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Sua cidade{" "}
                <span className="text-gray-400 text-xs font-normal">
                  (opcional)
                </span>
              </label>
              <select
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white"
              >
                <option value="">Todas as cidades do estado</option>
                {cidadesDoEstado.map((cid) => (
                  <option key={cid} value={cid}>
                    {cid}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-2">
                Se não selecionar uma cidade, consideraremos todo o estado
              </p>
            </div>
          )}

          {/* Divisória */}
          <div className="border-t border-gray-100 my-2" />

          {/* Cidades de interesse */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Outras cidades de interesse{" "}
              <span className="text-gray-400 text-xs font-normal">
                (opcional)
              </span>
            </label>

            {/* Estado para interesse */}
            <select
              value={estadoInteresse}
              onChange={(e) => {
                setEstadoInteresse(e.target.value);
                setCidadeInteresse("");
              }}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white mb-3"
            >
              <option value="">Selecione um estado</option>
              {estados.map((est) => (
                <option key={est.sigla} value={est.sigla}>
                  {est.nome} ({est.sigla})
                </option>
              ))}
            </select>

            {/* Cidade para interesse */}
            {estadoInteresse && (
              <div className="flex gap-2">
                <select
                  value={cidadeInteresse}
                  onChange={(e) => setCidadeInteresse(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="">Selecione uma cidade</option>
                  {cidadesDoEstadoInteresse.map((cid) => (
                    <option key={cid} value={cid}>
                      {cid}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={adicionarCidadeInteresse}
                  disabled={!cidadeInteresse}
                  className="px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium whitespace-nowrap"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Lista de cidades de interesse */}
            {cidadesInteresse.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {cidadesInteresse.map((cidade) => {
                  const [cid, est] = cidade.split(" - ");
                  return (
                    <span
                      key={cidade}
                      className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-2"
                    >
                      {cid} - {est}
                      <button
                        type="button"
                        onClick={() => removerCidadeInteresse(cidade)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl sticky bottom-0">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-200 rounded-xl hover:bg-white transition font-medium"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !estado}
              className="px-6 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 transition font-medium"
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Card de estatística principal (ATUALIZADO - mobile 2 colunas)
function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  trend,
  color,
  delay,
}: {
  icon: any;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; positive: boolean };
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} bg-opacity-10 flex items-center justify-center group-hover:scale-110 transition-transform`}
        >
          <Icon className={`w-6 h-6 text-white`} />
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              trend.positive
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {trend.positive ? "+" : "-"}
            {trend.value}%
          </span>
        )}
      </div>
      <p className="text-3xl font-black text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-2">{subtitle}</p>}
    </motion.div>
  );
}

// Card de concurso próximo
function ConcursoCard({ concurso }: { concurso: Concurso }) {
  const dataFim = concurso.inscricoes?.fim
    ? new Date(concurso.inscricoes.fim + "T23:59:59")
    : null;
  const diasRestantes = dataFim
    ? Math.ceil((dataFim.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const getStatusColor = () => {
    if (!diasRestantes) return "bg-gray-500";
    if (diasRestantes < 0) return "bg-red-500";
    if (diasRestantes <= 7) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusText = () => {
    if (!diasRestantes) return "Data não informada";
    if (diasRestantes < 0) return "Inscrições encerradas";
    if (diasRestantes === 0) return "Último dia!";
    if (diasRestantes === 1) return "1 dia restante";
    return `${diasRestantes} dias restantes`;
  };

  return (
    <Link href={`/concurso/${concurso.id}`}>
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all min-w-[280px]"
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-black text-gray-900 truncate">
              {concurso.nome}
            </h4>
            <p className="text-xs text-gray-500 truncate">
              {concurso.orgao || concurso.banca}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="w-3 h-3 text-gray-400" />
            <span className="text-gray-600 truncate">
              {concurso.locais?.[0] || "Nacional"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-600">
                {concurso.inscricoes?.fim
                  ? new Date(concurso.inscricoes.fim).toLocaleDateString(
                      "pt-BR",
                    )
                  : "Em breve"}
              </span>
            </div>
            <span className="text-xs font-bold text-orange-600">
              {concurso.vagas} {concurso.vagas === 1 ? "vaga" : "vagas"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <span className="text-xs text-gray-500">{getStatusText()}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// Card de área de estudo (ATUALIZADO - mais compacto e sem barra de progresso)
function AreaCard({ area }: { area: string; progresso?: number }) {
  const config: Record<string, { nome: string; icone: string }> = {
    tecnologia: {
      nome: "Tecnologia",
      icone: "💻",
    },
    direito: {
      nome: "Direito",
      icone: "⚖️",
    },
    contabilidade: {
      nome: "Contabilidade",
      icone: "📊",
    },
    administracao: {
      nome: "Administração",
      icone: "📈",
    },
  };

  const areaConfig = config[area] || {
    nome: area,
    icone: "📚",
  };

  return (
    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
      <span className="text-xl">{areaConfig.icone}</span>
      <span className="font-medium text-gray-700">{areaConfig.nome}</span>
    </div>
  );
}

// Card de tópico em andamento
function TopicoCard({ topico }: { topico: TopicoEmAndamento }) {
  return (
    <Link href={`/materia/${topico.materiaSlug}/topico/${topico.id}`}>
      <motion.div
        whileHover={{ x: 4 }}
        className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 transition-all group"
      >
        <div className="relative">
          {topico.progresso >= 100 ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Circle className="w-5 h-5 text-gray-300" />
          )}
          {topico.progresso > 0 && topico.progresso < 100 && (
            <div
              className="absolute inset-0 rounded-full border-2 border-orange-500"
              style={{
                clipPath: `polygon(0 0, 100% 0, 100% ${topico.progresso}%, 0 ${topico.progresso}%)`,
              }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 group-hover:text-orange-600 transition truncate">
            {topico.titulo}
          </p>
          <p className="text-xs text-gray-500">
            {topico.materia}
            {topico.concursoNome && ` • ${topico.concursoNome}`}
          </p>
        </div>

        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition" />
      </motion.div>
    </Link>
  );
}

// Card de meta diária
function MetaDiariaCard({
  meta,
  tempoEstudado,
  onUpdateMeta,
}: {
  meta: number;
  tempoEstudado: number;
  onUpdateMeta: (min: number) => void;
}) {
  const progresso = Math.min(Math.round((tempoEstudado / meta) * 100), 100);
  const [showOptions, setShowOptions] = useState(false);

  const opcoesMeta = [30, 60, 90, 120];

  return (
    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
      {/* Ícone do foguete no fundo */}
      <Rocket className="absolute -right-5 -bottom-6 w-64 h-64 text-orange-500 transform rotate-12" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          <h3 className="font-black">Meta Diária</h3>
        </div>
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="p-2 hover:bg-white/30 bg-white/15 rounded-lg transition relative cursor-pointer"
        >
          <Settings className="w-8 h-8" />
        </button>
      </div>

      {showOptions ? (
        <div className="space-y-3 relative z-10">
          <p className="text-sm text-orange-100">Escolha sua meta:</p>
          <div className="grid grid-cols-2 gap-2">
            {opcoesMeta.map((min) => (
              <button
                key={min}
                onClick={() => {
                  onUpdateMeta(min);
                  setShowOptions(false);
                }}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                  meta === min
                    ? "bg-white text-orange-600"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                {min} min
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="text-center mb-4 relative z-10">
            <span className="text-5xl font-black">{progresso}%</span>
            <p className="text-orange-100 text-sm mt-2">
              {Math.floor(tempoEstudado / 60)}h{tempoEstudado % 60}min de {meta}
              min
            </p>
          </div>

          <div className="h-3 bg-white/20 rounded-full overflow-hidden relative z-10">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progresso}%` }}
            />
          </div>

          {progresso >= 100 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mt-4 text-sm relative z-10"
            >
              <Sparkles className="w-4 h-4" />
              <span>Meta diária concluída! 🎉</span>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

// Card de streak
function StreakCard({
  streak,
  ultimoAcesso,
}: {
  streak: number;
  ultimoAcesso?: Date;
}) {
  const ontem = new Date();
  ontem.setDate(ontem.getDate() - 1);

  const estudouOntem = ultimoAcesso
    ? ultimoAcesso.toDateString() === ontem.toDateString()
    : false;

  return (
    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden min-h-[220px] flex flex-col justify-between">
      {/* Ícone de fogo no fundo */}
      <Flame className="absolute -right-5 -bottom-6 w-64 h-64 text-purple-400/20 transform rotate-12" />

      <div className="flex items-center gap-3 relative z-10">
        <Flame className="w-8 h-8" />
        <div>
          <p className="text-3xl font-black">dia {streak}</p>
          <span>Parabéns! Vamos seguir avançando!</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm relative z-10">
        {!estudouOntem && streak === 0 ? (
          <>
            <AlertCircle className="w-4 h-4" />
            <span>Estude hoje para iniciar seu streak!</span>
          </>
        ) : streak >= 7 ? (
          <>
            <Trophy className="w-4 h-4" />
            <span>Você está on fire! 🔥</span>
          </>
        ) : (
          <>
            {/* <Zap className="w-4 h-4" /> */}
            <span className="font-black text-3xl">Continue assim!</span>
          </>
        )}
      </div>
    </div>
  );
}

// Card de localização
function LocationCard({
  cidade,
  estado,
  cidadesInteresse,
  onEdit,
}: {
  cidade?: string;
  estado?: string;
  cidadesInteresse?: string[];
  onEdit: () => void;
}) {
  return (
    <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          <h3 className="font-black">Localização</h3>
        </div>
        <button
          onClick={onEdit}
          className="text-xs bg-white/10 px-3 py-1 rounded-lg hover:bg-white/20 transition"
        >
          Editar
        </button>
      </div>

      {cidade && estado ? (
        <>
          <p className="text-lg font-bold mb-1">
            {cidade}, {estado}
          </p>

          {cidadesInteresse && cidadesInteresse.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-300 mb-2">Também interesse em:</p>
              <div className="flex flex-wrap gap-2">
                {cidadesInteresse.slice(0, 3).map((cidade) => (
                  <span
                    key={cidade}
                    className="text-xs bg-white/10 px-2 py-1 rounded-full"
                  >
                    {cidade}
                  </span>
                ))}
                {cidadesInteresse.length > 3 && (
                  <span className="text-xs bg-white/10 px-2 py-1 rounded-full">
                    +{cidadesInteresse.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div>
          <p className="text-sm text-gray-300 mb-4">
            Configure sua localização para ver concursos próximos
          </p>
          <button
            onClick={onEdit}
            className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg transition text-sm font-medium"
          >
            Configurar agora
          </button>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [proximosConcursos, setProximosConcursos] = useState<Concurso[]>([]);
  const [topicosRecentes, setTopicosRecentes] = useState<TopicoEmAndamento[]>(
    [],
  );
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [stats, setStats] = useState({
    topicosConcluidos: 0,
    topicosEmAndamento: 0,
    totalAcertos: 0,
    totalQuestoes: 0,
    tempoEstudadoHoje: 0,
    tempoTotal: 0,
    streak: 0,
  });

  // Usar o hook de progresso
  const { estatisticas, loading: loadingProgresso } = useProgresso();

  useEffect(() => {
    async function carregarDados() {
      if (!user) return;

      try {
        // Buscar dados do usuário
        const userRef = doc(db, "usuarios", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data() as UserData;
          setUserData(data);

          // Calcular tempo estudado hoje
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);

          const tempoHoje =
            data.stats?.ultimoAcesso?.toDate() > hoje
              ? Math.min(
                  data.stats?.totalTempo || 0,
                  data.preferences?.metaDiaria || 60,
                )
              : 0;

          setStats({
            topicosConcluidos: estatisticas.topicosConcluidos,
            topicosEmAndamento: estatisticas.topicosEmAndamento,
            totalAcertos: data.stats?.totalAcertos || 0,
            totalQuestoes: data.stats?.totalQuestoes || 0,
            tempoEstudadoHoje: tempoHoje,
            tempoTotal: data.stats?.totalTempo || 0,
            streak: data.stats?.streak || 0,
          });

          // Buscar próximos concursos
          const concursosQuery = query(
            collection(db, "concursos"),
            where("status", "==", "aberto"),
            orderBy("inscricoes.fim", "asc"),
            limit(6),
          );

          const concursosSnap = await getDocs(concursosQuery);
          const concursosList = concursosSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Concurso[];

          setProximosConcursos(concursosList);
        }
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [user, estatisticas]);

  const handleUpdateMeta = async (minutos: number) => {
    if (!user) return;

    try {
      const userRef = doc(db, "usuarios", user.uid);
      await updateDoc(userRef, {
        "preferences.metaDiaria": minutos,
      });
      setUserData((prev) =>
        prev
          ? {
              ...prev,
              preferences: { ...prev.preferences, metaDiaria: minutos },
            }
          : null,
      );
    } catch (error) {
      console.error("Erro ao atualizar meta:", error);
    }
  };

  const handleSaveLocation = async (
    estado: string,
    cidade: string,
    cidadesInteresse: string[],
  ) => {
    if (!user) return;

    try {
      const userRef = doc(db, "usuarios", user.uid);
      await updateDoc(userRef, {
        estado,
        cidade,
        cidadesInteresse,
      });

      setUserData((prev) =>
        prev ? { ...prev, estado, cidade, cidadesInteresse } : null,
      );

      // Recarregar concursos com nova localização
      const cidadeCompleta = cidade ? `${cidade} - ${estado}` : estado;
      const locaisFiltro = [cidadeCompleta, ...cidadesInteresse].slice(0, 10);

      const proximosQuery = query(
        collection(db, "concursos"),
        where("status", "==", "aberto"),
        where("locais", "array-contains-any", locaisFiltro),
        orderBy("inscricoes.fim", "asc"),
        limit(4),
      );

      const proximosSnap = await getDocs(proximosQuery);
      const proximosList = proximosSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Concurso[];

      setProximosConcursos(proximosList);
    } catch (error) {
      console.error("Erro ao salvar localização:", error);
    }
  };

  if (loading || loadingProgresso) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Carregando seu dashboard...</p>
        </div>
      </div>
    );
  }

  // Dashboard principal
  return (
    <>
      <div className="space-y-8">
        {/* Header com saudação personalizada */}
        <div className="flex items-center justify-between bg-gradient-to-r from-black to-orange-900 text-white p-6 rounded-2xl">
          <div>
            <h1 className="text-3xl font-black mb-2 text-white">
              {new Date().getHours() < 12
                ? "Bom dia"
                : new Date().getHours() < 18
                  ? "Boa tarde"
                  : "Boa noite"}
              , {userData?.nome?.split(" ")[0] || "Aluno"}! 👋
            </h1>
            <p className="text-gray-200">
              {stats.streak >= 7
                ? "🔥 Você está on fire! Continue assim!"
                : stats.streak >= 3
                  ? "✨ Ótimo ritmo! Mantenha o foco!"
                  : stats.streak >= 1
                    ? "Bom começo! Vamos continuar?"
                    : "🎯 Pronto para estudar hoje?"}
            </p>
          </div>

          {userData?.subscription?.status === "trial" &&
            userData.subscription.trialEndsAt && (
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium">
                Trial até{" "}
                {userData.subscription.trialEndsAt
                  .toDate()
                  .toLocaleDateString("pt-BR")}
              </div>
            )}
        </div>

        {/* Cards de estatísticas principais - mobile 2 colunas, desktop 4 colunas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Brain}
            label="Tópicos concluídos"
            value={stats.topicosConcluidos}
            subtitle={`${stats.topicosEmAndamento} em andamento`}
            color="from-orange-500 to-orange-600"
            delay={0.1}
          />
          <StatCard
            icon={Clock}
            label="Tempo total"
            value={`${Math.floor(stats.tempoTotal / 60)}h`}
            subtitle={`${stats.tempoTotal % 60}min`}
            color="from-blue-500 to-blue-600"
            delay={0.2}
          />
          <StatCard
            icon={Target}
            label="Questões resolvidas"
            value={stats.totalQuestoes}
            subtitle={`${stats.totalAcertos} acertos • ${stats.totalQuestoes > 0 ? Math.round((stats.totalAcertos / stats.totalQuestoes) * 100) : 0}%`}
            color="from-green-500 to-green-600"
            delay={0.3}
          />
          <StatCard
            icon={Award}
            label="Aproveitamento"
            value={`${stats.totalQuestoes > 0 ? Math.round((stats.totalAcertos / stats.totalQuestoes) * 100) : 0}%`}
            trend={
              stats.totalQuestoes > 10
                ? { value: 5, positive: true }
                : undefined
            }
            color="from-purple-500 to-purple-600"
            delay={0.4}
          />
        </div>

        {/* Grid de 2 colunas para conteúdo principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna esquerda - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Meta diária e Streak */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetaDiariaCard
                meta={userData?.preferences?.metaDiaria || 60}
                tempoEstudado={stats.tempoEstudadoHoje}
                onUpdateMeta={handleUpdateMeta}
              />
              <StreakCard
                streak={stats.streak}
                ultimoAcesso={userData?.stats?.ultimoAcesso?.toDate()}
              />
            </div>

            {/* Próximos concursos */}
            {proximosConcursos.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    Próximos concursos
                  </h2>
                  <Link
                    href="/concursos"
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                  >
                    Ver todos <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
                  {proximosConcursos.map((concurso) => (
                    <ConcursoCard key={concurso.id} concurso={concurso} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Coluna direita - 1/3 */}
          <div className="space-y-4">
            {/* Localização - ÚNICO CARD */}
            <LocationCard
              cidade={userData?.cidade}
              estado={userData?.estado}
              cidadesInteresse={userData?.cidadesInteresse}
              onEdit={() => setShowLocationModal(true)}
            />

            {/* Áreas de estudo - MAIS COMPACTO */}
            {userData?.preferences?.areasInteresse &&
              userData.preferences.areasInteresse.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-orange-500" />
                    Minhas áreas
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    {userData.preferences.areasInteresse.map((area) => (
                      <AreaCard key={area} area={area} />
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Modal de Configuração de Localização */}
      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        userData={userData}
        onSave={handleSaveLocation}
      />
    </>
  );
}
