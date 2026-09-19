import { useState, useEffect, useCallback } from 'react';
import {
  Bold, Italic, Underline, List, AlignLeft, ImageIcon, Link, Mic,
  Check, Share2, Loader2, AlertCircle
} from 'lucide-react';
import { useGetLessonNoteQuery, useSaveLessonNoteMutation } from '@my-monorepo/store';
import { useTheme } from '../../../../theme/ThemeContext';


interface NotesTabProps {
  lessonId: string;
  userId: string;
  lessonIndex: number;
}

export default function NotesTab({ lessonId, userId, lessonIndex }: NotesTabProps) {
  const { isDark } = useTheme();
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
      <div className={isDark ? 'bg-[#111318] rounded-2xl p-5 border border-[#23262D] flex items-center justify-center py-8' : 'bg-[#f2efe9] rounded-lg p-5 border border-[#d8d4cb] flex items-center justify-center py-8 shadow-[2px_2px_0px_0px_#1a1a1a]'}>
        <Loader2 size={20} className={isDark ? 'animate-spin text-[#2F80ED] mr-2' : 'animate-spin text-[#b91c1c] mr-2'} />
        <span className={isDark ? 'text-sm text-[#A1A8B3]' : 'text-sm text-[#4a4a4a] font-serif'}>Loading notes...</span>
      </div>
    );
  }

  if (!lessonId || !userId) {
    return (
      <div className={isDark ? 'bg-[#111318] rounded-2xl p-5 border border-[#23262D]' : 'bg-[#f2efe9] rounded-lg p-5 border border-[#d8d4cb] shadow-[2px_2px_0px_0px_#1a1a1a]'}>
        <div className={isDark ? 'flex items-center gap-2 text-[#F2C94C]' : 'flex items-center gap-2 text-[#b91c1c]'}>
          <AlertCircle size={16} />
          <span className={isDark ? 'text-sm font-medium' : 'text-sm font-serif'}>Please log in to take notes</span>
        </div>
      </div>
    );
  }

  return (
    <div className={isDark ? 'bg-[#111318] rounded-2xl p-5 border border-[#23262D]' : 'bg-[#f2efe9] rounded-lg p-5 border border-[#d8d4cb] shadow-[2px_2px_0px_0px_#1a1a1a]'}>
      <div className="flex justify-between items-center mb-3">
        <h3 className={isDark ? 'font-bold text-[#F5F7FA] text-sm' : 'font-black text-[#1a1a1a] text-sm font-serif'}>My Notes - Lesson {lessonIndex + 1}</h3>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className={isDark ? 'text-[10px] text-[#6B7280]' : 'text-[10px] text-[#4a4a4a] font-serif'}>Last saved: {lastSaved}</span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`text-xs flex items-center gap-1 px-3 py-1 rounded-lg transition font-semibold ${
              isSaving
                ? (isDark ? 'bg-[#23262D] text-[#6B7280] cursor-wait' : 'bg-[#e0dcd5] text-[#4a4a4a] cursor-wait')
                : hasChanges
                  ? (isDark ? 'bg-[#2F80ED] text-white hover:bg-[#256BCE]' : 'bg-[#1a1a1a] text-[#f2efe9] hover:bg-[#2b2b2b]')
                  : (isDark ? 'bg-[#00E5B3]/10 text-[#00E5B3] border border-[#00E5B3]/30' : 'bg-[#e0dcd5] text-[#1a1a1a] border border-[#d8d4cb]')
            }`}
          >
            {isSaving ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Check size={12} />
            )}
            {isSaving ? 'Saving...' : hasChanges ? 'Save' : 'Saved'}
          </button>
          <button className={isDark ? 'text-xs flex items-center gap-1 px-3 py-1 border border-[#23262D] rounded-lg text-[#A1A8B3] hover:bg-[#161920] hover:text-[#F5F7FA] transition' : 'text-xs flex items-center gap-1 px-3 py-1 border border-[#d8d4cb] rounded-md text-[#4a4a4a] hover:bg-[#e0dcd5] hover:text-[#1a1a1a] transition font-serif'}>
            <Share2 size={12} /> Export
          </button>
        </div>
      </div>

      <div className={isDark ? 'flex items-center gap-3 pb-3 border-b border-[#23262D] text-[#A1A8B3]' : 'flex items-center gap-3 pb-3 border-b border-[#d8d4cb] text-[#4a4a4a]'}>
        <Bold size={16} className="cursor-pointer hover:text-[#F5F7FA] transition-colors" />
        <Italic size={16} className="cursor-pointer hover:text-[#F5F7FA] transition-colors" />
        <Underline size={16} className="cursor-pointer hover:text-[#F5F7FA] transition-colors" />
        <span className={isDark ? 'w-px h-4 bg-[#23262D]' : 'w-px h-4 bg-[#d8d4cb]'} />
        <List size={16} className="cursor-pointer hover:text-[#F5F7FA] transition-colors" />
        <AlignLeft size={16} className="cursor-pointer hover:text-[#F5F7FA] transition-colors" />
        <span className={isDark ? 'w-px h-4 bg-[#23262D]' : 'w-px h-4 bg-[#d8d4cb]'} />
        <ImageIcon size={16} className="cursor-pointer hover:text-[#F5F7FA] transition-colors" />
        <Link size={16} className="cursor-pointer hover:text-[#F5F7FA] transition-colors" />
        <Mic size={16} className="cursor-pointer hover:text-[#F5F7FA] transition-colors" />
      </div>

      <textarea
        value={localContent}
        onChange={(e) => setLocalContent(e.target.value)}
        onBlur={handleBlur}
        placeholder="Take notes while watching the lesson..."
        className={isDark ? 'mt-3 min-h-[160px] w-full text-sm p-3 bg-[#161920] border border-[#23262D] rounded-lg focus:outline-none focus:border-[#2F80ED] focus:ring-1 focus:ring-[#2F80ED]/30 resize-none text-[#F5F7FA] placeholder-[#6B7280] transition' : 'mt-3 min-h-[160px] w-full text-sm p-3 bg-[#f7f4ef] border border-[#d8d4cb] rounded-md focus:outline-none focus:border-[#b91c1c] focus:ring-1 focus:ring-[#b91c1c]/20 resize-none text-[#1a1a1a] placeholder-[#6B7280] font-serif transition'}
      />

      <div className="mt-2 flex justify-between items-center">
        <span className={isDark ? 'text-[10px] text-[#6B7280]' : 'text-[10px] text-[#4a4a4a] font-serif'}>{localContent.length} characters</span>
        {hasChanges && (
          <span className={isDark ? 'text-[10px] text-[#F2C94C] font-medium' : 'text-[10px] text-[#b91c1c] font-bold font-serif'}>Unsaved changes</span>
        )}
      </div>
    </div>
  );
}