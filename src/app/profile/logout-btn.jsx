"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (res.ok) {
        localStorage.clear();
        router.replace("/");
        router.refresh();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="cursor-pointer w-full sm:w-auto
      inline-flex items-center justify-center
      rounded-xl
      bg-[#D64545] text-white
      px-6 py-3
      font-medium
      shadow-sm
      hover:bg-[#B93A3A]
      focus:ring-2 focus:ring-offset-2 focus:ring-[#D64545]
      disabled:opacity-60 disabled:cursor-not-allowed
      transition duration-200"
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Logging out...
        </div>
      ) : (
        "Logout"
      )}
    </button>
  );
}
