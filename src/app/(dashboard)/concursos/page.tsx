"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useProgresso } from "@/lib/hooks/useProgresso";
import { estados } from "@/lib/utils/brazil-cities-states";
import {
  Search,
  Users,
  ChevronRight,
  Award,
  Target,
  Sparkles,
  Briefcase,
  Calendar,
  ChevronDown,
  X,
  SlidersHorizontal,
  Building2,
  CheckCircle,
  Circle,
  Flame,
  ChevronRight as ChevronRightIcon,
  Filter as FilterIcon,
  Layers,
  FileText,
  Star,
  Heart,
  MapPin,
  Globe2,
  Navigation,
} from "lucide-react";

interface Concurso {
  id: string;
  nome: string;
  banca: string;
  nivel: string;
  areas: string[];
  thumbnail?: string;
  descricao: string;
  vagas: number;
  salario?: string;
  ultimoEdital: string;
  tags?: string[];
  destaque?: boolean;
  orgao?: string;
  grade?: Record<string, string[]>;
  locais?: string[];
  status?: string;
}

interface ProgressoConcurso {
  total: number;
  concluidos: number;
  progresso: number;
  ultimoAcesso?: Date;
  emAndamento: number;
}

// Componente de Card de Métrica (versão horizontal)
function MetricCard({
  icon: Icon,
  label,
  value,
  bgColor,
  iconColor,
}: {
  icon: any;
  label: string;
  value: string | number;
  bgColor: string;
  iconColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.05 }}
      whileHover={{ y: -2, scale: 1.02 }}
      className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group"
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-r ${bgColor} bg-opacity-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 leading-tight">
            {value}
          </p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

