import { formatTime } from "@/lib/routines";

export function TimerDisplay({
  remaining,
  finished,
  countdown,
}: {
  remaining: number;
  finished: boolean;
  countdown: boolean;
}) {
  const [minutes, seconds] = formatTime(remaining).split(":");
  return (
    <div
      className={`clock ${countdown ? "countdown" : ""}`}
      role="timer"
      aria-label={
        finished
          ? "Entrenamiento completado"
          : `${Math.ceil(remaining)} segundos restantes`
      }
    >
      {finished ? (
        <span className="clock-finished">✓</span>
      ) : (
        <span className="clock-digits" aria-hidden="true">
          <span>{minutes}</span>
          <span className="clock-colon">:</span>
          <span>{seconds}</span>
        </span>
      )}
    </div>
  );
}
