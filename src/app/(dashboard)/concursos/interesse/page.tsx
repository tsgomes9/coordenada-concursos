"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/contexts/AuthContext";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  BookOpen,
  ChevronRight,
  CheckCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  Search,
  X,
} from "lucide-react";

interface Concurso {
  id: string;
  nome: string;
  banca: string;
  thumbnail: string;
  cor: string;
}

export default function ConcursosInteressePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [selectedConcursos, setSelectedConcursos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [step, setStep] = useState(1);

  useEffect(() => {
    async function carregarDados() {
      if (!user) return;

      try {
        setLoading(true);

        // Buscar concursos disponíveis
        const concursosSnap = await getDocs(collection(db, "concursos"));
        const lista = concursosSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Concurso[];
        setConcursos(lista);

        // Buscar concursos de interesse do usuário
        const userRef = doc(db, "usuarios", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setSelectedConcursos(userData.preferences?.concursosInteresse || []);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [user]);

  const toggleConcurso = (concursoId: string) => {
    setSelectedConcursos((prev) => {
      if (prev.includes(concursoId)) {
        return prev.filter((id) => id !== concursoId);
      } else {
        return [...prev, concursoId];
      }
    });
  };

  const salvarInteresses = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const userRef = doc(db, "usuarios", user.uid);
      await updateDoc(userRef, {
        "preferences.concursosInteresse": selectedConcursos,
      });

      // Se veio do onboarding, redireciona para o dashboard
      // Se veio da página de configurações, redireciona de volta
      router.push("/dashboard");
    } catch (error) {
      console.error("Erro ao salvar interesses:", error);
    } finally {
      setSaving(false);
    }
  };

  const filteredConcursos = concursos.filter(
    (concurso) =>
      concurso.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concurso.banca.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-black mb-2">
              Escolha seus concursos
            </h1>
            <p className="text-orange-100 text-lg max-w-2xl">
              Selecione os concursos que você quer estudar para personalizar sua
              experiência
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Barra de busca */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar concurso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
            />
          </div>
        </div>

        {/* Grid de concursos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredConcursos.map((concurso) => (
            <motion.div
              key={concurso.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className={`cursor-pointer rounded-xl p-6 border-2 transition-all ${
                selectedConcursos.includes(concurso.id)
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 bg-white hover:border-orange-200"
              }`}
              onClick={() => toggleConcurso(concurso.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{concurso.thumbnail || "📚"}</span>
                  <div>
                    <h3 className="font-bold text-gray-900">{concurso.nome}</h3>
                    <p className="text-sm text-gray-500">{concurso.banca}</p>
                  </div>
                </div>
                {selectedConcursos.includes(concurso.id) && (
                  <CheckCircle className="w-6 h-6 text-orange-500" />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Resumo e botão salvar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 sticky bottom-4"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Concursos selecionados</p>
              <p className="text-2xl font-black text-gray-900">
                {selectedConcursos.length} de {concursos.length}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={salvarInteresses}
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Salvar preferências
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
