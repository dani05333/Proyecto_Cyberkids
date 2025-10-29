import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { AppContextType, Classroom, Student } from '../types';
import Header from './Header';

// Mock data is now the initial state
const INITIAL_CLASSROOMS: Classroom[] = [
    { id: 'c1', name: 'Clase 5A - Los Halcones Digitales', teacher: 'Prof. Ana Reyes' },
    { id: 'c2', name: 'Clase 6B - Los Códigos Valientes', teacher: 'Prof. Ana Reyes' },
];

const INITIAL_STUDENTS: Student[] = [
    { id: 's1', name: 'Benjamín Rojas', xp: 850, classId: 'c1', lastActivity: 'hace 2 horas' },
    { id: 's2', name: 'Sofía Castro', xp: 1100, classId: 'c1', lastActivity: 'hace 1 día' },
    { id: 's3', name: 'Martina Soto', xp: 420, classId: 'c1', lastActivity: 'hace 3 días' },
    { id: 's4', name: 'Joaquín Silva', xp: 1300, classId: 'c1', lastActivity: 'hace 5 horas' },
    { id: 's5', name: 'Agustín Pérez', xp: 950, classId: 'c2', lastActivity: 'hace 4 horas' },
    { id: 's6', name: 'Isidora González', xp: 670, classId: 'c2', lastActivity: 'ayer' },
    { id: 's7', name: 'Mateo Flores', xp: 1450, classId: 'c2', lastActivity: 'hace 20 minutos' },
];


const SchoolDashboard: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const { loggedInAccount } = context;

    // State is now managed within the component to allow for real-time edits
    const [classrooms] = useState<Classroom[]>(INITIAL_CLASSROOMS);
    const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
    const [selectedClassId, setSelectedClassId] = useState<string>(INITIAL_CLASSROOMS[0]?.id || '');
    const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

    const handleClassChange = (studentId: string, newClassId: string) => {
        setStudents(prevStudents => 
            prevStudents.map(student => 
                student.id === studentId ? { ...student, classId: newClassId } : student
            )
        );
        setEditingStudentId(null); // Exit editing mode
    };

    const selectedClassStudents = students.filter(s => s.classId === selectedClassId).sort((a,b) => b.xp - a.xp);

    if (!loggedInAccount) {
        return <div className="p-8 text-center">Error: Debes iniciar sesión.</div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-100">
            <Header />
            <main className="flex-1 p-4 sm:p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Panel del Colegio</h1>
                    <p className="text-slate-600 mb-6">Bienvenido, {loggedInAccount.name}. Aquí puedes monitorear el progreso de tus clases.</p>

                    <div className="mb-6">
                        <div className="border-b border-slate-200">
                            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                {classrooms.map(classroom => (
                                    <button
                                        key={classroom.id}
                                        onClick={() => {
                                            setSelectedClassId(classroom.id);
                                            setEditingStudentId(null); // Cancel editing when switching classes
                                        }}
                                        className={`${selectedClassId === classroom.id ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                                    >
                                        {classroom.name}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-500">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Rango</th>
                                        <th scope="col" className="px-6 py-3">Estudiante</th>
                                        <th scope="col" className="px-6 py-3">XP Total</th>
                                        <th scope="col" className="px-6 py-3">Última Actividad</th>
                                        <th scope="col" className="px-6 py-3">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedClassStudents.map((student, index) => (
                                        <tr key={student.id} className="bg-white border-b hover:bg-slate-50">
                                            <td className="px-6 py-4 font-bold text-slate-900">{index + 1}</td>
                                            <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{student.name}</td>
                                            <td className="px-6 py-4 text-amber-600 font-bold">{student.xp}</td>
                                            <td className="px-6 py-4">{student.lastActivity}</td>
                                            <td className="px-6 py-4">
                                                {editingStudentId === student.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            value={student.classId}
                                                            onChange={(e) => handleClassChange(student.id, e.target.value)}
                                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                                                        >
                                                            {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                        </select>
                                                        <button onClick={() => setEditingStudentId(null)} className="text-slate-500 hover:text-slate-700">Cancelar</button>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => setEditingStudentId(student.id)} 
                                                        className="font-medium text-sky-600 hover:underline"
                                                    >
                                                        Cambiar Curso
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                     {selectedClassStudents.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="text-center py-8 text-slate-500">
                                                No hay estudiantes en esta clase.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SchoolDashboard;