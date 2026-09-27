import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../../api/axiosClient.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { X, UserPlus, Shield, UserX, Loader2, AlertCircle, Mail } from 'lucide-react';

export const MembersModal = ({ org, onClose }) => {
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Add Member State
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [addingMember, setAddingMember] = useState(false);
  const [inviteError, setInviteError] = useState('');

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await axiosClient.get(`/orgs/${org._id}/members`);
      setMembers(res.data || []);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }, [org._id]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setInviteError('');
    setAddingMember(true);
    try {
      await axiosClient.post(`/orgs/${org._id}/members`, {
        email: email.trim(),
        role,
      });

      setEmail('');
      setRole('member');
      fetchMembers(); // Fresh list load karo
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (membershipId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    try {
      await axiosClient.delete(`/orgs/${org._id}/members/${membershipId}`);
      setMembers((prev) => prev.filter((m) => m._id !== membershipId));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Workspace Members</h2>
              <p className="text-xs text-slate-400">{org.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-6 overflow-y-auto flex-1">
          {/* Invite Input Box */}
          <form onSubmit={handleAddMember} className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Add Member by Email
            </h3>

            {inviteError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{inviteError}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="colleague@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>

              <button
                type="submit"
                disabled={addingMember}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {addingMember ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                <span>Add</span>
              </button>
            </div>
          </form>

          {/* Members List */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Existing Members ({members.length})
            </h3>

            {loading ? (
              <div className="flex items-center justify-center p-8 text-slate-500 gap-2 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                <span>Loading team...</span>
              </div>
            ) : errorMsg ? (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                {errorMsg}
              </div>
            ) : members.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4 bg-slate-950/40 rounded-xl">
                No members found.
              </p>
            ) : (
              <div className="space-y-2">
                {members.map((m) => {
                  const memberUser = m.userId || {};
                  const isCurrent = memberUser._id === currentUser?._id;

                  return (
                    <div
                      key={m._id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">
                            {memberUser.name || 'Unnamed User'}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-medium">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500">{memberUser.email}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                          {m.role}
                        </span>

                        {/* Owner ko remove nahi kar sakte aur khud ko remove nahi karna yahan se */}
                        {m.role !== 'owner' && !isCurrent && (
                          <button
                            onClick={() => handleRemoveMember(m._id)}
                            className="text-slate-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                            title="Remove Member"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};