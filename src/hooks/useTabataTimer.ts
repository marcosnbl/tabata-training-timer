"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildIntervals, type Routine, type TimerStatus } from "@/lib/routines";
export function useTabataTimer(routine: Routine) {
  const intervals = useMemo(() => buildIntervals(routine), [routine]);
  const boundaries = useMemo(() => {
    let t = 0;
    return intervals.map((i) => {
      const start = t;
      t += i.duration * 1000;
      return { start, end: t };
    });
  }, [intervals]);
  const total = boundaries.at(-1)?.end ?? 0;
  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const elapsedRef = useRef(0),
    anchor = useRef(0),
    statusRef = useRef<TimerStatus>("idle");
  const updateStatus = useCallback((s: TimerStatus) => {
    statusRef.current = s;
    setStatus(s);
  }, []);
  const reset = useCallback(() => {
    elapsedRef.current = 0;
    setElapsed(0);
    updateStatus("idle");
  }, [updateStatus]);
  useEffect(() => {
    reset();
  }, [routine, reset]);
  useEffect(() => {
    if (status !== "running") return;
    let frame = 0;
    const tick = () => {
      const now = Math.min(total, performance.now() - anchor.current);
      elapsedRef.current = now;
      setElapsed(now);
      if (now >= total) {
        updateStatus("finished");
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [status, total, updateStatus]);
  const toggle = () => {
    if (statusRef.current === "running") {
      elapsedRef.current = Math.min(total, performance.now() - anchor.current);
      setElapsed(elapsedRef.current);
      updateStatus("paused");
    } else {
      if (statusRef.current === "finished") elapsedRef.current = 0;
      anchor.current = performance.now() - elapsedRef.current;
      updateStatus("running");
    }
  };
  const index = Math.max(
    0,
    boundaries.findIndex((b) => elapsed < b.end),
  );
  const activeIndex = status === "finished" ? intervals.length - 1 : index;
  const jump = (direction: number) => {
    const current = boundaries.findIndex((b) => elapsedRef.current < b.end);
    const target = Math.max(0, current + direction);
    const next = target >= boundaries.length ? total : boundaries[target].start;
    elapsedRef.current = next;
    anchor.current = performance.now() - next;
    setElapsed(next);
    if (next >= total) updateStatus("finished");
    else if (statusRef.current === "finished") updateStatus("paused");
  };
  return {
    status,
    elapsed,
    total,
    intervals,
    index: activeIndex,
    current: intervals[activeIndex],
    remaining:
      status === "finished"
        ? 0
        : (boundaries[activeIndex].end - elapsed) / 1000,
    progress: total ? elapsed / total : 0,
    toggle,
    reset,
    next: () => jump(1),
    previous: () => jump(-1),
  };
}
