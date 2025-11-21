import React, { useContext } from "react";
import { AppContext } from "../App";
import { AppContextType } from "../types";
import ManageChildren from "./ManageChildren";

const ParentHome: React.FC = () => {
  const context = useContext(AppContext) as AppContextType;
  const { logout } = context;

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center p-6">
      <div className="max-w-4xl w-full bg-white shadow-xl rounded-2xl p-8 space-y-8">

        {/* --------------------------------------------------------
            PERFIL DEL APODERADO
        -------------------------------------------------------- */}
        <div className="border-b pb-6">
          <h1 className="text-4xl font-extrabold text-slate-800">
            Panel del Apoderado
          </h1>
          <p className="text-slate-600 mt-2">
            Administra las cuentas de tus hijos, cambia contraseñas,
            agrega nuevos usuarios y gestiona su información.
          </p>
        </div>

        {/* --------------------------------------------------------
            PANEL DE GESTIÓN DE HIJOS
        -------------------------------------------------------- */}
        <ManageChildren />

        {/* --------------------------------------------------------
            BOTÓN DE LOGOUT
        -------------------------------------------------------- */}
        <div className="pt-4">
          <button
            onClick={logout}
            className="w-full py-3 bg-slate-500 text-white font-bold rounded-full hover:bg-slate-600 transition"
          >
            Cerrar Sesión
          </button>
        </div>

      </div>
    </div>
  );
};

export default ParentHome;
