import {
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Sun,
} from "lucide-react";
import { TimerDisplay } from "@/components/TimerDisplay";
import { formatTime, labels, type Routine } from "@/lib/routines";
import type { useTabataTimer } from "@/hooks/useTabataTimer";
import type { SoundStyle } from "@/lib/timerAudio";

type Timer = ReturnType<typeof useTabataTimer>;
interface Props {
  routine: Routine;
  timer: Timer;
  sound: boolean;
  soundStyle: SoundStyle;
  awake: boolean;
  wakeState: string;
  onToggle: () => void;
  onReset: () => void;
  onSound: () => void;
  onAwake: () => void;
}
export function TrainingScreen({
  routine,
  timer,
  sound,
  soundStyle,
  awake,
  wakeState,
  onToggle,
  onReset,
  onSound,
  onAwake,
}: Props) {
  const running = timer.status === "running";
  const finished = timer.status === "finished";
  const countdown = running && timer.remaining <= 3;
  const next = timer.intervals[timer.index + 1];
  return (
    <section className="training" aria-label="Temporizador de entrenamiento">
      <div className="session-heading">
        <div>
          <span className="eyebrow">SESIÓN ACTUAL</span>
          <h1>{routine.name}</h1>
        </div>
        <button className="reset-button" onClick={onReset}>
          <RotateCcw size={18} />
          <span>Reiniciar</span>
        </button>
      </div>
      <div className="training-display">
        <div className="phase-heading">
          <h2>
            <i />
            {finished ? "Completado" : labels[timer.current.phase]}
          </h2>
          <span
            className={`countdown-cue ${countdown ? "visible" : ""}`}
            aria-hidden={!countdown}
          >
            {countdown
              ? `CAMBIO EN ${Math.ceil(timer.remaining)}`
              : "CAMBIO EN 3"}
          </span>
        </div>
        <TimerDisplay
          remaining={timer.remaining}
          finished={finished}
          countdown={countdown}
        />
        <div className="round-summary">
          <span>
            RONDA{" "}
            <strong>{String(timer.current.round).padStart(2, "0")}</strong>
            <span className="round-total">
              {" "}
              / {String(routine.rounds).padStart(2, "0")}
            </span>
          </span>
          {routine.sets > 1 && (
            <span className="extra-metric">
              Serie {timer.current.set} / {routine.sets}
            </span>
          )}
          {routine.cycles > 1 && (
            <span className="extra-metric">
              Ciclo {timer.current.cycle} / {routine.cycles}
            </span>
          )}
        </div>
        <p className="next-phase">
          {finished ? (
            "Sesión terminada. Recupera y respira."
          ) : (
            <>
              Después <ChevronRight size={14} />
              <strong>
                {next
                  ? `${labels[next.phase]} · ${next.duration} s`
                  : "Fin del entrenamiento"}
              </strong>
            </>
          )}
        </p>
        <div className="session-progress">
          <div className="progress-label">
            <span>
              SESIÓN <strong>{Math.round(timer.progress * 100)}%</strong>
            </span>
            <span>
              RESTANTE{" "}
              <strong>
                {formatTime((timer.total - timer.elapsed) / 1000)}
              </strong>
            </span>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="Progreso de la sesión"
            aria-valuenow={Math.round(timer.progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${timer.progress * 100}%` }} />
          </div>
        </div>
      </div>
      <div className="training-dock">
        <div className="timer-controls">
          <button
            className="skip-control"
            aria-label="Intervalo anterior"
            onClick={timer.previous}
          >
            <SkipBack size={24} />
            <span>Anterior</span>
          </button>
          <button className="play-control" onClick={onToggle}>
            {running ? (
              <Pause size={26} fill="currentColor" />
            ) : (
              <Play size={26} fill="currentColor" />
            )}
            <span>
              {running
                ? "PAUSAR"
                : timer.status === "paused"
                  ? "CONTINUAR"
                  : finished
                    ? "REPETIR"
                    : "INICIAR"}
            </span>
          </button>
          <button
            className="skip-control"
            aria-label="Siguiente intervalo"
            disabled={finished}
            onClick={timer.next}
          >
            <SkipForward size={24} />
            <span>Siguiente</span>
          </button>
        </div>
        <div className="timer-options">
          <button
            className="option-button"
            aria-haspopup="dialog"
            onClick={onSound}
          >
            {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
            <span>
              Sonido ·{" "}
              {sound
                ? soundStyle === "sport"
                  ? "Deportivo"
                  : "Suave"
                : "Silenciado"}
            </span>
          </button>
          <button
            className="option-button"
            aria-pressed={awake}
            onClick={onAwake}
            title={`Mantener pantalla encendida: ${wakeState}`}
          >
            <Sun size={18} />
            <span>Pantalla encendida</span>
            <span className={`switch ${awake ? "on" : ""}`}>
              <i />
            </span>
            <span className="sr-only">{wakeState}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
