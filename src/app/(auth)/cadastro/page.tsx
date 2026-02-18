// app/cadastro/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/LogoCoordenada";
import { useAuth } from "@/lib/contexts/AuthContext";
import {
  Mail,
  Lock,
  User,
  Chrome,
  AlertCircle,
  CheckCircle,
  GraduationCap,
  Sparkles,
  Shield,
  Zap,
  Eye,
  EyeOff,
  Award,
  BookOpen,
  Headphones,
  TrendingUp,
  Target,
  Star,
  Users,
} from "lucide-react";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { signUpWithEmail, signInWithGoogle, user } = useAuth();

  // 🔥 Redireciona quando o usuário é detectado
  useEffect(() => {
    if (user) {
      window.location.href = "/dashboard";
    }
  }, [user]);

  // Calcular força da senha
  useEffect(() => {
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(Math.min(strength, 4));
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signUpWithEmail(email, password);
      // TODO: Salvar nome no Firestore
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      await signInWithGoogle();
      // O redirecionamento acontece pelo useEffect
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Cores para força da senha
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-green-600",
  ];

  const strengthLabels = [
    "Muito fraca",
    "Fraca",
    "Média",
    "Forte",
    "Muito forte",
  ];

  // Cards animados
  const floatingCards = [
    {
      icon: <Award className="w-5 h-5" />,
      text: "92% de aprovação",
      color: "from-orange-500 to-orange-600",
      delay: 0,
      position: "top-[15%] left-[8%]",
    },
    {
      icon: <Zap className="w-5 h-5" />,
      text: "+5000 questões",
      color: "from-orange-400 to-orange-500",
      delay: 0.5,
      position: "bottom-[20%] right-[5%]",
    },
    {
      icon: <GraduationCap className="w-5 h-5" />,
      text: "+1000 aprovados",
      color: "from-orange-500 to-orange-600",
      delay: 1,
      position: "top-[25%] right-[10%]",
    },
    {
      icon: <Target className="w-5 h-5" />,
      text: "Meta: Polícia Federal",
      color: "from-orange-400 to-orange-500",
      delay: 1.5,
      position: "bottom-[30%] left-[12%]",
    },
    {
      icon: <Star className="w-5 h-5" />,
      text: "4.9 de avaliação",
      color: "from-orange-500 to-orange-600",
      delay: 2,
      position: "top-[40%] left-[15%]",
    },
    {
      icon: <Users className="w-5 h-5" />,
      text: "Comunidade ativa",
      color: "from-orange-400 to-orange-500",
      delay: 2.5,
      position: "bottom-[15%] right-[12%]",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      text: "TRF 1ª Região",
      color: "from-orange-500 to-orange-600",
      delay: 3,
      position: "top-[60%] right-[15%]",
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

      {/* Cards flutuantes animados */}
      {floatingCards.map((card, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0, 0.2, 0.15, 0.2, 0],
            y: [0, -10, 0, 10, 0],
            x: [0, 5, -5, 5, 0],
          }}
          transition={{
            duration: 8,
            delay: card.delay,
            repeat: Infinity,
            repeatType: "loop",
            times: [0, 0.25, 0.5, 0.75, 1],
          }}
          className={`absolute ${card.position} hidden lg:block pointer-events-none z-0`}
        >
          <div
            className={`bg-gradient-to-r ${card.color} text-white px-4 py-2 rounded-full shadow-xl backdrop-blur-sm bg-opacity-90`}
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5">{card.icon}</div>
              <span className="text-xs font-medium whitespace-nowrap">
                {card.text}
              </span>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Conteúdo principal */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex items-center min-h-screen">
        {/* Lado esquerdo - Hero (visível apenas em telas grandes) */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex flex-col flex-1 pr-12"
        >
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">
                Comece grátis por 7 dias
              </span>
            </div>

            <h1 className="font-display text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              Estude para
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent block">
                concursos públicos
              </span>
            </h1>

            <p className="text-lg text-gray-600 mb-8 max-w-md">
              Acesso completo a conteúdo em texto, podcasts e questões. Tudo em
              um só lugar.
            </p>

            {/* Depoimento rápido */}
            <div className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-orange-100 max-w-md">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                AS
              </div>
              <div>
                <p className="text-sm text-gray-700 italic">
                  "Plataforma incrível! Em 3 meses fui aprovado no TRF."
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Ana Silva - Aprovada TRF
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Lado direito - Formulário de Cadastro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full lg:w-[520px] mx-auto lg:mx-0"
        >
          {/* Header mobile */}
          <div className="lg:hidden text-center mb-4">
            <Logo className="justify-center mb-2" />
            <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">
              Criar conta grátis
            </h1>
            <p className="text-sm text-gray-600">7 dias de acesso ilimitado</p>
          </div>

          {/* Card de Cadastro */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-orange-100/50"
          >
            {/* Botão Google */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 py-4 px-4 rounded-2xl hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 opacity-0 group-hover:opacity-5 transition-opacity" />
              <Chrome className="w-5 h-5 group-hover:text-orange-500 transition-colors" />
              <span className="font-medium">Criar conta com Google</span>
            </motion.button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 backdrop-blur-sm text-gray-500">
                  ou crie com email
                </span>
              </div>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nome completo
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  onFocus={() => setFocusedField("nome")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
                  placeholder="Seu nome completo"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
                  placeholder="seu@email.com"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none pr-12"
                    placeholder="Crie uma senha segura"
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

                {/* Indicador de força da senha */}
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1 h-1.5">
                      {[0, 1, 2, 3].map((index) => (
                        <motion.div
                          key={index}
                          initial={{ width: 0 }}
                          animate={{ width: "25%" }}
                          className={`h-full rounded-full transition-colors ${
                            index < passwordStrength
                              ? strengthColors[passwordStrength - 1]
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {strengthLabels[passwordStrength]}
                    </p>
                  </div>
                )}
              </div>

              {/* Mensagem de erro */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Termos */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  required
                />
                <label htmlFor="terms" className="text-xs text-gray-500">
                  Eu concordo com os{" "}
                  <Link
                    href="/termos"
                    className="text-orange-600 hover:underline"
                  >
                    Termos de Uso
                  </Link>{" "}
                  e{" "}
                  <Link
                    href="/privacidade"
                    className="text-orange-600 hover:underline"
                  >
                    Política de Privacidade
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25 py-3.5 rounded-xl font-semibold"
                isLoading={loading}
              >
                {!loading && "Criar minha conta gratuita"}
              </Button>
            </form>

            {/* Link para login */}
            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{" "}
                <Link
                  href="/login"
                  className="text-orange-600 hover:text-orange-700 font-medium hover:underline"
                >
                  Fazer login
                </Link>
              </p>
            </div>

            {/* Selo de segurança */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400">
              <Shield className="w-3.5 h-3.5" />
              <span>
                Seus dados estão seguros com criptografia de ponta a ponta
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
