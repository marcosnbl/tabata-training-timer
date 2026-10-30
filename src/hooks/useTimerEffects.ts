"use client";
import { useEffect, useRef, useState } from "react";
import type { Phase, TimerStatus } from "@/lib/routines";
import {
  TimerAudio,
  resolveSoundCue,
  type AudioPreferences,
  type AudioSnapshot,
  type SoundCue,
} from "@/lib/timerAudio";
export function useTimerEffects(
  status: TimerStatus,
  index: number,
  remaining: number,
  sound: boolean,
  awake: boolean,
  phase: Phase,
  preferences: AudioPreferences,
) {
  const audio = useRef<TimerAudio | null>(null);
  const previous = useRef<AudioSnapshot | null>(null);
  const [wakeState, setWakeState] = useState("Desactivado");
  const [audioError, setAudioError] = useState("");
  const unlock = async () => {
    try {
      audio.current ??= new TimerAudio();
      await audio.current.unlock();
      setAudioError("");
    } catch {
      setAudioError(
        "El navegador no pudo activar el audio. Vuelve a probar o revisa los permisos de sonido del sitio.",
      );
    }
  };
  const preview = async (cue: SoundCue) => {
    await unlock();
    audio.current?.preview(cue, preferences);
  };
  const seconds = Math.ceil(remaining);
  useEffect(() => {
    const snapshot: AudioSnapshot = { status, index, seconds, phase };
    const cue = resolveSoundCue(previous.current, snapshot);
    previous.current = snapshot;
    if (status === "paused" || status === "idle" || !sound)
      audio.current?.cancel();
    if (cue && sound) audio.current?.play(cue, preferences, seconds);
  }, [status, index, seconds, phase, sound, preferences]);
  useEffect(() => {
    audio.current?.cancel();
  }, [sound, preferences.style, preferences.volume]);
  useEffect(
    () => () => {
      audio.current?.dispose();
      audio.current = null;
    },
    [],
  );
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    let disposed = false;
    const request = async () => {
      if (
        !awake ||
        status !== "running" ||
        document.visibilityState !== "visible"
      )
        return;
      if (!("wakeLock" in navigator)) {
        setWakeState("No compatible");
        return;
      }
      try {
        const acquired = await navigator.wakeLock.request("screen");
        if (disposed) {
          await acquired.release();
          return;
        }
        lock = acquired;
        setWakeState("Activo");
        acquired.addEventListener("release", () => setWakeState("Suspendido"));
      } catch {
        setWakeState("No disponible");
      }
    };
    const visibility = () => {
      if (document.visibilityState === "visible") void request();
    };
    void request();
    document.addEventListener("visibilitychange", visibility);
    if (!awake || status !== "running") setWakeState("Desactivado");
    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", visibility);
      void lock?.release();
    };
  }, [awake, status]);
  return {
    unlock,
    preview,
    cancelPreview: () => audio.current?.cancel(),
    wakeState,
    audioError,
  };
}
