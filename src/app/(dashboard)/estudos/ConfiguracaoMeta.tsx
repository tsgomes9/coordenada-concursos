"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, ChevronDown, Check, Info } from "lucide-react";

interface ConfiguracaoMetaProps {
  metaAtual: number;
  onSave: (novaMeta: number) => Promise<void>;
}

export function ConfiguracaoMeta({ metaAtual, onSave }: ConfiguracaoMetaProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [meta, setMeta] = useState(metaAtual);
  const [metaInput, setMetaInput] = useState(metaAtual.toString());
  const [saving, setSaving] = useState(false);

  const opcoesRapidas = [
    { valor: 30, label: "30min", icone: "🌱" },
    { valor: 60, label: "1h", icone: "⚡" },
    { valor: 90, label: "1h30", icone: "🔥" },
    { valor: 120, label: "2h", icone: "🚀" },
    { valor: 150, label: "2h30", icone: "💪" },
    { valor: 180, label: "3h", icone: "🏆" },
  ];

  const handleSave = async () => {
    setSaving(true);
    await onSave(meta);
    setSaving(false);
    setIsOpen(false);
  };

  const formatarTempo = (minutos: number): string => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return horas > 0
      ? `${horas}h${mins > 0 ? mins + "min" : ""}`
      : `${mins}min`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition"
      >
        <Target className="w-4 h-4" />
        <span>Meta: {formatarTempo(metaAtual)}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 z-50"
          >
            <h3 className="font-bold text-gray-900 mb-3">
              Ajustar meta diária
            </h3>

            {/* Opções rápidas */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {opcoesRapidas.map((opcao) => (
                <button
                  key={opcao.valor}
                  onClick={() => {
                    setMeta(opcao.valor);
                    setMetaInput(opcao.valor.toString());
                  }}
                  className={`p-2 rounded-lg border transition ${
                    meta === opcao.valor
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-orange-200"
                  }`}
                >
                  <div className="text-lg">{opcao.icone}</div>
                  <div className="text-xs font-medium">{opcao.label}</div>
                </button>
              ))}
            </div>

            {/* Input personalizado */}
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">
                Personalizado (minutos)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="15"
                  max="480"
                  value={metaInput}
                  onChange={(e) => {
                    setMetaInput(e.target.value);
                    setMeta(parseInt(e.target.value) || 0);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <span className="text-sm text-gray-500 self-center">min</span>
              </div>
            </div>

            {/* Dica */}
            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <div className="flex gap-2 text-xs text-blue-700">
                <Info className="w-4 h-4 flex-shrink-0" />
                <p>
                  Estude pelo menos {formatarTempo(Math.round(meta * 0.7))} por
                  dia para manter seu streak. Meta ideal: {formatarTempo(meta)}.
                </p>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? "Salvando..." : "Salvar"}
                {!saving && <Check className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
