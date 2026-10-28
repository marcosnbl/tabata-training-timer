import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildIntervals,
  formatTime,
  isRoutine,
  presets,
} from "../src/lib/routines.ts";
test("Tabata tiene ocho esfuerzos y siete descansos sin descanso final", () => {
  const intervals = buildIntervals(presets[0]);
  assert.equal(intervals.filter((i) => i.phase === "work").length, 8);
  assert.equal(intervals.filter((i) => i.phase === "rest").length, 7);
  assert.equal(intervals.at(-1)?.phase, "work");
  assert.equal(
    intervals.reduce((n, i) => n + i.duration, 0),
    240,
  );
});
test("series y ciclos se separan y mantienen los índices correctos", () => {
  const intervals = buildIntervals({
    ...presets[0],
    preparation: 0,
    rounds: 2,
    sets: 2,
    cycles: 2,
  });
  assert.equal(intervals.filter((i) => i.phase === "work").length, 8);
  assert.equal(intervals.filter((i) => i.phase === "setRest").length, 3);
  assert.deepEqual(intervals.at(-1), {
    phase: "work",
    duration: 20,
    round: 2,
    set: 2,
    cycle: 2,
  });
});
test("EMOM omite intervalos de cero segundos", () => {
  const intervals = buildIntervals(presets[2]);
  assert.equal(intervals.length, 11);
  assert.equal(
    intervals.reduce((n, i) => n + i.duration, 0),
    610,
  );
});
test("rechaza datos corruptos y límites excesivos", () => {
  assert.ok(isRoutine(presets[0]));
  assert.equal(isRoutine({ ...presets[0], work: -1 }), false);
  assert.equal(isRoutine({ ...presets[0], rounds: 3000 }), false);
  assert.equal(isRoutine(null), false);
  assert.equal(isRoutine({ ...presets[0], rest: 1.5 }), false);
});
test("muestra el segundo entero pendiente", () => {
  assert.equal(formatTime(0.02), "00:01");
  assert.equal(formatTime(60), "01:00");
  assert.equal(formatTime(-2), "00:00");
});
