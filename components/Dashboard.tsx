import React, { useContext } from 'react';
import { AppContext } from '../App';
import { Module, User, AppContextType } from '../types';
import * as Icons from './icons';
import { CheckCircleIcon, LockIcon } from './icons';
import Leaderboard from './Leaderboard';

interface DashboardProps {
    onModuleSelect: (module: Module) => void;
}

interface ModuleNodeProps {
    module: Module;
    onSelect: () => void;
    isLocked: boolean;
    isCompleted: boolean;
    user: User;
}

const ModuleNode: React.FC<ModuleNodeProps> = ({ module, onSelect, isLocked, isCompleted, user }) => {
    const IconComponent = Icons.ICONS[module.icon] || Icons.ShieldCheckIcon;
    const statusColor = isLocked ? 'bg-slate-300' : module.color;
    const isClickable = !isLocked;

    const completedLessonsCount = module.lessons.filter(lesson => user.completedLessons.has(lesson.id)).length;
    const totalLessons = module.lessons.length;
    const progressPercentage = totalLessons > 0 ? (completedLessonsCount / totalLessons) * 100 : 0;


    return (
        <div className="relative flex flex-col items-center group mb-4">
            <button
                onClick={isClickable ? onSelect : undefined}
                disabled={!isClickable}
                className={`w-32 h-32 rounded-full ${statusColor} flex flex-col items-center justify-center text-white shadow-lg transform transition-transform duration-300 ${isClickable ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed'}`}
            >
                {isLocked ? (
                    <LockIcon className="w-12 h-12 text-slate-500"/>
                ) : (
                    <>
                        <IconComponent className="w-12 h-12"/>
                        {isCompleted && <CheckCircleIcon className="absolute top-0 right-0 w-8 h-8 text-white bg-green-500 rounded-full border-2 border-white"/>}
                    </>
                )}
            </button>
            <h3 className={`mt-3 font-bold text-center w-36 ${isLocked ? 'text-slate-400' : 'text-slate-700'}`}>{module.title}</h3>
            
            {/* Lesson Progress Indicators */}
            {module.lessons.length > 0 && (
                <div className="flex justify-center items-center gap-1.5 mt-2 h-4">
                    {module.lessons.map(lesson => {
                        if (isLocked) {
                            // FIX: Wrap icon in a span to apply the title attribute for tooltips.
                            return <span key={lesson.id} title={`${lesson.title} (Bloqueado)`}><LockIcon className="w-3.5 h-3.5 text-slate-400" /></span>;
                        }
                        
                        const isLessonCompleted = user.completedLessons.has(lesson.id);
                        
                        if (isLessonCompleted) {
                            // FIX: Wrap icon in a span to apply the title attribute for tooltips.
                            return <span key={lesson.id} title={`${lesson.title} (Completado)`}><CheckCircleIcon className="w-4 h-4 text-green-500" /></span>;
                        } else {
                            return <div key={lesson.id} className="w-3 h-3 rounded-full border-2 border-slate-400" title={`${lesson.title} (Pendiente)`}></div>;
                        }
                    })}
                </div>
            )}

            {/* Module Progress Bar */}
            {totalLessons > 0 && (
                <div className="w-24 mt-2" title={`${Math.round(progressPercentage)}% completado`}>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-500 ${isLocked ? 'bg-slate-300' : module.color}`}
                            style={{ width: `${isLocked ? 0 : progressPercentage}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

const PathConnector: React.FC = () => (
    <div className="h-16 w-1 bg-slate-300 my-2"></div>
);

const Dashboard: React.FC<DashboardProps> = ({ onModuleSelect }) => {
    const context = useContext(AppContext) as AppContextType;

    if (!context || !context.learningPath || !context.user) {
        return null;
    }
    const { learningPath, user } = context;

    const areAllLessonsInModuleCompleted = (module: Module) => {
        if(module.lessons.length === 0) return false;
        return module.lessons.every(lesson => user.completedLessons.has(lesson.id));
    };

    return (
        <div className="flex flex-col items-center py-8">
            <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Tu Aventura de Aprendizaje</h2>
            <p className="text-slate-600 mb-12">Completa los módulos para convertirte en un Guardián Cibernético.</p>

            <Leaderboard />

            <div className="flex flex-col items-center">
                {learningPath.modules.map((module, index) => {
                    const isCompleted = areAllLessonsInModuleCompleted(module);
                    
                    let isLocked = false;
                    if (index > 0) {
                        const prevModule = learningPath.modules[index - 1];
                        const prevModuleCompleted = areAllLessonsInModuleCompleted(prevModule);
                        isLocked = !prevModuleCompleted;
                    }

                    return (
                        <React.Fragment key={module.id}>
                            <ModuleNode
                                module={module}
                                onSelect={() => onModuleSelect(module)}
                                isLocked={isLocked}
                                isCompleted={isCompleted}
                                user={user}
                            />
                            {index < learningPath.modules.length - 1 && <PathConnector />}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default Dashboard;
