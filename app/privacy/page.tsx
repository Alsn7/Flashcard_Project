import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Flashcard",
  description: "Privacy Policy describing how Flashcard collects, uses, shares, and protects your data, including uploads and AI processing.",
};

export default function PrivacyPage() {
  const LastUpdated = "November 5, 2025";
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {LastUpdated}</p>
      </header>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p>
          This Privacy Policy explains how Flashcard ("we", "our", or "us") collects, uses, and shares information
          when you use our website and services (the "Service"). By using the Service, you consent to the practices
          described here.
        </p>

        <h2>1. Information We Collect</h2>
        <ul>
          <li>
            <strong>Account Information.</strong> Email address, name, and authentication data when you sign up using
            email/password or Google.
          </li>
          <li>
            <strong>Uploads & Content.</strong> Files and text you provide to generate flashcards (e.g., PDFs), plus
            the resulting decks and study data.
          </li>
          <li>
            <strong>Usage Data.</strong> App interactions, device information, approximate location, and diagnostics to
            maintain and improve the Service.
          </li>
          <li>
            <strong>Cookies & Local Storage.</strong> Used for authentication, preferences, security, and performance.
          </li>
        </ul>

        <h2>2. How We Use Information</h2>
        <ul>
          <li>Provide, operate, and maintain the Service (e.g., authentication, storage, deck management).</li>
          <li>Generate study materials using AI based on your inputs and uploads.</li>
          <li>Protect the Service from abuse, troubleshoot, and improve performance.</li>
          <li>Communicate with you about your account, security, and important changes.</li>
          <li>Comply with legal obligations and enforce our <Link href="/terms" className="underline">Terms of Service</Link>.</li>
        </ul>

        <h2>3. Legal Bases (EEA/UK)</h2>
        <p>Where applicable, we process data under these legal bases: contract (to provide the Service), legitimate interests (to improve and secure the Service), and consent (where required, e.g., certain cookies).</p>

        <h2>4. Sharing & Transfers</h2>
        <p>We share information with trusted service providers to deliver core features:</p>
        <ul>
          <li>
            <strong>Supabase</strong> for authentication, database, and storage.
          </li>
          <li>
            <strong>OpenAI</strong> to transform your inputs into flashcards and study materials.
          </li>
          <li>
            <strong>Google</strong> for OAuth sign‑in (if chosen).
          </li>
        </ul>
        <p>
          We may also share data to comply with law, respond to legal requests, prevent harm, or as part of a business
          transaction. Data may be transferred to, and processed in, countries other than where you live.
        </p>

        <h2>5. Data Retention</h2>
        <p>
          We retain information for as long as your account is active or as needed to provide the Service. You may delete
          uploads, decks, or your account; residual copies may persist in backups for a limited time.
        </p>

        <h2>6. Security</h2>
        <p>
          We use industry‑standard practices to help protect your information. No method of transmission or storage is
          100% secure, and we cannot guarantee absolute security.
        </p>

        <h2>7. Your Rights</h2>
        <ul>
          <li>Access, correct, or export certain data in your account.</li>
          <li>Delete your account or request deletion of your data (subject to legal requirements).</li>
          <li>Object to or restrict certain processing where applicable.</li>
        </ul>
        <p>To exercise rights, contact us at <a href="mailto:privacy@yourdomain.com" className="underline">privacy@yourdomain.com</a>.</p>

        <h2>8. Children’s Privacy</h2>
        <p>The Service is not directed to children under 13, and we do not knowingly collect data from them.</p>

        <h2>9. Cookies & Tracking</h2>
        <p>
          We use cookies and similar technologies for session management, preferences, analytics, and security. You can
          control cookies via your browser settings; some features may not function without them.
        </p>

        <h2>10. AI Processing</h2>
        <ul>
          <li>Your inputs and uploads may be sent to AI providers to generate study materials.</li>
          <li>We do not use your private uploads to train our own models.</li>
          <li>AI outputs may be inaccurate; always review generated content.</li>
        </ul>

        <h2>11. Changes to this Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. If changes are material, we will notify you (e.g., via
          email or in‑app). Continued use after changes means you accept the updated Policy.
        </p>

        <h2>12. Contact</h2>
        <p>
          Questions about privacy? Contact us at <a href="mailto:privacy@yourdomain.com" className="underline">privacy@yourdomain.com</a>.
          Replace this email in the source code with your actual contact address.
        </p>
      </div>
    </main>
  );
}
