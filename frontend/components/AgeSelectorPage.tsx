import React, { useContext } from "react";
import axios from "axios";
import { AppContext } from "../App";
import { AppContextType, AgeGroup } from "../types";

const API = "http://127.0.0.1:8000/api";

const AgeSelectorPage: React.FC<{ username: string; setView: any }> = ({
  username,
  setView,
}) => {
  const context = useContext(AppContext) as AppContextType;

  // Ahora usamos el tipo AgeGroup ("KID" | "TWEEN" | "TEEN")
  const handleSelectAge = async (group: AgeGroup) => {
    try {
      await axios.post(
        `${API}/student/set-age-group/`,
        { username, age_group: group },
        {
          headers: {
            Authorization: `Bearer ${context.accessToken}`,
          },
        }
      );

      // Guardar en frontend EXACTAMENTE el mismo valor ("KID" | "TWEEN" | "TEEN")
      context.updateUser({
        ...context.user!,
        ageGroup: group,
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
          onClick={() => handleSelectAge(AgeGroup.KID)}
          className="w-full bg-sky-500 text-white py-3 rounded-lg hover:bg-sky-600"
        >
          6 a 9 años
        </button>

        <button
          onClick={() => handleSelectAge(AgeGroup.TWEEN)}
          className="w-full bg-sky-500 text-white py-3 rounded-lg hover:bg-sky-600"
        >
          10 a 13 años
        </button>

        <button
          onClick={() => handleSelectAge(AgeGroup.TEEN)}
          className="w-full bg-sky-500 text-white py-3 rounded-lg hover:bg-sky-600"
        >
          14 a 17 años
        </button>
      </div>
    </div>
  );
};

export default AgeSelectorPage;
