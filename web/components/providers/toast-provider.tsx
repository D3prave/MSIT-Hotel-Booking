"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ToastVariant = "error" | "info" | "success";

type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  addToast: (message: string, variant?: ToastVariant) => void;
  dismissToast: (id: number) => void;
};

const TOAST_DURATION_MS = 4200;

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

type ToastProviderProps = {
  children: ReactNode;
};

const variantClassName: Record<ToastVariant, string> = {
  error: "border-red-500/40 bg-red-500/15 text-red-200",
  info: "border-sky-500/40 bg-sky-500/15 text-sky-200",
  success: "border-emerald-500/40 bg-emerald-500/15 text-emerald-100",
};

export default function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const trimmedMessage = message.trim();
      if (!trimmedMessage) return;

      const toastId = Date.now() + Math.floor(Math.random() * 1000);

      setToasts((current) => [...current, { id: toastId, message: trimmedMessage, variant }]);

      window.setTimeout(() => {
        dismissToast(toastId);
      }, TOAST_DURATION_MS);
    },
    [dismissToast]
  );

  const value = useMemo(
    () => ({
      addToast,
      dismissToast,
    }),
    [addToast, dismissToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[90] mx-auto flex w-full max-w-md flex-col gap-2 px-4 sm:right-5 sm:left-auto sm:mx-0 sm:max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm font-semibold shadow-xl backdrop-blur ${variantClassName[toast.variant]}`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start justify-between gap-3">
              <p>{toast.message}</p>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="rounded-md px-2 text-xs font-black uppercase tracking-wide text-white/70 transition hover:text-white"
                aria-label="Dismiss notification"
              >
                x
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }
  return context;
}
