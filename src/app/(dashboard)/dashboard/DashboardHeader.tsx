"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/contexts/AuthContext";
import {
  Bell,
  LogOut,
  ChevronDown,
  GraduationCap,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";

export function DashboardHeader() {
  const { user, userName, userInitials, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-orange-100/50">
      <div className="px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Menu Hamburguer - só mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-orange-50 rounded-lg transition"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* Logo - centralizada no mobile, à esquerda no desktop */}

          <Link
            href="/dashboard"
            className="flex items-center gap-2 group flex-1 lg:flex-none justify-center lg:justify-start"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>

            {/* Versão mobile: empilhado */}
            <div className="flex flex-col leading-none lg:hidden">
              <span className="font-display font-bold text-md text-gray-700 group-hover:text-orange-600 transition-colors">
                Coordenada
              </span>
              <span className="font-display font-bold text-md text-gray-700 group-hover:text-orange-600 transition-colors">
                Concursos
              </span>
            </div>

            {/* Versão desktop: lado a lado */}
            <span className="hidden lg:block font-display font-bold text-md text-gray-700 group-hover:text-orange-600 transition-colors">
              Coordenada Concursos
            </span>
          </Link>

          {/* Ações da Direita */}
          <div className="flex items-center gap-2">
            {/* Notificações */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 hover:bg-orange-50 rounded-lg transition group"
            >
              <Bell className="w-5 h-5 text-gray-600 group-hover:text-orange-500 transition" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white" />
            </motion.button>

            {/* Perfil - Desktop */}
            <div className="md:block relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 pr-3 hover:bg-orange-50 rounded-lg transition group"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-medium">
                  {userInitials}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-orange-600 transition">
                    {userName || "Usuário"}
                  </p>
                  <p className="text-xs text-gray-400">Aluno</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition" />
              </motion.button>

              {/* Dropdown Perfil */}
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden"
                >
                  <div className="px-4 py-2 border-b border-orange-100 bg-orange-50">
                    <p className="text-sm font-medium text-gray-900">
                      {userName || "Usuário"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden fixed inset-0 bg-black/50 z-40"
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-white z-50 p-6 shadow-xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="font-display font-bold text-gray-900">
                    Menu
                  </span>
                  <button onClick={() => setMobileMenuOpen(false)}>
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <nav className="space-y-4">
                  <Link
                    href="/dashboard"
                    className="block py-2 text-gray-700 hover:text-orange-600 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/concursos"
                    className="block py-2 text-gray-700 hover:text-orange-600 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Concursos
                  </Link>
                  <Link
                    href="/dashboard/estudos"
                    className="block py-2 text-gray-700 hover:text-orange-600 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Meus Estudos
                  </Link>
                  <Link
                    href="../configuracoes"
                    className="block py-2 text-gray-700 hover:text-orange-600 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Configurações
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 text-red-600 hover:text-red-700 transition"
                  >
                    Sair
                  </button>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
