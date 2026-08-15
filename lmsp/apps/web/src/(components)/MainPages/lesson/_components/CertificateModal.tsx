import { useState } from 'react';
import { Award, Loader2, Printer, X } from 'lucide-react';
import {
  useIssueCertificateMutation,
  type Certificate,
} from '@my-monorepo/store';

interface CertificateModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  courseId: string;
  courseTitle: string;
}

const CertificateModal = ({ open, onClose, userId, courseId, courseTitle }: CertificateModalProps) => {
  const [issue, { isLoading }] = useIssueCertificateMutation();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleIssue = async () => {
    setError('');
    try {
      const res = await issue({ userId, courseId }).unwrap();
      setCertificate(res.certificate);
    } catch (err: any) {
      setError(err?.data?.message || 'Unable to issue certificate');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-[#111318] border border-[#23262D] rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#23262D]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#00E5B3]/10 text-[#00E5B3]">
              <Award size={18} />
            </div>
            <h2 className="font-bold text-base text-[#F5F7FA]">Course Certificate</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-[#A1A8B3] hover:text-[#F5F7FA] hover:bg-[#161920] transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {!certificate && !error && (
            <div className="text-center py-6 space-y-4">
              <p className="text-sm text-[#A1A8B3]">
                Congratulations on completing <span className="text-[#F5F7FA] font-semibold">{courseTitle}</span>!
                Generate your official certificate.
              </p>
              <button
                onClick={handleIssue}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-[#00E5B3] text-black hover:bg-[#00C298] transition-all active:scale-95 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Award size={16} />
                    Generate Certificate
                  </>
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="text-center py-6 space-y-4">
              <p className="text-sm text-[#EB5757]">{error}</p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-bold border border-[#23262D] text-[#F5F7FA] hover:bg-[#161920] transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {certificate && (
            <div>
              {/* ── Printable certificate ── */}
              <div
                id="certificate-print-area"
                className="bg-[#0B0D12] border-2 border-[#00E5B3]/40 rounded-xl p-8 text-center relative overflow-hidden"
              >
                <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
                <Award size={40} className="mx-auto text-[#00E5B3] mb-3" />
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#6B7280] font-bold mb-2">Certificate of Completion</p>
                <p className="text-2xl font-extrabold text-[#F5F7FA] mb-2">{certificate.userName}</p>
                <p className="text-xs text-[#A1A8B3] mb-4">
                  has successfully completed the course
                </p>
                <p className="text-lg font-bold text-[#00E5B3] mb-6">{certificate.courseTitle}</p>
                <div className="flex justify-center gap-10 text-[11px] text-[#6B7280]">
                  <div>
                    <p className="font-semibold text-[#A1A8B3]">{certificate.completedLessons}/{certificate.totalLessons} lessons</p>
                    <p className="mt-0.5">Completed</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#A1A8B3]">{new Date(certificate.issuedAt).toLocaleDateString()}</p>
                    <p className="mt-0.5">Issue Date</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#A1A8B3]">{certificate.certificateId}</p>
                    <p className="mt-0.5">Certificate ID</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-3 mt-5">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#2F80ED] text-white hover:bg-[#256BCE] transition-colors"
                >
                  <Printer size={14} />
                  Print / Save as PDF
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold border border-[#23262D] text-[#A1A8B3] hover:text-[#F5F7FA] hover:bg-[#161920] transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
