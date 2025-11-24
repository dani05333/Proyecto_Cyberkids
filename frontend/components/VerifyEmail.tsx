import React, { useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000/api/";

const VerifyEmail: React.FC<{ onVerified: () => void }> = ({ onVerified }) => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ---------------------------------------------------------
  // 🔵 ENVIAR CÓDIGO AL CORREO
  // ---------------------------------------------------------
  const handleSendCode = async () => {
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Ingresa un correo válido.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(API + "send-verification-code/", {
        email: email,
      });

      setMessage(res.data.message);
      setStep("code");
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al enviar el código.");
    }

    setLoading(false);
  };

  // ---------------------------------------------------------
  // 🔵 VALIDAR CÓDIGO
  // ---------------------------------------------------------
  const handleVerify = async () => {
    setError("");
    setMessage("");

    if (!code.trim()) {
      setError("Ingresa el código de verificación.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(API + "verify-email/", {
        email: email,
        code: code,
      });

      setMessage(res.data.message);

      // Notificar al Login que ya está validado
      setTimeout(() => {
        onVerified();
      }, 800);
    } catch (err: any) {
      setError(err.response?.data?.error || "Código incorrecto.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-100 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-center text-slate-800">
          Verificar Correo
        </h2>

        <p className="text-center mt-2 text-slate-500 text-sm">
          Debes verificar tu correo electrónico para continuar.
        </p>

        {/* MENSAJES */}
        {message && (
          <p className="mt-3 text-green-600 text-center font-medium">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-3 text-red-500 text-center font-medium">{error}</p>
        )}

        {/* FORMULARIO */}
        <div className="mt-6 space-y-4">
          {/* Paso 1: ingresar correo */}
          {step === "email" && (
            <>
              <label className="block text-sm font-medium">Correo</label>
              <input
                type="email"
                className="w-full p-3 border rounded-md focus:ring-sky-500 focus:border-sky-500"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button
                onClick={handleSendCode}
                disabled={loading}
                className="w-full bg-sky-500 text-white py-3 rounded-full font-semibold hover:bg-sky-600 transition disabled:opacity-50"
              >
                {loading ? "Enviando..." : "Enviar Código"}
              </button>
            </>
          )}

          {/* Paso 2: ingresar código */}
          {step === "code" && (
            <>
              <label className="block text-sm font-medium">
                Código de verificación
              </label>
              <input
                type="text"
                maxLength={6}
                className="w-full p-3 border rounded-md tracking-widest text-center text-xl focus:ring-sky-500 focus:border-sky-500"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />

              <button
                onClick={handleVerify}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-full font-semibold hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? "Verificando..." : "Confirmar"}
              </button>

              <button
                onClick={handleSendCode}
                className="w-full mt-2 text-sky-600 text-sm font-semibold hover:underline"
              >
                Reenviar código
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
