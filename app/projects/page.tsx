"use client";

import { useEffect, useState } from "react";
import { FolderKanban, PlusCircle, Trash2, Download } from "lucide-react";
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

const db = getFirestore(app);

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
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
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
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
  const exportProject = async (project: any) => {
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
          <div className="flex justify-between items-center mb-6">
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
            <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="p-4 bg-[rgba(22,27,34,0.9)] border border-[#23272f] rounded-md"
                >
                  <h3 className="text-lg font-semibold text-white">
                    {project.title || "Untitled Project"}
                  </h3>

                  <p className="text-[#6c737f] text-sm mb-3">
                    Updated{" "}
                    {project.updatedAt?.toDate
                      ? project.updatedAt.toDate().toLocaleDateString()
                      : "N/A"}
                  </p>

                  <div className="flex justify-between items-center bg-[#161b22] p-3 rounded-md">
                    <p className="text-sm text-[#b0b7c3]">
                      {project.status || "in-progress"}
                    </p>

                    <div className="flex gap-2 px-2 py-1 rounded">
                      <Link
                        href={`/desyn?project=${project.id}`}
                        className="text-sm text-indigo-400 hover:text-indigo-500"
                      >
                        Open
                      </Link>

                      <button
                        onClick={() => exportProject(project)}
                        className="text-indigo-300 hover:text-indigo-400 text-sm flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(project.id)}
                        className="flex items-center gap-1 text-red-400 hover:text-red-500 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0d1117] border border-[#23272f] rounded-lg p-6 w-[90%] max-w-md shadow-xl animate-fadeIn">
            <h3 className="text-lg font-semibold mb-3">
              Name Your Project
            </h3>

            <input
              type="text"
              className="w-full px-3 py-2 rounded-md bg-black/20 border border-[#23272f] text-white focus:outline-none"
              placeholder="e.g. Portfolio layout"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-300 hover:text-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={createNewProject}
                className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
              >
                Create
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
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
