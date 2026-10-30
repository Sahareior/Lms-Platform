import { Resend } from "resend";

/**
 * Resend client for transactional emails (password reset).
 *
 * When RESEND_API_KEY is missing (e.g. local dev), sending falls back to
 * logging the email body to the console so the flow stays testable without
 * an account. Production should always set RESEND_API_KEY.
 */
const apiKey = process.env.RESEND_API_KEY;
export const resend = apiKey ? new Resend(apiKey) : null;

/**
 * Send a transactional email, or log it when Resend isn't configured.
 * Never throws — callers shouldn't break the request on email failures.
 */
export async function sendEmail({ to, subject, html }) {
  if (!resend) {
    console.log(`[email:dev] to=${to} subject="${subject}"\n${html}`);
    return { dev: true };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Geneseon LMS <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Resend email error:", err);
    throw err;
  }
}
