"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Loader2, Sparkles } from "lucide-react";
import Sidebar from "../components/sidebar";
import Header from "../components/Header";

export default function TrendsPage() {
  const [chartData, setChartData] = useState<{ month: string; usage: number }[]>([]);
  const [tips, setTips] = useState<{ title: string; description: string }[]>([]);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingTips, setLoadingTips] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true); // 👈 tracks if the page is visible

  const fetchChartData = async () => {
    try {
      setLoadingChart(true);
      const res = await fetch("/api/trendsData");
      const json = await res.json();
      setChartData(json.data || []);
    } catch (err) {
      console.error("Error loading chart:", err);
    } finally {
      setLoadingChart(false);
    }
  };

  const fetchDesignTips = async () => {
    try {
      setLoadingTips(true);
      const res = await fetch("/api/designTips");
      const json = await res.json();
      setTips(json.tips || []);
    } catch (err) {
      console.error("Error loading tips:", err);
    } finally {
      setLoadingTips(false);
    }
  };

  // 👇 Only fetch data when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Initial load
    if (isPageVisible) {
      fetchChartData();
      fetchDesignTips();
    }

    // Refresh only if user is on the page
    const interval = setInterval(() => {
      if (isPageVisible) {
        fetchChartData();
        fetchDesignTips();
      }
    }, 3600000); // 1 hour

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isPageVisible]);

  return (
    <div className="min-h-screen bg-[var(--panel)] text-white flex overflow-hidden">
      <Sidebar />

      <main className="flex-1 p-8 md:p-10 max-md:mt-10">
        <Header
          title="Trends"
          icon={<TrendingUp className="text-indigo-400 w-7 h-7" />}
          onHistoryClick={() => setShowHistory(true)}
        />

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Chart Section */}
          <div className="bg-black/50 backdrop-blur-md rounded-md p-6 border border-[#23272F]">
            <h2 className="text-lg font-semibold mb-4 text-white">Design Trend Data</h2>

            {loadingChart ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin w-6 h-6 text-indigo-400" />
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip />
                  <Line type="monotone" dataKey="usage" stroke="#818cf8" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-gray-400">No data available.</div>
            )}
          </div>

          {/* AI Design Tips */}
          <div className="bg-black/50 backdrop-blur-md rounded-md p-6 border border-[#23272F]">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-indigo-400 w-5 h-5" />
              <h2 className="text-lg font-semibold text-indigo-400">DesynAI Tips</h2>
            </div>

            {loadingTips ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin w-6 h-6 text-indigo-400" />
              </div>
            ) : tips.length > 0 ? (
              <ul className="space-y-4">
                {tips.map((tip, i) => (
                  <li
                    key={i}
                    className="bg-indigo-950/30 border border-[#23272F] p-4 rounded-xl"
                  >
                    <h3 className="font-semibold text-indigo-300 mb-1">{tip.title}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{tip.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm">No tips available.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
