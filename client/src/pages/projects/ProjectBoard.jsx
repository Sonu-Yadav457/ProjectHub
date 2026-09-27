import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient.js';
import { useOrg } from '../../context/OrgContext.jsx';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { TaskDetailModal } from '../../components/tasks/TaskDetailModal.jsx';
import { 
  ArrowLeft, 
  Plus, 
  AlertCircle, 
  Loader2,
  GripVertical
} from 'lucide-react';

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'border-slate-800' },
  { id: 'in_progress', label: 'In Progress', color: 'border-amber-500/30' },
  { id: 'in_review', label: 'In Review', color: 'border-indigo-500/30' },
  { id: 'done', label: 'Done', color: 'border-emerald-500/30' },
];

export const ProjectBoard = () => {
  const { projectId } = useParams();
  const { currentOrg, loadingOrgs } = useOrg();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Task Modal states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!currentOrg?._id) return;

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await axiosClient.get(
        `/orgs/${currentOrg._id}/projects/${projectId}/tasks`
      );
      setTasks(res.data || []);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId, currentOrg?._id]);

  useEffect(() => {
    if (currentOrg?._id) {
      fetchTasks();
    }
  }, [fetchTasks, currentOrg?._id]);

  // Create Task Handler
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim() || !currentOrg?._id) return;

    setCreatingTask(true);
    try {
      const res = await axiosClient.post(
        `/orgs/${currentOrg._id}/projects/${projectId}/tasks`,
        {
          title: taskTitle,
          description: taskDesc,
          priority: taskPriority,
          dueDate: taskDueDate || null,
        }
      );

      setTasks((prev) => [res.data, ...prev]);
      setTaskTitle('');
      setTaskDesc('');
      setTaskPriority('medium');
      setTaskDueDate('');
      setShowTaskModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setCreatingTask(false);
    }
  };

  // Drag and Drop Handler
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // 1. Agar board ke bahar drop kiya, kuch mat karo
    if (!destination) return;

    // 2. Agar same column aur same position pe chhod diya, ignore karo
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const targetStatus = destination.droppableId;

    // 3. Optimistic UI update: State turant badlo bina API wait kiye
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t._id === draggableId ? { ...t, status: targetStatus } : t))
    );

    // 4. Backend PATCH call
    try {
      await axiosClient.patch(`/tasks/${draggableId}`, {
        status: targetStatus,
      });
    } catch (err) {
      alert('Failed to update task position: ' + err.message);
      setTasks(previousTasks); // Rollback on error
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'high':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'medium':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  if (loadingOrgs || (!currentOrg && loading)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm font-medium">Loading workspace context...</p>
      </div>
    );
  }

  if (!currentOrg) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4 p-6 text-center">
        <AlertCircle className="w-10 h-10 text-amber-500" />
        <p className="text-white text-base">No active workspace found for this project.</p>
        <Link
          to="/"
          className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Project Tasks Board</h1>
            <p className="text-xs text-slate-400">Workspace: {currentOrg.name}</p>
          </div>
        </div>

        <button
          onClick={() => setShowTaskModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </header>

      {/* Kanban DragDropContext Area */}
      <main className="flex-1 p-6 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <span>Loading task board...</span>
          </div>
        ) : errorMsg ? (
          <div className="max-w-md mx-auto p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 min-w-[1000px] h-full items-start">
              {COLUMNS.map((col) => {
                const colTasks = tasks.filter((t) => t.status === col.id);

                return (
                  <Droppable key={col.id} droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`bg-slate-900/40 border ${col.color} rounded-2xl p-4 flex flex-col min-h-[550px] transition-colors ${
                          snapshot.isDraggingOver ? 'bg-slate-800/40 border-indigo-500/50' : ''
                        }`}
                      >
                        {/* Column Header */}
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/80">
                          <span className="font-semibold text-sm text-slate-200">
                            {col.label}
                          </span>
                          <span className="text-xs bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded-full">
                            {colTasks.length}
                          </span>
                        </div>

                        {/* Draggable Tasks List */}
                        <div className="flex-1 space-y-3">
                          {colTasks.map((task, index) => (
                            <Draggable
                              key={task._id}
                              draggableId={task._id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => setSelectedTask(task)}
                                  className={`bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm transition-shadow select-none ${
                                    snapshot.isDragging
                                      ? 'border-indigo-500 ring-2 ring-indigo-500/30 shadow-2xl bg-slate-800'
                                      : 'hover:border-slate-700'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <h4 className="font-medium text-sm text-white leading-snug">
                                      {task.title}
                                    </h4>
                                    <GripVertical className="w-4 h-4 text-slate-600 flex-shrink-0 cursor-grab" />
                                  </div>

                                  {task.description && (
                                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                                      {task.description}
                                    </p>
                                  )}

                                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
                                    <span
                                      className={`px-2 py-0.5 rounded-md border font-medium uppercase tracking-wider text-[10px] ${getPriorityBadge(
                                        task.priority
                                      )}`}
                                    >
                                      {task.priority}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </DragDropContext>
        )}
      </main>

      {/* Modal: Create Task */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-3">Create New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="Task title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Details..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTask}
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {creatingTask && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Task</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};