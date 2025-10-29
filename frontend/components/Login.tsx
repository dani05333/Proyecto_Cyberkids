import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { AppContextType } from '../types';
import StudentLogin from './StudentLogin';

const Login: React.FC<{ setView: (view: AppContextType['view']) => void; initialTab?: 'student' | 'parent' | 'school'; }> = ({ setView, initialTab = 'student' }) => {
  const [activeTab, setActiveTab] = useState<'student' | 'parent' | 'school'>(initialTab);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <header className="text-center mb-8">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-800">
          Bienvenid@ a <span className="text-sky-500">CyberKids Chile</span>
        </h1>
        <p className="text-slate-600 text-lg mt-4 max-w-2xl">
          Tu aventura para convertirte en un Guardián Cibernético comienza aquí.
        </p>
      </header>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-6 border-b border-slate-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('student')}
              className={`${activeTab === 'student'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Soy Estudiante
            </button>
            <button
              onClick={() => setActiveTab('parent')}
              className={`${activeTab === 'parent'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Soy Apoderado
            </button>
            <button
              onClick={() => setActiveTab('school')}
              className={`${activeTab === 'school'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Soy del Colegio
            </button>
          </nav>
        </div>

        <div>
          {activeTab === 'student' && <StudentLogin setView={setView} />}
          {(activeTab === 'parent' || activeTab === 'school') && (
            <AdultLoginForm profileType={activeTab} />
          )}
        </div>
      </div>
    </div>
  );
};

// 🔹 FORMULARIO DE APODERADO / COLEGIO
const AdultLoginForm: React.FC<{ profileType: 'parent' | 'school' }> = ({ profileType }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');
  const context = useContext(AppContext) as AppContextType;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    let success = false;

    if (isRegistering) {
      const parsedAge = parseInt(age);
      if (isNaN(parsedAge) || parsedAge < 18) {
        setError('Debes ingresar una edad válida (mayor de 18 años).');
        return;
      }

      // 🔹 Registro
      success = await context.register(username, parsedAge, email, password, profileType);
      if (!success) {
        setError('No se pudo registrar. Verifica los datos o el correo.');
      }
    } else {
      // 🔹 Login (puede usar username o email)
      success = await context.login(username || email, password);
      if (!success) {
        setError('Usuario/correo o contraseña incorrectos.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-800 text-center">
        {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
      </h2>

      {isRegistering && (
        <AuthInput
          id="username"
          type="text"
          label="Nombre de Usuario"
          value={username}
          onChange={setUsername}
          required
        />
      )}

      {!isRegistering && (
        <AuthInput
          id="username"
          type="text"
          label="Nombre de Usuario"
          value={username}
          onChange={setUsername}
          required
        />
      )}

      {isRegistering && (
        <>
          <AuthInput
            id="email"
            type="email"
            label="Correo Electrónico"
            value={email}
            onChange={setEmail}
            required
          />
          <AuthInput
            id="age"
            type="number"
            label="Edad"
            value={age}
            onChange={setAge}
            required
          />
        </>
      )}

      <AuthInput
        id="password"
        type="password"
        label="Contraseña"
        value={password}
        onChange={setPassword}
        required
      />

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <button
        type="submit"
        className="w-full font-bold py-3 text-white bg-sky-500 rounded-full hover:bg-sky-600 transition"
      >
        {isRegistering ? 'Registrarse' : 'Ingresar'}
      </button>

      <p className="text-center text-sm">
        {isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
        <button
          type="button"
          onClick={() => setIsRegistering(!isRegistering)}
          className="font-semibold text-sky-600 hover:underline ml-1"
        >
          {isRegistering ? 'Inicia Sesión' : 'Regístrate'}
        </button>
      </p>
    </form>
  );
};

// 🔹 COMPONENTE DE INPUT REUTILIZABLE
const AuthInput: React.FC<{
  id: string;
  type: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
}> = ({ id, type, label, value, onChange, required }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-700">
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500"
    />
  </div>
);

export default Login;
