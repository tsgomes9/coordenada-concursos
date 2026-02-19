"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Target,
  Settings,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  Calendar,
  AlertCircle,
  Crown,
  Clock,
  Zap,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface Concurso {
  id: string;
  nome: string;
  orgao?: string;
  inscricoes: {
    fim: string;
  };
  locais?: string[];
}

interface UserData {
  subscription: {
    status: string;
    plan: string | null;
    trialEndsAt?: any;
    expiresAt?: any;
  };
  estado?: string;
  cidade?: string;
  cidadesInteresse?: string[];
  preferences: {
    areasInteresse?: string[];
  };
}

const menuItems = [
  {
    section: "Principal",
    items: [
      {
        icon: LayoutDashboard,
        label: "Visão Geral",
        href: "/dashboard",
        color: "text-orange-500",
      },
      {
        icon: BookOpen,
        label: "Meus Estudos",
        href: "/estudos",
        color: "text-blue-500",
      },
      {
        icon: Target,
        label: "Concursos",
        href: "/concursos",
        color: "text-purple-500",
      },
    ],
  },
  {
    section: "Suporte",
    items: [
      {
        icon: Settings,
        label: "Configurações",
        href: "../configuracoes",
        color: "text-gray-500",
      },
      {
        icon: HelpCircle,
        label: "Ajuda",
        href: "../ajuda",
        color: "text-gray-500",
      },
    ],
  },
];

