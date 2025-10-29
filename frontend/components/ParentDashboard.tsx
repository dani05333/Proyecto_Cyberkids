import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { AppContextType, User, LearningPath, Module, Performance } from '../types';
import { BADGES, getLearningPathForAgeGroup } from '../constants';
import * as Icons from './icons';
import AvatarDisplay from './AvatarDisplay';

const ParentDashboard: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const { loggedInAccount, linkedStudent, linkStudentAccount, logout } = context;
    const [studentName, setStudentName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLinkAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const success = await linkStudentAccount(studentName);
        if (!success) {
            setError(`No se encontró un estudiante con el nombre "${studentName}". Revisa que esté bien escrito.`);
        }
        setIsLoading(false);
        setStudentName('');
    };

    if (!loggedInAccount) {
        return <div className="p-8 text-center">Error: Debes iniciar sesión.</div>;
    }
    
    if (!linkedStudent) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
                 <div className="max-w-md w-full">
                    <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                        <h2 className="text-3xl font-extrabold text-slate-800">Vincula la Cuenta de tu Hij@</h2>
                        <p className="text-slate-600 mt-2 mb-6">Ingresa el nombre de usuario que tu hij@ usa en CyberKids para ver su progreso.</p>
                        <form onSubmit={handleLinkAccount} className="flex flex-col items-center">
                            <input
                                type="text"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                placeholder="Nombre de usuario del estudiante"
                                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                required
                            />
                            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full mt-4 bg-sky-500 text-white font-bold py-3 px-6 rounded-full hover:bg-sky-600 transition-colors disabled:bg-slate-400"
                            >
                                {isLoading ? 'Vinculando...' : 'Vincular Cuenta'}
                            </button>
                             <button
                                type="button"
                                onClick={logout}
                                className="mt-4 text-slate-500 hover:text-slate-700 font-semibold text-sm"
                            >
                                Cerrar Sesión
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    const learningPath = getLearningPathForAgeGroup(linkedStudent.ageGroup);

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
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center text-center">
                        <AvatarDisplay user={linkedStudent} size="lg" />
                        <h2 className="text-2xl font-bold text-slate-800 mt-4">{linkedStudent.name}</h2>
                        <p className="text-slate-500">{linkedStudent.ageGroup}</p>
                        <div className="mt-4 bg-amber-100 text-amber-800 font-bold px-4 py-2 rounded-full text-lg">
                            {linkedStudent.xp} XP
                        </div>
                    </div>

                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Progreso General</h3>
                        {learningPath.modules.map(module => <ModuleProgress key={module.id} module={module} user={linkedStudent} />)}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                         <h3 className="text-xl font-bold text-slate-800 mb-4">Insignias Ganadas</h3>
                         {linkedStudent.badges.length > 0 ? (
                            <div className="flex flex-wrap gap-4">
                                {linkedStudent.badges.map(badgeKey => {
                                    const badge = BADGES[badgeKey];
                                    return <div key={badgeKey} title={`${badge.name}: ${badge.description}`} className="flex flex-col items-center text-center w-20">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-3xl">{badge.emoji}</div>
                                        <p className="text-xs font-semibold mt-2 text-slate-700">{badge.name}</p>
                                    </div>
                                })}
                            </div>
                         ) : <p className="text-slate-500">¡Tu hij@ aún no ha ganado insignias, anímale a seguir aprendiendo!</p>}
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Recomendaciones</h3>
                        <RecommendationCard user={linkedStudent} learningPath={learningPath} />
                    </div>
                </div>

            </div>
        </div>
    );
};

const ModuleProgress: React.FC<{module: Module, user: User}> = ({module, user}) => {
    const IconComponent = Icons.ICONS[module.icon] || Icons.ShieldCheckIcon;
    const completedLessons = module.lessons.filter(l => user.completedLessons.has(l.id)).length;
    const totalLessons = module.lessons.length;
    const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
    
    return (
        <div className="mb-4">
            <div className="flex items-center gap-3">
                <IconComponent className={`w-6 h-6 ${progress === 100 ? 'text-green-500' : 'text-slate-500'}`} />
                <h4 className="font-bold text-slate-700 flex-grow">{module.title}</h4>
                <span className="text-sm font-semibold text-slate-500">{completedLessons}/{totalLessons}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2">
                <div className={`${module.color} h-2.5 rounded-full`} style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
}

const RecommendationCard: React.FC<{user: User, learningPath: LearningPath}> = ({user, learningPath}) => {
    // FIX: With `user.performance` correctly typed, the cast to `Performance` is no longer necessary.
    const lowPerformingLesson = Object.entries(user.performance)
        .find(([, perf]) => perf.score < 0.5);

    if(lowPerformingLesson) {
        const [lessonId] = lowPerformingLesson;
        for (const module of learningPath.modules) {
            const lesson = module.lessons.find(l => l.id === lessonId);
            if (lesson) {
                 return <p className="text-slate-600">
                    Notamos que tu hij@ tuvo dificultades con la lección <strong>"{lesson.title}"</strong>.
                    Sería una buena idea repasarla juntos para reforzar el aprendizaje.
                </p>
            }
        }
    }

    return <p className="text-slate-600">¡Tu hij@ va muy bien! Anímale a completar la próxima lección de su ruta de aprendizaje para seguir sumando XP y ganando insignias.</p>
}


export default ParentDashboard;