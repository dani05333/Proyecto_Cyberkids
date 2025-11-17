import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { AppContextType } from '../types';
import axios from 'axios';

const StudentLogin: React.FC<{ setView: (view: AppContextType['view']) => void }> = ({ setView }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const context = useContext(AppContext) as AppContextType;

  // 🔹 Paso 1: Login con backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) return;

    const success = await context.login(username.trim(), password.trim(), "student");

    if (success) {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/student/${encodeURIComponent(username)}/`);
        console.log("🔍 Datos del estudiante:", response.data);

        const student = response.data;

        if (student && (student.age_group === null || student.age_group === "")) {
          console.log("👶 No tiene grupo, redirigiendo a AgeSelectorPage");
          // Guardamos temporalmente el username
          localStorage.setItem("student_username", username.trim());
          setView("age-selector"); // 👈 cambiamos de vista
        } else {
          console.log("✅ Tiene grupo:", student.age_group);
          setView("dashboard");
        }
      } catch (err) {
        console.error("Error al obtener datos del estudiante:", err);
        setError("No se pudo obtener la información del estudiante.");
      }
    } else {
      setError('Usuario o contraseña incorrectos.');
    }
  };

  // 🔹 Pantalla principal de login del estudiante
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 text-center">Soy Estudiante</h2>

      <div>
        <label htmlFor="student-username" className="block text-sm font-medium text-slate-700">
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

      <div>
        <label htmlFor="student-password" className="block text-sm font-medium text-slate-700">
          Contraseña
        </label>
        <input
          id="student-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Ej: 1234"
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
        />
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <button
        type="submit"
        className="w-full font-bold py-3 px-4 rounded-full text-white bg-sky-500 hover:bg-sky-600 transition"
      >
        Ingresar
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setView('login')}
          className="text-slate-500 hover:text-slate-700 font-semibold text-sm"
        >
          &larr; Volver
        </button>
      </div>
    </form>
  );
};

export default StudentLogin;
