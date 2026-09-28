"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { ToastViewport } from "@/components/ui/Toast";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ message, variant = "success" }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, variant }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastViewport toasts={toasts} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
