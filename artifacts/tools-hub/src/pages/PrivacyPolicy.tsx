import { useSEO } from "@/hooks/useSEO";
import {
  ShieldCheck, Eye, Database, Cookie, BarChart2,
  Globe, RefreshCw, Mail, Lock,
} from "lucide-react";

const LAST_UPDATED = "June 2026";
const CONTACT_EMAIL = "support@toolshub.app";

function Section({
  number,
  icon: Icon,
  title,
  children,
}: {
  number: number;
  icon: React.FC<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex gap-4">
      <div className="shrink-0 flex flex-col items-center gap-2 pt-0.5">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 w-px bg-border" />
      </div>
      <div className="pb-8 min-w-0">
        <h2 className="text-sm font-bold text-foreground mb-2">
          <span className="text-muted-foreground font-normal mr-2">{number}.</span>
          {title}
        </h2>
        <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
          {children}
        </div>
      </div>
    </section>
  );
}

export default function PrivacyPolicy() {
  useSEO({
    title: "Privacy Policy — ToolsHub",
    description: "ToolsHub privacy policy. We don't collect, store, or upload your files. Everything runs in your browser.",
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 pb-20">

      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden mb-10 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 px-6 py-8">
        <div className="absolute top-4 right-5 opacity-8 pointer-events-none">
          <ShieldCheck className="w-24 h-24 text-primary" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center border border-primary/20">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Privacy Policy</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Last updated: {LAST_UPDATED}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
            At ToolsHub, your privacy is not a feature — it is the foundation. This policy explains what we collect
            (spoiler: almost nothing), what we do with it, and your rights as a user.
          </p>
        </div>
      </div>

      {/* Privacy at a glance */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {[
          { icon: Lock,        label: "Zero uploads",   sub: "Files never leave your device" },
          { icon: Eye,         label: "No tracking",    sub: "No ad networks or fingerprinting" },
          { icon: Database,    label: "No accounts",    sub: "No email, no signup, ever" },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-3.5 text-center">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs font-semibold text-foreground">{label}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{sub}</p>
          </div>
        ))}
      </div>

      {/* Sections */}
      <div>
        <Section number={1} icon={Database} title="Information We Do Not Collect">
          <p>
            ToolsHub does <strong className="text-foreground">not</strong> collect, receive, store, or process any files
            you work with — images, PDFs, documents, or any other content you open in our tools. All processing
            happens entirely within your own web browser, on your own device. Nothing is ever transmitted to our
            servers or any third party.
          </p>
          <p>
            We do not collect your name, email address, phone number, IP address, location, or any other
            personally identifiable information.
          </p>
        </Section>

        <Section number={2} icon={Cookie} title="Local Storage & Preferences">
          <p>
            To remember your choices between visits, ToolsHub saves a small amount of data in your browser's
            local storage. This includes:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-1">
            <li>Your preferred theme (light or dark)</li>
            <li>Your default compression quality setting</li>
            <li>A list of tools you have marked as favourites</li>
            <li>An anonymous usage count per tool (so we can show you how often you've used each one)</li>
            <li>Your language preference</li>
          </ul>
          <p>
            This data lives only on your device, is never sent anywhere, and can be deleted at any time from
            <strong className="text-foreground"> Settings → Clear All Data</strong> or through your browser settings.
          </p>
        </Section>

        <Section number={3} icon={BarChart2} title="Analytics">
          <p>
            We may use privacy-respecting, anonymous page-view analytics to understand which tools are used most
            and how the site performs. If used, such analytics:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-1">
            <li>Do not use cookies</li>
            <li>Do not fingerprint your device or browser</li>
            <li>Do not track you across other websites</li>
            <li>Never include any file content or personal data</li>
          </ul>
        </Section>

        <Section number={4} icon={Globe} title="Third-Party Services">
          <p>
            ToolsHub does not embed advertising networks, retargeting pixels, social media widgets, or any
            third-party trackers that would observe your activity on this site. The tools themselves are
            self-contained and process all data locally.
          </p>
          <p>
            Hosting infrastructure (web server) may log standard access logs (request path, timestamp, browser
            type) purely for security and reliability purposes. These logs do not contain any of your file
            content and are not used for profiling.
          </p>
        </Section>

        <Section number={5} icon={ShieldCheck} title="Children's Privacy">
          <p>
            ToolsHub does not knowingly collect any data from children under the age of 13. Because we collect
            no personal information at all, this service is safe for users of all ages. Parents and guardians
            can allow children to use ToolsHub without any privacy concerns.
          </p>
        </Section>

        <Section number={6} icon={RefreshCw} title="Changes to This Policy">
          <p>
            If we update this Privacy Policy, the "Last updated" date at the top of this page will change.
            We encourage you to review this page periodically. Continued use of ToolsHub after a change
            constitutes your acceptance of the updated policy.
          </p>
        </Section>

        <Section number={7} icon={Mail} title="Contact Us">
          <p>
            If you have any questions, concerns, or requests regarding this Privacy Policy or your data,
            please contact us at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-primary font-medium hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            {" "}or use the feedback option in <strong className="text-foreground">Settings</strong>.
          </p>
        </Section>
      </div>

      {/* Bottom guarantee */}
      <div className="rounded-2xl border border-primary/25 bg-primary/5 px-5 py-4 flex items-start gap-3 mt-2">
        <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-sm text-foreground">
          <strong>Our promise:</strong> Your files are processed <strong>100% inside your browser</strong>.
          They are never uploaded to any server, never stored anywhere outside your device, and never
          seen by anyone other than you.
        </p>
      </div>

    </div>
  );
}
