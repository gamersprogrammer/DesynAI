"use client";

import { useEffect, useState } from "react";
import { FolderKanban, PlusCircle, Trash2, Download, ExternalLink } from "lucide-react";
import Sidebar from "../components/sidebar";
import Link from "next/link";
import Header from "../components/Header";
import { auth, app } from "@/firebase";
import {
  getFirestore,
  collection,
  deleteDoc,
  doc,
  addDoc,
  serverTimestamp,
  orderBy,
  query,
  onSnapshot,
} from "firebase/firestore";
import JSZip from "jszip";
import { useRouter } from "next/navigation";
import { Timestamp } from "firebase/firestore";

interface Project {
  id: string;
  title?: string;
  status?: string;
  blocks: unknown[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const db = getFirestore(app);

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState("");

  const router = useRouter();

  /** 🔥 Load user projects in realtime */
  useEffect(() => {
    if (!auth.currentUser) return;

    const userId = auth.currentUser.uid;
    const projectsCol = collection(db, "users", userId, "projects");
    const q = query(projectsCol, orderBy("updatedAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Project[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Project, "id">),
      }));
      setProjects(fetched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /** 🗑 Delete project */
  const handleDelete = async (projectId: string) => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;

    if (!confirm("Delete this project?")) return;

    await deleteDoc(doc(db, "users", userId, "projects", projectId));
  };

  /** 📦 Export project to ZIP */
  const exportProject = async (project: Project) => {
    const zip = new JSZip();
    zip.file("project.json", JSON.stringify(project, null, 2));
    const blob = await zip.generateAsync({ type: "blob" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title || "project"}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /** 🆕 Create new project + redirect */
  const createNewProject = async () => {
    if (!projectName.trim()) return alert("Enter a project name.");

    const user = auth.currentUser;
    if (!user) return;

    const docRef = await addDoc(
      collection(db, "users", user.uid, "projects"),
      {
        title: projectName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: "in-progress",
        blocks: [], // initial empty design
      }
    );

    setShowModal(false);
    setProjectName("");

    // redirect to new editor
    router.push(`/desyn?project=${docRef.id}`);
  };

  return (
    <div className="min-h-screen bg-[var(--panel)] text-white flex overflow-hidden">
      <Sidebar />

      <main className="flex-1 p-8 md:p-10 flex flex-col max-md:mt-10">
        <Header
          title="Projects"
          icon={<FolderKanban className="text-indigo-400 w-7 h-7" />}
        />

        <div className="backdrop-blur-md rounded-md p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-semibold text-[#e6edf3]">
              Saved Designs
            </h2>

            {/* NEW PROJECT BUTTON */}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#23272f] text-white hover:bg-[rgba(255,255,255,0.04)] transition"
            >
              <PlusCircle className="w-4 h-4" />
              New Project
            </button>
          </div>

          {loading ? (
            <p className="text-gray-400 text-center mt-8 italic">
              Loading projects...
            </p>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group relative flex flex-col justify-between p-5 bg-[rgba(22,27,34,0.9)] border border-[#23272f] rounded-2xl hover:border-indigo-500/30 transition-all duration-200"
                >
                  {/* --- Top Right Actions (Hidden until hover) --- */}
                  <div className="absolute top-4 right-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => exportProject(project)}
                      title="Export ZIP"
                      className="text-[#6c737f] hover:text-indigo-300 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      title="Delete Project"
                      className="text-[#6c737f] hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* --- Main Content --- */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-3 pr-16 line-clamp-1">
                      {project.title || "Untitled Project"}
                    </h3>

                    {/* Tags Row */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Status Tag - Styled like the pills in reference image */}
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-[#23272f] text-[#b0b7c3] capitalize border border-[#30363d]">
                        {project.status || "in-progress"}
                      </span>

                      {/* Date text */}
                      <span className="text-[#6c737f] text-xs">
                        {project.updatedAt?.toDate
                          ? project.updatedAt.toDate().toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                  </div>

                  {/* --- Bottom Action Button --- */}
                  <div className="flex justify-end">
                    <Link
                      href={`/desyn?project=${project.id}`}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors shadow-sm"
                    >
                      Open Editor
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center mt-8 italic">
              No projects yet.
            </p>
          )}
        </div>
      </main>

      {/* ✨ CREATE NEW PROJECT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0d1117] border border-[#23272f] rounded-xl p-6 w-[90%] max-w-md shadow-2xl animate-fadeIn">
            <h3 className="text-xl font-semibold mb-4 text-white">
              Name Your Project
            </h3>

            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg bg-black/40 border border-[#23272f] text-white focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="e.g. Portfolio layout v2"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              autoFocus
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-[#b0b7c3] hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={createNewProject}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 font-medium transition-colors"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}