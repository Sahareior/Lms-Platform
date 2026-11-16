import React, { useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronDown, ChevronUp, Mail, ShieldCheck } from 'lucide-react-native';

import type { RootStackParamList } from '../../navigation/types';
import { AppBar, Card, Screen } from '../../ui';
import { useAppTheme, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PrivacyPolicy'>;

const CONTACT_EMAIL = 'sahareiors@gmail.com';
const PLATFORM_URL = 'https://geneseon.netlify.app';
const LAST_UPDATED = 'September 4, 2026';

type Block =
  | { type: 'p'; text: string }
  | { type: 'sub'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'note'; title: string; text: string };

interface PolicySection {
  id: string;
  num: string;
  title: string;
  blocks: Block[];
}

const SECTIONS: PolicySection[] = [
  {
    id: 'introduction',
    num: '01',
    title: 'Introduction',
    blocks: [
      {
        type: 'p',
        text: `Welcome to Geneseon LMS (the "Platform"), operated by Geneseon ("Geneseon", "we", "us", or "our"). This Privacy Policy explains what information we collect when you use the Platform — including our website at ${PLATFORM_URL}, our web and mobile applications, and related services (collectively, the "Services") — how we use and protect it, and the choices you have over your data.`,
      },
      {
        type: 'p',
        text: 'The Platform is an AI-powered learning platform built to help you prepare for competitive exams. You can enrol in courses, practise quizzes and mock exams, answer past questions, chat with an AI assistant, and receive personalised AI performance reports.',
      },
      {
        type: 'p',
        text: 'By creating an account or using the Services, you agree to the practices described in this policy. If you do not agree, please do not use the Services.',
      },
    ],
  },
  {
    id: 'information',
    num: '02',
    title: 'Information We Collect',
    blocks: [
      {
        type: 'p',
        text: 'We collect only the information we need to run the Platform and improve your learning experience.',
      },
      { type: 'sub', text: 'Account information' },
      {
        type: 'bullets',
        items: [
          'Your full name and email address, which you provide when registering.',
          'A password, which we store only in encrypted (hashed) form — we can never read your plain-text password.',
          'The exams and subjects you select as your preparation targets.',
          'A profile picture if you choose to upload one.',
          'Your account role (for example, student or administrator).',
        ],
      },
      { type: 'sub', text: 'Learning activity' },
      {
        type: 'bullets',
        items: [
          'Courses you enrol in, lessons you view, and your progress through them.',
          'Your quiz and mock-exam attempts, including answers, scores, time taken, and results.',
          'Performance statistics and history used to track your improvement.',
          'Notes you create, certificates you earn, and temporary exam submissions that let you resume a test.',
        ],
      },
      { type: 'sub', text: 'AI interactions' },
      {
        type: 'bullets',
        items: [
          'The messages you send to the AI assistant and the responses you receive.',
          'Your performance data, which may be shared with our AI provider to generate your personalised reports.',
        ],
      },
      { type: 'sub', text: 'Device and usage information' },
      {
        type: 'bullets',
        items: [
          'Technical data such as browser type, device type, operating system, and language preferences.',
          'Usage data such as pages visited, features used, and approximate timestamps.',
          'Log data such as your IP address, recorded automatically by our hosting providers for security and reliability.',
        ],
      },
      {
        type: 'note',
        title: 'What we never collect',
        text: 'We do not sell your personal information. We do not use third-party advertising trackers, and we do not collect or store payment card numbers anywhere on the Platform.',
      },
    ],
  },
  {
    id: 'how-we-use',
    num: '03',
    title: 'How We Use Your Information',
    blocks: [
      { type: 'p', text: 'We use the information we collect for the following purposes:' },
      {
        type: 'bullets',
        items: [
          'To provide the Services — create and manage your account, deliver courses and lessons, grade quizzes and mock exams, and issue certificates.',
          'To power AI features — run the AI assistant chat and generate your AI performance reports.',
          'To personalise your experience — recommend exams, subjects, and content that match your goals.',
          'To communicate with you — send service messages, password resets, and (only with consent) educational updates.',
          'To keep the Platform safe — detect, investigate, and prevent fraud, abuse, or security incidents.',
          'To improve our product — analyse aggregated usage patterns. Aggregated analytics are stripped of anything that identifies you.',
          'To meet legal obligations — comply with applicable laws, court orders, and regulatory requests.',
        ],
      },
    ],
  },
  {
    id: 'legal-bases',
    num: '04',
    title: 'Legal Bases for Processing',
    blocks: [
      {
        type: 'p',
        text: 'Where data-protection law requires a legal basis for processing, we rely on the following:',
      },
      {
        type: 'bullets',
        items: [
          'Performance of a contract — processing is necessary to provide the account and Services you asked us to deliver.',
          'Legitimate interests — for security, fraud prevention, product improvement, and internal administration, where our interests are not overridden by your rights.',
          'Consent — where we ask for it (for example, before sending marketing communications), which you may withdraw at any time.',
          'Legal obligation — where we must process data to comply with the law.',
        ],
      },
      {
        type: 'note',
        title: 'Bangladeshi users',
        text: 'Where the data-protection laws of Bangladesh apply to you, we process your information in accordance with those laws and with the principles of transparency, purpose limitation, and data minimisation described in this policy.',
      },
    ],
  },
  {
    id: 'sharing',
    num: '05',
    title: 'Sharing & Disclosure',
    blocks: [
      {
        type: 'p',
        text: 'We never sell your personal information. We share it only in the limited circumstances below, and always under contractual obligations to keep it confidential and secure.',
      },
      { type: 'sub', text: 'Service providers' },
      {
        type: 'bullets',
        items: [
          'Cloud hosting and infrastructure — providers such as Vercel, Netlify, and Render that host the Platform and its servers.',
          'Media storage — providers such as Cloudinary, used to store profile pictures and other uploaded media.',
          'AI services — providers that power the AI assistant and AI performance reports. Data shared is limited to what the feature needs.',
        ],
      },
      { type: 'sub', text: 'Other circumstances' },
      {
        type: 'bullets',
        items: [
          'With your consent — when you ask us or give us permission to share specific information.',
          'Legal requirements — if we believe in good faith that disclosure is required by law, regulation, or a valid legal request, or is necessary to protect rights, property, or safety.',
          'Business transfers — if Geneseon is involved in a merger, acquisition, or sale of assets, your information may transfer as part of that transaction. We will notify you before it happens.',
        ],
      },
      {
        type: 'note',
        title: 'A note on learning content',
        text: 'Your exam answers, scores, and AI reports are visible to you and to the administrators who operate the Platform for support and quality purposes. They are never published or shared with other students.',
      },
    ],
  },
  {
    id: 'meta',
    num: '06',
    title: 'Facebook & Meta Platform Services',
    blocks: [
      {
        type: 'p',
        text: 'Geneseon may use Meta Platforms technologies and APIs to manage and publish content to Facebook Pages connected to the service. When a Page administrator authorises this functionality, we may process information necessary to identify and manage the connected Facebook Page, including the Page ID, Page access credentials or tokens, and content intended for publication.',
      },
      {
        type: 'p',
        text: 'We use this information solely to provide the requested Facebook Page publishing functionality. We do not sell Facebook information or use it for unrelated advertising purposes.',
      },
      {
        type: 'p',
        text: `Page administrators may revoke the application's access to their Facebook Page at any time through Meta/Facebook settings. For questions about our Meta integration, contact us at ${CONTACT_EMAIL}.`,
      },
    ],
  },
  {
    id: 'cookies',
    num: '07',
    title: 'Cookies & Local Storage',
    blocks: [
      {
        type: 'p',
        text: 'Like most applications, we use cookies and local storage to keep the Platform working:',
      },
      {
        type: 'bullets',
        items: [
          'Authentication — we store a secure session token on your device so you stay signed in between visits.',
          'Preferences — we remember choices such as your theme, reading font size, and layout preferences.',
          'Resume state — temporary exam submissions may be kept on your device so you can continue where you left off if you close the app mid-test.',
        ],
      },
      {
        type: 'p',
        text: 'These are strictly functional — we do not use advertising or cross-site tracking cookies. You can clear this data at any time from your device settings. Doing so will sign you out, and any unsaved in-progress exam may be lost.',
      },
    ],
  },
  {
    id: 'retention',
    num: '08',
    title: 'Data Retention & Deletion',
    blocks: [
      {
        type: 'p',
        text: 'We keep your personal information only for as long as your account is active or as long as we need it for the purposes described in this policy.',
      },
      {
        type: 'bullets',
        items: [
          'Account data — for the life of your account, and for a reasonable period afterwards to honour legitimate business needs.',
          'Learning history and AI reports — for as long as you keep your account, so your progress history stays intact.',
          'Log and security data — for a shorter period (typically months), after which it is aggregated or deleted.',
          'Where the law requires us to keep records (for example, for tax or accounting purposes), we keep only what is necessary.',
        ],
      },
      {
        type: 'p',
        text: 'When you ask us to delete your account and data, we erase or anonymise the information we hold about you within a reasonable time, unless we are legally required to keep it. See "Your Rights & Choices" below.',
      },
    ],
  },
  {
    id: 'security',
    num: '09',
    title: 'How We Protect Your Data',
    blocks: [
      {
        type: 'p',
        text: 'We take the security of your data seriously and apply industry-standard safeguards, including:',
      },
      {
        type: 'bullets',
        items: [
          'Encryption in transit — all traffic between your device and the Platform is encrypted with TLS/HTTPS.',
          'Hashed credentials — passwords are stored only as one-way hashes and are never stored in plain text.',
          'Access control — only authorised personnel who need it for their role can reach personal data, under strict confidentiality obligations.',
          'Backups and monitoring — routine backups protect against data loss, and our hosting providers monitor for unusual activity.',
        ],
      },
      {
        type: 'note',
        title: 'What you can do',
        text: 'No method of transmission or storage is 100% secure. Please use a strong, unique password, keep your login details private, and contact us immediately if you believe your account has been compromised.',
      },
    ],
  },
  {
    id: 'children',
    num: '10',
    title: "Children's Privacy",
    blocks: [
      {
        type: 'p',
        text: 'The Services are intended for students preparing for competitive examinations, which are typically adult or near-adult users. We do not knowingly collect personal information from children under the age of 13. If you are under 13, please do not create an account or use the Services.',
      },
      {
        type: 'p',
        text: `If the law where you live sets a higher minimum age or requires parental consent, you may only use the Services with the involvement and consent of a parent or guardian. If you believe a child has provided us with personal information without the required consent, contact us at ${CONTACT_EMAIL} and we will delete it promptly.`,
      },
    ],
  },
  {
    id: 'rights',
    num: '11',
    title: 'Your Rights & Choices',
    blocks: [
      {
        type: 'p',
        text: 'Depending on where you live, you may have the following rights over your personal information:',
      },
      {
        type: 'bullets',
        items: [
          'Access — ask for a copy of the personal information we hold about you.',
          'Correction — update or fix inaccurate information. You can edit most of it yourself under Settings.',
          'Deletion — ask us to erase your account and personal data.',
          'Portability — receive the data you gave us in a structured, machine-readable format.',
          'Restriction and objection — ask us to limit how we process your data, or object to processing based on legitimate interests.',
          'Withdraw consent — where processing is based on your consent, withdraw it at any time without affecting the lawfulness of earlier processing.',
        ],
      },
      { type: 'sub', text: 'How to exercise your rights' },
      {
        type: 'bullets',
        items: [
          'In the app — edit your profile and preferences anytime under Settings.',
          `By email — for account deletion, data copies, or anything else, email ${CONTACT_EMAIL} from the address linked to your account.`,
        ],
      },
      {
        type: 'note',
        title: 'Closing your account',
        text: 'We will process verified requests within 30 days, or sooner if required by law. Before deleting an account we may ask you to confirm, because this action permanently removes your progress, certificates, and saved reports and cannot be undone.',
      },
    ],
  },
  {
    id: 'transfers',
    num: '12',
    title: 'International Data Transfers',
    blocks: [
      {
        type: 'p',
        text: 'To run the Platform we may process your information on servers located outside your country of residence, including through the cloud providers listed above. Where your data is transferred across borders, we rely on appropriate safeguards — such as standard contractual clauses, adequacy decisions, or equivalent mechanisms — to keep your information protected to the standard described in this policy.',
      },
    ],
  },
  {
    id: 'links',
    num: '13',
    title: 'Links to Other Websites',
    blocks: [
      {
        type: 'p',
        text: 'The Services may contain links to third-party websites or services (for example, educational resources we reference). This Privacy Policy does not apply to those sites. We are not responsible for their privacy practices, and we encourage you to read their policies before providing them with any information.',
      },
    ],
  },
  {
    id: 'changes',
    num: '14',
    title: 'Changes to This Policy',
    blocks: [
      {
        type: 'p',
        text: 'We may update this Privacy Policy from time to time to reflect changes in our Services, technology, or legal obligations. When we do, we will revise the "Last updated" date and post a notice on the Platform for material changes. If a change materially affects how we treat your information, we will do our best to notify you directly before it takes effect. Your continued use of the Services after changes are posted means you accept the updated policy.',
      },
    ],
  },
  {
    id: 'contact',
    num: '15',
    title: 'Contact Us',
    blocks: [
      {
        type: 'p',
        text: 'If you have questions, concerns, or requests about this Privacy Policy or how we handle your data, please reach out to us:',
      },
      {
        type: 'note',
        title: 'Privacy inquiries',
        text: `Geneseon — Privacy\nEmail: ${CONTACT_EMAIL}\n\nPlease use the email address linked to your account where possible so we can verify your request quickly. We aim to respond to every inquiry within 30 days.`,
      },
      {
        type: 'p',
        text: 'If you are not satisfied with how we handle your concern, you may also have the right to lodge a complaint with your local data-protection authority.',
      },
    ],
  },
];

export default function PrivacyPolicyScreen({ navigation }: Props) {
  const { colors, radius } = useAppTheme();
  const [open, setOpen] = useState<Record<string, boolean>>({
    introduction: true,
  });

  const toggle = (id: string) =>
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const email = () =>
    Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=Privacy%20inquiry`).catch(
      () => undefined
    );

  return (
    <Screen>
      <AppBar
        title="Privacy Policy"
        subtitle={`Last updated: ${LAST_UPDATED}`}
        onBack={navigation.goBack}
      />

      <Card style={{ marginBottom: spacing.md }}>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: radius,
              backgroundColor: colors.accentSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={19} color={colors.accent} />
          </View>
          <Text
            style={{
              color: colors.text,
              fontSize: 14,
              fontWeight: '900',
              flex: 1,
            }}
          >
            Your privacy matters
          </Text>
        </View>
        <Text
          style={{
            color: colors.sub,
            fontSize: 12,
            lineHeight: 19,
            marginTop: spacing.sm,
          }}
        >
          This policy explains what information Geneseon LMS collects, why we
          collect it, how it is used and protected, and the choices you have over
          your data.
        </Text>
      </Card>

      <Card
        style={{
          marginBottom: spacing.md,
          backgroundColor: colors.infoSoft,
          borderColor: colors.info,
        }}
      >
        <Text style={{ color: colors.info, fontSize: 11, fontWeight: '900' }}>
          Plain-English summary
        </Text>
        <Text
          style={{
            color: colors.text,
            fontSize: 12,
            lineHeight: 19,
            marginTop: 4,
          }}
        >
          We collect only what we need to run your exam-prep account, we never
          sell your data, we do not run advertising trackers, and you can request
          a copy or deletion of your data at any time by emailing us.
        </Text>
      </Card>

      <View style={{ gap: spacing.sm }}>
        {SECTIONS.map((section) => {
          const expanded = !!open[section.id];
          return (
            <View
              key={section.id}
              style={{
                backgroundColor: colors.surface,
                borderRadius: radius,
                borderWidth: 1,
                borderColor: colors.borderSoft,
                overflow: 'hidden',
              }}
            >
              <Pressable
                onPress={() => toggle(section.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                  padding: spacing.md,
                }}
              >
                <Text
                  style={{
                    color: colors.muted,
                    fontSize: 10,
                    fontWeight: '900',
                    width: 20,
                  }}
                >
                  {section.num}
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 13,
                    fontWeight: '800',
                    flex: 1,
                  }}
                >
                  {section.title}
                </Text>
                {expanded ? (
                  <ChevronUp size={15} color={colors.muted} />
                ) : (
                  <ChevronDown size={15} color={colors.muted} />
                )}
              </Pressable>

              {expanded ? (
                <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.md }}>
                  {section.blocks.map((block, index) => {
                    if (block.type === 'sub') {
                      return (
                        <Text
                          key={index}
                          style={{
                            color: colors.text,
                            fontSize: 12,
                            fontWeight: '900',
                            marginTop: spacing.sm,
                            marginBottom: 4,
                          }}
                        >
                          {block.text}
                        </Text>
                      );
                    }

                    if (block.type === 'bullets') {
                      return (
                        <View key={index} style={{ gap: 6, marginVertical: 4 }}>
                          {block.items.map((item, i) => (
                            <View
                              key={i}
                              style={{ flexDirection: 'row', gap: 6 }}
                            >
                              <Text style={{ color: colors.accent, fontSize: 11 }}>
                                •
                              </Text>
                              <Text
                                style={{
                                  color: colors.sub,
                                  fontSize: 12,
                                  lineHeight: 19,
                                  flex: 1,
                                }}
                              >
                                {item}
                              </Text>
                            </View>
                          ))}
                        </View>
                      );
                    }

                    if (block.type === 'note') {
                      return (
                        <View
                          key={index}
                          style={{
                            backgroundColor: colors.surfaceAlt,
                            borderRadius: 8,
                            padding: spacing.md,
                            marginTop: spacing.sm,
                          }}
                        >
                          <Text
                            style={{
                              color: colors.accent,
                              fontSize: 11,
                              fontWeight: '900',
                            }}
                          >
                            {block.title}
                          </Text>
                          <Text
                            style={{
                              color: colors.sub,
                              fontSize: 12,
                              lineHeight: 19,
                              marginTop: 4,
                            }}
                          >
                            {block.text}
                          </Text>
                        </View>
                      );
                    }

                    return (
                      <Text
                        key={index}
                        style={{
                          color: colors.sub,
                          fontSize: 12,
                          lineHeight: 19,
                          marginTop: spacing.sm,
                        }}
                      >
                        {block.text}
                      </Text>
                    );
                  })}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      <Pressable
        onPress={email}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          marginTop: spacing.xl,
          paddingVertical: spacing.md,
          borderRadius: radius,
          backgroundColor: colors.primary,
        }}
      >
        <Mail size={15} color={colors.onAccent} />
        <Text
          style={{ color: colors.onAccent, fontSize: 13, fontWeight: '900' }}
        >
          Email privacy inquiries
        </Text>
      </Pressable>

      <Text
        style={{
          color: colors.muted,
          fontSize: 10,
          textAlign: 'center',
          marginTop: spacing.lg,
        }}
      >
        © 2026 Geneseon. All rights reserved.
      </Text>
    </Screen>
  );
}
