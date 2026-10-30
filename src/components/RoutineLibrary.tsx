import {
  ArrowUpRight,
  Check,
  Copy,
  Pencil,
  Plus,
  Trash2,
  Layers,
  Clock3,
} from "lucide-react";
import {
  buildIntervals,
  formatTime,
  presets,
  type Routine,
} from "@/lib/routines";

interface Props {
  selected: Routine;
  saved: Routine[];
  paused: boolean;
  onSelect: (routine: Routine) => void;
  onCreate: () => void;
  onEdit: (routine: Routine) => void;
  onDuplicate: (routine: Routine) => void;
  onDelete: (routine: Routine) => void;
  onReturn: () => void;
}
export function RoutineLibrary(props: Props) {
  const card = (routine: Routine, custom: boolean, index: number) => {
    const duration = buildIntervals(routine).reduce(
      (total, interval) => total + interval.duration,
      0,
    );
    return (
      <article
        className={`routine-card ${routine.id === props.selected.id ? "selected" : ""}`}
        key={routine.id}
      >
        <div className="routine-card-top">
          <span className="routine-number">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="eyebrow">
            {custom
              ? "PERSONALIZADA"
              : routine.id === "emom"
                ? "CADA MINUTO"
                : "INTERVALOS"}{" "}
          </span>
          {routine.id === props.selected.id && (
            <span className="selected-label">
              <Check size={13} /> Seleccionada
            </span>
          )}
        </div>
        <h3>{routine.name}</h3>
        <div className="routine-ratio">
          <span>
            {routine.work}
            <small>s trabajo</small>
          </span>
          <span className="ratio-separator">/</span>
          <span>
            {routine.rest}
            <small>s descanso</small>
          </span>
        </div>
        <p className="routine-meta">
          <span>
            <Layers size={14} />
            {routine.rounds} rondas
            {routine.sets > 1 ? ` × ${routine.sets} series` : ""}
            {routine.cycles > 1 ? ` × ${routine.cycles} ciclos` : ""}
          </span>
          <span>
            <Clock3 size={14} />
            {formatTime(duration)} total
          </span>
        </p>
        <p className="routine-detail">
          {routine.id === "emom"
            ? "Recuperación dentro de cada minuto."
            : `${routine.preparation} s de preparación incluidos.`}
        </p>
        <div className="routine-actions">
          <button
            className="select-routine"
            onClick={() => props.onSelect(routine)}
          >
            Preparar sesión <ArrowUpRight size={18} />
          </button>
          <button
            className="icon-button"
            onClick={() => props.onDuplicate(routine)}
            aria-label={`Duplicar ${routine.name}`}
            title="Duplicar"
          >
            <Copy size={18} />
          </button>
          {custom && (
            <>
              <button
                className="icon-button"
                onClick={() => props.onEdit(routine)}
                aria-label={`Editar ${routine.name}`}
                title="Editar"
              >
                <Pencil size={18} />
              </button>
              <button
                className="icon-button"
                onClick={() => props.onDelete(routine)}
                aria-label={`Eliminar ${routine.name}`}
                title="Eliminar"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </article>
    );
  };
  return (
    <section className="library" aria-labelledby="library-title">
      <div className="library-intro">
        <div>
          <span className="eyebrow">BIBLIOTECA / ENTRENA A TU RITMO</span>
          <h1 id="library-title">
            Tu próxima sesión<span>.</span>
          </h1>
          <p>Elige el esfuerzo. Nosotros llevamos el tiempo.</p>
        </div>
        <button className="primary-button" onClick={props.onCreate}>
          <Plus size={20} /> Crear rutina
        </button>
      </div>
      {props.paused && (
        <div className="library-notice">
          <span>Tu sesión está en pausa. Puedes volver y continuar.</span>
          <button onClick={props.onReturn}>
            Volver al reloj <ArrowUpRight size={16} />
          </button>
        </div>
      )}
      <div className="section-title">
        <h2>Listas para empezar</h2>
        <span>03 PRESETS</span>
      </div>
      <div className="routine-grid">
        {presets.map((routine, index) => card(routine, false, index))}
      </div>
      <div className="section-title">
        <h2>Mis rutinas</h2>
        <span>{String(props.saved.length).padStart(2, "0")} GUARDADAS</span>
      </div>
      {props.saved.length ? (
        <div className="routine-grid">
          {props.saved.map((routine, index) => card(routine, true, index))}
        </div>
      ) : (
        <button className="empty-library" onClick={props.onCreate}>
          <span className="empty-icon">
            <Plus size={24} />
          </span>
          <span>
            <strong>Tu entrenamiento, tus reglas.</strong>
            <small>Crea una rutina con tus tiempos, series y ciclos.</small>
          </span>
          <ArrowUpRight size={20} />
        </button>
      )}
      <p className="storage-note">Tus rutinas se guardan en este navegador.</p>
    </section>
  );
}