// Card para usuários premium - Próximo concurso com prazo
function PremiumCard({ concurso }: { concurso: Concurso }) {
  const dataFim = concurso.inscricoes?.fim
    ? new Date(concurso.inscricoes.fim + "T23:59:59")
    : null;

  const diasRestantes = dataFim
    ? Math.ceil((dataFim.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const getUrgencyColor = () => {
    if (!diasRestantes) return "text-blue-400";
    if (diasRestantes <= 3) return "text-red-400";
    if (diasRestantes <= 7) return "text-yellow-400";
    return "text-green-400";
  };

  const getUrgencyText = () => {
    if (!diasRestantes) return "Data não informada";
    if (diasRestantes < 0) return "Inscrições encerradas";
    if (diasRestantes === 0) return "Último dia! ⚡";
    if (diasRestantes === 1) return "Amanhã é o último dia!";
    return `${diasRestantes} dias restantes`;
  };

  return (
    <Link href={`/concurso/${concurso.id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-br from-amber-600 to-orange-900 rounded-2xl p-4 text-white shadow-lg shadow-orange-500/25 cursor-pointer group"
      >
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-4 h-4 text-yellow-300" />
          <span className="text-xs font-medium text-yellow-300 uppercase tracking-wider">
            Prazo urgente
          </span>
        </div>

        <h4 className="font-black text-lg mb-1 line-clamp-1">
          {concurso.nome}
        </h4>

        {concurso.orgao && (
          <p className="text-xs text-white/80 mb-3 line-clamp-1">
            {concurso.orgao}
          </p>
        )}

        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-white/70" />
          <span className={`text-sm font-bold ${getUrgencyColor()}`}>
            {getUrgencyText()}
          </span>
        </div>

        {concurso.locais && concurso.locais.length > 0 && (
          <p className="text-xs text-white/70 mb-3 line-clamp-1">
            📍 {concurso.locais[0]}
          </p>
        )}

        <div className="flex items-center justify-end text-xs font-medium text-white/80 group-hover:text-white transition">
          <span>Ver concurso</span>
          <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition" />
        </div>
      </motion.div>
    </Link>
  );
}

// Card para usuários em trial
function TrialCard({ trialEndsAt }: { trialEndsAt: Date }) {
  const diasRestantes = Math.ceil(
    (trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-2xl p-4 text-white shadow-lg shadow-purple-500/25"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-yellow-300" />
        <span className="text-xs font-medium text-yellow-300 uppercase tracking-wider">
          Período de teste
        </span>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{diasRestantes}</p>
          <p className="text-xs text-white/80">dias restantes</p>
        </div>
      </div>

      <p className="text-sm text-white/90 mb-3">
        {diasRestantes <= 3
          ? "Últimos dias! Não perca o acesso a todos os recursos."
          : "Aproveite ao máximo todos os recursos premium!"}
      </p>

      <Link href="../planos">
        <motion.button
          whileHover={{ scale: 1.02 }}
          className="w-full py-2 bg-white text-purple-600 rounded-xl font-medium text-sm hover:bg-purple-50 transition flex items-center justify-center gap-2"
        >
          <Crown className="w-4 h-4" />
          Assinar agora
        </motion.button>
      </Link>
    </motion.div>
  );
}

// Card para usuários com assinatura expirada
function ExpiredCard() {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-4 text-white shadow-lg"
    >
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="w-4 h-4 text-red-400" />
        <span className="text-xs font-medium text-red-400 uppercase tracking-wider">
          Assinatura expirada
        </span>
      </div>

      <p className="text-sm text-white/90 mb-4">
        Seu acesso aos recursos premium foi encerrado. Reative agora e continue
        seus estudos!
      </p>

      <Link href="/planos">
        <motion.button
          whileHover={{ scale: 1.02 }}
          className="w-full py-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-medium text-sm hover:from-orange-600 hover:to-orange-700 transition flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Reativar assinatura
        </motion.button>
      </Link>
    </motion.div>
  );
}

// Card para usuários que cancelaram
function CancelledCard() {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-4 text-white shadow-lg"
    >
      <div className="flex items-center gap-2 mb-3">
        <Crown className="w-4 h-4 text-gray-400" />
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          Premium cancelado
        </span>
      </div>

      <p className="text-sm text-white/90 mb-4">
        Sentimos sua falta! Volte a ter acesso a todos os concursos e recursos
        exclusivos.
      </p>

      <Link href="/planos">
        <motion.button
          whileHover={{ scale: 1.02 }}
          className="w-full py-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-medium text-sm hover:from-orange-600 hover:to-orange-700 transition flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Assinar novamente
        </motion.button>
      </Link>
    </motion.div>
  );
}

export function DashboardSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [proximoConcurso, setProximoConcurso] = useState<Concurso | null>(null);
  const [loading, setLoading] = useState(true);

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Carregar dados do usuário e próximo concurso
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

          // Se for premium, buscar próximo concurso
          if (data.subscription?.status === "active") {
            // Buscar concursos com inscrições abertas, ordenados por data de fim
            const concursosQuery = query(
              collection(db, "concursos"),
              where("status", "==", "aberto"),
              orderBy("inscricoes.fim", "asc"),
              limit(1),
            );

            const concursosSnap = await getDocs(concursosQuery);

            if (!concursosSnap.empty) {
              const doc = concursosSnap.docs[0];
              const concursoData = doc.data() as Concurso;
              setProximoConcurso({
                ...concursoData,
                id: doc.id,
              });
            }
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados da sidebar:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [user]);

  // Fechar mobile menu ao mudar de rota
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Versão Mobile (overlay)
  if (isMobile) {
    return (
      <>
        {/* Botão do Menu Mobile */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden fixed top-2 left-4 z-50 w-10 h-10 bg-white rounded-xl shadow-lg border border-orange-100 flex items-center justify-center hover:bg-orange-50 transition"
        >
          {mobileOpen ? (
            <X className="w-5 h-5 text-gray-600" />
          ) : (
            <Menu className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Overlay escuro */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
          )}
        </AnimatePresence>

        {/* Sidebar Mobile */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-white/95 backdrop-blur-xl border-r border-orange-100/50 z-50 shadow-2xl"
            >
              <div className="h-full overflow-y-auto py-6">
                {/* Card condicional baseado no status da assinatura */}
                {!loading && (
                  <div className="mx-4 mb-6">
                    {userData?.subscription?.status === "active" &&
                    proximoConcurso ? (
                      <PremiumCard concurso={proximoConcurso} />
                    ) : userData?.subscription?.status === "trial" &&
                      userData.subscription.trialEndsAt ? (
                      <TrialCard
                        trialEndsAt={userData.subscription.trialEndsAt.toDate()}
                      />
                    ) : userData?.subscription?.status === "expired" ? (
                      <ExpiredCard />
                    ) : userData?.subscription?.status === "cancelled" ? (
                      <CancelledCard />
                    ) : (
                      <TrialCard
                        trialEndsAt={
                          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                        }
                      />
                    )}
                  </div>
                )}

                {/* Menu Items */}
                <nav className="space-y-6">
                  {menuItems.map((section) => (
                    <div key={section.section} className="px-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                        {section.section}
                      </p>

                      <div className="space-y-1">
                        {section.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = pathname === item.href;

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                                isActive
                                  ? "bg-gradient-to-r from-orange-50 to-white text-orange-600 border border-orange-200 shadow-sm"
                                  : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                              }`}
                            >
                              <Icon
                                className={`w-5 h-5 ${
                                  isActive
                                    ? item.color
                                    : "text-gray-400 group-hover:text-orange-500"
                                } transition`}
                              />
                              <span className="text-sm font-medium flex-1">
                                {item.label}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Versão Desktop (sidebar fixa com collapse)
  return (
    <motion.aside
      initial={{ width: collapsed ? 80 : 280 }}
      animate={{ width: collapsed ? 80 : 280 }}
      className="relative hidden lg:block h-screen bg-white/80 backdrop-blur-xl border-r border-orange-100/50"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-orange-200 rounded-full flex items-center justify-center hover:border-orange-500 transition group z-10"
      >
        <ChevronRight
          className={`w-4 h-4 text-gray-400 group-hover:text-orange-500 transition ${
            collapsed ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Content */}
      <div className="h-full overflow-y-auto scrollbar-hide py-6">
        {/* Card condicional - Só aparece quando expandido */}
        {!collapsed && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-4 mb-6"
          >
            {userData?.subscription?.status === "active" && proximoConcurso ? (
              <PremiumCard concurso={proximoConcurso} />
            ) : userData?.subscription?.status === "trial" &&
              userData.subscription.trialEndsAt ? (
              <TrialCard
                trialEndsAt={userData.subscription.trialEndsAt.toDate()}
              />
            ) : userData?.subscription?.status === "expired" ? (
              <ExpiredCard />
            ) : userData?.subscription?.status === "cancelled" ? (
              <CancelledCard />
            ) : (
              <TrialCard
                trialEndsAt={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
              />
            )}
          </motion.div>
        )}

        {/* Menu Items */}
        <nav className="space-y-6">
          {menuItems.map((section) => (
            <div key={section.section} className="px-4">
              {/* Título da seção - só aparece quando expandido */}
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2"
                >
                  {section.section}
                </motion.p>
              )}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                        isActive
                          ? "bg-gradient-to-r from-orange-50 to-white text-orange-600 border border-orange-200 shadow-sm"
                          : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          isActive
                            ? item.color
                            : "text-gray-400 group-hover:text-orange-500"
                        } transition`}
                      />

                      {/* Label - só aparece quando expandido */}
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-sm font-medium flex-1"
                        >
                          {item.label}
                        </motion.span>
                      )}

                      {/* Tooltip para modo recolhido */}
                      {collapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-50">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </motion.aside>
  );
}
