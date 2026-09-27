import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { X, Send, MessageSquare, Clock, User, Calendar, Loader2 } from 'lucide-react';

export const TaskDetailModal = ({ task, onClose }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!task?._id) return;
    const fetchComments = async () => {
      setLoadingComments(true);
      try {
        const res = await axiosClient.get(`/tasks/${task._id}/comments`);
        setComments(res.data || []);
      } catch (err) {
        console.error('Failed to load comments:', err.message);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [task?._id]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setPosting(true);
    try {
      const res = await axiosClient.post(`/tasks/${task._id}/comments`, {
        content: newComment,
      });
      setComments((prev) => [...prev, res.data]);
      setNewComment('');
    } catch (err) {
      alert(err.message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between">
          <div>
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {task.status.replace('_', ' ')}
            </span>
            <h2 className="text-lg font-bold text-white mt-2 leading-snug">{task.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Details metadata */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Priority: <strong className="text-white capitalize">{task.priority}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Due: <strong className="text-white">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'}</strong></span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
            <p className="text-sm text-slate-200 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/50 leading-relaxed whitespace-pre-wrap">
              {task.description || 'No description provided.'}
            </p>
          </div>

          {/* Comments Section */}
          <div className="pt-2 border-t border-slate-800/80">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Discussion ({comments.length})</span>
            </h4>

            {loadingComments ? (
              <div className="flex items-center justify-center p-6 text-slate-500 gap-2 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                <span>Loading activity...</span>
              </div>
            ) : comments.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4 bg-slate-950/40 rounded-xl">
                No comments yet. Start the conversation!
              </p>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {comments.map((c) => (
                  <div key={c._id} className="bg-slate-950 border border-slate-800/70 p-3 rounded-xl">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-indigo-300">{c.userId?.name || 'User'}</span>
                      <span className="text-slate-500">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-slate-200">{c.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comment Input Footer */}
        <form onSubmit={handlePostComment} className="p-4 border-t border-slate-800 bg-slate-950 flex gap-2">
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={posting}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Reply</span>
          </button>
        </form>
      </div>
    </div>
  );
};