"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/LogoCoordenada";
import { useAuth } from "@/lib/contexts/AuthContext";
import {
  Mail,
  Lock,
  ArrowRight,
  Chrome,
  AlertCircle,
  GraduationCap,
  Sparkles,
  Shield,
  Zap,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmail(email, password);
      router.push("/dashboard");
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        setError("Usuário não encontrado");
      } else if (error.code === "auth/wrong-password") {
        setError("Senha incorreta");
      } else if (error.code === "auth/invalid-email") {
        setError("Email inválido");
      } else {
        setError("Erro ao fazer login. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      // Não redirecionamos aqui porque o usuário será redirecionado para o Google
      // O redirecionamento de volta será tratado pelo AuthProvider
    } catch (error) {
      setError("Erro ao fazer login com Google");
      setLoading(false);
    }
  };

  // Animações dos cards flutuantes
  const floatingCards = [
    {
      icon: <GraduationCap className="w-6 h-6" />,
      text: "Polícia Federal",
      color: "from-orange-500 to-orange-600",
      delay: 0,
      position: "top-20 left-10",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      text: "INSS",
      color: "from-orange-400 to-orange-500",
      delay: 0.5,
      position: "bottom-20 right-10",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      text: "TRF 1ª Região",
      color: "from-orange-500 to-orange-600",
      delay: 1,
      position: "top-40 right-20",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />

      {/* Elementos decorativos animados */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
      </div>

      {/* Cards flutuantes decorativos */}
      {floatingCards.map((card, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.15, y: 0 }}
          transition={{
            duration: 1,
            delay: card.delay,
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 2,
          }}
          className={`absolute ${card.position} hidden lg:block`}
        >
          <div
            className={`bg-gradient-to-r ${card.color} text-white px-6 py-3 rounded-full shadow-xl backdrop-blur-sm bg-opacity-90`}
          >
            <div className="flex items-center gap-2">
              {card.icon}
              <span className="text-sm font-medium whitespace-nowrap">
                {card.text}
              </span>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Conteúdo principal */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex items-center gap-12">
        {/* Lado esquerdo - Hero (visível apenas em telas grandes) */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex flex-col flex-1"
        >
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">
                Plataforma #1 em aprovações
              </span>
            </div>

            <h1 className="font-display text-5xl font-extrabold text-gray-900 leading-tight mb-6">
              Bem-vindo de
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent block">
                volta! 👋
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8">
              Acesse sua conta e continue sua jornada rumo à aprovação no
              concurso dos seus sonhos.
            </p>

            {/* Benefícios em lista */}
            <div className="space-y-4">
              {[
                "Mais de 50 concursos disponíveis",
                "Conteúdo atualizado diariamente",
                "Podcasts exclusivos para revisão",
                "Questões comentadas por especialistas",
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-orange-500" />
                  </div>
                  <span className="text-gray-700">{benefit}</span>
                </motion.div>
              ))}
            </div>

            {/* Estatísticas */}
            <div className="flex gap-8 mt-8 pt-8 border-t border-gray-200">
              <div>
                <div className="font-display text-2xl font-bold text-gray-900">
                  50+
                </div>
                <div className="text-sm text-gray-600">Concursos</div>
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-gray-900">
                  1000+
                </div>
                <div className="text-sm text-gray-600">Alunos aprovados</div>
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-gray-900">
                  92%
                </div>
                <div className="text-sm text-gray-600">Aprovação</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Lado direito - Formulário de Login */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full lg:w-[480px]"
        >
          {/* Header mobile */}
          <div className="lg:hidden text-center mb-8">
            <Logo className="justify-center mb-4" />
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
              Bem-vindo de volta! 👋
            </h1>
            <p className="text-gray-600">
              Acesse sua conta e continue seus estudos
            </p>
          </div>

          {/* Card de Login */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-orange-100/50"
          >
            {/* Botão Google com design premium */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 py-4 px-4 rounded-2xl hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 opacity-0 group-hover:opacity-5 transition-opacity" />
              <Chrome className="w-5 h-5 group-hover:text-orange-500 transition-colors" />
              <span className="font-medium">Continuar com Google</span>
            </motion.button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 backdrop-blur-sm text-gray-500">
                  ou entre com email
                </span>
              </div>
            </div>

            {/* Formulário com animações nos inputs */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                      focusedField === "email"
                        ? "text-orange-500"
                        : "text-gray-400"
                    }`}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
                    placeholder="seu@email.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <Lock
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                      focusedField === "password"
                        ? "text-orange-500"
                        : "text-gray-400"
                    }`}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Opções extras */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-600">Lembrar-me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>

              {/* Mensagem de erro */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm flex items-center gap-3 border border-red-100"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25 py-4 rounded-2xl text-lg font-semibold group"
                isLoading={loading}
              >
                {!loading && (
                  <>
                    Entrar na plataforma
                    {/* <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" /> */}
                  </>
                )}
              </Button>
            </form>

            {/* Link para cadastro com design melhorado */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Ainda não tem uma conta?{" "}
                <Link
                  href="/cadastro"
                  className="text-orange-600 hover:text-orange-700 font-semibold hover:underline inline-flex items-center gap-1 group"
                >
                  Criar conta grátis
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </p>
            </div>

            {/* Selo de segurança */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 border-t border-gray-100 pt-6">
              <Shield className="w-4 h-4" />
              <span>
                Seus dados estão seguros com criptografia de ponta a ponta
              </span>
            </div>
          </motion.div>

          {/* Benefícios mobile */}
          <div className="lg:hidden mt-8 grid grid-cols-3 gap-4 text-center text-sm">
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3">
              <div className="font-display font-bold text-gray-900">7 dias</div>
              <div className="text-gray-600 text-xs">grátis</div>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3">
              <div className="font-display font-bold text-gray-900">50+</div>
              <div className="text-gray-600 text-xs">concursos</div>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3">
              <div className="font-display font-bold text-gray-900">1000+</div>
              <div className="text-gray-600 text-xs">alunos</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
