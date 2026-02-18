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
} from "lucide-react";

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
        href: "/dashboard/configuracoes",
        color: "text-gray-500",
      },
      {
        icon: HelpCircle,
        label: "Ajuda",
        href: "/dashboard/ajuda",
        color: "text-gray-500",
      },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
                {/* User Progress Card */}
                <div className="mx-4 mb-6 p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl text-white shadow-lg shadow-orange-500/25">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/90">
                        Progresso
                      </p>
                      <p className="text-2xl font-bold">78%</p>
                    </div>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "78%" }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                  <p className="text-xs text-white/70 mt-2">
                    Meta da semana: 20h
                  </p>
                </div>

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
        {/* User Progress Card - Só aparece quando expandido */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-4 mb-6 p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl text-white shadow-lg shadow-orange-500/25"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/90">Progresso</p>
                <p className="text-2xl font-bold">78%</p>
              </div>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "78%" }}
                className="h-full bg-white rounded-full"
              />
            </div>
            <p className="text-xs text-white/70 mt-2">Meta da semana: 20h</p>
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
