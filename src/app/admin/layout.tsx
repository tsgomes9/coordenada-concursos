"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  LogOut,
  ChevronRight,
  Loader2,
  Library,
  Headphones,
  FolderTree,
  Sparkles,
  GraduationCap,
  ChevronLeft,
} from "lucide-react";

// Lista de admins autorizados
const ADMINS = [process.env.NEXT_PUBLIC_ADM_MASTER_NAME];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    console.log("🔐 Verificando acesso admin:", user?.email);

    if (!loading) {
      if (!user) {
        console.log("➡️ Usuário não logado, redirecionando para login");
        router.push("/login");
      } else if (!ADMINS.includes(user.email || "")) {
        console.log("➡️ Usuário não é admin, redirecionando para dashboard");
        router.push("/dashboard");
      } else {
        console.log("✅ Acesso admin autorizado");
        setIsAuthorized(true);
      }
    }
  }, [user, loading, router]);

  // Mostrar loading enquanto verifica
  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full mb-4"
        />
        <p className="text-gray-500">Verificando acesso...</p>
      </div>
    );
  }

  const menu = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: "Dashboard",
      href: "/admin",
      description: "Visão geral do sistema",
    },
    {
      section: "CONCURSOS",
      items: [
        {
          icon: <BookOpen className="w-5 h-5" />,
          label: "Concursos",
          href: "/admin/concursos",
          description: "Gerenciar concursos",
        },
        {
          icon: <FolderTree className="w-5 h-5" />,
          label: "Matérias",
          href: "/admin/materias",
          description: "Cadastrar matérias",
        },
      ],
    },
    {
      section: "CONTEÚDO",
      items: [
        {
          icon: <Library className="w-5 h-5" />,
          label: "Catálogo",
          href: "/admin/catalogo",
          description: "Todos os conteúdos",
        },
        {
          icon: <Headphones className="w-5 h-5" />,
          label: "Áudios",
          href: "/admin/audios",
          description: "Podcasts e aulas",
        },
      ],
    },
    {
      section: "USUÁRIOS",
      items: [
        {
          icon: <Users className="w-5 h-5" />,
          label: "Usuários",
          href: "/admin/usuarios",
          description: "Gerenciar usuários",
        },
      ],
    },
  ];

  // Função para verificar se o item está ativo
  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Sidebar */}
      <motion.aside
        initial={{ width: isSidebarOpen ? 280 : 80 }}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="bg-white border-r border-gray-200 shadow-xl h-screen sticky top-0 flex flex-col relative"
      >
        {/* Botão de toggle sobreposto - CORRIGIDO */}
        <motion.button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-4 top-20 z-50 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isSidebarOpen ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </motion.button>

        {/* Header da Sidebar */}
        <div className="h-20 flex items-center px-4 border-b border-gray-100 flex-shrink-0">
          <AnimatePresence mode="wait">
            {isSidebarOpen ? (
              <motion.div
                key="logo-expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-md">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="font-display text-xl font-bold text-gray-900">
                  Coordenada
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="logo-collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex justify-center"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-md">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Informações do admin */}
        <div className="p-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
              {user?.email?.charAt(0).toUpperCase()}
            </div>

            <AnimatePresence mode="wait">
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Sparkles className="w-3 h-3" />
                    Administrador
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Área de navegação com scroll */}
        <div className="flex-1 overflow-y-auto">
          <nav className="py-6 px-3">
            {menu.map((item, index) => {
              // Se for seção com items
              if ("items" in item && item.items) {
                return (
                  <div key={item.section} className="mb-6">
                    <AnimatePresence mode="wait">
                      {isSidebarOpen && (
                        <motion.h3
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider"
                        >
                          {item.section}
                        </motion.h3>
                      )}
                    </AnimatePresence>

                    <div className="space-y-1">
                      {item.items.map((subItem) => {
                        const active = isActive(subItem.href);

                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all group relative ${
                              active
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {/* Indicador de item ativo */}
                            {active && isSidebarOpen && (
                              <motion.div
                                layoutId="activeIndicator"
                                className="absolute left-0 w-1 h-8 bg-gray-900 rounded-r-full"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                              />
                            )}

                            <span
                              className={`flex-shrink-0 ${
                                active
                                  ? "text-gray-900"
                                  : "text-gray-500 group-hover:text-gray-700"
                              }`}
                            >
                              {subItem.icon}
                            </span>

                            <AnimatePresence mode="wait">
                              {isSidebarOpen && (
                                <motion.div
                                  initial={{ opacity: 0, width: 0 }}
                                  animate={{ opacity: 1, width: "auto" }}
                                  exit={{ opacity: 0, width: 0 }}
                                  className="flex-1 flex items-center justify-between overflow-hidden"
                                >
                                  <div className="flex-1">
                                    <p
                                      className={`text-sm font-medium whitespace-nowrap ${
                                        active
                                          ? "text-gray-900"
                                          : "text-gray-700"
                                      }`}
                                    >
                                      {subItem.label}
                                    </p>
                                    <p
                                      className={`text-xs whitespace-nowrap ${
                                        active
                                          ? "text-gray-500"
                                          : "text-gray-400"
                                      }`}
                                    >
                                      {subItem.description}
                                    </p>
                                  </div>
                                  <ChevronRight
                                    className={`w-4 h-4 ml-2 flex-shrink-0 transition-transform group-hover:translate-x-1 ${
                                      active ? "text-gray-700" : "text-gray-300"
                                    }`}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              // Se for item único
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all group mb-1 relative ${
                    active
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {/* Indicador de item ativo */}
                  {active && isSidebarOpen && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 w-1 h-8 bg-gray-900 rounded-r-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}

                  <span
                    className={`flex-shrink-0 ${
                      active
                        ? "text-gray-900"
                        : "text-gray-500 group-hover:text-gray-700"
                    }`}
                  >
                    {item.icon}
                  </span>

                  <AnimatePresence mode="wait">
                    {isSidebarOpen && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="flex-1 flex items-center justify-between overflow-hidden"
                      >
                        <div className="flex-1">
                          <p
                            className={`text-sm font-medium whitespace-nowrap ${
                              active ? "text-gray-900" : "text-gray-700"
                            }`}
                          >
                            {item.label}
                          </p>
                          <p
                            className={`text-xs whitespace-nowrap ${
                              active ? "text-gray-500" : "text-gray-400"
                            }`}
                          >
                            {item.description}
                          </p>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 ml-2 flex-shrink-0 transition-transform group-hover:translate-x-1 ${
                            active ? "text-gray-700" : "text-gray-300"
                          }`}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={async () => {
              const { signOut } = await import("firebase/auth");
              const { auth } = await import("@/lib/firebase/config");
              await signOut(auth);
              router.push("/");
            }}
            className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all w-full group"
          >
            <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-500 flex-shrink-0" />

            <AnimatePresence mode="wait">
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 flex items-center justify-between overflow-hidden"
                >
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium whitespace-nowrap">
                      Sair
                    </p>
                    <p className="text-xs text-gray-400 group-hover:text-red-400 whitespace-nowrap">
                      Encerrar sessão
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Versão do sistema (só aparece quando expandido) */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 text-center flex-shrink-0 border-t border-gray-100"
            >
              <p className="text-xs text-gray-400">Versão 1.0.0</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        animate={{
          width: isSidebarOpen ? "calc(100% - 280px)" : "calc(100% - 80px)",
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="flex-1 overflow-auto"
      >
        <div className="p-8">{children}</div>
      </motion.main>
    </div>
  );
}
