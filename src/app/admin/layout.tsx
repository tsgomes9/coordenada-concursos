"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  Loader2,
  BookMarked,
  Library,
  GraduationCap,
  Tag,
  FolderTree,
  FileJson,
  Headphones,
  BarChart,
} from "lucide-react";

// Lista de admins autorizados
const ADMINS = ["tsg.gomes9@gmail.com", "admin@coordenada.com"];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando acesso...</p>
        </div>
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
          icon: <FileJson className="w-5 h-5" />,
          label: "Novo Conteúdo",
          href: "/admin/catalogo/novo",
          description: "Criar tópico",
        },
        // {
        //   icon: <Tag className="w-5 h-5" />,
        //   label: "Tags",
        //   href: "/admin/tags",
        //   description: "Gerenciar tags",
        // },
      ],
    },
    {
      section: "MÍDIA",
      items: [
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
        // {
        //   icon: <BarChart className="w-5 h-5" />,
        //   label: "Estatísticas",
        //   href: "/admin/estatisticas",
        //   description: "Métricas e dados",
        // },
      ],
    },
    // {
    //   icon: <Settings className="w-5 h-5" />,
    //   label: "Configurações",
    //   href: "/admin/configuracoes",
    //   description: "Ajustes do sistema",
    // },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-6">
          <h1 className="font-display text-xl font-bold text-gray-900">
            Coordenada
          </h1>
          <p className="text-sm text-gray-500 mt-1">Painel Administrativo</p>
          <div className="mt-4 p-3 bg-orange-50 rounded-lg">
            <p className="text-xs text-orange-600 font-medium">Admin</p>
            <p className="text-sm text-gray-700 truncate">{user?.email}</p>
          </div>
        </div>

        <nav className="mt-2 pb-8">
          {menu.map((item, index) => {
            // Verificar se é uma seção (tem a propriedade 'items')
            if ("items" in item && item.items) {
              return (
                <div key={item.section} className="mt-6 first:mt-0">
                  <h3 className="px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {item.section}
                  </h3>
                  <div className="mt-2">
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition group"
                      >
                        <span className="text-gray-400 group-hover:text-orange-500">
                          {subItem.icon}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{subItem.label}</p>
                          <p className="text-xs text-gray-400 group-hover:text-orange-400">
                            {subItem.description}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-400" />
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            // Se for item único (tem href)
            if ("href" in item && item.href) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition group mt-2"
                >
                  <span className="text-gray-400 group-hover:text-orange-500">
                    {item.icon}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-gray-400 group-hover:text-orange-400">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-400" />
                </Link>
              );
            }

            return null;
          })}

          {/* Logout */}
          <div className="border-t border-gray-200 mt-8 pt-4 px-6">
            <button
              onClick={async () => {
                const { signOut } = await import("firebase/auth");
                const { auth } = await import("@/lib/firebase/config");
                await signOut(auth);
                router.push("/");
              }}
              className="flex items-center gap-3 w-full px-3 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition rounded-lg group"
            >
              <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">Sair</p>
                <p className="text-xs text-gray-400 group-hover:text-red-400">
                  Encerrar sessão
                </p>
              </div>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
