import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../App";
import { AppContextType, AgeGroup } from "../types";

const API = "http://127.0.0.1:8000/api";

/* -------------------------------------------------------------------------- */
/*                  Diccionario: ID de lección → nombre amigable              */
/* -------------------------------------------------------------------------- */

const LESSON_LABELS: Record<string, string> = {
  // ⚠️ CAMBIA ESTOS NOMBRES POR LOS REALES DE TU PROYECTO
  "kid-l1-1": "Nivel 1 · Juego 1",
  "kid-l1-2": "Nivel 1 · Juego 2",
  "kid-l2-1": "Nivel 2 · Juego 1",
  "kid-l2-2": "Nivel 2 · Juego 2",
  "tween-l1-1": "Preadolescente · Juego 1",
  "tween-l1-2": "Preadolescente · Juego 2",
  "teen-l1-1": "Adolescente · Juego 1",
};

const getLessonLabel = (lessonId: string): string => {
  return LESSON_LABELS[lessonId] || lessonId;
};

/* -------------------------------------------------------------------------- */
/*                     Helper para encabezados de autenticación               */
/* -------------------------------------------------------------------------- */

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/* -------------------------------------------------------------------------- */
/*                                  Tipos                                     */
/* -------------------------------------------------------------------------- */

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: "student" | "parent" | "teacher" | "admin";
  age?: number | null;
  age_group?: AgeGroup | null;
  linked_student_username?: string | null;
  is_archived?: boolean;
  date_joined?: string;
  last_login?: string | null;
}

type AdminSection = "users" | "stats" | "settings";

interface LessonErrorItem {
  lesson_id: string;
  times_played: number;
  average_score: number; // 0–1
  average_time: number; // segundos
  error_rate: number; // 0–100
  total_xp: number;
}

interface AdminReportOverview {
  total_students: number;
  archived_students: number;
  total_lessons_completed: number;
  average_score: number; // 0–1
  average_time: number; // segundos
  per_lessons: LessonErrorItem[];
  top_lessons_by_errors: LessonErrorItem[];
  // también viene top_students, pero no lo usamos aquí
}

/* -------------------------------------------------------------------------- */
/*                              Componente principal                          */
/* -------------------------------------------------------------------------- */

