import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { AppContextType, AgeGroup } from '../types';

const StudentLogin: React.FC<{ setView: (view: AppContextType['view']) => void }> = ({ setView }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState<string | null>(null); // holds name for registration
    const context = useContext(AppContext) as AppContextType;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name.trim()) return;

        const success = context.loginStudent(name.trim());
        if (!success) {
            // If login fails, assume it's a new user and start registration
            setIsRegistering(name.trim());
        }
    };
    
    const handleRegister = (ageGroup: AgeGroup) => {
        if(!isRegistering) return;
        const success = context.registerStudent(isRegistering, ageGroup);
        if(!success) {
             // This case should be rare if login check is done first
             setError(`El nombre de usuario "${isRegistering}" ya está en uso.`);
             setIsRegistering(null);
        }
    };
    
    if (isRegistering) {
        return (
            <div className="text-center">
                 <h2 className="text-2xl font-bold text-slate-800">¡Bienvenid@, {isRegistering}!</h2>
                 <p className="text-slate-600 my-4">Para personalizar tu aprendizaje, elige tu rango de edad:</p>
                 <div className="space-y-3">
                    <button onClick={() => handleRegister(AgeGroup.KID)} className="w-full font-bold py-3 px-4 rounded-lg bg-sky-100 text-sky-800 hover:bg-sky-200">
                        {AgeGroup.KID}
                    </button>
                    <button onClick={() => handleRegister(AgeGroup.TWEEN)} className="w-full font-bold py-3 px-4 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200">
                        {AgeGroup.TWEEN}
                    </button>
                    <button onClick={() => handleRegister(AgeGroup.TEEN)} className="w-full font-bold py-3 px-4 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                        {AgeGroup.TEEN}
                    </button>
                 </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 text-center">¡Hola, Guardián!</h2>
            <div>
                <label htmlFor="student-name" className="block text-sm font-medium text-slate-700">
                    Escribe tu nombre de usuario para ingresar o crear tu cuenta
                </label>
                <div className="mt-1">
                    <input
                        id="student-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: Capitán Ciber"
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                    />
                </div>
                 {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
            </div>
            <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-lg font-bold text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
            >
                Ingresar
            </button>
             <div className="text-center">
                <button
                    type="button"
                    onClick={() => setView('login')}
                    className="text-slate-500 hover:text-slate-700 font-semibold text-sm"
                >
                    &larr; Volver
                </button>
             </div>
        </form>
    );
};

export default StudentLogin;
