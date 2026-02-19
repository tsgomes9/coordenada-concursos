"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  ChevronLeft,
  Save,
  Loader2,
  Plus,
  X,
  MapPin,
  DollarSign,
} from "lucide-react";
import { estados, Estado } from "@/lib/utils/brazil-cities-states";

interface LocalidadeSelecionada {
  estado: string;
  cidade?: string;
}

export default function EditarConcursoPage() {
  const params = useParams();
  const router = useRouter();
  const concursoId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [novaArea, setNovaArea] = useState("");
  const [novoCargo, setNovoCargo] = useState("");

  // 🔥 Estados para seleção de localidades
  const [estadoSelecionado, setEstadoSelecionado] = useState<string>("");
  const [cidadeSelecionada, setCidadeSelecionada] = useState<string>("");
  const [localidades, setLocalidades] = useState<LocalidadeSelecionada[]>([]);

  const [formData, setFormData] = useState({
    nome: "",
    banca: "",
    nivel: "superior",
    orgao: "",
    ano: new Date().getFullYear(),
    edital: "",
    vagas: 0,
    salario: "",
    precoInscricao: "", // 🔥 NOVO CAMPO
    inscricoes: {
      inicio: "",
      fim: "",
    },
    provas: {
      data: "",
    },
    areas: [] as string[],
    cargos: [] as string[],
    descricao: "",
    status: "aberto",
    thumbnail: "📚",
    cor: "from-orange-500 to-orange-600",
  });

  useEffect(() => {
    async function carregarConcurso() {
      try {
        const docRef = doc(db, "concursos", concursoId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            nome: data.nome || "",
            banca: data.banca || "",
            nivel: data.nivel || "superior",
            orgao: data.orgao || "",
            ano: data.ano || new Date().getFullYear(),
            edital: data.edital || "",
            vagas: data.vagas || 0,
            salario: data.salario || "",
            precoInscricao: data.precoInscricao || "",
            inscricoes: data.inscricoes || { inicio: "", fim: "" },
            provas: data.provas || { data: "" },
            areas: data.areas || [],
            cargos: data.cargos || [],
            descricao: data.descricao || "",
            status: data.status || "aberto",
            thumbnail: data.thumbnail || "📚",
            cor: data.cor || "from-orange-500 to-orange-600",
          });

          // 🔥 Carregar localidades do Firestore
          if (data.locais && Array.isArray(data.locais)) {
            const locaisParseados: LocalidadeSelecionada[] = data.locais.map(
              (local: string) => {
                if (local.includes(" - ")) {
                  const [cidade, estado] = local.split(" - ");
                  return { estado, cidade };
                } else {
                  return { estado: local };
                }
              },
            );
            setLocalidades(locaisParseados);
          }
        } else {
          alert("Concurso não encontrado");
          router.push("/admin/concursos");
        }
      } catch (error) {
        console.error("Erro ao carregar:", error);
        alert("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    }

    carregarConcurso();
  }, [concursoId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 🔥 Formatar localidades para salvar no Firestore
      const locaisFormatados = localidades.map((local) =>
        local.cidade ? `${local.cidade} - ${local.estado}` : local.estado,
      );

      const docRef = doc(db, "concursos", concursoId);
      await updateDoc(docRef, {
        ...formData,
        vagas: Number(formData.vagas),
        locais: locaisFormatados.length > 0 ? locaisFormatados : ["Nacional"],
        updatedAt: Timestamp.now(),
      });

      router.push("/admin/concursos");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar concurso");
    } finally {
      setSaving(false);
    }
  };

  const addArea = () => {
    if (novaArea.trim()) {
      setFormData({
        ...formData,
        areas: [...formData.areas, novaArea.trim()],
      });
      setNovaArea("");
    }
  };

  const removeArea = (index: number) => {
    setFormData({
      ...formData,
      areas: formData.areas.filter((_, i) => i !== index),
    });
  };

  const addCargo = () => {
    if (novoCargo.trim()) {
      setFormData({
        ...formData,
        cargos: [...formData.cargos, novoCargo.trim()],
      });
      setNovoCargo("");
    }
  };

  const removeCargo = (index: number) => {
    setFormData({
      ...formData,
      cargos: formData.cargos.filter((_, i) => i !== index),
    });
  };

  // 🔥 FUNÇÕES PARA LOCALIDADES
  const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sigla = e.target.value;
    setEstadoSelecionado(sigla);
    setCidadeSelecionada(""); // Resetar cidade ao mudar estado
  };

  const adicionarLocalidade = () => {
    if (!estadoSelecionado) {
      alert("Selecione um estado");
      return;
    }

    const novaLocalidade: LocalidadeSelecionada = {
      estado: estadoSelecionado,
    };

    if (cidadeSelecionada) {
      novaLocalidade.cidade = cidadeSelecionada;
    }

    // Verificar se já não existe
    const existe = localidades.some((local) => {
      if (
        local.cidade &&
        local.cidade === cidadeSelecionada &&
        local.estado === estadoSelecionado
      ) {
        return true;
      }
      if (
        !local.cidade &&
        !cidadeSelecionada &&
        local.estado === estadoSelecionado
      ) {
        return true;
      }
      return false;
    });

    if (existe) {
      alert("Esta localidade já foi adicionada");
      return;
    }

    setLocalidades([...localidades, novaLocalidade]);
    setEstadoSelecionado("");
    setCidadeSelecionada("");
  };

  const removerLocalidade = (index: number) => {
    setLocalidades(localidades.filter((_, i) => i !== index));
  };

  // Obter cidades do estado selecionado
  const cidadesDoEstado =
    estados.find((e) => e.sigla === estadoSelecionado)?.cidades || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition mb-4"
      >
        <ChevronLeft className="w-5 h-5" />
        <span>Voltar</span>
      </button>

      <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">
        Editar Concurso: {formData.nome}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-display font-bold text-gray-900 mb-4">
            Informações Básicas
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Concurso *
              </label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Ex: Polícia Federal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banca *
              </label>
              <input
                type="text"
                required
                value={formData.banca}
                onChange={(e) =>
                  setFormData({ ...formData, banca: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Ex: Cebraspe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Órgão
              </label>
              <input
                type="text"
                value={formData.orgao}
                onChange={(e) =>
                  setFormData({ ...formData, orgao: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Ex: Ministério da Justiça"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nível *
              </label>
              <select
                value={formData.nivel}
                onChange={(e) =>
                  setFormData({ ...formData, nivel: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="medio">Médio</option>
                <option value="superior">Superior</option>
                <option value="ambos">Médio/Superior</option>
              </select>
            </div>
          </div>
        </div>

        {/* 🔥 LOCALIDADES */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-500" />
            Localidades (onde as vagas serão lotadas)
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* Select de Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado *
              </label>
              <select
                value={estadoSelecionado}
                onChange={handleEstadoChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Selecione um estado</option>
                {estados.map((estado) => (
                  <option key={estado.sigla} value={estado.sigla}>
                    {estado.sigla} - {estado.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Select de Cidade (opcional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cidade (opcional)
              </label>
              <select
                value={cidadeSelecionada}
                onChange={(e) => setCidadeSelecionada(e.target.value)}
                disabled={!estadoSelecionado}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Todas as cidades do estado</option>
                {cidadesDoEstado.map((cidade) => (
                  <option key={cidade} value={cidade}>
                    {cidade}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={adicionarLocalidade}
              disabled={!estadoSelecionado}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Localidade
            </button>
          </div>

          {/* Lista de Localidades Selecionadas */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {localidades.map((local, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  <MapPin className="w-3 h-3 text-gray-500" />
                  {local.cidade
                    ? `${local.cidade} - ${local.estado}`
                    : local.estado}
                  <button
                    type="button"
                    onClick={() => removerLocalidade(index)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
              {localidades.length === 0 && (
                <p className="text-sm text-gray-400">
                  Nenhuma localidade adicionada. Será considerado âmbito
                  nacional.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Áreas de Atuação */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-gray-900">
              Áreas de Atuação
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={novaArea}
                onChange={(e) => setNovaArea(e.target.value)}
                placeholder="Nova área..."
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addArea())
                }
              />
              <button
                type="button"
                onClick={addArea}
                className="p-1 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.areas.map((area, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {area}
                <button
                  type="button"
                  onClick={() => removeArea(index)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
            {formData.areas.length === 0 && (
              <p className="text-sm text-gray-400">Nenhuma área adicionada</p>
            )}
          </div>
        </div>

        {/* Cargos */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-gray-900">Cargos</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={novoCargo}
                onChange={(e) => setNovoCargo(e.target.value)}
                placeholder="Novo cargo..."
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addCargo())
                }
              />
              <button
                type="button"
                onClick={addCargo}
                className="p-1 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.cargos.map((cargo, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {cargo}
                <button
                  type="button"
                  onClick={() => removeCargo(index)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
            {formData.cargos.length === 0 && (
              <p className="text-sm text-gray-400">Nenhum cargo adicionado</p>
            )}
          </div>
        </div>

        {/* Vagas e Salário */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-display font-bold text-gray-900 mb-4">
            Vagas e Remuneração
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Vagas
              </label>
              <input
                type="number"
                value={formData.vagas}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vagas: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salário Inicial
              </label>
              <input
                type="text"
                value={formData.salario}
                onChange={(e) =>
                  setFormData({ ...formData, salario: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Ex: R$ 12.000,00"
              />
            </div>
          </div>
        </div>

        {/* 🔥 PREÇO DA INSCRIÇÃO */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-orange-500" />
            Inscrição
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preço da Inscrição
            </label>
            <input
              type="text"
              value={formData.precoInscricao}
              onChange={(e) =>
                setFormData({ ...formData, precoInscricao: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="Ex: R$ 150,00"
            />
          </div>
        </div>

        {/* Datas Importantes */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-display font-bold text-gray-900 mb-4">
            Datas Importantes
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Início das Inscrições
              </label>
              <input
                type="date"
                value={formData.inscricoes.inicio}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    inscricoes: {
                      ...formData.inscricoes,
                      inicio: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fim das Inscrições
              </label>
              <input
                type="date"
                value={formData.inscricoes.fim}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    inscricoes: { ...formData.inscricoes, fim: e.target.value },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data da Prova
              </label>
              <input
                type="date"
                value={formData.provas.data}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    provas: { ...formData.provas, data: e.target.value },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="aberto">Aberto</option>
            <option value="previsto">Previsto</option>
            <option value="fechado">Fechado</option>
          </select>
        </div>

        {/* Link do Edital */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link do Edital
          </label>
          <input
            type="url"
            value={formData.edital}
            onChange={(e) =>
              setFormData({ ...formData, edital: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            placeholder="https://..."
          />
        </div>

        {/* Descrição */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            rows={4}
            value={formData.descricao}
            onChange={(e) =>
              setFormData({ ...formData, descricao: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            placeholder="Informações gerais sobre o concurso..."
          />
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
