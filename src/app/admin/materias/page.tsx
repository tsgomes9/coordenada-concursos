"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ChevronLeft,
  Loader2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Materia {
  id: string;
  nome: string;
  icone: string;
  cor: string;
  ativo: boolean;
  ordem: number;
}

export default function MateriasPage() {
  const router = useRouter();
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<Materia | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    icone: "📚",
    cor: "from-purple-500 to-purple-600",
    ativo: true,
    ordem: 0,
  });

  // Opções de ícones
  const icones = [
    { value: "📚", label: "Livro" },
    { value: "⚖️", label: "Direito" },
    { value: "📝", label: "Português" },
    { value: "🧮", label: "Matemática" },
    { value: "💻", label: "Informática" },
    { value: "🔬", label: "Ciências" },
    { value: "🌍", label: "Geografia" },
    { value: "📜", label: "História" },
    { value: "🔢", label: "Raciocínio Lógico" },
    { value: "💼", label: "Administração" },
    { value: "💰", label: "Contabilidade" },
    { value: "🏛️", label: "Direito Constitucional" },
  ];

  // Opções de cores
  const cores = [
    { value: "from-purple-500 to-purple-600", label: "Roxo" },
    { value: "from-blue-500 to-blue-600", label: "Azul" },
    { value: "from-green-500 to-green-600", label: "Verde" },
    { value: "from-orange-500 to-orange-600", label: "Laranja" },
    { value: "from-red-500 to-red-600", label: "Vermelho" },
    { value: "from-yellow-500 to-yellow-600", label: "Amarelo" },
    { value: "from-pink-500 to-pink-600", label: "Rosa" },
    { value: "from-indigo-500 to-indigo-600", label: "Índigo" },
  ];

  useEffect(() => {
    carregarMaterias();
  }, []);

  const carregarMaterias = async () => {
    try {
      const snapshot = await getDocs(collection(db, "materias"));
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Materia[];

      // Ordenar por ordem
      lista.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
      setMaterias(lista);
    } catch (error) {
      console.error("Erro ao carregar matérias:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editando) {
        // Atualizar matéria existente
        await updateDoc(doc(db, "materias", editando.id), {
          ...formData,
          updatedAt: Timestamp.now(),
        });
      } else {
        // Criar nova matéria
        await addDoc(collection(db, "materias"), {
          ...formData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }

      setShowModal(false);
      setEditando(null);
      setFormData({
        nome: "",
        icone: "📚",
        cor: "from-purple-500 to-purple-600",
        ativo: true,
        ordem: materias.length,
      });

      carregarMaterias();
    } catch (error) {
      console.error("Erro ao salvar matéria:", error);
      alert("Erro ao salvar matéria");
    }
  };

  const handleEdit = (materia: Materia) => {
    setEditando(materia);
    setFormData({
      nome: materia.nome,
      icone: materia.icone,
      cor: materia.cor,
      ativo: materia.ativo,
      ordem: materia.ordem || 0,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta matéria?")) return;

    try {
      await deleteDoc(doc(db, "materias", id));
      carregarMaterias();
    } catch (error) {
      console.error("Erro ao excluir matéria:", error);
      alert("Erro ao excluir matéria");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full mb-4"
        />
        <p className="text-gray-500">Carregando matérias...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header com gradiente preto/roxo */}
      <div className="bg-gradient-to-r from-black to-purple-900 text-white rounded-2xl p-8 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">
                {materias.length} matérias cadastradas
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-2">Matérias</h1>
            <p className="text-purple-200 text-lg max-w-2xl">
              Gerencie as matérias que serão usadas nos concursos
            </p>
          </div>

          <button
            onClick={() => {
              setEditando(null);
              setFormData({
                nome: "",
                icone: "📚",
                cor: "from-purple-500 to-purple-600",
                ativo: true,
                ordem: materias.length,
              });
              setShowModal(true);
            }}
            className="bg-white cursor-pointer text-purple-900 px-6 py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nova Matéria
          </button>
        </div>
      </div>

      {/* Lista de Matérias */}
      {materias.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📚</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Nenhuma matéria cadastrada
          </h3>
          <p className="text-gray-500 mb-6">
            Comece cadastrando as matérias que serão usadas nos concursos
          </p>
          <button
            onClick={() => {
              setEditando(null);
              setFormData({
                nome: "",
                icone: "📚",
                cor: "from-purple-500 to-purple-600",
                ativo: true,
                ordem: 0,
              });
              setShowModal(true);
            }}
            className="bg-gradient-to-r from-black to-purple-900 text-white px-6 py-3 rounded-xl inline-flex items-center gap-2 font-bold hover:shadow-lg transition"
          >
            <Plus className="w-5 h-5" />
            Cadastrar Primeira Matéria
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materias.map((materia, index) => (
            <motion.div
              key={materia.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl p-5 border border-gray-200 hover:border-purple-200 transition-all shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${materia.cor} rounded-xl flex items-center justify-center text-white text-2xl shadow-md`}
                >
                  {materia.icone}
                </div>
                <div className="flex gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEdit(materia)}
                    className="p-2 hover:bg-purple-50 rounded-lg transition text-purple-600"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(materia.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition text-red-600"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              <h3 className="font-display font-bold text-lg text-gray-900 mb-2">
                {materia.nome}
              </h3>

              <div className="flex items-center justify-between">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    materia.ativo
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {materia.ativo ? "Ativo" : "Inativo"}
                </span>
                <span className="text-sm text-gray-400">
                  Ordem: {materia.ordem || 0}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal de Cadastro/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-xl text-gray-900">
                {editando ? "Editar Matéria" : "Nova Matéria"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Matéria *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  placeholder="Ex: Português"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ícone
                  </label>
                  <select
                    value={formData.icone}
                    onChange={(e) =>
                      setFormData({ ...formData, icone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  >
                    {icones.map((ico) => (
                      <option key={ico.value} value={ico.value}>
                        {ico.value} {ico.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cor
                  </label>
                  <select
                    value={formData.cor}
                    onChange={(e) =>
                      setFormData({ ...formData, cor: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  >
                    {cores.map((cor) => (
                      <option key={cor.value} value={cor.value}>
                        {cor.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordem
                  </label>
                  <input
                    type="number"
                    value={formData.ordem}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ordem: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.ativo ? "true" : "false"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ativo: e.target.value === "true",
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  >
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-black to-purple-900 text-white rounded-lg flex items-center gap-2 hover:shadow-lg transition"
                >
                  <Save className="w-4 h-4" />
                  {editando ? "Salvar Alterações" : "Salvar Matéria"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
