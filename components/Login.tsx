import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import StudentLogin from './StudentLogin';
import { AppContextType } from '../types';

const Login: React.FC = () => {
    const [loginType, setLoginType] = useState<'student' | 'parent' | 'school' | null>(null);
    const context = useContext(AppContext) as AppContextType;

    const handleParentLogin = () => {
        // For demo, we just log in with a generic parent account
        if (context) {
            context.login('Padre/Madre Ejemplo', 'parent');
        }
    };

    const handleSchoolLogin = () => {
        // For demo, we just log in with a generic school account
        if (context) {
            context.login('Colegio Ejemplo', 'school');
        }
    };

    if (loginType === 'student') {
        return <StudentLogin onBack={() => setLoginType(null)} />;
    }

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
            <header className="text-center mb-12">
                <h1 className="text-5xl md:text-6xl font-extrabold text-slate-800">
                    Bienvenid@ a <span className="text-sky-500">CyberKids Chile</span>
                </h1>
                <p className="text-slate-600 text-lg mt-4 max-w-2xl">
                    Tu aventura de aprendizaje en seguridad digital está a punto de comenzar.
                </p>
            </header>
            <div className="w-full max-w-sm space-y-4">
                <button
                    onClick={() => setLoginType('student')}
                    className="w-full bg-gradient-to-br from-sky-400 to-blue-500 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-lg hover:scale-105 transform transition-transform duration-300"
                >
                    Soy Estudiante
                </button>
                <button
                    onClick={handleParentLogin}
                    className="w-full bg-gradient-to-br from-emerald-400 to-green-500 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-lg hover:scale-105 transform transition-transform duration-300"
                >
                    Soy Padre / Apoderado
                </button>
                <button
                    onClick={handleSchoolLogin}
                    className="w-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-lg hover:scale-105 transform transition-transform duration-300"
                >
                    Soy Colegio
                </button>
            </div>
        </div>
    );
};

export default Login;
