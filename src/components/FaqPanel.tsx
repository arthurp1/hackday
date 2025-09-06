import React, { useMemo, useState } from 'react';
import { useHackathon } from '../contexts/HackathonContext';
import { Plus, Edit3, Trash2, Save, X } from 'lucide-react';

interface FaqPanelProps {
  isHost?: boolean;
}

const FaqPanel: React.FC<FaqPanelProps> = ({ isHost = false }) => {
  const { state, upsertFaqItem, deleteFaqItem } = useHackathon();
  const { faq = [] } = state;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftQ, setDraftQ] = useState('');
  const [draftA, setDraftA] = useState('');

  const sortedFaq = useMemo(() => {
    return [...faq].sort((a, b) => a.question.localeCompare(b.question));
  }, [faq]);

  const startEdit = (id?: string) => {
    if (id) {
      const item = faq.find(f => f.id === id);
      if (item) {
        setEditingId(id);
        setDraftQ(item.question);
        setDraftA(item.answer);
      }
    } else {
      setEditingId('new');
      setDraftQ('');
      setDraftA('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftQ('');
    setDraftA('');
  };

  const saveEdit = async () => {
    if (!draftQ.trim() || !draftA.trim()) return;
    const id = editingId && editingId !== 'new' ? editingId : undefined;
    const res = await upsertFaqItem({ id, question: draftQ.trim(), answer: draftA.trim() });
    if (res.success) cancelEdit();
  };

  const removeItem = async (id: string) => {
    await deleteFaqItem(id);
  };

  return (
    <div className="space-y-3">

      {/* List */}
      <div className="space-y-2">
        {sortedFaq.map(item => (
          <div key={item.id} className="p-3 bg-black/30 border border-white/10 rounded">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="text-white font-medium">{item.question}</div>
                <div className="text-sm text-gray-300 mt-1 whitespace-pre-line">{item.answer}</div>
              </div>
              {isHost && (
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(item.id)} className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded" title="Edit">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => removeItem(item.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Editor */}
      {isHost && (
        <div className="mt-2 p-3 bg-black/40 border border-white/10 rounded">
          <div className="flex items-center justify-between mb-2">
            <div className="text-white font-semibold text-sm">{editingId ? (editingId === 'new' ? 'Add FAQ' : 'Edit FAQ') : 'Add or Edit FAQ'}</div>
            {!editingId && (
              <button onClick={() => startEdit()} className="px-2 py-1 text-xs text-green-300 hover:bg-green-500/10 rounded inline-flex items-center gap-1">
                <Plus className="w-3 h-3" /> New FAQ
              </button>
            )}
          </div>
          {editingId && (
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Question</label>
                <input
                  value={draftQ}
                  onChange={(e) => setDraftQ(e.target.value)}
                  className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded text-white text-sm focus:border-cyan-500 outline-none"
                  placeholder="What’s the demo time and format?"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Answer</label>
                <textarea
                  value={draftA}
                  onChange={(e) => setDraftA(e.target.value)}
                  className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded text-white text-sm focus:border-cyan-500 outline-none"
                  rows={4}
                  placeholder={"10 minutes total: 5 min demo + 5 min slides. Show how you built it, AI features, stack, etc."}
                />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={saveEdit} className="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded text-cyan-300 hover:bg-cyan-500/30 text-sm">
                  <Save className="w-4 h-4" /> Save
                </button>
                <button onClick={cancelEdit} className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-500/20 border border-gray-500/30 rounded text-gray-300 hover:bg-gray-500/30 text-sm">
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FaqPanel;
