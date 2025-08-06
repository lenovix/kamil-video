import { useEffect } from "react";

interface NotificationProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}

export default function Notification({
  message,
  type = "success",
  onClose,
}: NotificationProps) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timeout);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 px-4 py-2 rounded shadow-lg text-white transition-all duration-300 ${
        type === "success" ? "bg-green-600" : "bg-red-600"
      }`}
    >
      {message}
    </div>
  );
}