// Componente de Card de Concurso
function ConcursoCard({
  concurso,
  index,
  progresso,
  isFavorito,
  onToggleFavorito,
}: {
  concurso: Concurso;
  index: number;
  progresso?: ProgressoConcurso;
  isFavorito: boolean;
  onToggleFavorito: (id: string) => void;
}) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  // Determinar status de estudo do usuário
  const getStudyStatus = () => {
    if (!progresso || progresso.progresso === 0) {
      return {
        label: "Não iniciado",
        icon: Circle,
        color: "text-gray-500",
        bgColor: "bg-gray-100",
        action: "Explorar",
        message: "Pronto para começar",
      };
    }

    if (progresso.progresso === 100) {
      return {
        label: "Concluído",
        icon: CheckCircle,
        color: "text-emerald-600",
        bgColor: "bg-emerald-100",
        action: "Revisar",
        message: "Parabéns! Conteúdo completo",
      };
    }

    return {
      label: "Estudando",
      icon: Flame,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      action: "Continuar",
      message: `${progresso.progresso}% concluído`,
    };
  };

  const studyStatus = getStudyStatus();
  const StatusIcon = studyStatus.icon;

  // Formatar local
  const localFormatado = concurso.orgao || concurso.nome;

  // Calcular número de matérias baseado na grade
  const numeroMaterias = concurso.grade
    ? Object.keys(concurso.grade).length
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.02 }}
      whileHover={{ y: -6 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => router.push(`/concurso/${concurso.id}`)}
      className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
    >
      {/* Header colorido com laranja */}
      <div className="bg-gradient-to-r from-black to-orange-700 px-6 py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-extrabold text-white mb-1 line-clamp-1">
              {concurso.nome}
            </h3>
            <div className="flex items-center gap-2 text-sm text-orange-100">
              <Building2 className="w-4 h-4" />
              <span className="line-clamp-1">{localFormatado}</span>
            </div>
          </div>

          {progresso && progresso.progresso > 0 && (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: isHovered ? 1.05 : 1 }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${studyStatus.bgColor} border-2 border-white shadow-md`}
            >
              <StatusIcon className={`w-3.5 h-3.5 ${studyStatus.color}`} />
              <span className={`text-xs font-bold ${studyStatus.color}`}>
                {studyStatus.label}
              </span>
            </motion.div>
          )}

          {/* Botão de favorito */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorito(concurso.id);
            }}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorito
                  ? "fill-red-500 text-red-500"
                  : "text-white/70 hover:text-white"
              }`}
            />
          </button>
        </div>

        {/* Info adicional no header */}
        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1 text-xs text-orange-100">
            <Award className="w-3.5 h-3.5" />
            {concurso.banca}
          </span>
          <span className="w-1 h-1 bg-orange-300 rounded-full" />
          <span className="flex items-center gap-1 text-xs text-orange-100">
            <Calendar className="w-3.5 h-3.5" />
            {concurso.ultimoEdital || "2024"}
          </span>
        </div>
      </div>

      {/* Conteúdo do card */}
      <div className="p-6">
        {/* Tags */}
        {concurso.tags && concurso.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {concurso.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-lg"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Descrição */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {concurso.descricao}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100 group-hover:shadow-md transition-all duration-300">
            <div className="text-sm font-bold text-gray-900">
              {concurso.vagas || 0}
            </div>
            <div className="text-xs text-gray-500">Vagas</div>
          </div>
          <div className="text-center p-2 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100 group-hover:shadow-md transition-all duration-300">
            <div className="text-sm font-bold text-gray-900">
              {numeroMaterias}
            </div>
            <div className="text-xs text-gray-500">Matérias</div>
          </div>
          <div className="text-center p-2 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100 group-hover:shadow-md transition-all duration-300">
            <div className="text-sm font-bold text-gray-900">
              {concurso.salario ? concurso.salario : "A definir"}
            </div>
            <div className="text-xs text-gray-500">Salário</div>
          </div>
        </div>

        {/* Locais do concurso */}
        {concurso.locais && concurso.locais.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
              <MapPin className="w-3 h-3" />
              <span>Locais de prova:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {concurso.locais.slice(0, 3).map((local) => (
                <span
                  key={local}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg"
                >
                  {local}
                </span>
              ))}
              {concurso.locais.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                  +{concurso.locais.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Progress Bar (se houver progresso) */}
        {progresso && progresso.progresso > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-gray-600 font-medium">Seu progresso</span>
              <span className="font-bold text-orange-600">
                {progresso.progresso}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progresso.progresso}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              {progresso.concluidos} de {progresso.total} tópicos concluídos
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Target className="w-4 h-4" />
            <span>
              {concurso.nivel === "ambos"
                ? "Médio/Superior"
                : concurso.nivel === "medio"
                  ? "Nível Médio"
                  : "Nível Superior"}
            </span>
          </div>

          <motion.div
            animate={{ x: isHovered ? 4 : 0 }}
            className="flex items-center gap-1 text-orange-600 text-sm font-bold"
          >
            <span>{studyStatus.action}</span>
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// Componente de Filtro Animado
function FilterChip({
  label,
  active,
  onClick,
  index,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  index: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
        active
          ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
          : "bg-white text-gray-600 hover:bg-orange-50 border border-gray-200 shadow-sm hover:shadow-md"
      }`}
    >
      {label}
    </motion.button>
  );
}

// Componente de Filtro de Localização
// Componente de Filtro de Localização
// Componente de Filtro de Localização
// Componente de Filtro de Localização
// Componente de Filtro de Localização
function LocationFilter({
  userData,
  selectedLocation,
  onLocationChange,
}: {
  userData: {
    estado?: string;
    cidade?: string;
    cidadesInteresse?: string[];
  } | null;
  selectedLocation: string;
  onLocationChange: (location: string) => void;
}) {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [searchLocation, setSearchLocation] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowLocationDropdown(false);
        setSearchLocation("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Gerar todas as cidades do Brasil a partir do JSON
  const todasCidades = estados
    .flatMap((estado) =>
      estado.cidades.map((cidade) => `${cidade} - ${estado.sigla}`),
    )
    .sort();

  // Opções baseadas no usuário + busca
  const getLocationOptions = () => {
    const options = ["Todos os locais"];

    // Adicionar localização do usuário (se tiver)
    if (userData?.cidade && userData?.estado) {
      options.push(`${userData.cidade} - ${userData.estado} (minha cidade)`);
    }

    // Adicionar cidades de interesse do usuário
    if (userData?.cidadesInteresse) {
      userData.cidadesInteresse.forEach((cidade) => {
        if (!options.includes(cidade)) {
          options.push(cidade);
        }
      });
    }

    // Se tiver busca, adicionar cidades do JSON que correspondem
    if (searchLocation.length > 2) {
      const cidadesEncontradas = todasCidades
        .filter((cidade) =>
          cidade.toLowerCase().includes(searchLocation.toLowerCase()),
        )
        .slice(0, 10); // Limitar a 10 resultados

      cidadesEncontradas.forEach((cidade) => {
        if (!options.includes(cidade)) {
          options.push(cidade);
        }
      });
    }

    return options;
  };

  const locationOptions = getLocationOptions();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowLocationDropdown(!showLocationDropdown)}
        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between hover:border-orange-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-orange-500" />
          <span className="text-sm text-gray-700">
            {selectedLocation === "Todos os locais"
              ? "Filtrar por localização"
              : selectedLocation}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${showLocationDropdown ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {showLocationDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-xl border border-gray-200 shadow-xl"
          >
            {/* Busca dentro do dropdown */}
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar cidade... (ex: São Paulo - SP)"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>

            {/* Lista de opções */}
            <div className="py-1 max-h-96 overflow-y-auto">
              {locationOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    onLocationChange(option);
                    setShowLocationDropdown(false);
                    setSearchLocation("");
                  }}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-orange-50 transition-colors flex items-center gap-2 ${
                    selectedLocation === option
                      ? "bg-orange-50 text-orange-600"
                      : "text-gray-700"
                  }`}
                >
                  <MapPin
                    className={`w-4 h-4 flex-shrink-0 ${selectedLocation === option ? "text-orange-500" : "text-gray-400"}`}
                  />
                  <span className="flex-1 truncate">{option}</span>
                  {option.includes("minha cidade") && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full flex-shrink-0">
                      Você está aqui
                    </span>
                  )}
                </button>
              ))}

              {locationOptions.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-500">
                  <Navigation className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Nenhuma localidade encontrada</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ConcursosPage() {
  const { user } = useAuth();
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [progressoPorConcurso, setProgressoPorConcurso] = useState<
    Record<string, ProgressoConcurso>
  >({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("Todos");
  const [selectedLocation, setSelectedLocation] = useState("Todos os locais");
  const [showFilters, setShowFilters] = useState(false);
  const [areas, setAreas] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(9);
  const [mostrarFavoritos, setMostrarFavoritos] = useState(false);
  const [userData, setUserData] = useState<{
    estado?: string;
    cidade?: string;
    cidadesInteresse?: string[];
  } | null>(null);

  const { progresso, loading: loadingProgresso } = useProgresso();

  // Carregar concursos, favoritos e dados do usuário
  useEffect(() => {
    async function carregarDados() {
      if (!user) return;

      try {
        setLoading(true);

        // Carregar dados do usuário
        const userRef = doc(db, "usuarios", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData({
            estado: data.estado,
            cidade: data.cidade,
            cidadesInteresse: data.cidadesInteresse,
          });
          setFavoritos(data.preferences?.concursosInteresse || []);
        }

        // Carregar concursos
        const snapshot = await getDocs(collection(db, "concursos"));
        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          vagas: doc.data().vagas || 0,
          salario: doc.data().salario,
          nome: doc.data().nome || "",
          banca: doc.data().banca || "",
          nivel: doc.data().nivel || "",
          areas: doc.data().areas || [],
          descricao: doc.data().descricao || "",
          ultimoEdital: doc.data().ultimoEdital || "",
          tags: doc.data().tags || [],
          orgao: doc.data().orgao,
          grade: doc.data().grade || {},
          locais: doc.data().locais || [],
          status: doc.data().status,
        })) as Concurso[];

        // Extrair áreas únicas
        const todasAreas = lista.flatMap((c) => c.areas || []);
        const areasUnicas = ["Todos", ...new Set(todasAreas)];
        setAreas(areasUnicas);

        setConcursos(lista);

        // Calcular progresso real por concurso
        if (Object.keys(progresso).length > 0) {
          const progressoMap: Record<string, ProgressoConcurso> = {};

          await Promise.all(
            lista.map(async (concurso) => {
              try {
                const grade = concurso.grade || {};
                const topicosIds = Object.values(grade).flat() as string[];

                if (topicosIds.length > 0) {
                  let concluidos = 0;
                  let emAndamento = 0;

                  topicosIds.forEach((topicoId) => {
                    const prog = progresso[topicoId];
                    if (prog) {
                      if (prog.status === "concluido") {
                        concluidos++;
                      } else if (
                        prog.status === "em_andamento" &&
                        prog.progresso > 0
                      ) {
                        emAndamento++;
                      }
                    }
                  });

                  progressoMap[concurso.id] = {
                    total: topicosIds.length,
                    concluidos,
                    progresso:
                      topicosIds.length > 0
                        ? Math.round((concluidos / topicosIds.length) * 100)
                        : 0,
                    emAndamento,
                    ultimoAcesso: new Date(),
                  };
                }
              } catch (error) {
                console.error(
                  `Erro ao calcular progresso para concurso ${concurso.id}:`,
                  error,
                );
              }
            }),
          );

          setProgressoPorConcurso(progressoMap);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [user, progresso]);

  // Função para favoritar/desfavoritar
  const toggleFavorito = async (concursoId: string) => {
    if (!user) return;

    const novosFavoritos = favoritos.includes(concursoId)
      ? favoritos.filter((id) => id !== concursoId)
      : [...favoritos, concursoId];

    setFavoritos(novosFavoritos);

    // Salvar no Firebase
    try {
      const userRef = doc(db, "usuarios", user.uid);
      await updateDoc(userRef, {
        "preferences.concursosInteresse": novosFavoritos,
      });
    } catch (error) {
      console.error("Erro ao salvar favoritos:", error);
    }
  };

  // Função para verificar se um concurso corresponde ao filtro de localização
  const matchesLocation = (concurso: Concurso) => {
    if (selectedLocation === "Todos os locais") return true;
    if (selectedLocation === "Nacional") return true; // Nacional mostra todos

    // Verificar se o concurso tem locais definidos
    if (!concurso.locais || concurso.locais.length === 0) {
      return selectedLocation === "Nacional";
    }

    // Verificar correspondência exata
    if (concurso.locais.includes(selectedLocation)) return true;

    // Verificar "Qualquer cidade de {estado}"
    if (selectedLocation.startsWith("Qualquer cidade de ")) {
      const estado = selectedLocation.replace("Qualquer cidade de ", "");
      return concurso.locais.some((local) => local.endsWith(` - ${estado}`));
    }

    // Verificar se é a cidade do usuário (com ou sem o sufixo)
    if (selectedLocation.includes("(minha cidade)")) {
      const cidadeSemSufixo = selectedLocation.replace(" (minha cidade)", "");
      return concurso.locais.includes(cidadeSemSufixo);
    }

    return false;
  };

  // Filtrar concursos
  const concursosFiltrados = concursos.filter((concurso) => {
    const matchesSearch =
      concurso.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concurso.banca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concurso.orgao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concurso.areas?.some((area) =>
        area.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchesArea =
      selectedArea === "Todos" || concurso.areas?.includes(selectedArea);
    const matchesFavorito = mostrarFavoritos
      ? favoritos.includes(concurso.id)
      : true;
    const matchesLocationFilter = matchesLocation(concurso);

    return (
      matchesSearch && matchesArea && matchesFavorito && matchesLocationFilter
    );
  });

  // Ordenar: favoritos primeiro
  const concursosOrdenados = [...concursosFiltrados].sort((a, b) => {
    const aFav = favoritos.includes(a.id) ? -1 : 1;
    const bFav = favoritos.includes(b.id) ? -1 : 1;
    return aFav - bFav;
  });

  // Concursos visíveis (para "Ver mais")
  const concursosVisiveis = concursosOrdenados.slice(0, visibleCount);
  const temMais = concursosOrdenados.length > visibleCount;

  // Resetar contagem quando filtrar
  useEffect(() => {
    setVisibleCount(9);
  }, [searchTerm, selectedArea, selectedLocation, mostrarFavoritos]);

  // Dados das métricas - SOMENTE concursos com status "aberto"
  const concursosAbertos = concursos.filter((c) => c.status === "aberto");
  const totalVagasAbertas = concursosAbertos.reduce(
    (acc, c) => acc + (c.vagas || 0),
    0,
  );
  const totalMaterias = concursos.reduce(
    (acc, c) => acc + Object.keys(c.grade || {}).length,
    0,
  );
  const totalTopicos = concursos.reduce((acc, c) => {
    const topicos = Object.values(c.grade || {}).flat();
    return acc + topicos.length;
  }, 0);

  const metricas = [
    {
      icon: Briefcase,
      label: "Concursos",
      value: concursos.length,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      icon: Users,
      label: "Vagas abertas",
      value: totalVagasAbertas,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      icon: Layers,
      label: "Matérias",
      value: totalMaterias,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      icon: FileText,
      label: "Tópicos",
      value: totalTopicos,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  if (loading || loadingProgresso) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
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
      <div className="flex items-center justify-between bg-gradient-to-r from-black to-orange-900 text-white p-8 rounded-2xl">
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-orange-600 text- px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">
              {concursos.length} concursos disponíveis
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
            Concursos públicos
          </h1>

          <p className="text-lg text-gray-100 max-w-2xl">
            Explore todos os concursos disponíveis na plataforma e prepare-se
            para sua aprovação com o melhor conteúdo
          </p>
        </div>
      </div>

      {/* Métricas - Cards horizontais */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {metricas.map((metrica, index) => (
          <MetricCard
            key={index}
            icon={metrica.icon}
            label={metrica.label}
            value={metrica.value}
            bgColor={metrica.bgColor}
            iconColor={metrica.iconColor}
          />
        ))}
      </motion.div>

      {/* Busca e Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-orange-500 transition-colors" />
            <input
              type="text"
              placeholder="Buscar concurso por nome, banca ou área..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none text-gray-900 placeholder-gray-400 shadow-sm"
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
            className="px-6 py-4 bg-white border border-gray-200 rounded-2xl hover:bg-orange-50 transition-all flex items-center gap-2 text-gray-700 shadow-sm"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="font-medium">Filtros</span>
            <motion.div
              animate={{ rotate: showFilters ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-visible"
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
              className="overflow-visible"
            >
              <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-lg space-y-6">
                {/* Filtro por área */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <FilterIcon className="w-4 h-4 text-orange-500" />
                      Áreas de interesse
                    </h3>
                    {selectedArea !== "Todos" && (
                      <button
                        onClick={() => setSelectedArea("Todos")}
                        className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Limpar
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {areas.map((area, index) => (
                      <FilterChip
                        key={area}
                        label={area}
                        active={selectedArea === area}
                        onClick={() => setSelectedArea(area)}
                        index={index}
                      />
                    ))}
                  </div>
                </div>

                {/* Filtro por localização */}
                <div className="border-t border-gray-100 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      Localização
                    </h3>
                    {selectedLocation !== "Todos os locais" && (
                      <button
                        onClick={() => setSelectedLocation("Todos os locais")}
                        className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Limpar
                      </button>
                    )}
                  </div>

                  <LocationFilter
                    userData={userData}
                    selectedLocation={selectedLocation}
                    onLocationChange={setSelectedLocation}
                  />

                  {userData?.cidade && userData?.estado && (
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      Baseado em sua localização: {userData.cidade} -{" "}
                      {userData.estado}
                    </p>
                  )}
                </div>

                {/* Filtro de favoritos */}
                <div className="border-t border-gray-100 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mostrarFavoritos}
                      onChange={(e) => setMostrarFavoritos(e.target.checked)}
                      className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">
                      Mostrar apenas meus favoritos
                    </span>
                    {favoritos.length > 0 && (
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                        {favoritos.length} selecionados
                      </span>
                    )}
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Grid de Concursos */}
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {concursosVisiveis.map((concurso, index) => (
              <ConcursoCard
                key={concurso.id}
                concurso={concurso}
                index={index}
                progresso={progressoPorConcurso[concurso.id]}
                isFavorito={favoritos.includes(concurso.id)}
                onToggleFavorito={toggleFavorito}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Botão Ver Mais */}
        {temMais && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center pt-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setVisibleCount((prev) => prev + 9)}
              className="px-8 py-3 bg-white border border-gray-200 rounded-xl hover:bg-orange-50 transition-all flex items-center gap-2 text-gray-700 shadow-md hover:shadow-lg group"
            >
              <span className="font-medium">Ver mais concursos</span>
              <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Empty State */}
      {concursosOrdenados.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-lg"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum concurso encontrado
          </h3>
          <p className="text-gray-500 mb-6">
            {mostrarFavoritos
              ? "Você ainda não favoritou nenhum concurso"
              : "Tente buscar por outro termo ou remova os filtros"}
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedArea("Todos");
              setSelectedLocation("Todos os locais");
              setMostrarFavoritos(false);
            }}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/25 font-medium"
          >
            Limpar busca
          </button>
        </motion.div>
      )}

      {/* Estatísticas adicionais */}
      {concursosOrdenados.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm text-gray-500 pt-4"
        >
          Mostrando {concursosVisiveis.length} de {concursosOrdenados.length}{" "}
          concursos
        </motion.div>
      )}
    </div>
  );
}
