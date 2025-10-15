import React from 'react';

const ParentDashboard: React.FC = () => {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-extrabold text-slate-800 mb-6">Panel de Padres</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-slate-600">
          Este es el portal para padres y apoderados. Aquí podrás supervisar el progreso de tus hijos, ver las insignias que han ganado y acceder a consejos para conversar sobre seguridad digital en familia.
        </p>
        <p className="text-slate-500 mt-4">
          (Contenido del panel de padres en desarrollo)
        </p>
      </div>
    </div>
  );
};

export default ParentDashboard;