const AdminDashboard: React.FC = () => {
  const context = useContext(AppContext) as AppContextType;
  const { loggedInAccount, user, logout } = context;

  const displayName =
    loggedInAccount?.name ||
    (user as any)?.name ||
    (user as any)?.username ||
    "Administrador";
  const displayEmail = loggedInAccount?.email || (user as any)?.email || "";

  const [activeSection, setActiveSection] = useState<AdminSection>("users");

  // ----------- Usuarios / CRUD -----------
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [roleFilter, setRoleFilter] = useState<
    "all" | "student" | "parent" | "teacher" | "admin"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<AdminUser["role"]>("student");
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // ----------- Reportes / estadísticas -----------
  const [reportOverview, setReportOverview] = useState<AdminReportOverview | null>(
    null
  );
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  /* -------------------------------------------------------------------------- */
  /*                           Cargar usuarios (CRUD)                           */
  /* -------------------------------------------------------------------------- */

  const fetchUsers = async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const res = await axios.get(`${API}/admin/users/`, {
        params: {
          page,
          page_size: pageSize,
          only_active: "false",
        },
        headers: getAuthHeaders(),
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

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      u.username.toLowerCase().includes(term) ||
      (u.email && u.email.toLowerCase().includes(term))
    );
  });

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
    setFormPassword("");
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
        await axios.post(
          `${API}/admin/users/`,
          {
            username: formUsername,
            password: formPassword,
            role: formRole,
          },
          {
            headers: getAuthHeaders(),
          }
        );
      } else if (editingUser) {
        const body: any = {
          username: formUsername,
          role: formRole,
        };
        if (formPassword.trim()) {
          body.password = formPassword;
        }

        await axios.patch(`${API}/admin/users/${editingUser.id}/`, body, {
          headers: getAuthHeaders(),
        });
      }

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
      await axios.patch(
        `${API}/admin/users/${u.id}/`,
        {
          is_archived: !u.is_archived,
        },
        {
          headers: getAuthHeaders(),
        }
      );
      fetchUsers();
    } catch (err) {
      console.error("Error al archivar/activar usuario:", err);
      alert("No se pudo actualizar el estado del usuario.");
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                      Reportes / estadísticas para admin                    */
  /* -------------------------------------------------------------------------- */

  const fetchReportOverview = async () => {
    setReportLoading(true);
    setReportError(null);

    try {
      const res = await axios.get<AdminReportOverview>(
        `${API}/admin/report/overview/`,
        {
          headers: getAuthHeaders(),
        }
      );
      setReportOverview(res.data);
    } catch (err) {
      console.error("Error cargando resumen de reportes:", err);
      setReportError(
        "No se pudieron cargar las estadísticas. Intenta nuevamente más tarde."
      );
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === "stats" && !reportOverview && !reportLoading) {
      fetchReportOverview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  /* -------------------------------------------------------------------------- */
  /*             Exportar reporte desde el FRONT (sin endpoint)                */
  /* -------------------------------------------------------------------------- */

  /** Exporta el resumen y los juegos a un CSV que Excel puede abrir. */
  const exportReportToCSV = () => {
    if (!reportOverview) {
      alert("Primero carga las estadísticas antes de exportar.");
      return;
    }

    const activeStudents =
      reportOverview.total_students - reportOverview.archived_students;

    let lines: string[] = [];

    // Resumen
    lines.push("Sección;Campo;Valor");
    lines.push(`Resumen;Alumnos activos;${activeStudents}`);
    lines.push(`Resumen;Alumnos archivados;${reportOverview.archived_students}`);
    lines.push(
      `Resumen;Lecciones completadas;${reportOverview.total_lessons_completed}`
    );
    lines.push(
      `Resumen;Puntaje promedio global;${(
        reportOverview.average_score * 100
      ).toFixed(1)}%`
    );
    lines.push(
      `Resumen;Tiempo promedio global (s);${reportOverview.average_time.toFixed(
        1
      )}`
    );

    lines.push(""); // línea en blanco

    // Juegos
    lines.push(
      "Juegos;Juego;Lesson ID;Veces jugado;Puntaje promedio;Tiempo promedio (s);% intentos con error;XP total"
    );
    reportOverview.per_lessons.forEach((l) => {
      lines.push(
        [
          "Juego",
          getLessonLabel(l.lesson_id),
          l.lesson_id,
          l.times_played,
          (l.average_score * 100).toFixed(1) + "%",
          l.average_time.toFixed(1),
          l.error_rate.toFixed(1) + "%",
          l.total_xp,
        ].join(";")
      );
    });

    const csvContent = lines.join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "reporte_cyberkids.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  /**
   * Genera una página imprimible con el resumen.
   * El usuario puede elegir "Guardar como PDF" en el diálogo de impresión.
   */
  const exportReportToPDF = () => {
    if (!reportOverview) {
      alert("Primero carga las estadísticas antes de exportar.");
      return;
    }

    const activeStudents =
      reportOverview.total_students - reportOverview.archived_students;

    const win = window.open("", "_blank");
    if (!win) {
      alert("No se pudo abrir la ventana de impresión.");
      return;
    }

    const html = `
      <html>
        <head>
          <title>Reporte CyberKids</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { font-size: 22px; margin-bottom: 10px; }
            h2 { font-size: 16px; margin-top: 20px; margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th, td { border: 1px solid #ccc; padding: 6px 8px; font-size: 12px; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>Reporte CyberKids - Resumen</h1>

          <h2>Resumen general</h2>
          <table>
            <tr><th>Campo</th><th>Valor</th></tr>
            <tr><td>Alumnos activos</td><td>${activeStudents}</td></tr>
            <tr><td>Alumnos archivados</td><td>${
              reportOverview.archived_students
            }</td></tr>
            <tr><td>Lecciones completadas</td><td>${
              reportOverview.total_lessons_completed
            }</td></tr>
            <tr><td>Puntaje promedio global</td><td>${(
              reportOverview.average_score * 100
            ).toFixed(1)}%</td></tr>
            <tr><td>Tiempo promedio global (s)</td><td>${reportOverview.average_time.toFixed(
              1
            )}</td></tr>
          </table>

          <h2>Juegos y tasa de error</h2>
          <table>
            <tr>
              <th>Juego</th>
              <th>Lesson ID</th>
              <th>Veces jugado</th>
              <th>Puntaje promedio</th>
              <th>Tiempo promedio (s)</th>
              <th>% intentos con error</th>
              <th>XP total</th>
            </tr>
            ${reportOverview.per_lessons
              .map(
                (l) => `
              <tr>
                <td>${getLessonLabel(l.lesson_id)}</td>
                <td>${l.lesson_id}</td>
                <td>${l.times_played}</td>
                <td>${(l.average_score * 100).toFixed(1)}%</td>
                <td>${l.average_time.toFixed(1)}</td>
                <td>${l.error_rate.toFixed(1)}%</td>
                <td>${l.total_xp}</td>
              </tr>
            `
              )
              .join("")}
          </table>

          <p style="margin-top: 24px; font-size: 11px; color: #6b7280;">
            Generado desde el panel de administración de CyberKids Chile.
          </p>
        </body>
      </html>
    `;

    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };

  /* -------------------------------------------------------------------------- */
  /*                        Render sección: Usuarios (CRUD)                     */
  /* -------------------------------------------------------------------------- */

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
                <option value="teacher">Colegios / Docentes</option>
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
                  <option value="teacher">Docente / Colegio</option>
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

  /* -------------------------------------------------------------------------- */
  /*                        Render sección: Estadísticas                        */
  /* -------------------------------------------------------------------------- */

  const renderStatsSection = () => {
    const activeStudents =
      reportOverview && reportOverview.archived_students !== undefined
        ? reportOverview.total_students - reportOverview.archived_students
        : 0;

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Estadísticas y reportes
            </h2>
            <p className="text-sm text-slate-600">
              Revisa el avance general y descarga reportes para compartir con la
              institución o apoderados.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={exportReportToCSV}
              className="inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600"
            >
              Descargar Excel (CSV)
            </button>
            <button
              type="button"
              onClick={exportReportToPDF}
              className="inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold bg-rose-500 text-white hover:bg-rose-600"
            >
              Descargar PDF
            </button>
          </div>
        </div>

        {reportLoading && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600">
            Cargando estadísticas...
          </div>
        )}

        {reportError && !reportLoading && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-700">
            {reportError}
          </div>
        )}

        {!reportLoading && !reportError && reportOverview && (
          <>
            {/* Tarjetas principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Estudiantes
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {reportOverview.total_students}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Activos:{" "}
                  <span className="font-semibold text-emerald-600">
                    {activeStudents}
                  </span>{" "}
                  · Archivados:{" "}
                  <span className="font-semibold text-slate-500">
                    {reportOverview.archived_students}
                  </span>
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Usuarios totales
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {total}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Total de cuentas registradas en la plataforma.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Progreso en lecciones
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {reportOverview.total_lessons_completed}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Puntaje promedio:{" "}
                  <span className="font-semibold text-sky-600">
                    {`${Math.round(reportOverview.average_score * 100)}%`}
                  </span>
                </p>
              </div>
            </div>

            {/* “Gráfico” simple de score promedio */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-700 mb-3">
                Puntaje promedio global
              </p>
              <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                <div
                  className="h-4 rounded-full bg-sky-500 transition-all"
                  style={{
                    width: `${
                      Math.max(
                        5,
                        Math.min(100, reportOverview.average_score * 100)
                      )
                    }%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Representa el desempeño promedio de los estudiantes en los
                juegos y actividades.
              </p>
            </div>

            {/* Tabla / gráfico simple de juegos con más errores */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-700 mb-3">
                Juegos con más dificultades (bajo puntaje promedio)
              </p>

              {(!reportOverview.top_lessons_by_errors ||
                reportOverview.top_lessons_by_errors.length === 0) && (
                <p className="text-sm text-slate-500">
                  Aún no hay suficiente información para este reporte.
                </p>
              )}

              {reportOverview.top_lessons_by_errors &&
                reportOverview.top_lessons_by_errors.length > 0 && (
                  <div className="space-y-3">
                    {reportOverview.top_lessons_by_errors.map((item) => {
                      const errorRate = 1 - item.average_score; // 0–1
                      const width = Math.max(
                        10,
                        Math.min(100, errorRate * 100)
                      );
                      return (
                        <div key={item.lesson_id}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-semibold text-slate-700">
                              {getLessonLabel(item.lesson_id)}
                            </span>
                            <span className="text-slate-500">
                              Puntaje:{" "}
                              {Math.round(item.average_score * 100)}
                              % · Intentos: {item.times_played}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                            <div
                              className="h-3 rounded-full bg-rose-400"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
            </div>
          </>
        )}
      </div>
    );
  };

  /* -------------------------------------------------------------------------- */
  /*                        Render principal: switch secciones                  */
  /* -------------------------------------------------------------------------- */

  const renderContent = () => {
    switch (activeSection) {
      case "users":
        return renderUsersSection();
      case "stats":
        return renderStatsSection();
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

  /* -------------------------------------------------------------------------- */
  /*                            Layout general                                  */
  /* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                             Componentes auxiliares                          */
/* -------------------------------------------------------------------------- */

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
