import React, { useState, useContext } from "react";
import { AppContext } from "../App";
import { AppContextType } from "../types";
import StudentLogin from "./StudentLogin";
import VerifyEmail from "./VerifyEmail";

const Login: React.FC<{
  setView: (view: AppContextType["view"]) => void;
  initialTab?: "student" | "parent" | "school" | "admin";
}> = ({ setView, initialTab = "student" }) => {
  const [activeTab, setActiveTab] = useState<
    "student" | "parent" | "school" | "admin"
  >(initialTab);

  // pantalla de verificación
  const [needsVerify, setNeedsVerify] = useState(false);
  const [emailToVerify, setEmailToVerify] = useState("");

  if (needsVerify) {
    return (
      <VerifyEmail
        email={emailToVerify}
        onVerified={() => {
          setNeedsVerify(false);
          alert("Correo verificado correctamente. Ahora puedes iniciar sesión.");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <header className="text-center mb-8">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-800">
          Bienvenid@ a <span className="text-sky-500">CyberKids Chile</span>
        </h1>
        <p className="text-slate-600 text-lg mt-4 max-w-2xl mx-auto">
          Tu aventura para convertirte en un Guardián Cibernético comienza aquí.
        </p>
      </header>

      {/* TARJETA PRINCIPAL */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        {/* TABS */}
        <div className="mb-6 border-b border-slate-200">
          <nav
            className="-mb-px flex justify-center space-x-4"
            aria-label="Tabs"
          >
            <Tab
              label="Soy Estudiante"
              active={activeTab === "student"}
              onClick={() => setActiveTab("student")}
            />
            <Tab
              label="Soy Apoderado"
              active={activeTab === "parent"}
              onClick={() => setActiveTab("parent")}
            />
            <Tab
              label="Soy del Colegio"
              active={activeTab === "school"}
              onClick={() => setActiveTab("school")}
            />
            <Tab
              label="Soy Administrador"
              active={activeTab === "admin"}
              onClick={() => setActiveTab("admin")}
            />
          </nav>
        </div>

        {/* VISTAS */}
        <div className="max-w-md mx-auto">
          {activeTab === "student" && <StudentLogin setView={setView} />}

          {(activeTab === "parent" ||
            activeTab === "school" ||
            activeTab === "admin") && (
            <AdultLoginForm
              profileType={activeTab}
              setNeedsVerify={setNeedsVerify}
              setEmailToVerify={setEmailToVerify}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------
// 🔹 TAB BUTTON REUTILIZABLE
// -----------------------------------------------------------------
const Tab: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`${
      active
        ? "border-sky-500 text-sky-600"
        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
    } whitespace-nowrap py-4 px-2 border-b-2 font-medium text-sm`}
  >
    {label}
  </button>
);

// -----------------------------------------------------------------
// 🔹 FORMULARIO ADULTOS (apoderado, colegio, admin)
// -----------------------------------------------------------------
const AdultLoginForm: React.FC<{
  profileType: "parent" | "school" | "admin";
  setNeedsVerify: (v: boolean) => void;
  setEmailToVerify: (v: string) => void;
}> = ({ profileType, setNeedsVerify, setEmailToVerify }) => {
  const context = useContext(AppContext) as AppContextType;

  // si es admin → NO puede registrarse
  const isAdmin = profileType === "admin";

  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isSecurePassword = (pass: string) => {
    const hasMinLength = pass.length >= 8;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSymbol = /[!@#$%^&*?.\-_+=\/\\()[\]{};,:\|]/.test(pass);
    return hasMinLength && hasUpper && hasLower && hasNumber && hasSymbol;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // REGISTRO (solo parent y school)
    if (isRegistering && !isAdmin) {
      const parsedAge = parseInt(age);

      if (isNaN(parsedAge) || parsedAge < 18) {
        setError("Debes ingresar una edad válida (mayor de 18 años).");
        return;
      }

      if (!isSecurePassword(password)) {
        setError(
          "La contraseña debe tener 8 caracteres, con mayúscula, minúscula, número y símbolo."
        );
        return;
      }

      const registered = await context.register(
        username,
        parsedAge,
        email,
        password,
        profileType
      );

      if (!registered.success) {
        setError(registered.error || "No se pudo registrar.");
        return;
      }

      setNeedsVerify(true);
      setEmailToVerify(email);
      return;
    }

    // LOGIN (enviando el rol esperado)
    const success = await context.login(
      username || email,
      password,
      profileType
    );

    if (!success) {
      if (context.lastError?.includes("Debes verificar tu correo")) {
        setNeedsVerify(true);
        setEmailToVerify(email || username);
        return;
      }
      setError("Usuario/correo o contraseña incorrectos.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-800 text-center">
        {isRegistering ? "Crear Cuenta" : "Iniciar Sesión"}
      </h2>

      <AuthInput
        id="username"
        type="text"
        label="Nombre de Usuario"
        value={username}
        onChange={setUsername}
        required
      />

      {/* Campos solo para registro (NO admin) */}
      {isRegistering && !isAdmin && (
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

      <PasswordInput
        id="password"
        label="Contraseña"
        value={password}
        onChange={setPassword}
        show={showPassword}
        setShow={setShowPassword}
      />

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <button
        type="submit"
        className="w-full font-bold py-3 text-white bg-sky-500 rounded-full hover:bg-sky-600 transition"
      >
        {isRegistering ? "Registrarse" : "Ingresar"}
      </button>

      {/* SI ES ADMIN NO SE MUESTRA EL BOTÓN DE REGISTRO */}
      {!isAdmin && (
        <p className="text-center text-sm">
          {isRegistering ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="font-semibold text-sky-600 hover:underline ml-1"
          >
            {isRegistering ? "Inicia Sesión" : "Regístrate"}
          </button>
        </p>
      )}
    </form>
  );
};

// --------------------------------------------------------
// INPUT REUTILIZABLE
// --------------------------------------------------------
const AuthInput: React.FC<any> = ({
  id,
  type,
  label,
  value,
  onChange,
  required,
}) => (
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

// --------------------------------------------------------
// INPUT PASSWORD
// --------------------------------------------------------
const PasswordInput: React.FC<any> = ({
  id,
  label,
  value,
  onChange,
  show,
  setShow,
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-700">
      {label}
    </label>

    <div className="flex items-center border px-3 py-2 rounded-md bg-white">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 outline-none"
        required
      />

      <button
        type="button"
        onClick={() => setShow(!show)}
        className="ml-2 text-slate-600 hover:text-slate-800"
      >
        {show ? "🙈" : "👁️"}
      </button>
    </div>
  </div>
);

export default Login;
