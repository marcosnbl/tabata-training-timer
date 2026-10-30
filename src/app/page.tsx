"use client";
import { useEffect, useState } from "react";
import { Activity, Expand, Library, Timer } from "lucide-react";
import { presets, routineRepository, type Routine } from "@/lib/routines";
import { RoutineEditor } from "@/components/RoutineEditor";
import { RoutineLibrary } from "@/components/RoutineLibrary";
import { TrainingScreen } from "@/components/TrainingScreen";
import { Dialog } from "@/components/Dialog";
import { useTabataTimer } from "@/hooks/useTabataTimer";
import { useTimerEffects } from "@/hooks/useTimerEffects";
import { SoundSettings } from "@/components/SoundSettings";
import {
  audioStorageKey,
  defaultAudioPreferences,
  parseAudioPreferences,
  type AudioPreferences,
} from "@/lib/timerAudio";

type Confirmation = {
  title: string;
  message: string;
  action: () => void;
  label: string;
};
export default function Home() {
  const [routine, setRoutine] = useState<Routine>(presets[0]);
  const [saved, setSaved] = useState<Routine[]>([]);
  const [sound, setSound] = useState(true);
  const [audioPreferences, setAudioPreferences] = useState<AudioPreferences>(
    defaultAudioPreferences,
  );
  const [soundSettingsOpen, setSoundSettingsOpen] = useState(false);
  const [awake, setAwake] = useState(true);
  const [view, setView] = useState<"training" | "library">("library");
  const [editor, setEditor] = useState<{ initial?: Routine } | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [error, setError] = useState("");
  const timer = useTabataTimer(routine);
  const effects = useTimerEffects(
    timer.status,
    timer.index,
    timer.remaining,
    sound,
    awake,
    timer.current.phase,
    audioPreferences,
  );
  useEffect(() => {
    setSaved(routineRepository.load());
    try {
      setAudioPreferences(
        parseAudioPreferences(
          JSON.parse(localStorage.getItem(audioStorageKey) ?? "null"),
        ),
      );
    } catch {
      /* Use defaults when storage is unavailable. */
    }
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production")
      void navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  const sessionStarted = timer.elapsed > 0 && timer.status !== "finished";
  const persist = (next: Routine[]) => {
    routineRepository.save(next);
    setSaved(next);
  };
  const select = (next: Routine) => {
    const apply = () => {
      if (next !== routine) setRoutine(next);
      setView("training");
      setError("");
    };
    if (sessionStarted && next !== routine)
      setConfirmation({
        title: "¿Cambiar de rutina?",
        message:
          "Se descartará el avance de la sesión actual. Tus rutinas guardadas se conservarán.",
        label: "Cambiar rutina",
        action: apply,
      });
    else apply();
  };
  const openLibrary = () => {
    if (timer.status === "running") timer.toggle();
    setView("library");
  };
  const saveRoutine = (next: Routine) => {
    try {
      persist(
        saved.some((r) => r.id === next.id)
          ? saved.map((r) => (r.id === next.id ? next : r))
          : [...saved, next],
      );
      setEditor(null);
      select(next);
    } catch {
      throw new Error(
        "No se pudo guardar. Revisa el espacio o los permisos de almacenamiento del navegador.",
      );
    }
  };
  const duplicate = (source: Routine) => {
    try {
      persist([
        ...saved,
        {
          ...source,
          id: crypto.randomUUID(),
          name: `${source.name.slice(0, 39)} (copia)`,
        },
      ]);
      setError("");
    } catch {
      setError("No se pudo duplicar la rutina.");
    }
  };
  const remove = (source: Routine) =>
    setConfirmation({
      title: "¿Eliminar esta rutina?",
      message: `Se eliminará “${source.name}” de este navegador. Esta acción no se puede deshacer.`,
      label: "Eliminar rutina",
      action: () => {
        try {
          persist(saved.filter((r) => r.id !== source.id));
          setError("");
        } catch {
          setError("No se pudo eliminar la rutina.");
        }
      },
    });
  const reset = () => {
    if (timer.elapsed > 0 && timer.status !== "finished") {
      if (timer.status === "running") timer.toggle();
      setConfirmation({
        title: "¿Reiniciar la sesión?",
        message:
          "El reloj volverá a la preparación y se perderá el avance de esta sesión.",
        label: "Reiniciar sesión",
        action: timer.reset,
      });
    } else timer.reset();
  };
  const fullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen)
        await document.documentElement.requestFullscreen();
      else setError("Pantalla completa no disponible en este navegador.");
    } catch {
      setError("No se pudo activar la pantalla completa.");
    }
  };
  const phase = timer.status === "finished" ? "finished" : timer.current.phase;
  const statusLabel =
    timer.status === "running"
      ? "En marcha"
      : timer.status === "paused"
        ? "En pausa"
        : timer.status === "finished"
          ? "Completado"
          : "Lista para empezar";
  return (
    <main className={`app phase-${phase} view-${view}`}>
      <header className="app-header">
        <div className="brand">
          <span className="brand-icon">
            <Activity size={22} />
          </span>
          <span>
            INTERVAL<span className="brand-secondary"> TRAINING</span>
          </span>
        </div>
        <nav className="view-tabs" aria-label="Vistas de la aplicación">
          <button
            aria-current={view === "library" ? "page" : undefined}
            onClick={openLibrary}
          >
            <Library size={18} />
            <span>Rutinas</span>
          </button>
          <button
            aria-current={view === "training" ? "page" : undefined}
            onClick={() => setView("training")}
          >
            <Timer size={18} />
            <span>Entrenar</span>
          </button>
        </nav>
        <div className="header-tools">
          <span className={`session-status status-${timer.status}`}>
            <i />
            {statusLabel}
          </span>
          <button
            className="icon-button fullscreen-button"
            onClick={() => void fullscreen()}
            aria-label="Alternar pantalla completa"
            title="Pantalla completa"
          >
            <Expand size={20} />
          </button>
        </div>
      </header>
      {error && (
        <div className="error-banner" role="alert">
          {error}
          <button onClick={() => setError("")}>Cerrar</button>
        </div>
      )}
      {view === "library" ? (
        <RoutineLibrary
          selected={routine}
          saved={saved}
          paused={sessionStarted && timer.status === "paused"}
          onSelect={select}
          onCreate={() => setEditor({})}
          onEdit={(initial) => setEditor({ initial })}
          onDuplicate={duplicate}
          onDelete={remove}
          onReturn={() => setView("training")}
        />
      ) : (
        <TrainingScreen
          routine={routine}
          timer={timer}
          sound={sound}
          soundStyle={audioPreferences.style}
          awake={awake}
          wakeState={effects.wakeState}
          onToggle={() => {
            effects.unlock();
            timer.toggle();
          }}
          onReset={reset}
          onSound={() => {
            if (timer.status === "running") timer.toggle();
            setSoundSettingsOpen(true);
          }}
          onAwake={() => setAwake(!awake)}
        />
      )}
      {soundSettingsOpen && (
        <SoundSettings
          preferences={audioPreferences}
          enabled={sound}
          paused={timer.status === "paused"}
          error={effects.audioError}
          onChange={(next) => {
            setAudioPreferences(next);
            try {
              localStorage.setItem(audioStorageKey, JSON.stringify(next));
            } catch {
              /* Preferences still work for this session. */
            }
          }}
          onEnabled={setSound}
          onPreview={(cue) => {
            void effects.preview(cue);
          }}
          onClose={() => {
            effects.cancelPreview();
            setSoundSettingsOpen(false);
          }}
        />
      )}
      {editor && (
        <RoutineEditor
          initial={editor.initial}
          onClose={() => setEditor(null)}
          onSave={saveRoutine}
        />
      )}
      {confirmation && (
        <Dialog
          title={confirmation.title}
          id="confirm-title"
          onClose={() => setConfirmation(null)}
        >
          <p className="dialog-description">{confirmation.message}</p>
          <div className="dialog-actions">
            <button
              className="secondary-button"
              onClick={() => setConfirmation(null)}
            >
              Cancelar
            </button>
            <button
              className="primary-button"
              onClick={() => {
                confirmation.action();
                setConfirmation(null);
              }}
            >
              {confirmation.label}
            </button>
          </div>
        </Dialog>
      )}
    </main>
  );
}
