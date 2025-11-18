"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, getFirestore } from "firebase/firestore";
import { auth, app } from "@/firebase";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function ChartCard() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const db = getFirestore(app);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const statsRef = doc(db, "users", user.uid, "stats", "weeklyPrompts");

    const unsubscribe = onSnapshot(statsRef, (snapshot) => {
      if (!snapshot.exists()) {
        setChartData([]);
        setLoading(false);
        return;
      }

      const data = snapshot.data();

      const formatted = [
        { day: "Mon", prompts: data.Mon || 0 },
        { day: "Tue", prompts: data.Tue || 0 },
        { day: "Wed", prompts: data.Wed || 0 },
        { day: "Thu", prompts: data.Thu || 0 },
        { day: "Fri", prompts: data.Fri || 0 },
        { day: "Sat", prompts: data.Sat || 0 },
        { day: "Sun", prompts: data.Sun || 0 },
      ];

      setChartData(formatted);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="card p-4 animate-pulse h-[260px] flex items-center justify-center text-sm text-gray-400">
        Loading chart...
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm text-[var(--muted)]">Weekly Performance</h3>
      </div>

      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <AreaChart
            data={chartData}
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="promptsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f39f6" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#432dd7" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />

            <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" />
            <YAxis stroke="rgba(255,255,255,0.4)" />

            <Tooltip
              contentStyle={{
                background: "rgba(15,16,20,0.95)",
                borderRadius: 8,
                border: "none",
                color: "#fff",
              }}
            />

            <Area
              type="monotone"
              dataKey="prompts"
              stroke="#3A7BD5"
              fill="url(#promptsGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
