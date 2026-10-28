"use client";
import { useEffect, useRef, useState } from "react";
import type { Phase, TimerStatus } from "@/lib/routines";
export function useTimerEffects(
  status: TimerStatus,
  index: number,
  remaining: number,
  sound: boolean,
  awake: boolean,
  phase: Phase,
) {
  const audio = useRef<AudioContext | null>(null);
  const last = useRef("");
  const previousIndex = useRef(-1);
  const [wakeState, setWakeState] = useState("Desactivado");
  const unlock = () => {
    audio.current ??= new AudioContext();
    void audio.current.resume();
  };
  useEffect(() => {
    if (status === "idle") {
      previousIndex.current = -1;
      last.current = "";
      return;
    }
    if (status !== "running" && status !== "finished") return;
    const seconds = Math.ceil(remaining);
    const key = `${status === "finished" ? "end" : index}:${seconds}`;
    if (last.current === key) return;
    last.current = key;
    const changed = previousIndex.current !== index || status === "finished";
    previousIndex.current = index;
    if (!sound || !audio.current || (!changed && (seconds > 3 || seconds < 1)))
      return;
    const ctx = audio.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = changed ? (phase === "work" ? 950 : 780) : 620;
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  }, [status, index, remaining, sound, phase]);
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
  return { unlock, wakeState };
}
