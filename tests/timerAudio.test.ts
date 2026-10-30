import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseAudioPreferences,
  resolveSoundCue,
  type AudioSnapshot,
} from "../src/lib/timerAudio.ts";

const running: AudioSnapshot = {
  status: "running",
  index: 1,
  seconds: 20,
  phase: "work",
};
test("phase cues take precedence over countdown on short intervals", () => {
  assert.equal(resolveSoundCue(null, { ...running, seconds: 2 }), "work");
  assert.equal(
    resolveSoundCue(running, {
      ...running,
      index: 2,
      phase: "rest",
      seconds: 3,
    }),
    "rest",
  );
  assert.equal(
    resolveSoundCue(running, { ...running, index: 2, phase: "setRest" }),
    "rest",
  );
});
test("countdown sounds once per second without replaying skipped seconds", () => {
  assert.equal(
    resolveSoundCue({ ...running, seconds: 4 }, { ...running, seconds: 3 }),
    "countdown",
  );
  assert.equal(
    resolveSoundCue({ ...running, seconds: 3 }, { ...running, seconds: 3 }),
    null,
  );
  assert.equal(
    resolveSoundCue({ ...running, seconds: 10 }, { ...running, seconds: 1 }),
    "countdown",
  );
  assert.equal(
    resolveSoundCue({ ...running, seconds: 1 }, { ...running, seconds: 0 }),
    null,
  );
});
test("pause, reset and resume do not trigger a phase or countdown sound", () => {
  assert.equal(
    resolveSoundCue(running, { ...running, status: "paused" }),
    null,
  );
  assert.equal(
    resolveSoundCue({ ...running, status: "paused" }, running),
    null,
  );
  assert.equal(resolveSoundCue(running, { ...running, status: "idle" }), null);
});
test("completion sounds once and replay starts with a phase cue", () => {
  const finished: AudioSnapshot = {
    ...running,
    status: "finished",
    seconds: 0,
  };
  assert.equal(resolveSoundCue(running, finished), "finished");
  assert.equal(resolveSoundCue(finished, finished), null);
  assert.equal(
    resolveSoundCue(finished, {
      ...running,
      index: 0,
      phase: "prepare",
      seconds: 10,
    }),
    "prepare",
  );
});
test("invalid stored preferences cannot create excessive or nonfinite volume", () => {
  assert.deepEqual(parseAudioPreferences({ style: "soft", volume: 0.5 }), {
    style: "soft",
    volume: 0.5,
  });
  assert.equal(parseAudioPreferences({ volume: 10 }).volume, 1);
  assert.equal(parseAudioPreferences({ volume: -5 }).volume, 0);
  assert.equal(parseAudioPreferences({ volume: NaN }).volume, 0.7);
  assert.deepEqual(parseAudioPreferences(null), {
    style: "sport",
    volume: 0.7,
  });
});
