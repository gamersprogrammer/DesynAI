"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/firebase";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Loading is derived from the route
  const [loading, setLoading] = useState(() => pathname !== "/signin");

  useEffect(() => {
    // Skip auth guard entirely on signin page
    if (pathname === "/signin") return;

    const auth = getAuth(app);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/signin");
      } else {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-(--panel) text-white">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        <span className="ml-3 font-medium text-indigo-300">Loading...</span>
      </div>
    );
  }

  return <>{children}</>;
}
