import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useOrg } from "../../context/OrgContext.jsx";
import axiosClient from "../../api/axiosClient.js";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { MembersModal } from "../../components/org/MembersModal.jsx";
import {
  LogOut,
  FolderKanban,
  Plus,
  Building2,
  Loader2,
  ArrowRight,
} from "lucide-react";

export const Overview = () => {
  const { user, logout } = useAuth();
  const { organizations, currentOrg, setCurrentOrg, createOrg, loadingOrgs } =
    useOrg();

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Modals / Simple Input state
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [showMembersModal, setShowMembersModal] = useState(false);

  // Jab bhi currentOrg change ho, uske projects fetch karo
  useEffect(() => {
    const fetchProjects = async () => {
      if (!currentOrg?._id) return;
      setLoadingProjects(true);
      try {
        const res = await axiosClient.get(`/orgs/${currentOrg._id}/projects`);
        setProjects(res.data);
      } catch (err) {
        console.error("Failed to fetch projects:", err.message);
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [currentOrg]);

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    await createOrg(newOrgName);
    setNewOrgName("");
    setShowOrgModal(false);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim() || !currentOrg?._id) return;
    try {
      const res = await axiosClient.post(`/orgs/${currentOrg._id}/projects`, {
        name: newProjectName,
        description: newProjectDesc,
      });
      setProjects((prev) => [res.data, ...prev]);
      setNewProjectName("");
      setNewProjectDesc("");
      setShowProjectModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/60 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              PH
            </div>
            <span className="font-bold text-white tracking-tight">
              ProjectHub
            </span>
          </div>

          {/* Workspace Switcher */}
          {organizations.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
              <Building2 className="w-4 h-4 text-slate-400" />
              <select
                value={currentOrg?._id || ""}
                onChange={(e) => {
                  const selected = organizations.find((item) => {
                    const org = item.organization || item;
                    return org._id === e.target.value;
                  });
                  if (selected) {
                    setCurrentOrg(selected.organization || selected);
                  }
                }}
                className="bg-transparent text-sm font-medium text-slate-200 focus:outline-none cursor-pointer"
              >
                {organizations.map((item, index) => {
                  const org = item.organization || item;
                  const orgId = org?._id || `org-fallback-${index}`;
                  const role = item.role ? `(${item.role})` : "";

                  return (
                    <option
                      key={orgId}
                      value={orgId}
                      className="bg-slate-900 text-white"
                    >
                      {org?.name || "Unnamed Org"} {role}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <button
            onClick={() => setShowOrgModal(true)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> New Org
          </button>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400">
            {user?.name} ({user?.email})
          </span>
          <button
            onClick={logout}
            className="text-slate-400 hover:text-rose-400 p-1.5 transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-8">
        {loadingOrgs ? (
          <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            <span>Loading workspaces...</span>
          </div>
        ) : !currentOrg ? (
          /* No Workspace Empty State */
          <div className="text-center p-12 bg-slate-900/40 border border-slate-800 rounded-2xl max-w-lg mx-auto mt-12">
            <Building2 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-white mb-2">
              No Workspace Found
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              Create your first organization or workspace to start managing
              projects.
            </p>
            <button
              onClick={() => setShowOrgModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl cursor-pointer"
            >
              Create Workspace
            </button>
          </div>
        ) : (
          /* Projects Section */
          <div>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/80">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>{currentOrg.name}</span>
                </h1>
                <p className="text-slate-400 text-xs mt-1">
                  Slug: {currentOrg.slug}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMembersModal(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium px-3.5 py-2 rounded-xl flex items-center gap-2 border border-slate-700 cursor-pointer"
                >
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>Team Members</span>
                </button>

                <button
                  onClick={() => setShowProjectModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Project</span>
                </button>
              </div>
            </div>

            {loadingProjects ? (
              <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                <span>Loading projects...</span>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center p-12 bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl">
                <FolderKanban className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">
                  No projects in this workspace yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {projects.map((proj) => (
                  <div
                    key={proj._id}
                    className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-medium">
                          {proj.status}
                        </span>
                      </div>
                      <h3 className="font-semibold text-white text-lg mb-1">
                        {proj.name}
                      </h3>
                      <p className="text-slate-400 text-xs line-clamp-2 mb-4">
                        {proj.description || "No description provided"}
                      </p>
                    </div>

                    <Link
                      to={`/projects/${proj._id}`}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer mt-2"
                    >
                      <span>Open Project Tasks</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal: Create Org */}
        {showOrgModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold text-white mb-2">
                Create Workspace
              </h3>
              <form onSubmit={handleCreateOrg}>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp or SIH Team"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 mb-4"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowOrgModal(false)}
                    className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 cursor-pointer"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Create Project */}
        {showProjectModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold text-white mb-2">
                Create New Project
              </h3>
              <form onSubmit={handleCreateProject} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Project Name (e.g. Mobile App)"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <textarea
                  placeholder="Description (optional)"
                  rows={3}
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowProjectModal(false)}
                    className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 cursor-pointer"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      {showMembersModal && currentOrg && (
        <MembersModal
          org={currentOrg}
          onClose={() => setShowMembersModal(false)}
        />
      )}
    </div>
  );
};
