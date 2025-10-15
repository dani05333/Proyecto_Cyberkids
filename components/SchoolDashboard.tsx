import React from 'react';

const SchoolDashboard: React.FC = () => {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-extrabold text-slate-800 mb-6">Panel de Colegios</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-slate-600">
          Este es el portal para administradores de colegios. Aquí podrás gestionar cursos, ver el progreso general de los estudiantes y acceder a material educativo complementario.
        </p>
        <p className="text-slate-500 mt-4">
          (Contenido del panel de colegios en desarrollo)
        </p>
      </div>
    </div>
  );
};

export default SchoolDashboard;
