import React, { useState } from 'react';
import { MessageSquare, X, Send, CheckCircle2, User, Clock } from 'lucide-react';

interface CommentItem {
  id: string;
  author_name: string;
  author_role: string;
  text: string;
  version: number;
  created_at: string;
  is_resolved: boolean;
}

interface CommentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentVersion: number;
  currentUser: { name: string; role: string };
}

export const CommentDrawer: React.FC<CommentDrawerProps> = ({
  isOpen,
  onClose,
  currentVersion,
  currentUser
}) => {
  const [comments, setComments] = useState<CommentItem[]>([
    {
      id: 'comm-1',
      author_name: 'Priya Nair',
      author_role: 'manager',
      text: '@ananya Please ensure we do not use GlowSerum Plus in the Diwali reels. The European packaging team retired that name.',
      version: 1,
      created_at: '2 hours ago',
      is_resolved: false
    },
    {
      id: 'comm-2',
      author_name: 'Kavita Iyer',
      author_role: 'administrator',
      text: 'Mandatory legal reminder: Quantitative clinical hydration claims require the 14-day study cohort disclaimer.',
      version: 1,
      created_at: '1 hour ago',
      is_resolved: true
    }
  ]);
  const [newComment, setNewComment] = useState('');

  if (!isOpen) return null;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setComments(prev => [
      ...prev,
      {
        id: `comm-${Date.now()}`,
        author_name: currentUser.name,
        author_role: currentUser.role,
        text: newComment,
        version: currentVersion,
        created_at: 'Just now',
        is_resolved: false
      }
    ]);
    setNewComment('');
  };

  const toggleResolved = (id: string) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, is_resolved: !c.is_resolved } : c));
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0b1410] border-l border-[#1b3426] shadow-2xl p-6 flex flex-col space-y-4">
      <div className="flex items-center justify-between border-b border-[#1b2f23] pb-3">
        <div className="flex items-center space-x-2 text-emerald-400">
          <MessageSquare className="w-5 h-5" />
          <h3 className="font-bold text-slate-100 text-sm">Reviewer Collaboration Threads (IS 14)</h3>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="text-[11px] text-slate-400 font-mono bg-[#070d0a] p-2.5 rounded-lg border border-[#16271e]">
        Active Content Version: <strong className="text-emerald-400">v{currentVersion}</strong> • Historical anchors preserved
      </div>

      {/* Comment List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {comments.map((c) => (
          <div
            key={c.id}
            className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${
              c.is_resolved
                ? 'bg-[#080e0b] border-[#16271e] opacity-60'
                : 'bg-[#0c1913] border-[#1f3a2b]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-slate-200">{c.author_name}</span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {c.author_role}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
                <span>v{c.version}</span>
                <span>•</span>
                <span>{c.created_at}</span>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed font-sans">{c.text}</p>

            <div className="flex items-center justify-end pt-1">
              <button
                onClick={() => toggleResolved(c.id)}
                className={`text-[10px] font-medium flex items-center space-x-1 px-2 py-0.5 rounded transition-colors ${
                  c.is_resolved
                    ? 'text-slate-500 hover:text-slate-300'
                    : 'text-emerald-400 hover:text-emerald-300 bg-emerald-950/40'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>{c.is_resolved ? 'Reopen' : 'Resolve Thread'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleAddComment} className="pt-2 border-t border-[#172a1e] space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Leave a comment or mention (@priya, @rohit)..."
          className="w-full bg-[#070d0a] border border-[#1a3325] rounded-xl p-3 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none h-20 resize-none font-sans"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow flex items-center space-x-1.5 disabled:opacity-40"
          >
            <span>Post Comment</span>
            <Send className="w-3 h-3" />
          </button>
        </div>
      </form>
    </div>
  );
};
