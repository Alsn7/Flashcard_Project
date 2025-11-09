import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Flashcard",
  description: "Terms of Service governing the use of the Flashcard app, including uploads, AI-generated study materials, account rules, and acceptable use.",
};

export default function TermsPage() {
  const LastUpdated = "November 5, 2025";
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {LastUpdated}</p>
      </header>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p>
          Welcome to Flashcard (the "Service"). By creating an account, accessing, or using the
          Service, you agree to these Terms of Service (the "Terms"). If you do not agree to the Terms,
          do not use the Service.
        </p>

        <h2>1. About Flashcard</h2>
        <p>
          Flashcard helps you turn documents and text into study materials using AI. You can upload files
          (for example, PDFs) and generate flashcards, save decks, track progress, and sign in using email/password
          or Google. We leverage trusted third parties to deliver the Service, including Supabase (auth/storage),
          OpenAI (content generation), and cloud storage providers.
        </p>

        <h2>2. Eligibility & Accounts</h2>
        <ul>
          <li>You must be at least 13 years old (or the minimum age in your jurisdiction) to use the Service.</li>
          <li>Keep your account credentials secure and do not share them. You are responsible for all activity on your account.</li>
          <li>You may sign up with email/password or a supported OAuth provider (e.g., Google). You agree to provide accurate information.</li>
          <li>We may contact you at the email associated with your account for verification and security purposes.</li>
        </ul>

        <h2>3. User Content & Uploads</h2>
        <ul>
          <li>You retain ownership of the materials you upload or enter into the Service ("User Content").</li>
          <li>
            You grant us a non-exclusive, worldwide, royalty-free license to host, process, transform,
            and display your User Content solely to provide and improve the Service (e.g., to generate flashcards,
            store decks, and enable your account features).
          </li>
          <li>You represent that you have the necessary rights to upload the User Content and that it does not infringe others’ rights.</li>
          <li>Do not upload content that is illegal, harmful, infringing, or that violates academic integrity policies.</li>
        </ul>

        <h2>4. AI-Generated Content</h2>
        <ul>
          <li>AI outputs may be inaccurate or incomplete. Always review generated materials before use.</li>
          <li>AI-generated content is for educational assistance only and is not professional advice.</li>
          <li>Do not rely on AI outputs where errors could cause harm or significant impact.</li>
        </ul>

        <h2>5. Acceptable Use</h2>
        <ul>
          <li>No reverse engineering, scraping, or misuse of the Service or its APIs.</li>
          <li>No uploading malware, attempting unauthorized access, or disrupting operations.</li>
          <li>No use that violates laws, intellectual property, or privacy rights.</li>
          <li>No cheating or academic misconduct using generated materials.</li>
        </ul>

        <h2>6. Intellectual Property</h2>
        <p>
          The Service, including our trademarks, UI, and code, is protected by intellectual property laws. Except for the
          limited license described in Section 3, these Terms do not grant you any rights to our IP.
        </p>

        <h2>7. Third‑Party Services</h2>
        <p>
          We integrate with third‑party providers to deliver features. Your use may also be subject to their terms and
          privacy practices. Key providers may include Supabase (authentication and database), OpenAI (content generation),
          Google (OAuth), and cloud storage providers. We are not responsible for third‑party services.
        </p>

        <h2>8. Plans, Trials, and Billing</h2>
        <p>
          Some features may be offered free of charge today. We may introduce paid plans, usage limits, or trials in the
          future. If paid plans are introduced, additional terms (pricing, refunds, cancellation) will be provided at checkout.
        </p>

        <h2>9. Termination</h2>
        <p>
          You may stop using the Service at any time. We may suspend or terminate your access if you breach these Terms or if
          continued access creates risk for us or others. Upon termination, certain provisions survive (e.g., IP, disclaimers,
          limitations of liability).
        </p>

        <h2>10. Disclaimers</h2>
        <p>
          THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL
          WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON‑INFRINGEMENT.
        </p>

        <h2>11. Limitation of Liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
          EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF DATA, PROFITS, OR REVENUE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
          DAMAGES. OUR AGGREGATE LIABILITY FOR ALL CLAIMS RELATING TO THE SERVICE SHALL NOT EXCEED THE GREATER OF (A) AMOUNTS
          YOU PAID US FOR THE SERVICE IN THE 12 MONTHS PRECEDING THE CLAIM, OR (B) $100.
        </p>

        <h2>12. Changes to the Service or Terms</h2>
        <p>
          We may modify the Service or these Terms from time to time. If changes are material, we will provide notice (e.g., via
          email or in‑app). Continued use after changes means you accept the updated Terms.
        </p>

        <h2>13. Privacy</h2>
        <p>
          Our <Link href="/privacy" className="underline">Privacy Policy</Link> explains how we collect, use, and share information. By using the Service,
          you also agree to the Privacy Policy.
        </p>

        <h2>14. Contact</h2>
        <p>
          Questions? Reach us at <a href="mailto:support@yourdomain.com" className="underline">support@yourdomain.com</a>.
          Replace this email in the source code with your actual support address.
        </p>
      </div>
    </main>
  );
}
