import React, { useContext, useEffect, useState } from "react";
import axios from "axios";

import { AppContext } from "../App";
import { AppContextType, AgeGroup } from "../types";
import { getLearningPathForAgeGroup } from "../constants";
import ManageChildren from "./ManageChildren";

const ParentHome: React.FC = () => {
  const context = useContext(AppContext) as AppContextType;
  const { user, loggedInAccount, logout } = context;

  // Secciones del menú lateral
  type Section = "children" | "profile" | "overview";
  const [activeSection, setActiveSection] = useState<Section>("overview");

  const displayName =
    loggedInAccount?.name || user?.name || user?.username || "Apoderado";
  const displayEmail = loggedInAccount?.email || user?.email || "";

  // ----------------------------------------------
  // Estado para hijos + progreso
  // ----------------------------------------------
  interface ChildFromApi {
    id: number;
    username: string;
    age?: number | null;
    age_group?: AgeGroup | null;
  }

  interface ChildProgressEntry {
    lesson_id: string;
    xp: number;
    completed: boolean;
  }

  interface ChildProgressResponse {
    id: number;
    username: string;
    age_group: AgeGroup | null;
    age?: number | null;
    progress: ChildProgressEntry[];
  }

  const [children, setChildren] = useState<ChildFromApi[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [selectedChildProgress, setSelectedChildProgress] =
    useState<ChildProgressResponse | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  // Cargar hijos una sola vez al montar
  useEffect(() => {
    const loadChildren = async () => {
      try {
        const res = await axios.get<ChildFromApi[]>(
          "http://127.0.0.1:8000/api/parent/children/"
        );
        setChildren(res.data || []);
        if (res.data && res.data.length > 0) {
          setSelectedChildId(res.data[0].id); // 👈 por defecto hijo 1
        }
      } catch (err) {
        console.error("Error cargando hijos para resumen:", err);
        setOverviewError("No se pudo cargar la lista de alumnos.");
      }
    };

    loadChildren();
  }, []);

  // Cargar progreso cuando cambia el hijo seleccionado
  useEffect(() => {
    const loadProgress = async () => {
      if (selectedChildId == null) return;
      setLoadingOverview(true);
      setOverviewError(null);
      try {
        const res = await axios.get<ChildProgressResponse>(
          `http://127.0.0.1:8000/api/parent/children/${selectedChildId}/progress/`
        );
        setSelectedChildProgress(res.data);
      } catch (err) {
        console.error("Error cargando progreso de hijo:", err);
        setOverviewError("No se pudo cargar el progreso de este alumno.");
      } finally {
        setLoadingOverview(false);
      }
    };

    loadProgress();
  }, [selectedChildId]);

  // ----------------------------------------------
  // Render del contenido central según sección
  // ----------------------------------------------
  const renderOverviewContent = () => {
    if (children.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Aún no has registrado alumnos
          </h2>
          <p className="text-slate-600 max-w-md">
            En la sección{" "}
            <span className="font-semibold">“Gestionar alumnos”</span> podrás
            crear cuentas para tus hijos. Una vez que tengan actividad, aquí
            verás un resumen de su progreso.
          </p>
        </div>
      );
    }

    const child =
      children.find((c) => c.id === selectedChildId) || children[0];

    const progressData = selectedChildProgress;

    // Cálculos de XP y progreso global
    let totalXp = 0;
    let completedLessons = 0;
    let totalLessons = 0;
    let completionPercent = 0;
    let effectiveAgeGroup: AgeGroup = AgeGroup.KID;

    if (progressData) {
      // XP y lecciones completadas
      const completedSet = new Set<string>();
      progressData.progress.forEach((p) => {
        if (p.completed) {
          completedSet.add(p.lesson_id);
          totalXp += p.xp || 0;
        }
      });
      completedLessons = completedSet.size;

      // Rutina para saber cuántas lecciones hay en total para su grupo etario
      if (child.age_group) {
        effectiveAgeGroup = child.age_group;
      } else {
        // fallback si no hay age_group
        effectiveAgeGroup = AgeGroup.KID;
      }

      const learningPath = getLearningPathForAgeGroup(effectiveAgeGroup);
      totalLessons = learningPath.modules.reduce(
        (acc, m) => acc + m.lessons.length,
        0
      );
      completionPercent =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;
    }

    return (
      <>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Resumen de progreso
            </h2>
            <p className="text-slate-600">
              Revisa cómo va el avance de tus hijos en CyberKids Chile.
            </p>
          </div>

          {/* Selector de hijo */}
          <div className="flex flex-col items-start md:items-end gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Alumno seleccionado
            </span>
            <div className="flex flex-wrap gap-2">
              {children.map((c) => {
                const isActive = c.id === selectedChildId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedChildId(c.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                      isActive
                        ? "bg-sky-500 text-white border-sky-500 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {c.username}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {loadingOverview && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600">
            Cargando progreso del alumno...
          </div>
        )}

        {overviewError && !loadingOverview && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-700">
            {overviewError}
          </div>
        )}

        {!loadingOverview && !overviewError && progressData && (
          <div className="space-y-6">
            {/* Tarjeta principal de progreso */}
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 flex flex-col md:flex-row gap-5 items-start md:items-center">
              <div className="flex-1">
                <p className="text-xs font-semibold text-sky-700 uppercase tracking-wide mb-1">
                  Progreso global
                </p>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {progressData.username}
                </h3>

                <p className="text-sm text-slate-600 mb-3">
                  Grupo etario:{" "}
                  <span className="font-semibold">
                    {effectiveAgeGroup === AgeGroup.KID && "Niño (6–9)"}
                    {effectiveAgeGroup === AgeGroup.TWEEN &&
                      "Preadolescente (10–12)"}
                    {effectiveAgeGroup === AgeGroup.TEEN &&
                      "Adolescente (13–16)"}
                  </span>
                </p>

                {/* Barra de progreso */}
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase">
                    Avance en el plan
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {completionPercent}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-3 bg-sky-500 transition-all"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  {completedLessons} lecciones completadas de {totalLessons}{" "}
                  disponibles para su grupo de edad.
                </p>
              </div>

              {/* Mini resumen numérico */}
              <div className="flex flex-row md:flex-col gap-3 min-w-[180px]">
                <SummaryStat
                  label="XP total"
                  value={totalXp}
                  icon="🌟"
                  accent="text-amber-600"
                />
                <SummaryStat
                  label="Lecciones completadas"
                  value={completedLessons}
                  icon="📚"
                  accent="text-emerald-600"
                />
              </div>
            </div>

            {/* Aquí en el futuro puedes agregar más detalles:
                - Progreso por módulo
                - Últimas actividades
                - Alertas, etc. */}
          </div>
        )}
      </>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case "children":
        return (
          <>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Gestionar alumnos
            </h2>
            <p className="text-slate-600 mb-6">
              Administra las cuentas de tus hijos, cambia contraseñas, agrega
              nuevos usuarios y gestiona su información.
            </p>
            <ManageChildren />
          </>
        );

      case "profile":
        return (
          <>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Mi perfil
            </h2>
            <p className="text-slate-600 mb-6">
              Aquí podrás ver y editar la información de tu cuenta de apoderado.
              (Por ahora es solo un placeholder, lo iremos mejorando 👀)
            </p>

            <div className="space-y-4 max-w-lg">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-sm text-slate-500">Nombre</p>
                <p className="text-lg font-semibold text-slate-800">
                  {displayName}
                </p>
              </div>

              {displayEmail && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-sm text-slate-500">Correo</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {displayEmail}
                  </p>
                </div>
              )}

              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-sm text-slate-700">
                Próximamente podrás:
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>Cambiar tu contraseña.</li>
                  <li>Actualizar tus datos de contacto.</li>
                  <li>Configurar preferencias de notificación.</li>
                </ul>
              </div>
            </div>
          </>
        );

      case "overview":
      default:
        return renderOverviewContent();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* NAVBAR SUPERIOR */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500 flex items-center justify-center text-2xl">
              🔐
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-extrabold text-slate-800">
                Panel del Apoderado
              </h1>
              <p className="text-xs text-slate-500">
                CyberKids Chile · Control y seguridad para tu familia
              </p>
            </div>
          </div>

          {/* Info de usuario + acciones */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-800">
                {displayName}
              </span>
              {displayEmail && (
                <span className="text-xs text-slate-500">{displayEmail}</span>
              )}
            </div>

            {/* Botón "Mi perfil" en el navbar superior */}
            <button
              type="button"
              onClick={() => setActiveSection("profile")}
              className="hidden sm:inline-flex px-3 py-2 rounded-full border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Mi perfil
            </button>

            {/* Avatar redondo simple */}
            <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL: sidebar + contenido */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 flex gap-6">
        {/* SIDEBAR IZQUIERDO */}
        <aside className="w-56 bg-white rounded-2xl shadow-md p-4 flex flex-col">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Menú
          </p>

          <SidebarButton
            label="Resumen"
            icon="🏠"
            active={activeSection === "overview"}
            onClick={() => setActiveSection("overview")}
          />

          <SidebarButton
            label="Gestionar alumnos"
            icon="👨‍👧‍👦"
            active={activeSection === "children"}
            onClick={() => setActiveSection("children")}
          />

          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Próximamente
            </p>
            <SidebarButton label="Reportes" icon="📊" active={false} disabled />
            <SidebarButton
              label="Configuración"
              icon="⚙️"
              active={false}
              disabled
            />
          </div>

          {/* Botón de logout al final del sidebar */}
          <div className="mt-auto pt-4 border-t border-slate-100">
            <button
              onClick={logout}
              className="w-full py-2.5 text-sm font-semibold bg-slate-500 text-white rounded-full hover:bg-slate-600 transition"
            >
              Cerrar sesión
            </button>
          </div>
        </aside>

        {/* CONTENIDO CENTRAL */}
        <main className="flex-1 bg-white rounded-2xl shadow-md p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// --------------------------------------------------------
// Botón reutilizable para el sidebar
// --------------------------------------------------------
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
  const baseClasses =
    "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition";
  const activeClasses =
    "bg-sky-500 text-white shadow-sm hover:bg-sky-600";
  const inactiveClasses =
    "text-slate-700 hover:bg-slate-50 border border-transparent";
  const disabledClasses =
    "text-slate-400 cursor-not-allowed bg-slate-50 border border-slate-100";

  let classes = baseClasses;
  if (disabled) {
    classes += " " + disabledClasses;
  } else if (active) {
    classes += " " + activeClasses;
  } else {
    classes += " " + inactiveClasses;
  }

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

// --------------------------------------------------------
// Tarjeta pequeña de estadística
// --------------------------------------------------------
interface SummaryStatProps {
  label: string;
  value: number;
  icon?: string;
  accent?: string;
}

const SummaryStat: React.FC<SummaryStatProps> = ({
  label,
  value,
  icon,
  accent = "text-slate-700",
}) => {
  return (
    <div className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5 flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-lg">
        {icon || "📌"}
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className={`text-lg font-bold ${accent}`}>{value}</p>
      </div>
    </div>
  );
};

export default ParentHome;
