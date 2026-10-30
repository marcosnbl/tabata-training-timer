import { Play, Volume2 } from "lucide-react";
import { Dialog } from "./Dialog";
import type { AudioPreferences, SoundCue } from "@/lib/timerAudio";

interface Props {
  preferences: AudioPreferences;
  enabled: boolean;
  paused: boolean;
  error: string;
  onChange: (preferences: AudioPreferences) => void;
  onEnabled: (enabled: boolean) => void;
  onPreview: (cue: SoundCue) => void;
  onClose: () => void;
}
export function SoundSettings({
  preferences,
  enabled,
  paused,
  error,
  onChange,
  onEnabled,
  onPreview,
  onClose,
}: Props) {
  return (
    <Dialog title="Sonidos de entrenamiento" id="sound-title" onClose={onClose}>
      <p className="dialog-description">
        Señales distintas para cada momento.
        {paused ? " Tu sesión está en pausa." : ""}
      </p>
      <label className="sound-enabled">
        <span>
          <Volume2 size={18} /> Avisos durante el entrenamiento
        </span>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => onEnabled(event.target.checked)}
        />
      </label>
      <fieldset className="sound-styles">
        <legend>Estilo de sonido</legend>
        {(
          [
            {
              id: "sport",
              name: "Deportivo",
              detail: "Pulsos marcados y cambios de tono.",
            },
            {
              id: "soft",
              name: "Suave",
              detail: "Señales más discretas y redondas.",
            },
          ] as const
        ).map((style) => (
          <label
            className={`sound-style ${preferences.style === style.id ? "selected" : ""}`}
            key={style.id}
          >
            <input
              type="radio"
              name="sound-style"
              value={style.id}
              checked={preferences.style === style.id}
              onChange={() => onChange({ ...preferences, style: style.id })}
            />
            <span>
              <strong>{style.name}</strong>
              <small>{style.detail}</small>
            </span>
          </label>
        ))}
      </fieldset>
      <label className="volume-label" htmlFor="sound-volume">
        <span>
          Volumen de los avisos{" "}
          <strong>{Math.round(preferences.volume * 100)}%</strong>
        </span>
        <input
          id="sound-volume"
          type="range"
          min="0"
          max="100"
          step="5"
          value={Math.round(preferences.volume * 100)}
          onChange={(event) =>
            onChange({
              ...preferences,
              volume: Number(event.target.value) / 100,
            })
          }
        />
      </label>
      <div className="sound-preview">
        <p>Escuchar una muestra</p>
        {(
          [
            {
              cue: "countdown",
              name: "Cuenta regresiva",
              description: "Tres pulsos; el tono sube al acercarse el cambio.",
            },
            {
              cue: "work",
              name: "Trabajo",
              description: "Señal ascendente para arrancar.",
            },
            {
              cue: "rest",
              name: "Descanso",
              description: "Dos tonos descendentes para recuperar.",
            },
            {
              cue: "finished",
              name: "Finalización",
              description: "Secuencia de cierre del entrenamiento.",
            },
          ] satisfies { cue: SoundCue; name: string; description: string }[]
        ).map((item) => (
          <button
            key={item.cue}
            onClick={() => onPreview(item.cue)}
            aria-label={`Probar sonido de ${item.name.toLowerCase()}`}
          >
            <span>
              <strong>{item.name}</strong>
              <small>{item.description}</small>
            </span>
            <Play size={17} />
          </button>
        ))}
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button className="save-button" onClick={onClose}>
        Listo
      </button>
    </Dialog>
  );
}
