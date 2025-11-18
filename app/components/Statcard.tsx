"use client";
import React, { useEffect, useState } from "react";
import { doc, onSnapshot, getFirestore } from "firebase/firestore";
import { app, auth } from "@/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

interface StatCardProps { 
  title: string; 
  value?: string | number; 
  delta?: string; 
  icon?: React.ReactNode;

  // Firestore path array: ["users", "<uid>", "stats"]
  path?: string[];   
  field?: string;    
}

export default function StatCard({ title, value, delta, icon, path, field }: StatCardProps) {
  const db = getFirestore(app);

  const [liveValue, setLiveValue] = useState<number | string>(value || 0);
  const [user, setUser] = useState<User | null>(null);

  // Listen for auth
  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  // Realtime Firestore listener
  useEffect(() => {
    if (!path || !field || !user) return;

    const finalPath = path.map((p) => (p === "<uid>" ? user.uid : p));
    const ref = doc(db, ...finalPath);

    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      setLiveValue(data[field] ?? 0); // only this user's field
    });

    return () => unsub();
  }, [path, field, user]);
  

  return (
    <div className="card p-4 flex flex-col gap-2 bg-black/50 backdrop-blur-md rounded-md border border-[#23272F]">
      <div className="flex items-center justify-between">
        <div className="text-xs text-[#b0b7c3]">{title}</div>
        {icon ? <div>{icon}</div> : <div className="text-xs text-[var(--muted)]">{delta || ""}</div>}
      </div>

      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-bold text-[#e6edf3]">{liveValue}</div>
        {delta && <div className="text-sm text-[#b0b7c3]">{delta}</div>}
      </div>

      <div className="h-1 bg-[rgba(255,255,255,0.02)] rounded-full mt-2">
        <div className="h-1 rounded-full" style={{ width: "45%", background: "#23272f" }} />
      </div>
    </div>
  );
}
