import React from 'react';
import { AppContextType } from '../types';
import { AppContext } from '../App';
import { useContext } from 'react';

const ParentHome: React.FC = () => {
  const context = useContext(AppContext) as AppContextType;
  const { logout } = context;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-lg w-full">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-4">Bienvenid@, Apoderad@</h1>
        <p className="text-slate-600 mb-6">
          Desde aquí podrás gestionar las cuentas de tus hijos, revisar su progreso y acceder a
          materiales educativos.
        </p>

        <div className="space-y-4">
          <button
            className="w-full py-3 bg-sky-500 text-white font-bold rounded-full hover:bg-sky-600 transition"
            onClick={() => alert('Aquí iría la sección para gestionar hijos')}
          >
            👨‍👩‍👧 Gestionar Hijos
          </button>

          <button
            className="w-full py-3 bg-slate-500 text-white font-bold rounded-full hover:bg-slate-600 transition"
            onClick={logout}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParentHome;
