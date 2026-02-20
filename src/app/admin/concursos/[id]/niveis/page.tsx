"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import Link from "next/link";
import {
  ChevronLeft,
  BookOpen,
  ChevronRight,
  Loader2,
  GraduationCap,
  Briefcase,
  Users,
  DollarSign,
  Edit,
  FileText,
} from "lucide-react";
import { NivelEnsino, Cargo } from "@/types";
import {
  formatarNivel,
  getNivelIcone,
  getNivelColor,
} from "@/lib/utils/formatadores";

interface Concurso {
  id: string;
  nome: string;
  banca: string;
  niveis: NivelEnsino[];
  cargos: Cargo[];
}

export default function NiveisPage() {
  const params = useParams();
  const router = useRouter();
  const concursoId = params.id as string;

  const [concurso, setConcurso] = useState<Concurso | null>(null);
  const [loading, setLoading] = useState(true);
  const [gradesExistentes, setGradesExistentes] = useState<string[]>([]);

  useEffect(() => {
    async function carregarDados() {
      try {
        // Carregar concurso
        const concursoRef = doc(db, "concursos", concursoId);
        const concursoSnap = await getDoc(concursoRef);

        if (!concursoSnap.exists()) {
          alert("Concurso não encontrado");
          router.push("/admin/concursos");
          return;
        }

        const data = concursoSnap.data();
        setConcurso({
          id: concursoSnap.id,
          nome: data.nome || "",
          banca: data.banca || "",
          niveis: data.niveis || [],
          cargos: data.cargos || [],
        });

        // Verificar grades existentes
        const gradesSnapshot = await getDocs(collection(db, "grades"));
        const gradesIds = gradesSnapshot.docs.map((doc) => doc.id);
        setGradesExistentes(gradesIds);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [concursoId, router]);

  const gradeExiste = (nivel: NivelEnsino) => {
    return gradesExistentes.includes(`${concursoId}_${nivel}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!concurso) return null;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Voltar para concursos</span>
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
              {concurso.nome}
            </h1>
            <p className="text-gray-500">
              Gerencie o conteúdo programático por nível de escolaridade
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Níveis */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {concurso.niveis.map((nivel) => {
          const cargosDoNivel = concurso.cargos.filter(
            (c) => c.nivel === nivel,
          );
          const totalVagas = cargosDoNivel.reduce(
            (acc, c) => acc + (c.vagas || 0),
            0,
          );
          const existeGrade = gradeExiste(nivel);

          return (
            <div
              key={nivel}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all"
            >
              {/* Header do nível */}
              <div
                className={`p-6 bg-gradient-to-r ${getNivelColor(nivel)} bg-opacity-10`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{getNivelIcone(nivel)}</span>
                    <div>
                      <h2 className="font-display font-bold text-xl text-gray-900">
                        {formatarNivel(nivel)}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {cargosDoNivel.length}{" "}
                        {cargosDoNivel.length === 1 ? "cargo" : "cargos"}
                      </p>
                    </div>
                  </div>
                  {existeGrade && (
                    <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                      Grade pronta
                    </span>
                  )}
                </div>

                {/* Resumo dos cargos */}
                <div className="space-y-2">
                  {cargosDoNivel.slice(0, 2).map((cargo) => (
                    <div
                      key={cargo.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-600">{cargo.nome}</span>
                      <span className="text-gray-900 font-medium">
                        {cargo.vagas} vagas
                      </span>
                    </div>
                  ))}
                  {cargosDoNivel.length > 2 && (
                    <p className="text-xs text-gray-400">
                      +{cargosDoNivel.length - 2} cargos
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{totalVagas} vagas</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Briefcase className="w-4 h-4" />
                    <span>{cargosDoNivel.length} cargos</span>
                  </div>
                </div>

                <Link
                  href={`/admin/concursos/${concursoId}/niveis/${nivel}`}
                  className="w-full flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition group"
                >
                  <div className="flex items-center gap-3">
                    <FileText
                      className={`w-5 h-5 ${existeGrade ? "text-orange-500" : "text-gray-400"}`}
                    />
                    <span
                      className={`font-medium ${existeGrade ? "text-orange-600" : "text-gray-500"}`}
                    >
                      {existeGrade
                        ? "Editar grade curricular"
                        : "Criar grade curricular"}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-orange-400 group-hover:translate-x-1 transition" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
