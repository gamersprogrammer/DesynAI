"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  Copy,
  Code2,
  FileText,
  X,
  Trash2,
  Download,
} from "lucide-react";
import Sidebar from "../components/sidebar";
import Header from "../components/Header";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import { auth, app } from "@/firebase"; // adjust path if needed
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  getDocs,
  getDoc,
  increment,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

const db = getFirestore(app);

export default function DesynPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams?.get("project") || null;
  const projectName = searchParams.get("project") || null;

  // UI state
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generationMode, setGenerationMode] = useState<"text" | "code">(
    "text"
  );
  const [sparkles, setSparkles] = useState<number[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [projectHistory, setProjectHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // auth/user
  const [user, setUser] = useState<any>(null);
  const [initializing, setInitializing] = useState(true);

  // project meta (title)
  const [projectMeta, setProjectMeta] = useState<any | null>(null);
  const [project, setProject] = useState<any>(null);

  // Sparkly loading animation
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(
      () => setSparkles((prev) => [...prev, Math.random()]),
      150
    );
    const cleanup = setTimeout(() => clearInterval(interval), 4000);
    return () => {
      clearInterval(interval);
      clearTimeout(cleanup);
    };
  }, [loading]);

  //Get project from url
  useEffect(() => {
    if(!projectName || !auth.currentUser) return;

    const fetchProject = async () => {
      const ref = doc(db, "users", auth.currentUser.uid, "projects", projectName);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setProject( { id:snap.id, ...snap.data()});
      }
      setLoading(false);
    };

    fetchProject();
  }, [projectName]);

  // Listen for auth state
  useEffect(() => {
    setInitializing(true);
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
      setInitializing(false);
    });
    return () => unsub();
  }, []);

  // Load user prompts history (global) when user available
  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      try {
        const snaps = await getDocs(
          collection(db, "users", user.uid, "prompts")
        );
        const fetched = snaps.docs.map((d) => ({ id: d.id, ...d.data() }));
        setHistory(fetched.reverse());
      } catch (err) {
        console.error("Failed to fetch user prompts", err);
      }
    };

    fetchHistory();
  }, [user]);

  // If projectId present, fetch project metadata and project history
  useEffect(() => {
    if (!user || !projectId) {
      setProjectMeta(null);
      setProjectHistory([]);
      return;
    }

    let mounted = true;
    const fetchProject = async () => {
      try {
        const pRef = doc(db, "users", user.uid, "projects", projectId);
        const pSnap = await getDoc(pRef);
        if (mounted && pSnap.exists()) {
          setProjectMeta({ id: pSnap.id, ...pSnap.data() });
        } else {
          setProjectMeta(null);
        }

        // project history (ordered newest first)
        // project-specific history is a subcollection; use getDocs
        const historySnaps = await getDocs(
          collection(db, "users", user.uid, "projects", projectId, "history")
        );
        const ph = historySnaps.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (mounted) setProjectHistory(ph.reverse());
      } catch (err) {
        console.error("Failed to fetch project", err);
      }
    };

    fetchProject();

    return () => {
      mounted = false;
    };
  }, [user, projectId]);

  // Main generation handler
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setResponse("Please enter a prompt before generating.");
      return;
    }
    if (!user) {
      // show a quick redirect to signin or prompt the user
      router.push("/signin");
      return;
    }

    setLoading(true);
    setResponse("");

    try {
      // Call AI API
      const res = await fetch("/api/desyn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, mode: generationMode }),
      });
      const data = await res.json();
      const result = data.result || "No response received.";
      setResponse(result);

      // Build entry
      const newEntry = {
        prompt,
        response: result,
        mode: generationMode,
        time: new Date().toLocaleTimeString(),
        createdAt: serverTimestamp(),
      };

      // Update local state immediately
      setHistory((prev) => [newEntry, ...prev]);

      // Save to user's prompts collection
      await addDoc(collection(db, "users", user.uid, "prompts"), newEntry);

      // Update weeklyPrompts (Mon..Sun) for chart
      const statsRef = doc(db, "users", user.uid, "stats", "weeklyPrompts");
      const weekday = new Date().toLocaleString("en-US", { weekday: "short" }); // Mon, Tue...
      await setDoc(
        statsRef,
        {
          [weekday]: increment(1),
          lastUpdated: serverTimestamp(),
        },
        { merge: true }
      );

      // Update overview stats for StatCards
      const overviewRef = doc(db, "users", user.uid, "stats", "overview");
      await setDoc(
        overviewRef,
        {
          totalPrompts: increment(1),
          daily: {
            count: increment(1),
            date: new Date().toLocaleDateString("en-US"),
          },
          lastUpdated: serverTimestamp(),
        },
        { merge: true }
      );

      // If there's an active project (projectId), append to that project's history
      if (projectId) {
        const projectRef = doc(db, "users", user.uid, "projects", projectId);
        await addDoc(collection(projectRef, "history"), newEntry);

        // update project metadata
        await updateDoc(projectRef, {
          updatedAt: serverTimestamp(),
          lastPrompt: prompt,
        });

        // local projectHistory update so UI shows it right away
        setProjectHistory((prev) => [newEntry, ...prev]);
      }

      // keep prompt but optionally clear: setPrompt("");
    } catch (err) {
      console.error("Generate error:", err);
      setResponse("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Copy response
  const handleCopy = () => {
    navigator.clipboard.writeText(response || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export ZIP of visible history (if project open export projectHistory, else export global history)
  const handleExportZip = async () => {
    const source = projectId ? projectHistory : history;
    if (source.length === 0) return alert("No history to export!");
    const zip = new JSZip();
    source.forEach((item: any, i: number) => {
      const fileName = `${i + 1} - ${item.mode}_${item.time?.replace(/:/g, "-")}.txt`;
      const content = `Prompt:\n${item.prompt}\n\nResponse:\n${item.response}`;
      zip.file(fileName, content);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `${projectId ? projectName?.title ?? "project" : "desyn"}_history.zip`);
  };

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to clear your prompt history locally?")) return;
    // local clear
    if (projectId) setProjectHistory([]);
    else setHistory([]);

    // optionally: delete from Firestore (not implemented automatically to avoid data loss)
  };

  // UI loading while auth initializing
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--panel)] text-white">
        <div className="animate-spin h-8 w-8 border-b-2 border-white rounded-full" />
        <span className="ml-3">Checking authentication...</span>
      </div>
    );
  }

  // If user not signed in -> show signin suggestion
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--panel)] text-white px-6">
        <div className="max-w-md text-center bg-[#0b0c10] p-8 rounded-xl border border-gray-800">
          <h2 className="text-xl font-semibold mb-2">You're not signed in</h2>
          <p className="text-sm text-[#b0b7c3] mb-6">Sign in to save prompts and continue projects.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push("/signin")} className="px-4 py-2 rounded-lg bg-indigo-600">Go to Sign in</button>
          </div>
        </div>
      </div>
    );
  }

  // choose which history to show in drawer
  const visibleHistory = projectName ? projectHistory : history;

  return (
    <div className="min-h-screen bg-[var(--panel)] text-white flex overflow-hidden relative">
      <Sidebar />

      <main className="flex-1 p-8 md:p-10 flex flex-col max-md:mt-10">
        <Header
          title='Desyn Studio'
          icon={<Sparkles className="text-indigo-400 w-7 h-7" />}
          onHistoryClick={() => setShowHistory(true)}
        />

        <div className="flex flex-row max-md:flex-col-reverse gap-8 flex-1 overflow-hidden h-[60%]">
          {/* Input Section */}
          <div className="flex-1 backdrop-blur-md p-6 flex flex-col h-[70vh]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-[#e6edf3]">Studio</h2>
                {project ? (
                  <div className="text-xs text-[#b0b7c3]">Active project:  {project?.title || "Untitled Project"}</div>
                ) : (
                  <div className="text-xs text-[#b0b7c3]">No active project — create one on Projects</div>
                )}
              </div>

              {/* Mode Switch */}
              <div className="flex items-center gap-2 bg-[#161b22] rounded-lg px-3 py-1.5">
                <button
                  onClick={() => setGenerationMode("text")}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm max-md:text-xs max-md:px-1 ${
                    generationMode === "text" ? "bg-black" : "hover:bg-gray-700"
                  }`}
                >
                  <FileText className="w-4 h-4" /> Text
                </button>
                <button
                  onClick={() => setGenerationMode("code")}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm max-md:text-xs max-md:px-1 ${
                    generationMode === "code" ? "bg-black" : "hover:bg-gray-700"
                  }`}
                >
                  <Code2 className="w-4 h-4" /> Code
                </button>
              </div>
            </div>

            <textarea
              className="flex-1 p-4 rounded-md focus:outline-none focus:ring-1 focus:ring-[#23272f] resize-none text-gray-100 scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-gray-800"
              placeholder={
                generationMode === "code"
                  ? "Write a React component that displays a profile card..."
                  : "Design a modern dashboard for tracking fitness goals..."
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />

            <div className="mt-5 flex items-center justify-between gap-3 w-full">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 max-md:text-xs max-md:px-3 max-md:py-2.5 py-3 border border-[#23272f] rounded-lg text-white hover:bg-[rgba(255,255,255,0.04)] transition disabled:opacity-50"
              >
                <Sparkles className={`w-5 h-5 ${loading ? "animate-pulse" : ""}`} />
                {loading
                  ? `Generating ${generationMode === "code" ? "Code..." : "Design..."}`
                  : `Generate ${generationMode === "code" ? "Code" : "Design"}`}
              </button>

              <button
                onClick={() => {
                  setPrompt("");
                  setResponse("Your generated designs will appear here...");
                }}
                className="px-6 max-md:text-xs max-md:px-3 max-md:py-2.5 py-3 text-white font-medium rounded-lg border border-[#23272f] hover:bg-[rgba(255,255,255,0.04)] transition flex items-center justify-center"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="flex-1 rounded-md p-6 flex flex-col h-[70vh]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-indigo-400">Desyn</h2>
              {response && (
                <button
                  onClick={handleCopy}
                  className="text-sm flex items-center gap-2 px-3 py-1.5 text-white rounded-lg hover:text-gray-200 transition"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>

            <div className="flex-1 p-4 rounded-md overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 text-sm text-gray-100 whitespace-pre-wrap relative scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-gray-800 leading-relaxed">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full relative">
                  <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
                  <p className="mt-2 text-indigo-300 font-medium">
                    Generating your {generationMode}...
                  </p>
                </div>
              ) : response ? (
                generationMode === "code" ? (
                  <pre className="bg-black border border-gray-800 p-4 rounded-lg text-green-400 font-mono text-[13px] leading-snug overflow-x-auto shadow-inner">
                    <code>{response}</code>
                  </pre>
                ) : (
                  <div className="prose prose-invert max-w-none text-gray-200 text-[15px] leading-relaxed space-y-3">
                    {response.split("\n").map((line, i) =>
                      line.trim() === "" ? <br key={i} /> : <p key={i}>{line}</p>
                    )}
                  </div>
                )
              ) : (
                <p className="text-gray-500 text-center mt-8 italic">
                  Your AI-generated {generationMode} will appear here...
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* History Drawer */}
      {showHistory && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowHistory(false)}
          />
          <div className="relative z-50 w-96 bg-[#0D0D0D] border-l border-gray-800 shadow-2xl p-5 animate-slideIn overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#e6edf3]">Prompt History</h2>
              <button onClick={() => setShowHistory(false)} className="p-1 rounded hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2 mb-5">
              <button
                onClick={handleExportZip}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] text-white border border-[#23272f] transition"
              >
                <Download className="w-4 h-4" /> Export ZIP
              </button>
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-700 py-2 rounded-lg text-white border border-[#23272f] transition"
              >
                <Trash2 className="w-4 h-4" /> Clear
              </button>
            </div>

            {visibleHistory.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No history yet. Generate something to get started.</p>
            ) : (
              <div className="space-y-4">
                {visibleHistory.map((item, i) => (
                  <div key={i} className="p-3 bg-black/40 border border-gray-800 rounded-lg hover:bg-black/60 transition">
                    <p className="text-xs text-gray-400">{item.time}</p>
                    <p className="text-sm font-medium text-indigo-300 mt-1">{item.mode?.toUpperCase?.()}</p>
                    <p className="text-gray-200 text-sm mt-1">{item.prompt}</p>
                    <details className="mt-2 text-gray-400 text-xs">
                      <summary className="cursor-pointer text-indigo-400">View Output</summary>
                      <pre className="mt-1 bg-gray-900 p-2 rounded text-[12px] overflow-x-auto border border-gray-800">
                        {item.response}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideIn { animation: slideIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}
