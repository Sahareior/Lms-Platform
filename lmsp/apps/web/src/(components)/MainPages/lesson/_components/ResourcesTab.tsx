import { Download, ExternalLink, FileText, Video, Headphones, File } from 'lucide-react';

interface Resource {
  _id?: string;
  name: string;
  url: string;
  type: 'PDF' | 'DOC' | 'PPT' | 'VIDEO' | 'AUDIO' | 'OTHER';
}

interface ResourcesTabProps {
  resources?: Resource[];
  material?: string[];
}

const typeIconMap: Record<string, React.ElementType> = {
  PDF: FileText,
  DOC: FileText,
  PPT: FileText,
  VIDEO: Video,
  AUDIO: Headphones,
  OTHER: File,
};

// Dark‑themed semantic colours (BrainForge)
const typeColors: Record<string, string> = {
  PDF:   'bg-[#EB5757]/10 text-[#EB5757] border border-[#EB5757]/30',
  DOC:   'bg-[#2F80ED]/10 text-[#2F80ED] border border-[#2F80ED]/30',
  PPT:   'bg-[#F2C94C]/10 text-[#F2C94C] border border-[#F2C94C]/30',
  VIDEO: 'bg-[#9B51E0]/10 text-[#9B51E0] border border-[#9B51E0]/30',
  AUDIO: 'bg-[#00E5B3]/10 text-[#00E5B3] border border-[#00E5B3]/30',
  OTHER: 'bg-[#A1A8B3]/10 text-[#A1A8B3] border border-[#A1A8B3]/30',
};

export default function ResourcesTab({ resources, material }: ResourcesTabProps) {
  const hasResources = resources && resources.length > 0;
  const hasMaterials = material && material.length > 0;

  if (!hasResources && !hasMaterials) {
    return (
      <div className="bg-[#111318] rounded-2xl p-5 border border-[#23262D]">
        <h3 className="font-bold text-[#F5F7FA] text-sm mb-3">Resources & Materials</h3>
        <div className="text-center py-8 text-[#6B7280]">
          <FileText size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium">No resources available for this lesson.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111318] rounded-2xl p-5 border border-[#23262D]">
      <h3 className="font-bold text-[#F5F7FA] text-sm mb-3">Resources & Materials</h3>

      {/* Structured Resources */}
      {hasResources && (
        <div className="space-y-2 mb-4">
          <h4 className="text-[10px] font-bold text-[#A1A8B3] uppercase tracking-wider mb-2">Lesson Resources</h4>
          {resources!.map((res) => {
            const Icon = typeIconMap[res.type] || File;
            const colorClass = typeColors[res.type] || typeColors.OTHER;

            return (
              <a
                key={res._id || res.name}
                href={res.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 bg-[#161920] rounded-lg hover:bg-[#1C1F26] border border-[#23262D] hover:border-[#323742] transition cursor-pointer group"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#F5F7FA] truncate group-hover:text-[#2F80ED] transition">
                    {res.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-[#6B7280] uppercase">{res.type}</span>
                    <span className="text-[10px] text-[#323742]">•</span>
                    <span className="text-[10px] text-[#6B7280] truncate">{res.url.split('/').pop()}</span>
                  </div>
                </div>
                <ExternalLink size={14} className="text-[#A1A8B3] opacity-0 group-hover:opacity-100 transition" />
              </a>
            );
          })}
        </div>
      )}

      {/* Additional Materials */}
      {hasMaterials && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-[#A1A8B3] uppercase tracking-wider mb-2">Additional Materials</h4>
          {material!.map((mat, idx) => (
            <a
              key={idx}
              href={mat}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-3 bg-[#161920] rounded-lg hover:bg-[#1C1F26] border border-[#23262D] hover:border-[#323742] transition cursor-pointer group"
            >
              <div className="w-10 h-10 bg-[#2F80ED]/10 border border-[#2F80ED]/30 rounded-lg flex items-center justify-center text-[#2F80ED]">
                <Download size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#F5F7FA] truncate group-hover:text-[#2F80ED] transition">
                  {mat.split('/').pop() || `Material ${idx + 1}`}
                </p>
                <p className="text-[10px] text-[#6B7280] truncate">{mat}</p>
              </div>
              <ExternalLink size={14} className="text-[#A1A8B3] opacity-0 group-hover:opacity-100 transition" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}