// lib/contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userName: string | null;
  userInitials: string;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Rotas públicas
const PUBLIC_ROUTES = [
  "/login",
  "/cadastro",
  "/recuperar-senha",
  "/termos",
  "/privacidade",
  "/sobre",
  "/onboarding",
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // 🔥 FUNÇÃO PARA SALVAR USUÁRIO NO FIRESTORE
  const salvarUsuarioNoFirestore = async (user: User) => {
    try {
      const userRef = doc(db, "usuarios", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Criar novo usuário
        const userData = {
          uid: user.uid,
          email: user.email,
          nome: user.displayName || user.email?.split("@")[0] || "Usuário",
          fotoURL: user.photoURL || null,
          createdAt: Timestamp.now(),
          subscription: {
            status: "trial",
            plan: null,
            trialEndsAt: Timestamp.fromDate(
              new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            ),
            expiresAt: null,
          },
          preferences: {
            concursosInteresse: [],
            metaDiaria: 60,
            notificacoes: true,
          },
          stats: {
            totalQuestoes: 0,
            totalAcertos: 0,
            totalTempo: 0,
            streak: 0,
          },
        };

        await setDoc(userRef, userData);
        console.log("✅ Usuário criado no Firestore:", user.uid);
        return true; // É novo usuário
      } else {
        console.log("📝 Usuário já existe no Firestore:", user.uid);
        return false; // Já existia
      }
    } catch (error) {
      console.error("❌ Erro ao salvar usuário no Firestore:", error);
      return false;
    }
  };

  // 🔥 Função para extrair nome do usuário
  const extractUserName = (user: User | null): string | null => {
    if (!user) return null;

    // Tenta pegar do displayName (Google)
    if (user.displayName) {
      return user.displayName.split(" ")[0]; // Pega o primeiro nome
    }

    // Se não tem displayName, usa o email
    if (user.email) {
      return user.email.split("@")[0];
    }

    return null;
  };

  // 🔥 Função para gerar iniciais
  const getUserInitials = (user: User | null): string => {
    if (!user) return "U";

    if (user.displayName) {
      const names = user.displayName.split(" ");
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return names[0][0].toUpperCase();
    }

    if (user.email) {
      return user.email[0].toUpperCase();
    }

    return "U";
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state:", user ? user.email : "deslogado");

      if (user) {
        // 🔥 SALVAR NO FIRESTORE QUANDO USUÁRIO LOGAR
        await salvarUsuarioNoFirestore(user);
      }

      setUser(user);
      setUserName(extractUserName(user));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔥 REDIRECIONAMENTO CONTROLADO
  useEffect(() => {
    if (loading) return;

    const isPublicRoute = PUBLIC_ROUTES.some((route) =>
      pathname?.startsWith(route),
    );
    const isLandingPage = pathname === "/";
    const isAuthPage =
      pathname?.startsWith("/login") || pathname?.startsWith("/cadastro");

    // Se tem usuário E está em página de auth
    if (user && isAuthPage) {
      console.log("Usuário logado em página de auth → dashboard");
      router.push("/dashboard");
    }

    // Se não tem usuário E está em rota protegida
    if (
      !user &&
      !isPublicRoute &&
      !isLandingPage &&
      pathname?.startsWith("/dashboard")
    ) {
      console.log("Sem usuário em rota protegida → login");
      router.push("/login");
    }
  }, [user, loading, pathname, router]);

  // 🔥 GOOGLE SIGN IN
  const signInWithGoogle = async (): Promise<void> => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, provider);
      console.log("Login Google realizado:", result.user.email);

      // 🔥 SALVAR NO FIRESTORE APÓS LOGIN COM GOOGLE
      await salvarUsuarioNoFirestore(result.user);

      // Atualiza o nome com os dados do Google
      setUserName(extractUserName(result.user));
    } catch (error: any) {
      console.error("Erro no login Google:", error);

      if (error.code === "auth/popup-closed-by-user") {
        return;
      }

      throw error;
    }
  };

  const signInWithEmail = async (
    email: string,
    password: string,
  ): Promise<void> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login email realizado:", result.user.email);

      // 🔥 SALVAR NO FIRESTORE APÓS LOGIN COM EMAIL
      await salvarUsuarioNoFirestore(result.user);

      setUserName(extractUserName(result.user));
    } catch (error) {
      console.error("Erro no login email:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
  ): Promise<void> => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      console.log("Cadastro email realizado:", result.user.email);

      // 🔥 SALVAR NO FIRESTORE APÓS CADASTRO COM EMAIL
      await salvarUsuarioNoFirestore(result.user);

      setUserName(extractUserName(result.user));
    } catch (error) {
      console.error("Erro no cadastro:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      console.log("Logout realizado");
      setUserName(null);
      router.push("/");
    } catch (error) {
      console.error("Erro no logout:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        userName,
        userInitials: getUserInitials(user),
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
