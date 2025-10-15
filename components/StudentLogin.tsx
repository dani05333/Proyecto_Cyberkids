import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { AppContextType } from '../types';

interface StudentLoginProps {
    onBack: () => void;
}

const StudentLogin: React.FC<StudentLoginProps> = ({ onBack }) => {
    const [name, setName] = useState('');
    const context = useContext(AppContext) as AppContextType;

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && context) {
            context.login(name.trim(), 'student');
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
                <h2 className="text-3xl font-extrabold text-slate-800 text-center mb-6">Ingreso de Estudiante</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label htmlFor="student-name" className="block text-slate-700 font-bold mb-2">
                            Tu Nombre o Apodo
                        </label>
                        <input
                            id="student-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Super Explorador"
                            className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-sky-500 transition-colors"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className="w-full bg-sky-500 text-white font-bold text-lg py-3 px-6 rounded-lg shadow-md hover:bg-sky-600 disabled:bg-slate-300 transition-colors"
                    >
                        ¡A Jugar!
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <button
                        onClick={onBack}
                        className="text-slate-500 hover:text-slate-700 font-semibold"
                    >
                        &larr; Volver
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentLogin;
