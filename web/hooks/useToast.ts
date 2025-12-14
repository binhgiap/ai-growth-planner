import { useCallback, useState } from "react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (message: string, type: "success" | "error" | "warning" | "info" = "info", duration = 3000) => {
      const id = Date.now().toString();
      const toast: ToastMessage = { id, type, message, duration };

      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((message: string) => addToast(message, "success"), [addToast]);
  const error = useCallback((message: string) => addToast(message, "error"), [addToast]);
  const warning = useCallback((message: string) => addToast(message, "warning"), [addToast]);
  const info = useCallback((message: string) => addToast(message, "info"), [addToast]);

  return { toasts, addToast, removeToast, success, error, warning, info };
}
