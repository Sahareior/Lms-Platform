import { useState, useEffect, useCallback } from 'react';
import {
  Bold, Italic, Underline, List, AlignLeft, ImageIcon, Link, Mic,
  Check, Share2, Loader2, AlertCircle
} from 'lucide-react';
import { useGetLessonNoteQuery, useSaveLessonNoteMutation } from '@my-monorepo/store';

interface NotesTabProps {
  lessonId: string;
  userId: string;
  lessonIndex: number;
}

export default function NotesTab({ lessonId, userId, lessonIndex }: NotesTabProps) {
  const [localContent, setLocalContent] = useState('');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: noteData, isLoading: isLoadingNote } = useGetLessonNoteQuery(
    { lessonId, userId },
    { skip: !lessonId || !userId }
  );

  const [saveNote, { isLoading: isSaving }] = useSaveLessonNoteMutation();

  // Load note content when data arrives
  useEffect(() => {
    if (noteData?.note) {
      setLocalContent(noteData.note.content || '');
    }
  }, [noteData]);

  // Track unsaved changes
  useEffect(() => {
    if (noteData?.note) {
      setHasChanges(localContent !== (noteData.note.content || ''));
    } else {
      setHasChanges(localContent !== '');
    }
  }, [localContent, noteData]);

  const handleSave = useCallback(async () => {
    if (!lessonId || !userId) return;
    try {
      await saveNote({ lessonId, userId, content: localContent }).unwrap();
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setHasChanges(false);
    } catch (err) {
      console.error('Failed to save note', err);
    }
  }, [lessonId, userId, localContent, saveNote]);

  // Auto-save on blur after changes
  const handleBlur = useCallback(() => {
    if (hasChanges) handleSave();
  }, [hasChanges, handleSave]);

  // ─── Loading State ────────────────────────────
  if (isLoadingNote) {
    return (
      <div className="bg-[#111318] rounded-2xl p-5 border border-[#23262D] flex items-center justify-center py-8">
        <Loader2 size={20} className="animate-spin text-[#2F80ED] mr-2" />
        <span className="text-sm text-[#A1A8B3]">Loading notes...</span>
      </div>
    );
  }

  // ─── Auth Required ────────────────────────────
  if (!lessonId || !userId) {
    return (
      <div className="bg-[#111318] rounded-2xl p-5 border border-[#23262D]">
        <div className="flex items-center gap-2 text-[#F2C94C]">
          <AlertCircle size={16} />
          <span className="text-sm font-medium">Please log in to take notes</span>
        </div>
      </div>
    );
  }

  // ─── Main Notes UI ────────────────────────────
  return (
    <div className="bg-[#111318] rounded-2xl p-5 border border-[#23262D]">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-[#F5F7FA] text-sm">My Notes - Lesson {lessonIndex + 1}</h3>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-[10px] text-[#6B7280]">Last saved: {lastSaved}</span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`text-xs flex items-center gap-1 px-3 py-1 rounded-lg transition font-semibold ${
              isSaving
                ? 'bg-[#23262D] text-[#6B7280] cursor-wait'
                : hasChanges
                  ? 'bg-[#2F80ED] text-white hover:bg-[#256BCE]'
                  : 'bg-[#00E5B3]/10 text-[#00E5B3] border border-[#00E5B3]/30'
            }`}
          >
            {isSaving ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Check size={12} />
            )}
            {isSaving ? 'Saving...' : hasChanges ? 'Save' : 'Saved'}
          </button>
          <button className="text-xs flex items-center gap-1 px-3 py-1 border border-[#23262D] rounded-lg text-[#A1A8B3] hover:bg-[#161920] hover:text-[#F5F7FA] transition">
            <Share2 size={12} /> Export
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 pb-3 border-b border-[#23262D] text-[#A1A8B3]">
        <Bold size={16} className="cursor-pointer hover:text-[#F5F7FA] transition-colors" />
        <Italic size={16} className="cursor-pointer hover:text-[#F5F7FA] transition-colors" />
        <Underline size={16} className="cursor-pointer hover:text-[#F5F7FA] transition-colors" />
        <span className="w-px h-4 bg-[#23262D]" />
        <List size={16} className="cursor-pointer hover:text-[#F5F7FA] transition-colors" />
        <AlignLeft size={16} className="cursor-pointer hover:text-[#F5F7FA] transition-colors" />
        <span className="w-px h-4 bg-[#23262D]" />
        <ImageIcon size={16} className="cursor-pointer hover:text-[#F5F7FA] transition-colors" />
        <Link size={16} className="cursor-pointer hover:text-[#F5F7FA] transition-colors" />
        <Mic size={16} className="cursor-pointer hover:text-[#F5F7FA] transition-colors" />
      </div>

      {/* Textarea */}
      <textarea
        value={localContent}
        onChange={(e) => setLocalContent(e.target.value)}
        onBlur={handleBlur}
        placeholder="Take notes while watching the lesson..."
        className="mt-3 min-h-[160px] w-full text-sm p-3 bg-[#161920] border border-[#23262D] rounded-lg focus:outline-none focus:border-[#2F80ED] focus:ring-1 focus:ring-[#2F80ED]/30 resize-none text-[#F5F7FA] placeholder-[#6B7280] transition"
      />

      {/* Footer */}
      <div className="mt-2 flex justify-between items-center">
        <span className="text-[10px] text-[#6B7280]">
          {localContent.length} characters
        </span>
        {hasChanges && (
          <span className="text-[10px] text-[#F2C94C] font-medium">Unsaved changes</span>
        )}
      </div>
    </div>
  );
}