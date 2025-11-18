"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/firebase";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Ensure this code runs only on client
    if (typeof window === "undefined") return;
    
  // Skip guard on signin page
  if (window.location.pathname === "/signin") {
    setLoading(false);
    return;
  }

    const auth = getAuth(app);

    // Delay subscription slightly to allow Firebase to initialize
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/signin"); // use replace instead of push to avoid back button issues
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--panel)] text-white">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-400" />
        <span className="ml-3 text-indigo-300 font-medium">Loading...</span>
      </div>
    );
  }

  return <>{children}</>;
}
