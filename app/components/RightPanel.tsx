"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Share2, Loader2 } from "lucide-react";
import { auth, app } from "@/firebase";
import { doc, onSnapshot, getFirestore } from "firebase/firestore";
import { useRouter } from "next/navigation";

interface RightPanelProps {
  onShareClick?: (text: string) => void;
}

interface WeeklyPrompts {
  Mon?: number;
  Tue?: number;
  Wed?: number;
  Thu?: number;
  Fri?: number;
  Sat?: number;
  Sun?: number;
}

export default function RightPanel({ onShareClick }: RightPanelProps) {
  const db = useMemo(() => getFirestore(app), []);
  const router = useRouter();

  const [pct, setPct] = useState(0);
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState<WeeklyPrompts | null>(null);

  const WEEKLY_GOAL = 50;

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const statsRef = doc(db, "users", user.uid, "stats", "weeklyPrompts");

    const unsubscribe = onSnapshot(statsRef, (snapshot) => {
      if (!snapshot.exists()) {
        setWeeklyData(null);
        setPct(0);
        setLoading(false);
        return;
      }

      const data = snapshot.data() as WeeklyPrompts;
      setWeeklyData(data);

      const total =
        (data.Mon ?? 0) +
        (data.Tue ?? 0) +
        (data.Wed ?? 0) +
        (data.Thu ?? 0) +
        (data.Fri ?? 0) +
        (data.Sat ?? 0) +
        (data.Sun ?? 0);

      const percentage = Math.min(
        Math.round((total / WEEKLY_GOAL) * 100),
        100
      );

      setPct(percentage);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  const generateShareText = (): string => {
    if (!weeklyData) return "";

    const total =
      (weeklyData.Mon ?? 0) +
      (weeklyData.Tue ?? 0) +
      (weeklyData.Wed ?? 0) +
      (weeklyData.Thu ?? 0) +
      (weeklyData.Fri ?? 0) +
      (weeklyData.Sat ?? 0) +
      (weeklyData.Sun ?? 0);

    return `🎨 My Weekly Design Performance on DesynAI

📊 Progress: ${pct}% of ${WEEKLY_GOAL} prompts
📈 Total Prompts: ${total}

Weekly Breakdown:
📅 Monday: ${weeklyData.Mon ?? 0}
📅 Tuesday: ${weeklyData.Tue ?? 0}
📅 Wednesday: ${weeklyData.Wed ?? 0}
📅 Thursday: ${weeklyData.Thu ?? 0}
📅 Friday: ${weeklyData.Fri ?? 0}
📅 Saturday: ${weeklyData.Sat ?? 0}
📅 Sunday: ${weeklyData.Sun ?? 0}

Join me on DesynAI — AI-Powered Design Inspiration! 🚀`;
  };

  if (loading) {
    return (
      <div className="card p-4 flex items-center justify-center">
        <Loader2 className="animate-spin text-white" size={28} />
      </div>
    );
  }

  // SVG ring math
  const circleSize = 120;
  const stroke = 8;
  const radius = (circleSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="card p-4 flex flex-col items-center gap-4">
      <svg width={circleSize} height={circleSize}>
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0%" stopColor="#4f39f6" />
            <stop offset="100%" stopColor="#432dd7" />
          </linearGradient>
        </defs>

        <circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
          fill="none"
        />

        <circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          stroke="url(#g1)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${circleSize / 2} ${circleSize / 2})`}
          fill="none"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />

        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="white"
          fontSize="22"
          fontWeight="600"
        >
          {pct}%
        </text>
      </svg>

      <p className="text-xs text-[#b0b7c3] text-center">
        {pct}% of your weekly design tasks done. Keep going!
      </p>

      <div className="w-full flex gap-2">
        <button
          className="flex-1 py-2 rounded-lg border border-[#23272f] hover:bg-white/5 transition"
          onClick={() => router.push("/projects")}
        >
          Continue
        </button>

        <button
          onClick={() => onShareClick?.(generateShareText())}
          className="flex gap-2 items-center justify-center py-2 px-3 rounded-lg border border-[#23272f] hover:bg-white/5 transition"
        >
          <Share2 size={16} />
          Share
        </button>
      </div>
    </div>
  );
}
