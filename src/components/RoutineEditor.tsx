"use client";
import { useState } from "react";
import { Check } from "lucide-react";
import { Dialog } from "@/components/Dialog";
import { presets, isRoutine, type Routine } from "@/lib/routines";
export function RoutineEditor({
  onClose,
  onSave,
  initial,
}: {
  onClose: () => void;
  onSave: (r: Routine) => void;
  initial?: Routine;
}) {
  const [draft, setDraft] = useState<Routine>(
    initial ?? {
      ...presets[0],
      id: "",
      name: "Mi entrenamiento",
    },
  );
  const [error, setError] = useState("");
  const fields: {
    key: Exclude<keyof Routine, "id" | "name">;
    label: string;
    min: number;
    max: number;
  }[] = [
    { key: "preparation", label: "Preparación (s)", min: 0, max: 3600 },
    { key: "work", label: "Trabajo (s)", min: 1, max: 3600 },
    { key: "rest", label: "Descanso (s)", min: 0, max: 3600 },
    { key: "rounds", label: "Rondas por serie", min: 1, max: 100 },
    { key: "sets", label: "Series por ciclo", min: 1, max: 20 },
    {
      key: "setRest",
      label: "Descanso entre series / ciclos (s)",
      min: 0,
      max: 3600,
    },
    { key: "cycles", label: "Ciclos", min: 1, max: 20 },
  ];
  return (
    <Dialog
      title={initial ? "Editar rutina" : "Crear rutina"}
      id="editor-title"
      onClose={onClose}
    >
      <p className="dialog-description">
        Configura tus tiempos, rondas y recuperación.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const r = {
            ...draft,
            id: initial?.id ?? crypto.randomUUID(),
            name: draft.name.trim(),
          };
          if (!isRoutine(r)) {
            setError("Revisa los valores. Máximo 2000 rondas totales.");
            return;
          }
          try {
            onSave(r);
          } catch (cause) {
            setError(
              cause instanceof Error
                ? cause.message
                : "No se pudo guardar la rutina.",
            );
          }
        }}
      >
        <label className="name-field">
          Nombre de la rutina
          <input
            autoFocus
            required
            maxLength={48}
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </label>
        <div className="form-grid">
          {fields.map((f) => (
            <label key={f.key}>
              {f.label}
              <input
                type="number"
                required
                min={f.min}
                max={f.max}
                step="1"
                value={draft[f.key]}
                onChange={(e) =>
                  setDraft({ ...draft, [f.key]: Number(e.target.value) })
                }
              />
            </label>
          ))}
        </div>
        <p className="form-note">
          El último esfuerzo termina sin descanso final. EMOM: 60 segundos de
          trabajo; realiza las repeticiones y recupera dentro de cada minuto.
        </p>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <button className="save-button" type="submit">
          <Check size={19} /> {initial ? "Guardar cambios" : "Guardar rutina"}
        </button>
      </form>
    </Dialog>
  );
}
