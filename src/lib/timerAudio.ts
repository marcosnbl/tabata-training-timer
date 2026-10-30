import type { Phase, TimerStatus } from "./routines";

export type SoundStyle = "sport" | "soft";
export type SoundCue = "prepare" | "work" | "rest" | "countdown" | "finished";
export interface AudioPreferences {
  style: SoundStyle;
  volume: number;
}
export const defaultAudioPreferences: AudioPreferences = {
  style: "sport",
  volume: 0.7,
};
export const audioStorageKey = "interval-training.audio.v1";
export function parseAudioPreferences(value: unknown): AudioPreferences {
  if (!value || typeof value !== "object") return defaultAudioPreferences;
  const p = value as Record<string, unknown>;
  return {
    style: p.style === "soft" ? "soft" : "sport",
    volume:
      typeof p.volume === "number" && Number.isFinite(p.volume)
        ? Math.min(1, Math.max(0, p.volume))
        : defaultAudioPreferences.volume,
  };
}
export interface AudioSnapshot {
  status: TimerStatus;
  index: number;
  seconds: number;
  phase: Phase;
}
export function resolveSoundCue(
  previous: AudioSnapshot | null,
  current: AudioSnapshot,
): SoundCue | null {
  if (current.status === "idle" || current.status === "paused") return null;
  if (current.status === "finished")
    return previous?.status === "finished" ? null : "finished";
  if (
    !previous ||
    previous.status === "idle" ||
    previous.status === "finished" ||
    previous.index !== current.index
  )
    return current.phase === "setRest" ? "rest" : current.phase;
  if (previous.status === "paused") return null;
  if (
    current.seconds >= 1 &&
    current.seconds <= 3 &&
    previous.seconds !== current.seconds
  )
    return "countdown";
  return null;
}

interface Tone {
  frequency: number;
  end?: number;
  duration: number;
  offset: number;
}
const patterns: Record<
  SoundStyle,
  Record<Exclude<SoundCue, "countdown">, Tone[]>
> = {
  sport: {
    prepare: [{ frequency: 440, end: 550, duration: 0.22, offset: 0 }],
    work: [
      { frequency: 440, end: 660, duration: 0.12, offset: 0 },
      { frequency: 660, end: 880, duration: 0.12, offset: 0.16 },
      { frequency: 880, end: 1100, duration: 0.3, offset: 0.32 },
    ],
    rest: [
      { frequency: 660, end: 440, duration: 0.18, offset: 0 },
      { frequency: 440, end: 330, duration: 0.32, offset: 0.24 },
    ],
    finished: [
      { frequency: 523, duration: 0.16, offset: 0 },
      { frequency: 659, duration: 0.16, offset: 0.18 },
      { frequency: 784, duration: 0.16, offset: 0.36 },
      { frequency: 1047, duration: 0.5, offset: 0.54 },
    ],
  },
  soft: {
    prepare: [{ frequency: 440, duration: 0.15, offset: 0 }],
    work: [
      { frequency: 660, duration: 0.16, offset: 0 },
      { frequency: 880, duration: 0.23, offset: 0.2 },
    ],
    rest: [
      { frequency: 440, duration: 0.16, offset: 0 },
      { frequency: 330, duration: 0.23, offset: 0.2 },
    ],
    finished: [
      { frequency: 659, duration: 0.22, offset: 0 },
      { frequency: 880, duration: 0.4, offset: 0.25 },
    ],
  },
};

/** One audio context, with cancellable scheduled voices and no external assets. */
export class TimerAudio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private voices = new Set<OscillatorNode>();
  async unlock() {
    this.context ??= new AudioContext();
    if (!this.master) {
      this.master = this.context.createGain();
      this.master.connect(this.context.destination);
    }
    if (this.context.state !== "running") await this.context.resume();
  }
  cancel() {
    for (const voice of this.voices) {
      try {
        voice.stop();
      } catch {
        /* Already ended. */
      }
    }
    this.voices.clear();
  }
  play(cue: SoundCue, preferences: AudioPreferences, seconds = 3) {
    this.cancel();
    const ctx = this.context;
    if (
      !ctx ||
      !this.master ||
      ctx.state !== "running" ||
      preferences.volume === 0
    )
      return;
    this.master.gain.setValueAtTime(preferences.volume, ctx.currentTime);
    const tones =
      cue === "countdown"
        ? [
            {
              frequency:
                preferences.style === "sport" ? 800 + (3 - seconds) * 160 : 620,
              duration: preferences.style === "sport" ? 0.14 : 0.1,
              offset: 0,
            },
          ]
        : patterns[preferences.style][cue];
    this.schedule(tones, preferences.style);
  }
  preview(cue: SoundCue, preferences: AudioPreferences) {
    if (cue !== "countdown") {
      this.play(cue, preferences);
      return;
    }
    this.cancel();
    const ctx = this.context;
    if (
      !ctx ||
      !this.master ||
      ctx.state !== "running" ||
      preferences.volume === 0
    )
      return;
    this.master.gain.setValueAtTime(preferences.volume, ctx.currentTime);
    this.schedule(
      [3, 2, 1].map((second, index) => ({
        frequency:
          preferences.style === "sport" ? 800 + (3 - second) * 160 : 620,
        duration: 0.14,
        offset: index * 0.45,
      })),
      preferences.style,
    );
  }
  private schedule(tones: Tone[], style: SoundStyle) {
    const ctx = this.context!;
    for (const tone of tones) {
      const start = ctx.currentTime + 0.015 + tone.offset;
      const oscillator = ctx.createOscillator();
      const envelope = ctx.createGain();
      oscillator.type = style === "sport" ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(tone.frequency, start);
      if (tone.end)
        oscillator.frequency.exponentialRampToValueAtTime(
          tone.end,
          start + tone.duration,
        );
      envelope.gain.setValueAtTime(0, start);
      envelope.gain.linearRampToValueAtTime(
        style === "sport" ? 0.32 : 0.18,
        start + 0.008,
      );
      envelope.gain.setValueAtTime(
        style === "sport" ? 0.32 : 0.18,
        start + tone.duration * 0.55,
      );
      envelope.gain.exponentialRampToValueAtTime(0.0001, start + tone.duration);
      oscillator.connect(envelope);
      envelope.connect(this.master!);
      this.voices.add(oscillator);
      oscillator.onended = () => {
        oscillator.disconnect();
        envelope.disconnect();
        this.voices.delete(oscillator);
      };
      oscillator.start(start);
      oscillator.stop(start + tone.duration + 0.01);
    }
  }
  dispose() {
    this.cancel();
    void this.context?.close().catch(() => {});
    this.context = null;
    this.master = null;
  }
}
