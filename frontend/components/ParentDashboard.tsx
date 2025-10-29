import React, { useContext, useState } from 'react';
import axios from 'axios';
import { AppContext } from '../App';
import { AppContextType, User, LearningPath, Module, AgeGroup } from '../types';
import { BADGES, getLearningPathForAgeGroup } from '../constants';
import * as Icons from './icons';
import AvatarDisplay from './AvatarDisplay';



const ParentDashboard: React.FC = () => {
  const context = useContext(AppContext) as AppContextType;
  const { loggedInAccount, linkedStudent, logout } = context;

  const [studentName, setStudentName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [studentData, setStudentData] = useState<User | null>(null);

  // Si no hay sesión iniciada
  if (!loggedInAccount) {
    return <div className="p-8 text-center">Error: Debes iniciar sesión.</div>;
  }

  // 🔹 Si aún no hay estudiante vinculado → mostrar formulario para crearlo
  if (!linkedStudent) {
  return (
    <div className="p-8 text-center text-slate-600">
      Aún no has seleccionado ningún hijo.  
      Ve a "Gestionar Hijos" para vincular o crear una cuenta infantil.
    </div>
  );
}


  // 🔹 Usa el estudiante actual (de backend o recién creado)
  const student = linkedStudent || studentData!;
  const learningPath: LearningPath = student.ageGroup
  ? getLearningPathForAgeGroup(student.ageGroup)
  :getLearningPathForAgeGroup(AgeGroup.KID);



  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-extrabold text-slate-800">Panel de Apoderado</h1>
          <button
            onClick={logout}
            className="bg-sky-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* 🧩 Información general del hijo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center text-center">
            <AvatarDisplay user={student} size="lg" />
            <h2 className="text-2xl font-bold text-slate-800 mt-4">{student.name}</h2>
            <p className="text-slate-500">{student.ageGroup || 'Edad no especificada'}</p>
            <div className="mt-4 bg-amber-100 text-amber-800 font-bold px-4 py-2 rounded-full text-lg">
              {student.xp || 0} XP
            </div>
          </div>

          {/* 📊 Progreso */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Progreso General</h3>
            {learningPath.modules.map((module) => (
              <ModuleProgress key={module.id} module={module} user={student} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 🔹 Componente auxiliar de progreso de módulos
const ModuleProgress: React.FC<{ module: Module; user: User }> = ({ module, user }) => {
  const IconComponent = Icons.ICONS[module.icon] || Icons.ShieldCheckIcon;
  const completedLessons = module.lessons.filter((l) => user.completedLessons.has(l.id)).length;
  const totalLessons = module.lessons.length;
  const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-3">
        <IconComponent
          className={`w-6 h-6 ${progress === 100 ? 'text-green-500' : 'text-slate-500'}`}
        />
        <h4 className="font-bold text-slate-700 flex-grow">{module.title}</h4>
        <span className="text-sm font-semibold text-slate-500">
          {completedLessons}/{totalLessons}
        </span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2">
        <div
          className={`${module.color} h-2.5 rounded-full`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ParentDashboard;
