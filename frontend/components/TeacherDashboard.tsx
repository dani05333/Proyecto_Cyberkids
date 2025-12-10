// src/components/TeacherDashboard.tsx

import React, {
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import axios from "axios";
import { AppContext } from "../App";
import {
  AppContextType,
  TeacherCourse,
  TeacherStudentProgress,
} from "../types";

const API = "http://127.0.0.1:8000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

interface CourseDetailResponse {
  id: number;
  name: string;
  grade?: string | null;
  students: TeacherStudentProgress[];
}

const TeacherDashboard: React.FC = () => {
  const appCtx = useContext(AppContext) as AppContextType | null;

  if (!appCtx) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-600 text-sm">Cargando panel...</p>
      </div>
    );
  }

  const { user, logout } = appCtx;

  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [courseDetail, setCourseDetail] = useState<CourseDetailResponse | null>(
    null
  );

  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // formulario para agregar alumno
  const [newStudentUsername, setNewStudentUsername] = useState("");
  const [newStudentAge, setNewStudentAge] = useState("");
  const [createdStudentInfo, setCreatedStudentInfo] = useState<string | null>(
    null
  );

  // formulario para crear curso
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseGrade, setNewCourseGrade] = useState("");

  // edición de curso seleccionado
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [editCourseName, setEditCourseName] = useState("");
  const [editCourseGrade, setEditCourseGrade] = useState("");

  // navegación lateral (derecha)
  type TeacherNavItem = "courses" | "students" | "reports";
  const [activeNavItem, setActiveNavItem] = useState<TeacherNavItem>("courses");

  const coursesSectionRef = useRef<HTMLDivElement | null>(null);
  const studentsSectionRef = useRef<HTMLDivElement | null>(null);

  const scrollToSection = (section: TeacherNavItem) => {
    setActiveNavItem(section);
    if (section === "courses" && coursesSectionRef.current) {
      coursesSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else if (section === "students" && studentsSectionRef.current) {
      studentsSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else if (section === "reports") {
      // por ahora no hay sección, solo mostramos un alert suave
      alert("La sección de reportes estará disponible próximamente.");
    }
  };

  // seguridad básica: solo rol teacher
  if (user && user.role !== "teacher") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white shadow-lg rounded-xl p-8">
          <h1 className="text-xl font-bold text-red-500">
            No tienes permisos para ver este panel.
          </h1>
        </div>
      </div>
    );
  }

  // ---------------------------------------------
  // Cargar lista de cursos del docente
  // ---------------------------------------------
  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      setError(null);
      try {
        const res = await axios.get<TeacherCourse[]>(
          `${API}/teacher/courses/`,
          { headers: getAuthHeaders() }
        );
        setCourses(res.data);
        if (res.data.length > 0) {
          setSelectedCourseId(res.data[0].id);
        } else {
          setSelectedCourseId(null);
        }
      } catch (err: any) {
        console.error(err);
        setError(
          err.response?.data?.error ||
            "Error al cargar los cursos del docente."
        );
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  // ---------------------------------------------
  // Cargar detalle de curso cuando cambia selección
  // ---------------------------------------------
  useEffect(() => {
    if (!selectedCourseId) {
      setCourseDetail(null);
      setIsEditingCourse(false);
      return;
    }

    const fetchDetail = async () => {
      setLoadingDetail(true);
      setError(null);
      try {
        const res = await axios.get<CourseDetailResponse>(
          `${API}/teacher/courses/${selectedCourseId}/`,
          { headers: getAuthHeaders() }
        );
        setCourseDetail(res.data);
        setEditCourseName(res.data.name);
        setEditCourseGrade(res.data.grade || "");
      } catch (err: any) {
        console.error(err);
        setError(
          err.response?.data?.error ||
            "Error al cargar el detalle del curso."
        );
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchDetail();
  }, [selectedCourseId]);

  // ---------------------------------------------
  // Crear curso nuevo (POST /teacher/courses/)
  // ---------------------------------------------
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;

    setError(null);
    try {
      const res = await axios.post<TeacherCourse>(
        `${API}/teacher/courses/`,
        {
          name: newCourseName,
          grade: newCourseGrade || null,
        },
        { headers: getAuthHeaders() }
      );

      const created = res.data;
      setCourses((prev) => [created, ...prev]);
      setSelectedCourseId(created.id);

      setNewCourseName("");
      setNewCourseGrade("");
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          "Error al crear el curso. Inténtalo de nuevo."
      );
    }
  };

  // ---------------------------------------------
  // Actualizar curso (PATCH /teacher/courses/<id>/)
  // ---------------------------------------------
  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    if (!editCourseName.trim()) return;

    setError(null);
    try {
      const res = await axios.patch<CourseDetailResponse>(
        `${API}/teacher/courses/${selectedCourseId}/`,
        {
          name: editCourseName,
          grade: editCourseGrade || null,
        },
        { headers: getAuthHeaders() }
      );

      const updated = res.data;

      // actualizamos lista de cursos
      setCourses((prev) =>
        prev.map((c) =>
          c.id === updated.id
            ? {
                ...c,
                name: updated.name,
                grade: updated.grade,
              }
            : c
        )
      );

      setCourseDetail(updated);
      setIsEditingCourse(false);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          "Error al actualizar el curso. Inténtalo de nuevo."
      );
    }
  };

  // ---------------------------------------------
  // Eliminar curso (DELETE /teacher/courses/<id>/)
  // ---------------------------------------------
  const handleDeleteCourse = async () => {
    if (!selectedCourseId) return;

    const confirmDelete = window.confirm(
      "¿Seguro que deseas eliminar este curso? Se perderá la asociación con sus alumnos (no se borran las cuentas)."
    );
    if (!confirmDelete) return;

    setError(null);
    try {
      await axios.delete(`${API}/teacher/courses/${selectedCourseId}/`, {
        headers: getAuthHeaders(),
      });

      setCourses((prev) => prev.filter((c) => c.id !== selectedCourseId));

      // reset selección
      if (courses.length > 1) {
        const next = courses.find((c) => c.id !== selectedCourseId) || null;
        setSelectedCourseId(next ? next.id : null);
      } else {
        setSelectedCourseId(null);
      }

      setCourseDetail(null);
      setIsEditingCourse(false);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          "Error al eliminar el curso. Inténtalo de nuevo."
      );
    }
  };

  // ---------------------------------------------
  // Agregar alumno al curso (creación + asignación)
  // ---------------------------------------------
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;

    setError(null);
    setCreatedStudentInfo(null);

    try {
      const res = await axios.post(
        `${API}/teacher/courses/${selectedCourseId}/add-student/`,
        {
          username: newStudentUsername,
          age: newStudentAge ? parseInt(newStudentAge) : null,
        },
        { headers: getAuthHeaders() }
      );

      const { student_username, student_password } = res.data;

      setCreatedStudentInfo(
        `Alumno creado: ${student_username} / Contraseña temporal: ${student_password}`
      );

      setNewStudentUsername("");
      setNewStudentAge("");

      // refrescar detalle del curso
      const detailRes = await axios.get<CourseDetailResponse>(
        `${API}/teacher/courses/${selectedCourseId}/`,
        { headers: getAuthHeaders() }
      );
      setCourseDetail(detailRes.data);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          "Error al crear el alumno y agregarlo al curso."
      );
    }
  };

  // ---------------------------------------------
  // Eliminar alumno de un curso
  // ---------------------------------------------
  const handleRemoveStudent = async (studentId: number) => {
    if (!selectedCourseId) return;

    const confirmRemove = window.confirm(
      "¿Seguro que deseas quitar este alumno de este curso? La cuenta del alumno no se eliminará."
    );
    if (!confirmRemove) return;

    setError(null);
    try {
      await axios.post(
        `${API}/teacher/courses/${selectedCourseId}/remove-student/`,
        { student_id: studentId },
        { headers: getAuthHeaders() }
      );

      // refrescar detalle del curso
      const detailRes = await axios.get<CourseDetailResponse>(
        `${API}/teacher/courses/${selectedCourseId}/`,
        { headers: getAuthHeaders() }
      );
      setCourseDetail(detailRes.data);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          "Error al quitar el alumno del curso."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* NAVBAR SUPERIOR */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧑‍🏫</span>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Panel Docente
              </h1>
              <p className="text-xs text-slate-500">
                Gestiona cursos, alumnos y revisa su progreso en CyberKids.
              </p>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <div className="text-right text-xs text-slate-600">
                <p className="font-semibold">{user.name}</p>
                <p>Docente</p>
              </div>
              <button
                onClick={logout}
                className="px-3 py-1 text-xs font-semibold rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>

      {/* LAYOUT CON CONTENIDO + MENÚ DERECHA */}
      <div className="flex-1 mx-auto max-w-7xl px-4 py-6 flex gap-6">
        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Columna izquierda: cursos + crear curso */}
          <section
            ref={coursesSectionRef}
            className="bg-white rounded-2xl shadow p-4 md:col-span-1 flex flex-col border border-slate-100"
          >
            <h2 className="text-lg font-semibold text-slate-800 mb-2">
              Mis cursos
            </h2>

            {/* Formulario crear curso */}
            <form
              onSubmit={handleCreateCourse}
              className="mb-4 space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50"
            >
              <p className="text-xs font-semibold text-slate-600 uppercase">
                Crear nuevo curso
              </p>
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Nombre del curso
                </label>
                <input
                  type="text"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  required
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                  placeholder="Ej: 5° Básico A"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Nivel / grado (opcional)
                </label>
                <input
                  type="text"
                  value={newCourseGrade}
                  onChange={(e) => setNewCourseGrade(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                  placeholder="Ej: 5° básico"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-1 px-3 py-1.5 text-xs font-semibold text-white bg-sky-500 rounded-full hover:bg-sky-600"
              >
                Crear curso
              </button>
            </form>

            {/* Lista de cursos */}
            {loadingCourses && (
              <p className="text-sm text-slate-500">Cargando cursos...</p>
            )}
            {!loadingCourses && courses.length === 0 && (
              <p className="text-sm text-slate-500">
                Aún no tienes cursos registrados. Crea uno para comenzar.
              </p>
            )}

            <ul className="space-y-2 max-h-[400px] overflow-y-auto">
              {courses.map((course) => (
                <li key={course.id}>
                  <button
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      setActiveNavItem("courses");
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition ${
                      selectedCourseId === course.id
                        ? "bg-sky-50 border-sky-400 text-sky-700 shadow-sm"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-semibold">{course.name}</div>
                    <div className="text-xs text-slate-500">
                      {course.grade || "Sin nivel definido"} •{" "}
                      {course.students_count} alumnos
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Columna derecha: detalle del curso + alumnos */}
          <section
            ref={studentsSectionRef}
            className="bg-white rounded-2xl shadow p-4 md:col-span-2 border border-slate-100"
          >
            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            {loadingDetail && <p>Cargando detalle del curso...</p>}

            {!loadingDetail && !courseDetail && (
              <p className="text-sm text-slate-500">
                Selecciona un curso para ver a tus estudiantes.
              </p>
            )}

            {courseDetail && (
              <>
                {/* Encabezado curso + acciones */}
                <div className="flex items-start justify-between mb-4 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">
                      {courseDetail.name}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {courseDetail.grade || "Sin nivel definido"} •{" "}
                      {courseDetail.students.length} alumnos
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() =>
                        setIsEditingCourse((prev) => !prev)
                      }
                      className="px-3 py-1 text-xs font-semibold rounded-full border border-sky-500 text-sky-600 hover:bg-sky-50"
                    >
                      {isEditingCourse ? "Cancelar edición" : "Editar curso"}
                    </button>
                    <button
                      onClick={handleDeleteCourse}
                      className="px-3 py-1 text-xs font-semibold rounded-full border border-red-500 text-red-600 hover:bg-red-50"
                    >
                      Eliminar curso
                    </button>
                  </div>
                </div>

                {/* Formulario de edición de curso */}
                {isEditingCourse && (
                  <form
                    onSubmit={handleUpdateCourse}
                    className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3 items-end border border-slate-200 rounded-xl p-3 bg-slate-50"
                  >
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Nombre del curso
                      </label>
                      <input
                        type="text"
                        value={editCourseName}
                        onChange={(e) =>
                          setEditCourseName(e.target.value)
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Nivel / grado
                      </label>
                      <input
                        type="text"
                        value={editCourseGrade}
                        onChange={(e) =>
                          setEditCourseGrade(e.target.value)
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full md:w-auto px-4 py-2 font-semibold text-sm text-white bg-sky-500 rounded-full hover:bg-sky-600 transition"
                    >
                      Guardar cambios
                    </button>
                  </form>
                )}

                {/* Tabla de alumnos */}
                <div className="overflow-x-auto mb-6">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700">
                        <th className="px-3 py-2 text-left font-semibold">
                          Alumno
                        </th>
                        <th className="px-3 py-2 text-left font-semibold">
                          Edad
                        </th>
                        <th className="px-3 py-2 text-left font-semibold">
                          Grupo etario
                        </th>
                        <th className="px-3 py-2 text-right font-semibold">
                          XP total
                        </th>
                        <th className="px-3 py-2 text-right font-semibold">
                          Puntaje prom.
                        </th>
                        <th className="px-3 py-2 text-right font-semibold">
                          Tiempo prom. (s)
                        </th>
                        <th className="px-3 py-2 text-right font-semibold">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseDetail.students.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-3 py-4 text-center text-slate-500"
                          >
                            Aún no hay alumnos en este curso.
                          </td>
                        </tr>
                      )}

                      {courseDetail.students.map((s) => (
                        <tr
                          key={s.id}
                          className="border-b border-slate-100 last:border-0"
                        >
                          <td className="px-3 py-2 font-medium">
                            {s.username}
                          </td>
                          <td className="px-3 py-2">{s.age ?? "-"}</td>
                          <td className="px-3 py-2">
                            {s.age_group ?? "-"}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {s.total_xp}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {s.average_score.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {s.average_time.toFixed(1)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button
                              onClick={() =>
                                handleRemoveStudent(s.id)
                              }
                              className="px-2 py-1 text-xs rounded-full border border-red-400 text-red-500 hover:bg-red-50"
                            >
                              Quitar del curso
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Formulario: agregar alumno */}
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="text-md font-semibold text-slate-800 mb-2">
                    Agregar nuevo alumno a este curso
                  </h3>

                  <form
                    onSubmit={handleAddStudent}
                    className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end"
                  >
                    <div>
                      <label className="block text-xs font-medium text-slate-600">
                        Nombre de usuario
                      </label>
                      <input
                        type="text"
                        value={newStudentUsername}
                        onChange={(e) =>
                          setNewStudentUsername(e.target.value)
                        }
                        required
                        className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600">
                        Edad (opcional)
                      </label>
                      <input
                        type="number"
                        value={newStudentAge}
                        onChange={(e) => setNewStudentAge(e.target.value)}
                        className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full md:w-auto px-4 py-2 font-semibold text-sm text-white bg-sky-500 rounded-full hover:bg-sky-600 transition"
                    >
                      Crear alumno
                    </button>
                  </form>

                  {createdStudentInfo && (
                    <p className="mt-2 text-xs text-emerald-600">
                      {createdStudentInfo}. Esta contraseña es temporal: el
                      estudiante deberá cambiarla en su primer ingreso.
                    </p>
                  )}
                </div>
              </>
            )}
          </section>
        </main>

        {/* MENÚ VERTICAL DERECHA */}
        <aside className="hidden lg:flex w-56 bg-white rounded-2xl shadow-md p-4 flex-col border border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Menú rápido
          </p>

          <button
            type="button"
            onClick={() => scrollToSection("courses")}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${
              activeNavItem === "courses"
                ? "bg-sky-500 text-white shadow-sm hover:bg-sky-600"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span>📚</span>
            <span>Cursos</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("students")}
            className={`mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${
              activeNavItem === "students"
                ? "bg-sky-500 text-white shadow-sm hover:bg-sky-600"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span>👥</span>
            <span>Alumnos</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("reports")}
            className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 bg-slate-50 cursor-not-allowed"
          >
            <span>📊</span>
            <span>Reportes (próx.)</span>
          </button>

          <div className="mt-auto pt-4 border-t border-slate-100">
            <p className="text-[11px] text-slate-400">
              Tip: usa este menú para saltar rápidamente entre tus cursos y la
              lista de estudiantes.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TeacherDashboard;
