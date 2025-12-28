"use client";
import Sidebar from "./components/sidebar";
import Header from "./components/Header";
import StatCard from "./components/Statcard";
import ChartCard from "./components/ChartCard";
import RightPanel from "./components/RightPanel";
import RatingModal from "./components/RatingModal";
import SharePreviewModal from "./components/SharePreviewModal";
import { Star, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { auth, db } from "@/firebase";
import { collection, query, orderBy, limit, onSnapshot, doc, onSnapshot as fsOnSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from 'next/navigation';
import type { User } from "firebase/auth";
import type { Timestamp, DocumentData } from "firebase/firestore";


interface Project {
  id: string;
  title?: string;
  name?: string;
  updatedAt?: Timestamp;
}


export default function Page() {
  const [showHistory, setShowHistory] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState<string>("");
  const [shareLoading, setShareLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [ratingRefresh, setRatingRefresh] = useState(0);
  const router = useRouter();

  // 🔹 Listen to Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // 🔹 Listen to recent projects
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "projects"),
      orderBy("updatedAt", "desc"),
      limit(3)
    );

    const unsub = onSnapshot(q, (snap) => {
      const items: Project[] = [];
      snap.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
      setRecentProjects(items);
    });

    return () => unsub();
  }, [user]);

  // 🔹 Listen to user rating
  useEffect(() => {
    if (!user) return;

    const statsRef = doc(db, "users", user.uid, "stats", "overview");
    const unsub = fsOnSnapshot(statsRef, (snap) => {
      if (snap.exists()) {
        setUserRating(snap.data().rating || null);
      }
    });

    return () => unsub();
  }, [user, ratingRefresh]);

  // 🔹 Handle share modal
  const handleShareClick = (shareText: string) => {
    setShareData(shareText);
    setShowShareModal(true);
  };

  const handleConfirmShare = async () => {
    setShareLoading(true);

    // Try Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My DesynAI Weekly Performance",
          text: shareData,
        });
        setShowShareModal(false);
      } catch (err) {
        console.error("Share failed:", err);
      }
      setShareLoading(false);
      return;
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareData);
      setShowShareModal(false);
    } catch (err) {
      console.error("Copy failed:", err);
    } finally {
      setShareLoading(false);
    }
  };

  // 🔹 Wait for user to load
  if (!user) return <div className="p-10 text-white">Loading dashboard...</div>;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 max-md:mt-10">
        <Header
          title="Dashboard"
          icon={<LayoutDashboard className="text-indigo-400 w-7 h-7" />}
          onHistoryClick={() => setShowHistory(true)}
        />
        
        <section className="grid grid-cols-12 gap-6">
          {/* Left stats */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <StatCard
              title="Total Prompts"
              path={["users", "<uid>", "stats", "overview"]}
              field="totalPrompts"
            />
            <StatCard
              title="Today Prompts"
              path={["users", "<uid>", "stats", "weeklyPrompts"]}
              field={new Date().toLocaleString("en-US", { weekday: "short" })}
            />
            <StatCard
              title="Weekly Prompts"
              path={["users", "<uid>", "stats", "weeklyPrompts"]}
              field="weekTotal"
            />

            <StatCard icon={<Star size={18} />} title="Rating" value={userRating ? userRating.toFixed(1) : "No Rating"} delta={userRating ? "+Rated" : "Not rated"} />
          </div>

          {/* Center chart */}
          <div className="col-span-12 lg:col-span-6 bg-black/50 backdrop-blur-md rounded-md p-4 border border-[#23272F]">
            <ChartCard />
            <div className="mt-4 grid grid-cols-3 gap-4 rounded-md">
              {recentProjects.length === 0 ? (
                <>
                  <div className="card p-3">Loading...</div>
                  <div className="card p-3">Loading...</div>
                  <div className="card p-3">Loading...</div>
                </>
              ) : (
                recentProjects.map((p) => (
                  <div key={p.id} className="card p-3">
                    <div className="text-xs text-[#b0b7c3]">{p.title || p.name}</div>
                    <div className="h-16 mt-3 bg-[rgba(255,255,255,0.02)] rounded" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right panel */}
          <div className="col-span-12 lg:col-span-3 space-y-10 bg-black/50 backdrop-blur-md pt-4 border border-[#23272F] rounded-md">
            <RightPanel onShareClick={handleShareClick} />
            <div className="card p-4">
              <h4 className="text-sm text-[var(--muted)]">Quick Action</h4>
              <div className="mt-3 flex flex-col gap-2">
                <button 
                  onClick={() => setShowRatingModal(true)}
                  className="py-2 rounded-lg bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] text-white border border-[#23272f]">
                  Rate Us
                </button>
                <button className="py-2 rounded-lg bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] text-white border border-[#23272f]"
                onClick={() => router.push('/desyn')}
                >
                  Desyn Studio
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <RatingModal 
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSuccess={() => setRatingRefresh(prev => prev + 1)}
      />

      <SharePreviewModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onConfirm={handleConfirmShare}
        shareText={shareData}
        isLoading={shareLoading}
      />
    </div>
  );
}
