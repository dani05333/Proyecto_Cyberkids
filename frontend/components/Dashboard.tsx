import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { AppContextType, Module, User } from '../types';
import { getLearningPathForAgeGroup } from '../constants';
import * as Icons from './icons';
import UserProfileSidebar from './UserProfileSidebar';
import LessonModal from './LessonModal';
import Leaderboard from './Leaderboard';
import Header from './Header';
import { SparklesIcon } from './icons';

const Dashboard: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const [selectedModule, setSelectedModule] = useState<Module | null>(null);

    if (!context || !context.user) {
        return <div className="p-8 text-center">Cargando datos del guardián...</div>;
    }
    
    const { user, openPremiumModal } = context;
    const learningPath = getLearningPathForAgeGroup(user.ageGroup);

    const handleModuleSelect = (module: Module) => {
        if(module.isPremium && !user.isPremium) {
            openPremiumModal();
        } else {
            setSelectedModule(module);
        }
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-slate-100">
            <UserProfileSidebar />
            <main className="flex-1">
                <Header />
                <div className="p-4 sm:p-8">
                    <Leaderboard />
                    <h2 className="text-3xl font-extrabold text-slate-800 mb-6">Ruta de Aprendizaje</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {learningPath.modules.map(module => (
                            <ModuleCard key={module.id} module={module} user={user} onSelect={() => handleModuleSelect(module)} />
                        ))}
                    </div>
                </div>
            </main>
            {selectedModule && <LessonModal module={selectedModule} onClose={() => setSelectedModule(null)} />}
        </div>
    );
};

const ModuleCard: React.FC<{ module: Module, user: User, onSelect: () => void }> = ({ module, user, onSelect }) => {
    if (!user) return null;
    const completed = module.lessons.filter(l => user.completedLessons.has(l.id)).length;
    const total = module.lessons.length;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    const IconComponent = Icons.ICONS[module.icon] || Icons.ShieldCheckIcon;
    const isLocked = module.isPremium && !user.isPremium;

    return (
        <div className={`relative bg-white rounded-2xl shadow-md p-6 text-left transition-all transform ${isLocked ? 'opacity-80' : 'hover:shadow-xl hover:-translate-y-1'}`}>
            {isLocked && <div className="absolute inset-0 bg-slate-100 bg-opacity-50 rounded-2xl z-10"></div>}
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${module.color}`}>
                    <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-800">{module.title}</h3>
                        {module.isPremium && <SparklesIcon className="w-5 h-5 text-purple-500" />}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{module.description}</p>
                </div>
            </div>
            <div className="mt-4">
                <div className="flex justify-between items-center text-sm font-semibold text-slate-500 mb-1">
                    <span>Progreso</span>
                    <span>{completed}/{total}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className={`${module.color} h-2.5 rounded-full`} style={{ width: `${progress}%` }}></div>
                </div>
                 <button onClick={onSelect} className={`w-full mt-4 font-bold py-2 px-4 rounded-full text-white ${isLocked ? 'bg-purple-500 hover:bg-purple-600' : 'bg-sky-500 hover:bg-sky-600'} transition-colors`}>
                    {isLocked ? 'Desbloquear' : 'Comenzar'}
                </button>
            </div>
        </div>
    );
};

export default Dashboard;