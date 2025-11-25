import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../App";
import { AppContextType, AgeGroup } from "../types";

const API = "http://127.0.0.1:8000/api";

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: "student" | "parent" | "school" | "admin" | "teacher"; // por si el backend usa "teacher"
  age?: number | null;
  age_group?: AgeGroup | null;
  linked_student_username?: string | null;
  is_archived?: boolean;
  date_joined?: string;
  last_login?: string | null;
}

type AdminSection = "users" | "stats" | "settings";

const AdminDashboard: React.FC = () => {
  const context = useContext(AppContext) as AppContextType;
  const { loggedInAccount, user, logout } = context;

  const displayName =
    loggedInAccount?.name || user?.name || user?.username || "Administrador";
  const displayEmail = loggedInAccount?.email || user?.email || "";

  const [activeSection, setActiveSection] = useState<AdminSection>("users");

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // filtros
  const [roleFilter, setRoleFilter] = useState<
    "all" | "student" | "parent" | "school" | "admin" | "teacher"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");

  // paginación
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // ---------- estado para CRUD ----------
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<AdminUser["role"]>("student");
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // ----------------- Cargar usuarios -----------------
  const fetchUsers = async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const res = await axios.get(`${API}/admin/users/`, {
        params: {
          page,
          page_size: pageSize,
          // siempre pedimos TODOS (archivados y activos)
          only_active: "false",
        },
      });

      const { results, total: totalCount } = res.data;
      setUsers(results || []);
      setTotal(totalCount ?? 0);
    } catch (err) {
      console.error("Error cargando usuarios para admin:", err);
      setLoadError(
        "No se pudo cargar la lista de usuarios. Intenta nuevamente más tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // ----------------- Filtro local por rol/busqueda -----------------
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      u.username.toLowerCase().includes(term) ||
      (u.email && u.email.toLowerCase().includes(term))
    );
  });

  // ---------- helpers CRUD ----------
  const resetForm = () => {
    setFormUsername("");
    setFormPassword("");
    setFormRole("student");
    setFormError(null);
    setEditingUser(null);
  };

  const openCreateForm = () => {
    setFormMode("create");
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (user: AdminUser) => {
    setFormMode("edit");
    setEditingUser(user);
    setFormUsername(user.username);
    setFormPassword(""); // contraseña vacía: solo se cambia si se escribe
    setFormRole(user.role);
    setFormError(null);
    setShowForm(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      if (formMode === "create") {
        // CREATE: POST /api/admin/users/
        await axios.post(`${API}/admin/users/`, {
          username: formUsername,
          password: formPassword,
          role: formRole,
        });
      } else if (editingUser) {
        // EDIT: PATCH /api/admin/users/<id>/
        const body: any = {
          username: formUsername,
          role: formRole,
        };
        if (formPassword.trim()) {
          body.password = formPassword;
        }

        await axios.patch(`${API}/admin/users/${editingUser.id}/`, body);
      }

      // recargar lista
      await fetchUsers();
      setShowForm(false);
      resetForm();
    } catch (err: any) {
      console.error("Error guardando usuario:", err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "No se pudo guardar el usuario.";
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const toggleArchive = async (u: AdminUser) => {
    try {
      await axios.patch(`${API}/admin/users/${u.id}/`, {
        is_archived: !u.is_archived,
      });
      fetchUsers();
    } catch (err) {
      console.error("Error al archivar/activar usuario:", err);
      alert("No se pudo actualizar el estado del usuario.");
    }
  };

  // ----------------- Render sección Usuarios -----------------
  const renderUsersSection = () => {
    return (
      <div className="space-y-6">
        {/* Encabezado + filtros */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Gestión de usuarios
            </h2>
            <p className="text-sm text-slate-600">
              Revisa, crea y administra todas las cuentas de CyberKids Chile.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-3 md:items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Rol
              </label>
              <select
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(e.target.value as typeof roleFilter)
                }
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 bg-white"
              >
                <option value="all">Todos</option>
                <option value="student">Estudiantes</option>
                <option value="parent">Apoderados</option>
                <option value="school">Colegios / Docentes</option>
                <option value="admin">Administradores</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Buscar
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por usuario o correo..."
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 bg-white"
              />
            </div>

            <button
              type="button"
              onClick={openCreateForm}
              className="mt-2 md:mt-0 inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold bg-sky-500 text-white hover:bg-sky-600 transition"
            >
              + Nuevo usuario
            </button>
          </div>
        </div>

        {/* Formulario crear/editar */}
        {showForm && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              {formMode === "create"
                ? "Crear nuevo usuario"
                : `Editar usuario: ${editingUser?.username}`}
            </h3>

            <form
              onSubmit={handleSubmitForm}
              className="flex flex-col md:flex-row gap-3 md:items-end"
            >
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 bg-white"
                />
              </div>

              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Rol
                </label>
                <select
                  value={formRole}
                  onChange={(e) =>
                    setFormRole(e.target.value as AdminUser["role"])
                  }
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 bg-white"
                >
                  <option value="student">Estudiante</option>
                  <option value="parent">Apoderado</option>
                  <option value="school">Docente / Colegio</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder={
                    formMode === "edit"
                      ? "Deja en blanco para no cambiarla"
                      : ""
                  }
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 bg-white"
                  required={formMode === "create"}
                />
              </div>

              <div className="flex gap-2 mt-2 md:mt-0">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 rounded-full text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-60"
                >
                  {formMode === "create" ? "Crear" : "Guardar"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-full text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
              </div>
            </form>

            {formError && (
              <p className="text-xs text-rose-600 mt-2">{formError}</p>
            )}
          </div>
        )}

        {/* Estado de carga / error */}
        {loading && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600">
            Cargando usuarios...
          </div>
        )}

        {loadError && !loading && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-700">
            {loadError}
          </div>
        )}

        {!loading && !loadError && (
          <>
            {filteredUsers.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-sm text-slate-600 text-center">
                No se encontraron usuarios con los filtros actuales.
              </div>
            ) : (
              <>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-sm">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Usuario
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Rol
                        </th>
                        {/* Columna de correo eliminada */}
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Grupo etario
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Edad
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Vinculado a
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Estado
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u, idx) => (
                        <tr
                          key={u.id}
                          className={
                            idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                          }
                        >
                          <td className="px-4 py-3 align-top">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-800">
                                {u.username}
                              </span>
                              {u.date_joined && (
                                <span className="text-[11px] text-slate-500">
                                  Alta:{" "}
                                  {new Date(
                                    u.date_joined
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <RoleBadge role={u.role} />
                          </td>
                          {/* Celda de correo eliminada */}
                          <td className="px-4 py-3 align-top">
                            <AgeGroupLabel ageGroup={u.age_group || null} />
                          </td>
                          <td className="px-4 py-3 align-top">
                            {u.age ?? "—"}
                          </td>
                          <td className="px-4 py-3 align-top">
                            {u.linked_student_username ? (
                              <span className="text-xs text-slate-700">
                                {u.linked_student_username}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 align-top">
                            {u.is_archived ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                                Archivado
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border-emerald-200">
                                Activo
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="flex flex-col gap-1 text-xs">
                              <button
                                type="button"
                                onClick={() => openEditForm(u)}
                                className="px-2 py-1 rounded-full border border-sky-300 text-sky-700 hover:bg-sky-50"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleArchive(u)}
                                className={`px-2 py-1 rounded-full border ${
                                  u.is_archived
                                    ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                    : "border-rose-300 text-rose-700 hover:bg-rose-50"
                                }`}
                              >
                                {u.is_archived ? "Activar" : "Archivar"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                <div className="flex items-center justify-between mt-4 text-xs text-slate-600">
                  <span>
                    Página {page} de {totalPages} · {total} usuarios
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1 rounded-full border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      className="px-3 py-1 rounded-full border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    );
  };

  // ----------------- Render principal -----------------
  const renderContent = () => {
    switch (activeSection) {
      case "users":
        return renderUsersSection();
      case "stats":
        return (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Estadísticas (próximamente)
            </h2>
            <p className="text-slate-600">
              Aquí podrás ver métricas de uso de la plataforma, ranking global,
              instituciones, etc.
            </p>
          </div>
        );
      case "settings":
        return (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Configuración (próximamente)
            </h2>
            <p className="text-slate-600">
              Podrás ajustar parámetros globales de la plataforma.
            </p>
          </div>
        );
      default:
        return renderUsersSection();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* NAVBAR SUPERIOR */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500 flex items-center justify-center text-2xl">
              🛡️
            </div>
          <div>
              <h1 className="text-lg md:text-xl font-extrabold text-slate-800">
                Panel del Administrador
              </h1>
              <p className="text-xs text-slate-500">
                CyberKids Chile · Control global de usuarios
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-800">
                {displayName}
              </span>
              {displayEmail && (
                <span className="text-xs text-slate-500">{displayEmail}</span>
              )}
            </div>

            <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* LAYOUT PRINCIPAL */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 flex gap-6">
        {/* SIDEBAR */}
        <aside className="w-56 bg-white rounded-2xl shadow-md p-4 flex flex-col">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Menú
          </p>

          <SidebarButton
            label="Usuarios"
            icon="👥"
            active={activeSection === "users"}
            onClick={() => setActiveSection("users")}
          />
          <SidebarButton
            label="Estadísticas"
            icon="📊"
            active={activeSection === "stats"}
            onClick={() => setActiveSection("stats")}
            disabled
          />
          <SidebarButton
            label="Configuración"
            icon="⚙️"
            active={activeSection === "settings"}
            onClick={() => setActiveSection("settings")}
            disabled
          />

          <div className="mt-auto pt-4 border-t border-slate-100">
            <button
              onClick={logout}
              className="w-full py-2.5 text-sm font-semibold bg-slate-500 text-white rounded-full hover:bg-slate-600 transition"
            >
              Cerrar sesión
            </button>
          </div>
        </aside>

        {/* CONTENIDO */}
        <main className="flex-1 bg-white rounded-2xl shadow-md p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// Sidebar button
interface SidebarButtonProps {
  label: string;
  icon?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({
  label,
  icon,
  active = false,
  disabled = false,
  onClick,
}) => {
  const base =
    "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition";
  const activeCls = "bg-sky-500 text-white shadow-sm hover:bg-sky-600";
  const inactiveCls =
    "text-slate-700 hover:bg-slate-50 border border-transparent";
  const disabledCls =
    "text-slate-400 cursor-not-allowed bg-slate-50 border border-slate-100";

  let classes = base;
  if (disabled) classes += " " + disabledCls;
  else if (active) classes += " " + activeCls;
  else classes += " " + inactiveCls;

  return (
    <button
      type="button"
      className={classes}
      onClick={disabled ? undefined : onClick}
    >
      {icon && <span className="text-base">{icon}</span>}
      <span>{label}</span>
    </button>
  );
};

// Badges helpers
const RoleBadge: React.FC<{ role: AdminUser["role"] }> = ({ role }) => {
  let label = "";
  let classes = "";

  switch (role) {
    case "student":
      label = "Estudiante";
      classes = "bg-sky-50 text-sky-700 border-sky-200";
      break;
    case "parent":
      label = "Apoderado";
      classes = "bg-emerald-50 text-emerald-700 border-emerald-200";
      break;
    case "school":
    case "teacher":
      label = "Docente / Colegio";
      classes = "bg-amber-50 text-amber-700 border-amber-200";
      break;
    case "admin":
      label = "Admin";
      classes = "bg-rose-50 text-rose-700 border-rose-200";
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${classes}`}
    >
      {label}
    </span>
  );
};

const AgeGroupLabel: React.FC<{ ageGroup: AgeGroup | null }> = ({
  ageGroup,
}) => {
  if (!ageGroup) {
    return <span className="text-xs text-slate-400">Sin definir</span>;
  }

  let text = "";
  switch (ageGroup) {
    case AgeGroup.KID:
      text = "Niño (6–9)";
      break;
    case AgeGroup.TWEEN:
      text = "Preadolescente (10–12)";
      break;
    case AgeGroup.TEEN:
      text = "Adolescente (13–16)";
      break;
  }

  return <span className="text-xs text-slate-700">{text}</span>;
};

export default AdminDashboard;
