import React, { useContext } from "react";
import axios from "axios";
import { AppContext } from "../App";
import { AppContextType } from "../types";

const API = "http://127.0.0.1:8000/api";

const AgeSelectorPage: React.FC<{ username: string; setView: any }> = ({
  username,
  setView,
}) => {
  const context = useContext(AppContext) as AppContextType;

  const handleSelectAge = async (range: string) => {
    try {
      await axios.post(
        `${API}/student/set-age-group/`,
        { username, age_group: range },
        {
          headers: {
            Authorization: `Bearer ${context.accessToken}`,
          },
        }
      );

      // guardar en frontend EXACTAMENTE LO MISMO
      context.updateUser({
        ...context.user!,
        ageGroup: range as any,
      });

      setView("dashboard");

    } catch (err) {
      console.error("Error al guardar edad:", err);
      alert("No se pudo guardar la edad, intenta nuevamente.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-6">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">
        ¿Qué edad tienes?
      </h1>

      <div className="space-y-4 w-full max-w-sm">
        <button
          onClick={() => handleSelectAge("6-9")}
          className="w-full bg-sky-500 text-white py-3 rounded-lg hover:bg-sky-600"
        >
          6 a 9 años
        </button>

        <button
          onClick={() => handleSelectAge("10-13")}
          className="w-full bg-sky-500 text-white py-3 rounded-lg hover:bg-sky-600"
        >
          10 a 13 años
        </button>

        <button
          onClick={() => handleSelectAge("14-17")}
          className="w-full bg-sky-500 text-white py-3 rounded-lg hover:bg-sky-600"
        >
          14 a 17 años
        </button>
      </div>
    </div>
  );
};

export default AgeSelectorPage;
