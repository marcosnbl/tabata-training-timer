"use client";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  ChevronRight,
  Expand,
  Flame,
  Pause,
  Play,
  Plus,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import {
  formatTime,
  labels,
  presets,
  routineRepository,
  type Routine,
} from "@/lib/routines";
import { RoutineEditor } from "@/components/RoutineEditor";
import { TimerDisplay } from "@/components/TimerDisplay";
import { useTabataTimer } from "@/hooks/useTabataTimer";
import { useTimerEffects } from "@/hooks/useTimerEffects";
export default function Home() {
  const [routine, setRoutine] = useState<Routine>(presets[0]);
  const [saved, setSaved] = useState<Routine[]>([]);
  const [sound, setSound] = useState(true);
  const [awake, setAwake] = useState(true);
  const [editor, setEditor] = useState(false);
  const [routinesOpen, setRoutinesOpen] = useState(false);
  const [error, setError] = useState("");
  const timer = useTabataTimer(routine);
  const effects = useTimerEffects(
    timer.status,
    timer.index,
    timer.remaining,
    sound,
    awake,
    timer.current.phase,
  );
  useEffect(() => {
    setSaved(routineRepository.load());
    if ("serviceWorker" in navigator)
      void navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  const phase = timer.status === "finished" ? "finished" : timer.current.phase;
  const running = timer.status === "running";
  const select = (r: Routine) => {
    setRoutine(r);
    setRoutinesOpen(false);
    setError("");
  };
  const fullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else
      void document.documentElement
        .requestFullscreen()
        .catch(() =>
          setError("Pantalla completa no disponible en este navegador."),
        );
  };
  return (
    <main
      className={`app phase-${phase} ${timer.remaining <= 3 && running ? "is-countdown" : ""} ${routinesOpen ? "routines-open" : ""} ${timer.status === "running" || timer.status === "paused" ? "active-session" : ""}`}
    >
      <header className="topbar">
        <a className="brand" href="/" aria-label="Interval Training inicio">
          <span className="brand-icon">
            <Activity size={22} />
          </span>
          INTERVAL TRAINING
        </a>
        <div className="top-right">
          <button
            className="routines-toggle"
            aria-expanded={routinesOpen}
            aria-controls="routine-library"
            onClick={() => setRoutinesOpen(!routinesOpen)}
          >
            {routinesOpen ? <X size={20} /> : <Activity size={20} />}
            <span>{routinesOpen ? "Cerrar" : "Rutinas"}</span>
          </button>
          <span className="local-badge">
            <i /> LISTO PARA ENTRENAR
          </span>
          <button
            className="icon-button"
            onClick={fullscreen}
            aria-label="Pantalla completa"
          >
            <Expand size={19} />
          </button>
        </div>
      </header>
      <div className="workspace">
        <aside
          className="sidebar"
          id="routine-library"
          aria-label="Biblioteca de rutinas"
        >
          <div className="eyebrow">TU ENTRENAMIENTO</div>
          <h1>
            Configura tu
            <br />
            <span>entrenamiento.</span>
          </h1>
          <p className="intro">Selecciona una rutina y empieza.</p>
          <div className="section-heading">
            <span>RUTINAS RÁPIDAS</span>
            <span>03</span>
          </div>
          <div className="preset-list">
            {presets.map((r, i) => (
              <button
                key={r.id}
                className={`preset ${routine.id === r.id ? "selected" : ""}`}
                onClick={() => select(r)}
              >
                <span className="preset-icon">
                  {i === 0 ? (
                    <Flame size={22} />
                  ) : i === 1 ? (
                    <Zap size={22} />
                  ) : (
                    <RotateCcw size={21} />
                  )}
                </span>
                <span className="preset-copy">
                  <strong>{r.name}</strong>
                  <small>
                    {r.work}s trabajo <span> / </span>{" "}
                    {r.rest ? safeRest(r.rest) : "sin descanso"} · {r.rounds}{" "}
                    rondas
                  </small>
                </span>
                {routine.id === r.id ? (
                  <span className="selected-dot" />
                ) : (
                  <ChevronRight size={17} />
                )}
              </button>
            ))}
          </div>
          <button className="create-button" onClick={() => setEditor(true)}>
            <Plus size={18} /> Crear rutina personalizada
            <ArrowUpRight size={16} />
          </button>
          {saved.length > 0 && (
            <div className="saved">
              <div className="section-heading">MIS RUTINAS</div>
              {saved.map((r) => (
                <div className="saved-row" key={r.id}>
                  <button onClick={() => select(r)}>
                    {r.name}
                    <small>
                      {r.work}s / {r.rest}s · {r.rounds} rondas
                    </small>
                  </button>
                  <button
                    aria-label={`Eliminar ${r.name}`}
                    onClick={() => {
                      try {
                        const next = saved.filter((x) => x.id !== r.id);
                        routineRepository.save(next);
                        setSaved(next);
                      } catch {
                        setError("No se pudo eliminar la rutina.");
                      }
                    }}
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="coach-note">
            <span className="eyebrow">CONSTRUYE CONSTANCIA</span>
            <p>
              Una ronda más.
              <br />
              Una versión más fuerte.
            </p>
            <div className="note-line" />
            <small>CONCÉNTRATE. RESPIRA. REPITE.</small>
          </div>
        </aside>
        <section className="timer-area" aria-label="Temporizador">
          <div className="timer-heading">
            <div>
              <span className="eyebrow">SESIÓN ACTUAL</span>
              <h2>{routine.name}</h2>
            </div>
            <span className="mode-badge">
              {routine.id === "emom" ? "EMOM" : "INTERVALOS"}
              <span> / </span>
              {formatTime(timer.total / 1000)}
            </span>
          </div>
          <div className="timer-card">
            <div className="timer-card-top">
              <span className="phase-label">
                <i />
                {timer.status === "finished"
                  ? "COMPLETADO"
                  : labels[timer.current.phase].toUpperCase()}
              </span>
              <span className="status-label">
                {running
                  ? "EN MARCHA"
                  : timer.status === "paused"
                    ? "EN PAUSA"
                    : timer.status === "finished"
                      ? "BUEN TRABAJO"
                      : "LISTO CUANDO TÚ LO ESTÉS"}
              </span>
            </div>
            <TimerDisplay
              remaining={timer.remaining}
              finished={timer.status === "finished"}
              countdown={timer.remaining <= 3 && running}
            />
            <div className="next-phase">
              {timer.status === "finished" ? (
                "Superaste el entrenamiento."
              ) : (
                <>
                  SIGUIENTE <ChevronRight size={12} />{" "}
                  <strong>
                    {timer.intervals[timer.index + 1]
                      ? `${labels[timer.intervals[timer.index + 1].phase]} · ${timer.intervals[timer.index + 1].duration}s`
                      : "Fin del entrenamiento"}
                  </strong>
                </>
              )}
            </div>
            <div className="metrics">
              <div>
                <span>RONDA</span>
                <strong>
                  {String(timer.current.round).padStart(2, "0")}
                  <small> / {String(routine.rounds).padStart(2, "0")}</small>
                </strong>
              </div>
              <div>
                <span>SERIE / CICLO</span>
                <strong>
                  {timer.current.set}
                  <small>/{routine.sets} · </small>
                  {timer.current.cycle}
                  <small>/{routine.cycles}</small>
                </strong>
              </div>
              <div>
                <span>TIEMPO RESTANTE</span>
                <strong>
                  {formatTime((timer.total - timer.elapsed) / 1000)}
                </strong>
              </div>
            </div>
            <div className="session-progress">
              <div className="progress-label">
                <span>PROGRESO DE LA SESIÓN</span>
                <strong>{Math.round(timer.progress * 100)}%</strong>
              </div>
              <div className="progress-track">
                <div style={{ width: `${timer.progress * 100}%` }} />
              </div>
              <div className="round-ticks">
                {Array.from(
                  { length: Math.min(routine.rounds, 40) },
                  (_, i) => (
                    <span
                      key={i}
                      className={i < timer.current.round - 1 ? "done" : ""}
                    />
                  ),
                )}
              </div>
            </div>
          </div>
          <div className="controls">
            <button
              className="secondary-control"
              onClick={timer.reset}
              aria-label="Reiniciar"
            >
              <RotateCcw size={21} />
              <span>Reiniciar</span>
            </button>
            <button
              className="skip-control"
              onClick={timer.previous}
              aria-label="Intervalo anterior"
            >
              <SkipBack size={22} />
            </button>
            <button
              className="play-control"
              onClick={() => {
                effects.unlock();
                timer.toggle();
              }}
            >
              {running ? (
                <Pause size={25} fill="currentColor" />
              ) : (
                <Play size={25} fill="currentColor" />
              )}
              {running
                ? "PAUSAR"
                : timer.status === "paused"
                  ? "CONTINUAR"
                  : timer.status === "finished"
                    ? "REPETIR"
                    : "INICIAR"}
              <span>{running ? "PAUSE" : "GO"}</span>
            </button>
            <button
              className="skip-control"
              onClick={timer.next}
              disabled={timer.status === "finished"}
              aria-label="Siguiente intervalo"
            >
              <SkipForward size={22} />
            </button>
            <button
              className="secondary-control sound-control"
              onClick={() => setSound(!sound)}
              aria-label={sound ? "Silenciar" : "Activar sonido"}
            >
              {sound ? <Volume2 size={21} /> : <VolumeX size={21} />}
              <span>{sound ? "Sonido on" : "Sonido off"}</span>
            </button>
          </div>
          <div className="timer-options">
            <button
              className="awake-option"
              onClick={() => setAwake(!awake)}
              aria-pressed={awake}
            >
              <span className={`switch ${awake ? "on" : ""}`}>
                <i />
              </span>
              Mantener pantalla encendida{" "}
              <span className="wake-state">{effects.wakeState}</span>
            </button>
            <span className="audio-note">
              <Volume2 size={13} /> Cuenta regresiva 3 · 2 · 1
            </span>
          </div>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <div className="session-footer">
            <span>
              <i /> TU ÚNICA COMPETENCIA ERES TÚ.
            </span>
            <span>MAKE EVERY SECOND COUNT.</span>
          </div>
        </section>
      </div>
      <footer className="footer">
        <span>
          INTERVAL TRAINING <span> / </span> DISEÑADO PARA DAR MÁS.
        </span>
        <span>
          PRECISIÓN EN CADA INTERVALO <Activity size={14} />
        </span>
      </footer>
      {editor && (
        <RoutineEditor
          onClose={() => setEditor(false)}
          onSave={(r) => {
            try {
              const next = [...saved, r];
              routineRepository.save(next);
              setSaved(next);
              select(r);
              setEditor(false);
            } catch {
              setError("El almacenamiento está lleno o no está disponible.");
            }
          }}
        />
      )}
    </main>
  );
}
function safeRest(n: number) {
  return `${n}s descanso`;
}
