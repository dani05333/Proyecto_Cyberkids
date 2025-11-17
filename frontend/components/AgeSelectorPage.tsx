import React, { useContext } from "react";
import { AppContext } from "../App";
import { AppContextType, AgeGroup } from "../types";
import axios from "axios";

interface AgeSelectorPageProps {
  username: string;
  setView: (view: AppContextType["view"]) => void;
}

const AgeSelectorPage: React.FC<AgeSelectorPageProps> = ({ username, setView }) => {
  const context = useContext(AppContext) as AppContextType;

  const handleSelectAge = async (ageGroup: AgeGroup) => {
  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/api/student/set-age-group",
      {
        username,
        age_group: ageGroup,
      }
    );

    if (context.user) {
      context.updateUser({
        ...context.user,
        ageGroup: response.data.age_group,
      });
    }

    alert("Edad guardada correctamente");
    setView("dashboard");
  } catch (err) {
    console.error("Error al guardar edad:", err);
    alert("Hubo un error al guardar tu edad. Intenta nuevamente.");
  }
};


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
      <h2 className="text-3xl font-bold text-slate-800 mb-4">¡Bienvenid@, {username}!</h2>
      <p className="text-slate-600 mb-6 text-center max-w-md">
        Selecciona tu rango de edad para personalizar tu aventura en CyberKids:
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => handleSelectAge(AgeGroup.KID)}
          className="py-3 px-4 rounded-lg bg-sky-100 text-sky-800 font-semibold hover:bg-sky-200"
        >
          Niño (6–9 años)
        </button>

        <button
          onClick={() => handleSelectAge(AgeGroup.TWEEN)}
          className="py-3 px-4 rounded-lg bg-amber-100 text-amber-800 font-semibold hover:bg-amber-200"
        >
          Preadolescente (10–12 años)
        </button>

        <button
          onClick={() => handleSelectAge(AgeGroup.TEEN)}
          className="py-3 px-4 rounded-lg bg-emerald-100 text-emerald-800 font-semibold hover:bg-emerald-200"
        >
          Adolescente (13–16 años)
        </button>
      </div>
    </div>
  );
};

export default AgeSelectorPage;
