import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUp,
  BookCheck,
  ChevronRight,
  Clock,
  Cookie,
  Database,
  EyeOff,
  FileText,
  Globe,
  KeyRound,
  Link2,
  ListChecks,
  Lock,
  Mail,
  Menu,
  RefreshCw,
  Scale,
  ScrollText,
  Send,
  Share2,
  ShieldCheck,
  ThumbsUp,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   Geneseon LMS — Privacy Policy
   Public legal page at /privacy-policy
   ═══════════════════════════════════════════════════════════════ */

const CONTACT_EMAIL = 'sahareiors@gmail.com';
const PLATFORM_URL = 'https://geneseon.netlify.app';
const LAST_UPDATED = 'September 4, 2026';

/* ── Small content building blocks ─────────────────────────── */

function P({ children }: { children: ReactNode }) {
  return <p className="text-[15px] leading-7 text-[#A9B0BD]">{children}</p>;
}

function UL({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-[15px] leading-7 text-[#A9B0BD]">
          <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#00E5B3] ring-4 ring-[#00E5B3]/10" />
          <span className="min-w-0 flex-1">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Sub({ children }: { children: ReactNode }) {
  return (
    <h4 className="flex items-center gap-2 text-[15px] font-bold text-[#F5F7FA]">
      <ChevronRight size={15} className="text-[#00E5B3]" />
      {children}
    </h4>
  );
}

function Callout({
  icon,
  tone = 'teal',
  title,
  children,
}: {
  icon?: LucideIcon;
  tone?: 'teal' | 'blue' | 'amber';
  title: string;
  children: ReactNode;
}) {
  const Icon = icon ?? ShieldCheck;
  const tones: Record<'teal' | 'blue' | 'amber', { chip: string; title: string }> = {
    teal: { chip: 'bg-[#00E5B3]/10 border-[#00E5B3]/30 text-[#00E5B3]', title: 'text-[#00E5B3]' },
    blue: { chip: 'bg-[#2F80ED]/10 border-[#2F80ED]/30 text-[#2F80ED]', title: 'text-[#5DA5F6]' },
    amber: { chip: 'bg-[#F2C94C]/10 border-[#F2C94C]/30 text-[#F2C94C]', title: 'text-[#F2C94C]' },
  };
  const activeTone = tones[tone];
  return (      <div className="flex gap-4 rounded-2xl border border-[#23262D] bg-[#111318] p-5">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${activeTone.chip}`}>
          <Icon size={17} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-bold ${activeTone.title}`}>{title}</p>
        <div className="mt-1 space-y-2 text-[14px] leading-6 text-[#A1A8B3]">{children}</div>
      </div>
    </div>
  );
}

/* ── Section model ─────────────────────────────────────────── */

interface Section {
  id: string;
  num: string;
  title: string;
  icon: LucideIcon;
  body: ReactNode[];
}

const SECTIONS: Section[] = [
  {
    id: 'introduction',
    num: '01',
    title: 'Introduction',
    icon: FileText,
    body: [
      <P key="p1">
        Welcome to <strong className="font-bold text-[#F5F7FA]">Geneseon LMS</strong> (the “Platform”), operated by{' '}
        <strong className="font-bold text-[#F5F7FA]">Geneseon</strong> (“Geneseon”, “we”, “us”, or “our”). This Privacy
        Policy explains what information we collect when you use the Platform — including our website at {PLATFORM_URL},
        our web and mobile applications, and related services (collectively, the “Services”) — how we use and protect it,
        and the choices you have over your data.
      </P>,
      <P key="p2">
        The Platform is an AI-powered learning platform built to help you prepare for competitive exams. You can enrol in
        courses, practise quizzes and mock exams, answer past questions, chat with an AI assistant, and receive
        personalised AI performance reports.
      </P>,
      <P key="p3">
        By creating an account or using the Services, you agree to the practices described in this policy. If you do not
        agree, please do not use the Services. Capitalised terms used but not defined here have the meaning given to them
        in our Terms of Service.
      </P>,
    ],
  },
  {
    id: 'information-we-collect',
    num: '02',
    title: 'Information We Collect',
    icon: Database,
    body: [
      <P key="p0">We collect only the information we need to run the Platform and improve your learning experience.</P>,
      <div key="acc" className="space-y-2">
        <Sub>Account information</Sub>
        <UL
          items={[
            <>Your full name and email address, which you provide when registering.</>,
            <>A password, which we store only in encrypted (hashed) form — we can never read or recover your plain-text password.</>,
            <>The exams and subjects you select as your preparation targets, so we can recommend the right content.</>,
            <>A profile picture if you choose to upload one.</>,
            <>Your account role (for example, student or administrator).</>,
          ]}
        />
      </div>,
      <div key="learning" className="space-y-2">
        <Sub>Learning activity</Sub>
        <UL
          items={[
            <>Courses you enrol in, lessons you view, and your progress through them.</>,
            <>Your quiz and mock-exam attempts, including your answers, scores, time taken, and results.</>,
            <>Performance statistics and history used to track your improvement over time.</>,
            <>Notes you create, certificates you earn, and any temporary exam submissions used to let you resume a test.</>,
          ]}
        />
      </div>,
      <div key="ai" className="space-y-2">
        <Sub>AI interactions</Sub>
        <UL
          items={[
            <>The messages you send to the AI assistant and the responses you receive.</>,
            <>Your performance data, which may be shared with our AI provider to generate your personalised AI performance reports.</>,
          ]}
        />
      </div>,
      <div key="tech" className="space-y-2">
        <Sub>Device and usage information</Sub>
        <UL
          items={[
            <>Technical data such as your browser type and version, device type, operating system, and language preferences.</>,
            <>Usage data such as pages visited, features used, and approximate timestamps of your activity.</>,
            <>Log data such as your IP address, which our hosting providers record automatically for security and reliability.</>,
          ]}
        />
      </div>,
      <div key="comms" className="space-y-2">
        <Sub>Communications</Sub>
        <UL
          items={[
            <>If you contact us for support, we keep a record of your inquiry and how we resolved it.</>,
          ]}
        />
      </div>,
      <Callout
        key="never"
        tone="teal"
        icon={EyeOff}
        title="What we never collect"
      >
        <p>
          We do <strong className="font-semibold text-[#C7CBD4]">not</strong> sell your personal information. We do{' '}
          <strong className="font-semibold text-[#C7CBD4]">not</strong> use third-party advertising trackers, and we do{' '}
          <strong className="font-semibold text-[#C7CBD4]">not</strong> collect or store payment card numbers anywhere on
          the Platform.
        </p>
      </Callout>,
    ],
  },
  {
    id: 'how-we-use',
    num: '03',
    title: 'How We Use Your Information',
    icon: ListChecks,
    body: [
      <P key="p0">We use the information we collect for the following purposes:</P>,
      <UL
        key="list"
        items={[
          <><strong className="font-semibold text-[#E6E9EF]">To provide the Services</strong> — create and manage your account, deliver courses and lessons, grade quizzes and mock exams, and issue certificates.</>,
          <><strong className="font-semibold text-[#E6E9EF]">To power AI features</strong> — run the AI assistant chat and generate your AI performance reports.</>,
          <><strong className="font-semibold text-[#E6E9EF]">To personalise your experience</strong> — recommend exams, subjects, and content that match the goals you set.</>,
          <><strong className="font-semibold text-[#E6E9EF]">To communicate with you</strong> — send you service messages, password resets, and (only with your consent) educational updates.</>,
          <><strong className="font-semibold text-[#E6E9EF]">To keep the Platform safe</strong> — detect, investigate, and prevent fraud, abuse, or security incidents.</>,
          <><strong className="font-semibold text-[#E6E9EF]">To improve our product</strong> — analyse aggregated usage patterns so we can fix bugs and build better features. Aggregated analytics are stripped of anything that identifies you personally.</>,
          <><strong className="font-semibold text-[#E6E9EF]">To meet legal obligations</strong> — comply with applicable laws, court orders, and regulatory requests.</>,
        ]}
      />,
    ],
  },
  {
    id: 'legal-bases',
    num: '04',
    title: 'Legal Bases for Processing',
    icon: Scale,
    body: [
      <P key="p0">Where data-protection law requires a legal basis for processing, we rely on the following:</P>,
      <UL
        key="list"
        items={[
          <><strong className="font-semibold text-[#E6E9EF]">Performance of a contract</strong> — processing is necessary to provide the account and Services you asked us to deliver.</>,
          <><strong className="font-semibold text-[#E6E9EF]">Legitimate interests</strong> — for security, fraud prevention, product improvement, and internal administration, where our interests are not overridden by your rights.</>,
          <><strong className="font-semibold text-[#E6E9EF]">Consent</strong> — where we ask for it (for example, before sending marketing communications), which you may withdraw at any time.</>,
          <><strong className="font-semibold text-[#E6E9EF]">Legal obligation</strong> — where we must process data to comply with the law.</>,
        ]}
      />,
      <Callout
        key="note"
        tone="blue"
        icon={BookCheck}
        title="Bangladeshi users"
      >
        <p>
          Where the data-protection laws of Bangladesh apply to you, we process your information in accordance with those
          laws and with the principles of transparency, purpose limitation, and data minimisation described in this
          policy.
        </p>
      </Callout>,
    ],
  },
  {
    id: 'sharing',
    num: '05',
    title: 'Sharing & Disclosure',
    icon: Share2,
    body: [
      <P key="p0">
        We never sell your personal information. We share it only in the limited circumstances below, and always under
        contractual obligations to keep it confidential and secure.
      </P>,
      <div key="svc" className="space-y-2">
        <Sub>Service providers</Sub>
        <UL
          items={[
            <><strong className="font-semibold text-[#E6E9EF]">Cloud hosting and infrastructure</strong> — providers such as Vercel, Netlify, and Render that host the Platform and its servers, and process data on our behalf.</>,
            <><strong className="font-semibold text-[#E6E9EF]">Media storage</strong> — providers such as Cloudinary, used to store profile pictures and other uploaded media.</>,
            <><strong className="font-semibold text-[#E6E9EF]">AI services</strong> — providers that power the AI assistant and AI performance reports. Data shared for this purpose is limited to what the feature needs.</>,
          ]}
        />
      </div>,
      <div key="other" className="space-y-2">
        <Sub>Other circumstances</Sub>
        <UL
          items={[
            <><strong className="font-semibold text-[#E6E9EF]">With your consent</strong> — when you ask us or give us permission to share specific information.</>,
            <><strong className="font-semibold text-[#E6E9EF]">Legal requirements</strong> — if we believe in good faith that disclosure is required by law, regulation, or a valid legal request, or is necessary to protect the rights, property, or safety of Geneseon, our users, or the public.</>,
            <><strong className="font-semibold text-[#E6E9EF]">Business transfers</strong> — if Geneseon is involved in a merger, acquisition, or sale of assets, your information may transfer as part of that transaction. We will notify you before it happens and give you the chance to exercise your rights.</>,
          ]}
        />
      </div>,
      <Callout
        key="note"
        tone="teal"
        icon={ShieldCheck}
        title="A note on learning content"
      >
        <p>
          Your exam answers, scores, and AI reports are visible to you and to the administrators who operate the Platform
          for support and quality purposes. They are never published or shared with other students.
        </p>
      </Callout>,
    ],
  },
  {
    id: 'meta-platform-services',
    num: '06',
    title: 'Facebook & Meta Platform Services',
    icon: ThumbsUp,
    body: [
      <P key="p0">
        Geneseon may use Meta Platforms technologies and APIs to manage and publish content to Facebook Pages that are
        connected to the service. When a Page administrator authorises this functionality, we may process information
        necessary to identify and manage the connected Facebook Page, including the Page ID, Page access credentials or
        tokens, and content intended for publication.
      </P>,
      <P key="p1">
        We use this information solely to provide the requested Facebook Page publishing functionality. We do not sell
        Facebook information or use it for unrelated advertising purposes.
      </P>,
      <P key="p2">
        Page administrators may revoke the application’s access to their Facebook Page at any time through Meta/Facebook
        settings. For questions or requests concerning data processed through our Meta integration, contact us at{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-[#00E5B3] hover:text-[#00C298] underline underline-offset-4">
          {CONTACT_EMAIL}
        </a>
        .
      </P>,
    ],
  },
  {
    id: 'cookies',
    num: '07',
    title: 'Cookies & Local Storage',
    icon: Cookie,
    body: [
      <P key="p0">Like most web applications, we use cookies and browser storage to keep the Platform working:</P>,
      <UL
        key="list"
        items={[
          <><strong className="font-semibold text-[#E6E9EF]">Authentication</strong> — we store a secure session token in your browser’s local storage so you stay signed in between visits.</>,
          <><strong className="font-semibold text-[#E6E9EF]">Preferences</strong> — we remember choices such as your theme and layout preferences.</>,
          <><strong className="font-semibold text-[#E6E9EF]">Resume state</strong> — temporary exam submissions may be kept on your device so you can continue where you left off if you close the app mid-test.</>,
        ]}
      />,
      <P key="p1">
        These are strictly functional — we do not use advertising or cross-site tracking cookies. You can clear your
        browser’s cookies and site data at any time through your browser settings. Doing so will sign you out, and any
        unsaved in-progress exam may be lost.
      </P>,
    ],
  },
  {
    id: 'retention',
    num: '08',
    title: 'Data Retention & Deletion',
    icon: Clock,
    body: [
      <P key="p0">We keep your personal information only for as long as your account is active or as long as we need it for the purposes described in this policy.</P>,
      <UL
        key="list"
        items={[
          <>Account data — for the life of your account, and for a reasonable period afterwards to honour legitimate business needs.</>,
          <>Learning history and AI reports — for as long as you keep your account, so your progress history stays intact.</>,
          <>Log and security data — for a shorter period (typically months), after which it is aggregated or deleted.</>,
          <>Where the law requires us to keep records (for example, for tax or accounting purposes), we keep only what is necessary.</>,
        ]}
      />,
      <P key="p1">
        When you ask us to delete your account and data, we erase or anonymise the information we hold about you within a
        reasonable time, unless we are legally required to keep it. See{' '}
        <a href="#your-rights" className="font-semibold text-[#00E5B3] hover:text-[#00C298] underline underline-offset-4">Your Rights &amp; Choices</a>{' '}
        below.
      </P>,
    ],
  },
  {
    id: 'security',
    num: '09',
    title: 'How We Protect Your Data',
    icon: Lock,
    body: [
      <P key="p0">We take the security of your data seriously and apply industry-standard safeguards, including:</P>,
      <UL
        key="list"
        items={[
          <><strong className="font-semibold text-[#E6E9EF]">Encryption in transit</strong> — all traffic between your device and the Platform is encrypted with TLS/HTTPS.</>,
          <><strong className="font-semibold text-[#E6E9EF]">Hashed credentials</strong> — passwords are stored only as one-way hashes and are never stored in plain text.</>,
          <><strong className="font-semibold text-[#E6E9EF]">Access control</strong> — only authorised personnel who need it for their role can reach personal data, under strict confidentiality obligations.</>,
          <><strong className="font-semibold text-[#E6E9EF]">Backups and monitoring</strong> — routine backups protect against data loss, and our hosting providers monitor for unusual activity.</>,
        ]}
      />,
      <Callout
        key="note"
        tone="amber"
        icon={KeyRound}
        title="What you can do"
      >
        <p>
          No method of transmission or storage is 100% secure. Please use a strong, unique password, keep your login
          details private, and contact us immediately if you believe your account has been compromised.
        </p>
      </Callout>,
    ],
  },
  {
    id: 'children',
    num: '10',
    title: "Children's Privacy",
    icon: Users,
    body: [
      <P key="p0">
        The Services are intended for students preparing for competitive examinations, which are typically adult or
        near-adult users. We do not knowingly collect personal information from children under the age of 13. If you are
        under 13, please do not create an account or use the Services.
      </P>,
      <P key="p1">
        If the law where you live sets a higher minimum age or requires parental consent for the collection of personal
        data, you may only use the Services with the involvement and consent of a parent or guardian. If you believe a
        child has provided us with personal information without the required consent, contact us at{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-[#00E5B3] hover:text-[#00C298] underline underline-offset-4">
          {CONTACT_EMAIL}
        </a>{' '}
        and we will delete it promptly.
      </P>,
    ],
  },
  {
    id: 'your-rights',
    num: '11',
    title: 'Your Rights & Choices',
    icon: ShieldCheck,
    body: [
      <P key="p0">Depending on where you live, you may have the following rights over your personal information:</P>,
      <UL
        key="list"
        items={[
          <><strong className="font-semibold text-[#E6E9EF]">Access</strong> — ask for a copy of the personal information we hold about you.</>,
          <><strong className="font-semibold text-[#E6E9EF]">Correction</strong> — update or fix inaccurate information. You can edit most of it yourself under Settings.</>,
          <><strong className="font-semibold text-[#E6E9EF]">Deletion</strong> — ask us to erase your account and personal data.</>,
          <><strong className="font-semibold text-[#E6E9EF]">Portability</strong> — receive the data you gave us in a structured, machine-readable format.</>,
          <><strong className="font-semibold text-[#E6E9EF]">Restriction and objection</strong> — ask us to limit how we process your data, or object to processing based on legitimate interests.</>,
          <><strong className="font-semibold text-[#E6E9EF]">Withdraw consent</strong> — where processing is based on your consent, withdraw it at any time without affecting the lawfulness of earlier processing.</>,
        ]}
      />,
      <div key="how" className="space-y-2">
        <Sub>How to exercise your rights</Sub>
        <UL
          items={[
            <><strong className="font-semibold text-[#E6E9EF]">In the app</strong> — edit your profile and preferences anytime under <em>Settings</em>.</>,
            <><strong className="font-semibold text-[#E6E9EF]">By email</strong> — for account deletion, data copies, or anything else, email <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-[#00E5B3] hover:text-[#00C298] underline underline-offset-4">{CONTACT_EMAIL}</a> from the email address linked to your account.</>,
          ]}
        />
      </div>,
      <Callout
        key="note"
        tone="teal"
        icon={Trash2}
        title="Closing your account"
      >
        <p>
          We will process verified requests within 30 days, or sooner if required by law. Before deleting an account we
          may ask you to confirm, because this action permanently removes your progress, certificates, and saved reports
          and cannot be undone.
        </p>
      </Callout>,
    ],
  },
  {
    id: 'transfers',
    num: '12',
    title: 'International Data Transfers',
    icon: Globe,
    body: [
      <P key="p0">
        To run the Platform we may process your information on servers located outside your country of residence,
        including through the cloud providers listed above. Where your data is transferred across borders, we rely on
        appropriate safeguards — such as standard contractual clauses, adequacy decisions, or equivalent mechanisms —
        to keep your information protected to the standard described in this policy.
      </P>,
    ],
  },
  {
    id: 'third-party-links',
    num: '13',
    title: 'Links to Other Websites',
    icon: Link2,
    body: [
      <P key="p0">
        The Services may contain links to third-party websites or services (for example, educational resources we
        reference). This Privacy Policy does not apply to those sites. We are not responsible for their privacy practices,
        and we encourage you to read their policies before providing them with any information.
      </P>,
    ],
  },
  {
    id: 'changes',
    num: '14',
    title: 'Changes to This Policy',
    icon: RefreshCw,
    body: [
      <P key="p0">
        We may update this Privacy Policy from time to time to reflect changes in our Services, technology, or legal
        obligations. When we do, we will revise the “Last updated” date at the top of this page and post a notice on the
        Platform for material changes. If a change materially affects how we treat your information, we will do our best
        to notify you directly before it takes effect. Your continued use of the Services after changes are posted means
        you accept the updated policy.
      </P>,
    ],
  },
  {
    id: 'contact',
    num: '15',
    title: 'Contact Us',
    icon: Mail,
    body: [
      <P key="p0">
        If you have questions, concerns, or requests about this Privacy Policy or how we handle your data, please reach
        out to us:
      </P>,
      <Callout
        key="cta"
        tone="blue"
        icon={Send}
        title="Privacy inquiries"
      >
        <p>
          Geneseon — Privacy
          <br />
          Email:{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-[#5DA5F6] hover:text-[#00C298] underline underline-offset-4">
            {CONTACT_EMAIL}
          </a>
        </p>
        <p className="text-[13px] text-[#6B7280]">
          Please use the email address linked to your account where possible so we can verify your request quickly. We
          aim to respond to every inquiry within 30 days.
        </p>
      </Callout>,
      <P key="p1">
        If you are not satisfied with how we handle your concern, you may also have the right to lodge a complaint with
        your local data-protection authority.
      </P>,
    ],
  },
];

/* ── Scroll helper ─────────────────────────────────────────── */

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function PrivacyPolicy() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const [tocOpen, setTocOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);

  // Scroll-spy: highlight the section currently in view.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: '-15% 0px -75% 0px', threshold: 0 }
    );
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  // Back-to-top button visibility.
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div id="privacy-policy-root" className="min-h-dvh select-text bg-[#07090E] text-[#F5F7FA]">
      {/* ── Top bar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#07090E]/80 backdrop-blur-xl print:hidden">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="Geneseon home" className="flex items-center gap-2.5">
            <img src="/logo1.png" className="w-8 object-cover" alt="Geneseon logo" />
            <span className="text-xs font-semibold tracking-[0.3em] text-white">GENESEON</span>
          </Link>
          <div className="flex items-center gap-4">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="hidden items-center gap-2 text-[13px] font-medium text-[#A1A8B3] transition-colors hover:text-white sm:flex"
            >
              <Mail size={14} />
              Contact
            </a>
            <Link
              to="/login"
              className="rounded-lg border border-[#23262D] bg-[#111318] px-4 py-2 text-[13px] font-semibold text-[#F5F7FA] transition-colors hover:border-[#00E5B3]/50 hover:text-[#00E5B3]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-white/[0.05]">
        {/* decorative glows */}
        <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-[#00E5B3]/[0.07] blur-3xl" />
        <div className="pointer-events-none absolute -top-24 right-1/4 h-80 w-80 rounded-full bg-[#2F80ED]/[0.08] blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6 sm:pt-20 lg:px-8">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#00E5B3]/30 bg-[#00E5B3]/10 shadow-[0_0_40px_-8px_rgba(0,229,179,0.4)]">
            <ScrollText size={26} className="text-[#00E5B3]" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Privacy Policy</h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#A1A8B3]">
            This policy explains what information <strong className="font-semibold text-[#E6E9EF]">Geneseon LMS</strong>{' '}
            collects, why we collect it, how it is used and protected, and the choices you have over your data.
          </p>

          {/* meta chips */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#23262D] bg-[#111318] px-4 py-1.5 text-xs font-semibold text-[#A1A8B3]">
              <Clock size={13} className="text-[#00E5B3]" />
              Last updated: {LAST_UPDATED}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#23262D] bg-[#111318] px-4 py-1.5 text-xs font-semibold text-[#A1A8B3]">
              <ShieldCheck size={13} className="text-[#2F80ED]" />
              Effective as of {LAST_UPDATED}
            </span>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-[#00E5B3] transition-colors hover:text-[#00C298]"
            >
              Questions? <Mail size={13} />
            </a>
          </div>
        </div>
      </div>

      {/* ── Body: sticky TOC + article ──────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-14">
          {/* ── Table of contents ───────────────────────────── */}
          <aside className="print:hidden">
            <div className="lg:sticky lg:top-24">
              {/* Mobile toggle */}
              <button
                onClick={() => setTocOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-xl border border-[#23262D] bg-[#111318] px-4 py-3 text-sm font-bold text-[#F5F7FA] lg:hidden"
                aria-expanded={tocOpen}
              >
                <span className="flex items-center gap-2">
                  <Menu size={15} className="text-[#00E5B3]" /> On this page
                </span>
                {tocOpen ? <X size={16} className="text-[#A1A8B3]" /> : <ChevronRight size={16} className="text-[#A1A8B3]" />}
              </button>

              <nav
                aria-label="Privacy policy sections"
                className={`mt-3 overflow-hidden rounded-2xl border border-[#23262D] bg-[#0D0F15] transition-all lg:mt-0 lg:block ${
                  tocOpen ? 'max-h-[560px] overflow-y-auto pb-2' : 'max-h-0 lg:max-h-none'
                }`}
              >
                <p className="hidden px-5 pb-3 pt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B7280] lg:block">
                  On this page
                </p>
                <ul className="px-3 py-3 lg:py-2">
                  {SECTIONS.map((s) => {
                    const active = s.id === activeId;
                    return (
                      <li key={s.id}>
                        <button
                          onClick={() => {
                            scrollToSection(s.id);
                            setTocOpen(false);
                          }}
                          className={`group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors ${
                            active ? 'bg-[#00E5B3]/10 text-[#00E5B3]' : 'text-[#A1A8B3] hover:bg-white/[0.03] hover:text-[#F5F7FA]'
                          }`}
                        >
                          <span className={`text-[10px] font-bold tabular-nums ${active ? 'text-[#00E5B3]' : 'text-[#5A6270]'}`}>
                            {s.num}
                          </span>
                          <span className="min-w-0 flex-1 leading-snug">{s.title}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* contact nudge */}
              <div className="mt-5 hidden rounded-2xl border border-[#23262D] bg-gradient-to-b from-[#111318] to-[#0D0F15] p-5 lg:block">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-[#2F80ED]/30 bg-[#2F80ED]/10">
                  <Mail size={17} className="text-[#2F80ED]" />
                </div>
                <p className="text-sm font-bold text-[#F5F7FA]">Need a hand?</p>
                <p className="mt-1.5 text-[13px] leading-6 text-[#A1A8B3]">
                  Questions about your data? Email us anytime and we’ll get back to you.
                </p>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#00E5B3] px-4 py-2.5 text-[13px] font-bold text-black transition-all hover:bg-[#00C298]"
                >
                  Contact us <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </aside>

          {/* ── Article ──────────────────────────────────────── */}
          <article className="min-w-0">
            {/* Reader note */}
            <Callout
              tone="blue"
              icon={BookCheck}
              title="Plain-English summary"
            >
              <p>
                We collect only what we need to run your exam-prep account, we never sell your data, we do not run
                advertising trackers, and you can request a copy or deletion of your data at any time by emailing us.
                Details for each point are below.
              </p>
            </Callout>

            <div className="mt-4 space-y-10">
              {SECTIONS.map((s) => (
                <section
                  key={s.id}
                  id={s.id}
                  aria-label={s.title}
                  className="scroll-mt-28 rounded-2xl border border-[#1C1F26] bg-[#0B0D12]/80 p-6 transition-colors duration-300 sm:p-8"
                >
                  <div className="mb-5 flex items-center gap-4 border-b border-[#1C1F26] pb-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#00E5B3]/25 bg-[#00E5B3]/[0.07]">
                      <s.icon size={19} className="text-[#00E5B3]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#5A6270]">Section {s.num}</p>
                      <h2 className="mt-0.5 text-lg font-bold tracking-tight text-[#F5F7FA] sm:text-xl">{s.title}</h2>
                    </div>
                  </div>
                  <div className="space-y-4">{s.body}</div>
                </section>
              ))}
            </div>

            

            {/* Closing card */}
            <div className="mt-10 overflow-hidden rounded-2xl border border-[#00E5B3]/25 bg-gradient-to-br from-[#0E1B18] via-[#0B0D12] to-[#0B0D12] p-7 sm:p-9">
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-xl">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#00E5B3]">Thank you for reading</p>
                  <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-white">Your privacy matters to us.</h2>
                  <p className="mt-2 text-[14px] leading-6 text-[#A1A8B3]">
                    If anything in this policy is unclear, or you would like to exercise any of your data rights, don’t
                    hesitate to get in touch at{' '}
                    <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-[#00E5B3] underline underline-offset-4 hover:text-[#00C298]">
                      {CONTACT_EMAIL}
                    </a>
                    .
                  </p>
                </div>
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Privacy inquiry')}`}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#00E5B3] px-6 py-3.5 text-sm font-bold text-black shadow-[0_0_30px_-6px_rgba(0,229,179,0.5)] transition-all hover:bg-[#00C298]"
                >
                  <Send size={16} /> Email us
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.05] bg-[#05070B] print:hidden">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-[#5A6270]">© 2026 Geneseon. All rights reserved.</p>
          <div className="flex items-center gap-5 text-xs font-semibold text-[#A1A8B3]">
            <Link to="/" className="transition-colors hover:text-[#00E5B3]">Home</Link>
            <Link to="/register" className="transition-colors hover:text-[#00E5B3]">Sign up</Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="transition-colors hover:text-[#00E5B3]">Contact</a>
          </div>
        </div>
      </footer>

      {/* ── Back to top ─────────────────────────────────────── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        className={`fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-xl border border-[#00E5B3]/40 bg-[#111318] text-[#00E5B3] shadow-[0_0_25px_-5px_rgba(0,229,179,0.45)] backdrop-blur transition-all duration-300 hover:bg-[#00E5B3] hover:text-black print:hidden ${
          showTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
        }`}
      >
        <ArrowUp size={18} />
      </button>
    </div>
  );
}
