import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../App";
import { AppContextType } from "../types";

const API = "http://127.0.0.1:8000/api";

const ManageChildren: React.FC = () => {
  const context = useContext(AppContext) as AppContextType;

  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Errores por hijo
  const [errors, setErrors] = useState<{ [id: number]: string }>({});

  // Estados internos por hijo
  const [passwordState, setPasswordState] = useState<{
    [id: number]: {
      hasChangedBefore: boolean;
      oldPassword: string;
      newPassword: string;
      showOld: boolean;
      showNew: boolean;
    };
  }>({});

  // --------------------------------------------------------
  // Cargar hijos
  // --------------------------------------------------------
  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      const res = await axios.get(`${API}/parent/children/`, {
        headers: { Authorization: `Bearer ${context.accessToken}` },
      });

      const initialState: any = {};
      res.data.forEach((child: any) => {
    initialState[child.id] = {
        hasChangedBefore: child.password_changed_once || false,
        oldPassword: "",
        newPassword: "",
        showOld: false,
        showNew: false,
    };
});


      setPasswordState(initialState);
      setChildren(res.data);
    } catch (err) {
      alert("No se pudo cargar la información.");
    }
    setLoading(false);
  };

  // --------------------------------------------------------
  // Validación completa de seguridad
  // --------------------------------------------------------
  const isSecurePassword = (pass: string) => {
  const hasMinLength = pass.length >= 8;
  const hasUppercase = /[A-Z]/.test(pass);
  const hasNumber = /[0-9]/.test(pass);

  // Nuevos símbolos permitidos extendidos
  const hasSymbol = /[!@#$%^&*?.\-_+=\/\\()[\]{};,:\|]/.test(pass);

  return hasMinLength && hasUppercase && hasNumber && hasSymbol;
};


  // --------------------------------------------------------
  // Actualizar hijo
  // --------------------------------------------------------
  const updateChild = async (child: any) => {
    const state = passwordState[child.id];

    // Validación de password
    if (state.newPassword && !isSecurePassword(state.newPassword)) {
      setErrors((prev) => ({
        ...prev,
        [child.id]:
          "La contraseña debe tener 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 símbolo.",
      }));
      return;
    }

    // Requerir contraseña antigua si ya cambió antes
    if (state.hasChangedBefore && !state.oldPassword) {
      setErrors((prev) => ({
        ...prev,
        [child.id]: "Debes ingresar la contraseña anterior.",
      }));
      return;
    }

    try {
      await axios.post(
        `${API}/parent/update-child/`,
        {
          child_id: child.id,
          new_username: child.new_username || child.username,
          new_password: state.newPassword || null,
          old_password: state.hasChangedBefore ? state.oldPassword : null,
        },
        { headers: { Authorization: `Bearer ${context.accessToken}` } }
      );

      // limpiar estado
      setPasswordState((prev) => ({
        ...prev,
        [child.id]: {
          ...prev[child.id],
          hasChangedBefore: true,
          oldPassword: "",
          newPassword: "",
        },
      }));

      setErrors((prev) => ({ ...prev, [child.id]: "" }));
      alert("Datos actualizados");
      loadChildren();
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        [child.id]: err.response?.data?.error || "Error al actualizar.",
      }));
    }
  };

  // --------------------------------------------------------
  // Crear hijo nuevo
  // --------------------------------------------------------
  const createChild = async () => {
    const username = prompt("Nombre de usuario del nuevo hijo:");
    if (!username) return;

    try {
      const res = await axios.post(
        `${API}/parent/create-child/`,
        { username, age: 10 },
        { headers: { Authorization: `Bearer ${context.accessToken}` } }
      );

      alert(
        `Hijo creado correctamente.
Usuario: ${res.data.child_username}
Contraseña: ${res.data.child_password}`
      );

      loadChildren();
    } catch (err: any) {
      alert(err.response?.data?.error || "Error al crear hijo");
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-3xl font-bold text-slate-800 text-center">
        👨‍👧 Gestión de Hijos
      </h2>

      <button
        onClick={createChild}
        className="px-4 py-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition"
      >
        ➕ Añadir hijo
      </button>

      {children.map((child) => {
        const state = passwordState[child.id];

        return (
          <div
            key={child.id}
            className="bg-white p-6 rounded-xl shadow-md space-y-3"
          >
            <h3 className="text-lg font-semibold text-slate-800">
              👦 Usuario actual: {child.username}
            </h3>

            {/* Username */}
            <div>
              <label className="text-sm text-slate-700">Nuevo nombre</label>
              <input
                className="w-full border p-2 rounded-md"
                defaultValue={child.username}
                onChange={(e) => (child.new_username = e.target.value)}
              />
            </div>

            {/* OLD PASSWORD (solo si ya cambió antes) */}
            {state.hasChangedBefore && (
              <div>
                <label className="text-sm text-slate-700">
                  Contraseña anterior
                </label>
                <div className="flex items-center border p-2 rounded-md">
                  <input
                    type={state.showOld ? "text" : "password"}
                    className="flex-1 outline-none"
                    value={state.oldPassword}
                    onChange={(e) =>
                      setPasswordState((prev) => ({
                        ...prev,
                        [child.id]: {
                          ...prev[child.id],
                          oldPassword: e.target.value,
                        },
                      }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setPasswordState((prev) => ({
                        ...prev,
                        [child.id]: {
                          ...prev[child.id],
                          showOld: !prev[child.id].showOld,
                        },
                      }))
                    }
                    className="ml-2 text-slate-600"
                  >
                    👁️
                  </button>
                </div>
              </div>
            )}

            {/* NEW PASSWORD */}
            <div>
              <label className="text-sm text-slate-700">
                Nueva contraseña
              </label>

              <div className="flex items-center border p-2 rounded-md">
                <input
                  type={state.showNew ? "text" : "password"}
                  className="flex-1 outline-none"
                  value={state.newPassword}
                  onChange={(e) =>
                    setPasswordState((prev) => ({
                      ...prev,
                      [child.id]: {
                        ...prev[child.id],
                        newPassword: e.target.value,
                      },
                    }))
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    setPasswordState((prev) => ({
                      ...prev,
                      [child.id]: {
                        ...prev[child.id],
                        showNew: !prev[child.id].showNew,
                      },
                    }))
                  }
                  className="ml-2 text-slate-600"
                >
                  👁️
                </button>
              </div>
            </div>

            {/* Errores */}
            {errors[child.id] && (
              <p className="text-red-500 text-sm">{errors[child.id]}</p>
            )}

            <button
              onClick={() => updateChild(child)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg"
            >
              Guardar cambios
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ManageChildren;
