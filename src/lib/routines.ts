export interface Routine {
  id: string;
  name: string;
  preparation: number;
  work: number;
  rest: number;
  rounds: number;
  sets: number;
  setRest: number;
  cycles: number;
}
export type TimerStatus = "idle" | "running" | "paused" | "finished";
export type Phase = "prepare" | "work" | "rest" | "setRest";
export interface Interval {
  phase: Phase;
  duration: number;
  round: number;
  set: number;
  cycle: number;
}
export const labels: Record<Phase, string> = {
  prepare: "Preparación",
  work: "Trabajo",
  rest: "Descanso",
  setRest: "Descanso de serie",
};
export const presets: Routine[] = [
  {
    id: "tabata",
    name: "Tabata clásico",
    preparation: 10,
    work: 20,
    rest: 10,
    rounds: 8,
    sets: 1,
    setRest: 60,
    cycles: 1,
  },
  {
    id: "hiit",
    name: "HIIT 30 / 30",
    preparation: 10,
    work: 30,
    rest: 30,
    rounds: 10,
    sets: 1,
    setRest: 60,
    cycles: 1,
  },
  {
    id: "emom",
    name: "EMOM 1 minuto",
    preparation: 10,
    work: 60,
    rest: 0,
    rounds: 10,
    sets: 1,
    setRest: 0,
    cycles: 1,
  },
];
export function buildIntervals(r: Routine): Interval[] {
  const list: Interval[] = [];
  const add = (
    phase: Phase,
    duration: number,
    round: number,
    set: number,
    cycle: number,
  ) => {
    if (duration > 0) list.push({ phase, duration, round, set, cycle });
  };
  add("prepare", r.preparation, 1, 1, 1);
  for (let c = 1; c <= r.cycles; c++)
    for (let s = 1; s <= r.sets; s++)
      for (let n = 1; n <= r.rounds; n++) {
        add("work", r.work, n, s, c);
        if (n < r.rounds) add("rest", r.rest, n, s, c);
        else if (s < r.sets || c < r.cycles) add("setRest", r.setRest, n, s, c);
      }
  return list;
}
export function formatTime(seconds: number): string {
  const n = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(n / 60)
    .toString()
    .padStart(2, "0")}:${(n % 60).toString().padStart(2, "0")}`;
}
export interface RoutineRepository {
  load(): Routine[];
  save(routines: Routine[]): void;
}
export const routineRepository: RoutineRepository = {
  load() {
    try {
      const raw: unknown = JSON.parse(
        localStorage.getItem("forge.routines.v1") ?? "[]",
      );
      return Array.isArray(raw) ? raw.filter(isRoutine) : [];
    } catch {
      return [];
    }
  },
  save(routines) {
    localStorage.setItem("forge.routines.v1", JSON.stringify(routines));
  },
};
export function isRoutine(value: unknown): value is Routine {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.name === "string" &&
    r.name.length > 0 &&
    [
      "preparation",
      "work",
      "rest",
      "rounds",
      "sets",
      "setRest",
      "cycles",
    ].every(
      (k) =>
        typeof r[k] === "number" &&
        Number.isInteger(r[k]) &&
        (r[k] as number) >=
          (["work", "rounds", "sets", "cycles"].includes(k) ? 1 : 0) &&
        (r[k] as number) <= 3600,
    ) &&
    Number(r.rounds) * Number(r.sets) * Number(r.cycles) <= 2000
  );
}
