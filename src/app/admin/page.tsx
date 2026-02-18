"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  Users,
  TrendingUp,
  ArrowRight,
  Loader2,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  Briefcase,
  Tag,
  Calendar,
  DollarSign,
} from "lucide-react";

interface Concurso {
  id: string;
  nome: string;
  banca: string;
  status: string;
  createdAt?: any;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    concursos: 0,
    concursosAbertos: 0,
    materias: 0,
    catalogo: 0,
    usuarios: 0,
    usuariosAtivos: 0,
    topicos: 0,
    exercicios: 0,
    flashcards: 0,
  });
  const [ultimosConcursos, setUltimosConcursos] = useState<Concurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function carregarDados() {
      try {
        console.log("🔍 Carregando estatísticas...");

        // Carregar concursos
        const concursosSnap = await getDocs(collection(db, "concursos"));
        const concursos = concursosSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Concurso[];

        const concursosAbertos = concursos.filter(
          (c) => c.status === "aberto",
        ).length;

        // Carregar matérias
        const materiasSnap = await getDocs(collection(db, "materias"));

        // Carregar catálogo
        const catalogoSnap = await getDocs(collection(db, "catalogo"));

        // Carregar usuários
        const usuariosSnap = await getDocs(collection(db, "usuarios"));
        const usuariosAtivos = usuariosSnap.docs.filter(
          (doc) =>
            doc.data().subscription?.status === "active" ||
            doc.data().subscription?.status === "trial",
        ).length;

        // Buscar últimos 5 concursos
        const concursosQuery = query(
          collection(db, "concursos"),
          orderBy("createdAt", "desc"),
          limit(5),
        );
        const ultimosSnap = await getDocs(concursosQuery);
        const ultimos = ultimosSnap.docs.map((doc) => ({
          id: doc.id,
          nome: doc.data().nome,
          banca: doc.data().banca,
          status: doc.data().status,
          createdAt: doc.data().createdAt,
        })) as Concurso[];

        // Calcular total de tópicos, exercícios e flashcards (precisa buscar dos JSONs)
        // Por enquanto, vamos estimar baseado no catálogo
        const totalTopicos = catalogoSnap.size * 3; // estimativa
        const totalExercicios = catalogoSnap.size * 2; // estimativa
        const totalFlashcards = catalogoSnap.size * 4; // estimativa

        setStats({
          concursos: concursosSnap.size,
          concursosAbertos,
          materias: materiasSnap.size,
          catalogo: catalogoSnap.size,
          usuarios: usuariosSnap.size,
          usuariosAtivos,
          topicos: totalTopicos,
          exercicios: totalExercicios,
          flashcards: totalFlashcards,
        });

        setUltimosConcursos(ultimos);
      } catch (error: any) {
        console.error("❌ Erro detalhado:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <h2 className="text-red-600 font-bold mb-2">Erro de permissão</h2>
        <p className="text-red-500 text-sm mb-4">{error}</p>
        <p className="text-gray-600 text-sm">
          Verifique se as regras do Firestore estão corretas e se você está
          logado como admin.
        </p>
      </div>
    );
  }

  const cardStyle =
    "bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition";

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900">
          Dashboard Admin
        </h1>
        <p className="text-gray-500 mt-1">
          Visão geral do sistema em tempo real
        </p>
      </div>

      {/* Stats Cards - Linha 1 */}
      <div className="grid md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <Briefcase className="w-8 h-8 mb-4" />
          <p className="text-3xl font-bold">{stats.concursos}</p>
          <p className="text-orange-100">Concursos</p>
          <p className="text-xs text-orange-200 mt-2">
            {stats.concursosAbertos} abertos
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <FileText className="w-8 h-8 mb-4" />
          <p className="text-3xl font-bold">{stats.materias}</p>
          <p className="text-blue-100">Matérias</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <BookOpen className="w-8 h-8 mb-4" />
          <p className="text-3xl font-bold">{stats.catalogo}</p>
          <p className="text-green-100">Conteúdos</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <Users className="w-8 h-8 mb-4" />
          <p className="text-3xl font-bold">{stats.usuarios}</p>
          <p className="text-purple-100">Usuários</p>
          <p className="text-xs text-purple-200 mt-2">
            {stats.usuariosAtivos} ativos
          </p>
        </div>
      </div>

      {/* Stats Cards - Linha 2 (Conteúdo) */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className={cardStyle}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tópicos</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.topicos}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <FileText className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">em todo o catálogo</p>
        </div>

        <div className={cardStyle}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Exercícios</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.exercicios}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">questões disponíveis</p>
        </div>

        <div className={cardStyle}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Flashcards</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.flashcards}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">para revisão</p>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Ações rápidas */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            Ações rápidas
          </h2>
          <div className="space-y-2">
            <Link
              href="/admin/concursos/novo"
              className="flex items-center justify-between p-3 hover:bg-orange-50 rounded-lg transition group"
            >
              <span className="text-gray-700 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-400" />
                Criar novo concurso
              </span>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition" />
            </Link>

            <Link
              href="/admin/materias"
              className="flex items-center justify-between p-3 hover:bg-orange-50 rounded-lg transition group"
            >
              <span className="text-gray-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                Gerenciar matérias
              </span>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition" />
            </Link>

            <Link
              href="/admin/catalogo/novo"
              className="flex items-center justify-between p-3 hover:bg-orange-50 rounded-lg transition group"
            >
              <span className="text-gray-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-400" />
                Criar novo conteúdo
              </span>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition" />
            </Link>

            <Link
              href="/admin/usuarios"
              className="flex items-center justify-between p-3 hover:bg-orange-50 rounded-lg transition group"
            >
              <span className="text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                Gerenciar usuários
              </span>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition" />
            </Link>
          </div>
        </div>

        {/* Últimos concursos */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Últimos concursos cadastrados
          </h2>

          {ultimosConcursos.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">
              Nenhum concurso cadastrado ainda
            </p>
          ) : (
            <div className="space-y-3">
              {ultimosConcursos.map((concurso) => (
                <Link
                  key={concurso.id}
                  href={`/admin/concursos/${concurso.id}/editar`}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition group"
                >
                  <div>
                    <p className="font-medium text-gray-900">{concurso.nome}</p>
                    <p className="text-sm text-gray-500">{concurso.banca}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        concurso.status === "aberto"
                          ? "bg-green-100 text-green-600"
                          : concurso.status === "previsto"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {concurso.status}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition" />
                  </div>
                </Link>
              ))}

              <Link
                href="/admin/concursos"
                className="block text-center text-sm text-orange-500 hover:text-orange-600 font-medium mt-4 pt-2 border-t border-gray-100"
              >
                Ver todos os concursos →
              </Link>
            </div>
          )}
        </div>

        {/* Resumo do sistema */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 md:col-span-2">
          <h2 className="font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            Resumo do sistema
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Conteúdo por matéria</p>
              <p className="text-lg font-bold text-gray-900">
                {stats.materias > 0
                  ? (stats.catalogo / stats.materias).toFixed(1)
                  : 0}
              </p>
              <p className="text-xs text-gray-400">média de conteúdos</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">
                Taxa de usuários ativos
              </p>
              <p className="text-lg font-bold text-gray-900">
                {stats.usuarios > 0
                  ? ((stats.usuariosAtivos / stats.usuarios) * 100).toFixed(1)
                  : 0}
                %
              </p>
              <p className="text-xs text-gray-400">dos cadastrados</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Concursos abertos</p>
              <p className="text-lg font-bold text-gray-900">
                {((stats.concursosAbertos / stats.concursos) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-400">do total</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">
                Exercícios por conteúdo
              </p>
              <p className="text-lg font-bold text-gray-900">
                {stats.catalogo > 0
                  ? (stats.exercicios / stats.catalogo).toFixed(1)
                  : 0}
              </p>
              <p className="text-xs text-gray-400">média</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
