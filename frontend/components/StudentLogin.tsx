import React, { useState, useContext } from "react";
import { AppContext } from "../App";
import { AppContextType } from "../types";
import axios from "axios";

const StudentLogin: React.FC<{ setView: (view: AppContextType["view"]) => void }> = ({
  setView,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👁️ estado ojito
  const [error, setError] = useState("");

  const context = useContext(AppContext) as AppContextType;

  // ------------------------------------------------------------
  // 🔹 LOGIN ESTUDIANTE
  // ------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) return;

    const success = await context.login(username.trim(), password.trim(), "student");

    if (success) {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/student/${encodeURIComponent(username)}`
        );

        const student = response.data;

        if (!student.age_group) {
          // Guardar username temporal
          localStorage.setItem("student_username", username.trim());
          setView("age-selector");
        } else {
          setView("dashboard");
        }
      } catch (err) {
        console.error("❌ Error al obtener estudiante:", err);
        setError("No se pudo obtener la información del estudiante.");
      }
    } else {
      setError("Usuario o contraseña incorrectos.");
    }
  };

  // ------------------------------------------------------------
  // 🔹 FORMULARIO
  // ------------------------------------------------------------
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 text-center">Soy Estudiante</h2>

      {/* Username */}
      <div>
        <label
          htmlFor="student-username"
          className="block text-sm font-medium text-slate-700"
        >
          Nombre de usuario
        </label>

        <input
          id="student-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Ej: student_sofia"
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
        />
      </div>

      {/* Password con OJITO */}
      <div>
        <label
          htmlFor="student-password"
          className="block text-sm font-medium text-slate-700"
        >
          Contraseña
        </label>

        <div className="flex items-center border px-3 py-2 rounded-md">
          <input
            id="student-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Escribe tu contraseña"
            className="flex-1 outline-none"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="ml-2 text-slate-600 hover:text-slate-800"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      {/* Submit */}
      <button
        type="submit"
        className="w-full font-bold py-3 px-4 rounded-full text-white bg-sky-500 hover:bg-sky-600 transition"
      >
        Ingresar
      </button>

      {/* Volver */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => setView("login")}
          className="text-slate-500 hover:text-slate-700 font-semibold text-sm"
        >
          &larr; Volver
        </button>
      </div>
    </form>
  );
};

export default StudentLogin;
