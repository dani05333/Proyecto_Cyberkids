import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../App";
import { AppContextType } from "../types";

const API = "http://127.0.0.1:8000/api";

interface Child {
  id: number;
  username: string;
  password_changed_once: boolean;
}

interface PasswordState {
  hasChangedBefore: boolean;
  oldPassword: string;
  newPassword: string;
  showOld: boolean;
  showNew: boolean;
}

const ManageChildren: React.FC = () => {
  const context = useContext(AppContext) as AppContextType;

  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  // Errores y mensajes por hijo
  const [errors, setErrors] = useState<{ [id: number]: string }>({});
  const [successMessages, setSuccessMessages] = useState<{
    [id: number]: string;
  }>({});

  // Estados internos por hijo (contraseñas, visibilidad)
  const [passwordState, setPasswordState] = useState<{
    [id: number]: PasswordState;
  }>({});

  // Para crear hijo nuevo (sin prompt)
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newChildUsername, setNewChildUsername] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Para mostrar estado mientras se archiva un alumno
  const [archivingId, setArchivingId] = useState<number | null>(null);

  // 👉 NUEVO: estado para el modal de confirmación
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    username: string;
  } | null>(null);

  // --------------------------------------------------------
  // Cargar hijos
  // --------------------------------------------------------
  useEffect(() => {
    loadChildren();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadChildren = async () => {
    setLoading(true);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      const res = await axios.get<Child[]>(`${API}/parent/children/`, {
        headers: { Authorization: `Bearer ${context.accessToken}` },
      });

      const list = res.data || [];
      setChildren(list);

      const initialState: { [id: number]: PasswordState } = {};
      list.forEach((child) => {
        initialState[child.id] = {
          hasChangedBefore: child.password_changed_once || false,
          oldPassword: "",
          newPassword: "",
          showOld: false,
          showNew: false,
        };
      });
      setPasswordState(initialState);
    } catch (err) {
      console.error("Error cargando hijos:", err);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------
  // Validación completa de seguridad
  // --------------------------------------------------------
  const isSecurePassword = (pass: string) => {
    const hasMinLength = pass.length >= 8;
    const hasUppercase = /[A-Z]/.test(pass);
    const hasLowercase = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSymbol = /[!@#$%^&*?.\-_+=\/\\()[\]{};,:\|]/.test(pass);

    return (
      hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSymbol
    );
  };

  // --------------------------------------------------------
  // Crear hijo nuevo (formulario dentro de la página)
  // --------------------------------------------------------
  const handleCreateChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);

    const username = newChildUsername.trim();
    if (!username) {
      setCreateError("El nombre de usuario es obligatorio.");
      return;
    }

    setCreating(true);

    try {
      const res = await axios.post(
        `${API}/parent/create-child/`,
        {
          username,
          // age: 10, // si el backend lo requiere, puedes dejar esto
        },
        { headers: { Authorization: `Bearer ${context.accessToken}` } }
      );

      setCreateSuccess(
        `Hijo creado correctamente. Usuario: ${res.data.child_username}, contraseña: ${res.data.child_password}`
      );

      setNewChildUsername("");
      setShowCreateForm(false);
      await loadChildren();
    } catch (err: any) {
      console.error("Error creando hijo:", err);
      setCreateError(
        err.response?.data?.error || "Error al crear hijo. Intenta nuevamente."
      );
    } finally {
      setCreating(false);
    }
  };

  // --------------------------------------------------------
  // Actualizar hijo (nombre + contraseña)
  // --------------------------------------------------------
  const updateChild = async (child: Child & { new_username?: string }) => {
    const state = passwordState[child.id];

    setErrors((prev) => ({ ...prev, [child.id]: "" }));
    setSuccessMessages((prev) => ({ ...prev, [child.id]: "" }));

    // Validación de password (solo si se quiere cambiar)
    if (state.newPassword && !isSecurePassword(state.newPassword)) {
      setErrors((prev) => ({
        ...prev,
        [child.id]:
          "La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 símbolo.",
      }));
      return;
    }

    // Requerir contraseña antigua si ya cambió antes
    if (state.hasChangedBefore && state.newPassword && !state.oldPassword) {
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
          old_password: state.hasChangedBefore ? state.oldPassword || null : null,
        },
        { headers: { Authorization: `Bearer ${context.accessToken}` } }
      );

      // limpiar estado de contraseñas para ese hijo
      setPasswordState((prev) => ({
        ...prev,
        [child.id]: {
          ...prev[child.id],
          hasChangedBefore: true, // ahora ya cambió al menos una vez
          oldPassword: "",
          newPassword: "",
        },
      }));

      setErrors((prev) => ({ ...prev, [child.id]: "" }));
      setSuccessMessages((prev) => ({
        ...prev,
        [child.id]: "Datos del alumno actualizados correctamente.",
      }));

      await loadChildren();
    } catch (err: any) {
      console.error("Error al actualizar hijo:", err);
      setErrors((prev) => ({
        ...prev,
        [child.id]: err.response?.data?.error || "Error al actualizar.",
      }));
    }
  };

  // --------------------------------------------------------
  // Archivar (soft delete) hijo  👉 SIN window.confirm
  // --------------------------------------------------------
  const archiveChild = async (childId: number) => {
    try {
      setArchivingId(childId);
      setErrors((prev) => ({ ...prev, [childId]: "" }));
      setSuccessMessages((prev) => ({ ...prev, [childId]: "" }));

      await axios.post(
        `${API}/parent/archive-child/`,
        { child_id: childId },
        { headers: { Authorization: `Bearer ${context.accessToken}` } }
      );

      setDeleteTarget(null); // cerrar modal
      await loadChildren();
    } catch (err: any) {
      console.error("Error archivando hijo:", err);
      setErrors((prev) => ({
        ...prev,
        [childId]:
          err.response?.data?.error ||
          "No se pudo eliminar el alumno. Intenta nuevamente.",
      }));
    } finally {
      setArchivingId(null);
    }
  };

  // --------------------------------------------------------
  // RENDER
  // --------------------------------------------------------
  if (loading && children.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600">
        Cargando alumnos...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado + botón crear hijo */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            👨‍👧 Gestión de Hijos
          </h2>
          <p className="text-sm text-slate-600">
            Cambia nombres de usuario y contraseñas de tus hijos desde aquí.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateForm((prev) => !prev)}
          className="px-4 py-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition text-sm font-semibold"
        >
          {showCreateForm ? "Cancelar" : "➕ Añadir hijo"}
        </button>
      </div>

      {/* Formulario de creación inline */}
      {showCreateForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <form
            onSubmit={handleCreateChild}
            className="flex flex-col md:flex-row gap-3 items-stretch md:items-end"
          >
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nombre de usuario del nuevo alumno
              </label>
              <input
                type="text"
                value={newChildUsername}
                onChange={(e) => setNewChildUsername(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-sm"
                placeholder="Ej: estudiante_martin"
                required
              />
            </div>

            <div className="md:w-auto">
              <button
                type="submit"
                disabled={creating}
                className="w-full md:w-auto px-4 py-2.5 rounded-full text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {creating ? "Creando..." : "Crear alumno"}
              </button>
            </div>
          </form>

          {createError && (
            <p className="mt-2 text-sm text-rose-600">{createError}</p>
          )}
          {createSuccess && (
            <p className="mt-2 text-sm text-emerald-700">{createSuccess}</p>
          )}

          <p className="mt-2 text-xs text-slate-500">
            La contraseña inicial generada aparecerá en el mensaje de
            confirmación. Luego podrás compartirla con tu hijo.
          </p>
        </div>
      )}

      {/* Lista de hijos */}
      {children.length === 0 && !loading && (
        <p className="text-sm text-slate-600">
          Aún no has creado alumnos. Usa el botón{" "}
          <span className="font-semibold">“Añadir hijo”</span> para crear el
          primero.
        </p>
      )}

      {children.map((child) => {
        const state = passwordState[child.id];

        if (!state) return null; // por seguridad

        const isArchiving = archivingId === child.id;

        return (
          <div
            key={child.id}
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Alumno
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {child.username}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Contraseña{" "}
                  {state.hasChangedBefore
                    ? "ya fue cambiada al menos una vez."
                    : "sigue siendo la contraseña inicial entregada al apoderado."}
                </p>
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nuevo nombre de usuario
              </label>
              <input
                className="w-full border border-slate-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                defaultValue={child.username}
                onChange={(e) => ((child as any).new_username = e.target.value)}
              />
            </div>

            {/* OLD PASSWORD (solo si ya cambió antes y va a cambiar de nuevo) */}
            {state.hasChangedBefore && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Contraseña anterior
                </label>
                <div className="flex items-center border border-slate-300 px-3 py-2 rounded-md bg-white">
                  <input
                    type={state.showOld ? "text" : "password"}
                    className="flex-1 outline-none text-sm"
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
                    placeholder="Obligatoria si vas a cambiar la contraseña"
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
                    className="ml-2 text-slate-600 text-sm"
                  >
                    {state.showOld ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
            )}

            {/* NEW PASSWORD */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nueva contraseña
              </label>
              <div className="flex items-center border border-slate-300 px-3 py-2 rounded-md bg-white">
                <input
                  type={state.showNew ? "text" : "password"}
                  className="flex-1 outline-none text-sm"
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
                  placeholder="Déjalo vacío si no quieres cambiarla"
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
                  className="ml-2 text-slate-600 text-sm"
                >
                  {state.showNew ? "🙈" : "👁️"}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Debe tener al menos 8 caracteres, una mayúscula, una minúscula,
                un número y un símbolo.
              </p>
            </div>

            {/* Errores / éxito */}
            {errors[child.id] && (
              <p className="text-sm text-rose-600">{errors[child.id]}</p>
            )}
            {successMessages[child.id] && (
              <p className="text-sm text-emerald-700">
                {successMessages[child.id]}
              </p>
            )}

            <div className="pt-1 flex flex-wrap gap-3">
              <button
                onClick={() => updateChild(child)}
                className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-emerald-600 transition"
              >
                Guardar cambios
              </button>

              <button
                type="button"
                disabled={isArchiving}
                onClick={() =>
                  setDeleteTarget({ id: child.id, username: child.username })
                }
                className="px-4 py-2 rounded-full text-sm font-semibold border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {isArchiving ? "Eliminando..." : "Eliminar alumno"}
              </button>
            </div>
          </div>
        );
      })}

      {/* 👉 MODAL DE CONFIRMACIÓN DE ELIMINAR ALUMNO */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              Eliminar alumno
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              ¿Seguro que deseas eliminar al alumno{" "}
              <span className="font-semibold">
                “{deleteTarget.username}”
              </span>
              ?
            </p>
            <p className="text-xs text-slate-500 mb-4">
              El alumno ya no podrá iniciar sesión y desaparecerá de tu panel.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3 py-2 rounded-full text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={archivingId === deleteTarget.id}
                onClick={() => archiveChild(deleteTarget.id)}
                className="px-3 py-2 rounded-full text-sm font-semibold bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {archivingId === deleteTarget.id
                  ? "Eliminando..."
                  : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageChildren;
