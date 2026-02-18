"use client";

import { useState, useEffect } from "react";
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
import { Plus, Edit, Trash2, Save, X, ChevronLeft } from "lucide-react";
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
    cor: "from-blue-500 to-blue-600",
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
    { value: "from-blue-500 to-blue-600", label: "Azul" },
    { value: "from-green-500 to-green-600", label: "Verde" },
    { value: "from-orange-500 to-orange-600", label: "Laranja" },
    { value: "from-purple-500 to-purple-600", label: "Roxo" },
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
        cor: "from-blue-500 to-blue-600",
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">
              Matérias
            </h1>
            <p className="text-gray-500 mt-1">
              Gerencie as matérias que serão usadas nos concursos
            </p>
          </div>

          <button
            onClick={() => {
              setEditando(null);
              setFormData({
                nome: "",
                icone: "📚",
                cor: "from-blue-500 to-blue-600",
                ativo: true,
                ordem: materias.length,
              });
              setShowModal(true);
            }}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nova Matéria
          </button>
        </div>
      </div>

      {/* Lista de Matérias */}
      {materias.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📚</span>
          </div>
          <h3 className="font-display text-xl font-bold text-gray-900 mb-2">
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
                cor: "from-blue-500 to-blue-600",
                ativo: true,
                ordem: 0,
              });
              setShowModal(true);
            }}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Cadastrar Primeira Matéria
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materias.map((materia) => (
            <div
              key={materia.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${materia.cor} rounded-xl flex items-center justify-center text-white text-2xl`}
                >
                  {materia.icone}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(materia)}
                    className="p-2 hover:bg-orange-100 rounded-lg transition text-orange-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(materia.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-display font-bold text-lg text-gray-900 mb-1">
                {materia.nome}
              </h3>

              <div className="flex items-center justify-between text-sm">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    materia.ativo
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {materia.ativo ? "Ativo" : "Inativo"}
                </span>
                <span className="text-gray-400">
                  Ordem: {materia.ordem || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Cadastro/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-display font-bold text-xl text-gray-900">
                {editando ? "Editar Matéria" : "Nova Matéria"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editando ? "Salvar Alterações" : "Salvar Matéria"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
