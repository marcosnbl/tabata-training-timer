"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export function Dialog({
  title,
  id,
  onClose,
  children,
}: {
  title: string;
  id: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby={id}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="dialog-heading">
        <h2 id={id}>{title}</h2>
        <button className="icon-button" onClick={onClose} aria-label="Cerrar">
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
