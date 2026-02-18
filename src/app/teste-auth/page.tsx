"use client";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { app } from "@/lib/firebase/config";
import { useState } from "react";

export default function TesteAuthPage() {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");
  const auth = getAuth(app);

  const loginGoogle = async () => {
    try {
      setError("");
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      console.log("Usuário logado:", result.user);
    } catch (err: any) {
      setError(err.message);
      console.error("Erro completo:", err);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>Teste de Autenticação Firebase</h1>

      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={loginGoogle}
          style={{
            padding: "0.5rem 1rem",
            background: "#4285f4",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "1rem",
          }}
        >
          Login com Google
        </button>

        {user && (
          <button
            onClick={logout}
            style={{
              padding: "0.5rem 1rem",
              background: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        )}
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: "1rem" }}>Erro: {error}</div>
      )}

      {user && (
        <div
          style={{
            padding: "1rem",
            background: "#f0f0f0",
            borderRadius: "8px",
          }}
        >
          <h3>Usuário logado:</h3>
          <p>
            <strong>Nome:</strong> {user.displayName}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>UID:</strong> {user.uid}
          </p>
          <img
            src={user.photoURL}
            alt="foto"
            style={{ borderRadius: "50%", width: "50px" }}
          />
        </div>
      )}
    </div>
  );
}
