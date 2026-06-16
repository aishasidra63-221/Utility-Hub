import { useSEO } from "@/hooks/useSEO";
import {
  FileText, CheckCircle2, Ban, AlertTriangle,
  Scale, Layers, RefreshCw, Mail, Gavel,
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

export default function TermsConditions() {
  useSEO({
    title: "Terms & Conditions — ToolsHub",
    description: "ToolsHub terms and conditions of use. Free browser-based tools with no warranties.",
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 pb-20">

      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden mb-10 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 px-6 py-8">
        <div className="absolute top-4 right-5 opacity-8 pointer-events-none">
          <FileText className="w-24 h-24 text-primary" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center border border-primary/20">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Terms &amp; Conditions</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Last updated: {LAST_UPDATED}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
            By using ToolsHub, you agree to these terms. Please read them carefully. They are written in plain
            language — no hidden clauses, no surprises.
          </p>
        </div>
      </div>

      {/* Quick summary pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-10">
        {[
          { icon: CheckCircle2, label: "Free forever",   color: "text-emerald-500 bg-emerald-500/10" },
          { icon: Ban,          label: "No signup",       color: "text-blue-500 bg-blue-500/10" },
          { icon: Layers,       label: "26+ tools",       color: "text-violet-500 bg-violet-500/10" },
          { icon: Scale,        label: "Fair use",        color: "text-amber-500 bg-amber-500/10" },
        ].map(({ icon: Icon, label, color }) => (
          <div key={label} className="rounded-xl border border-border bg-card px-3 py-2.5 flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Sections */}
      <div>
        <Section number={1} icon={CheckCircle2} title="Acceptance of Terms">
          <p>
            By accessing or using ToolsHub ("the Service"), you confirm that you are at least 13 years of age
            and agree to be bound by these Terms &amp; Conditions. If you do not agree to any part of these terms,
            you must not use the Service. Your continued use of ToolsHub after any update to these terms
            constitutes acceptance of the revised terms.
          </p>
        </Section>

        <Section number={2} icon={CheckCircle2} title="Description of the Service">
          <p>
            ToolsHub is a free, browser-based utility platform that provides a collection of tools for
            processing images, PDF documents, and other digital content. Tools currently available include:
          </p>
          <div className="grid grid-cols-2 gap-1.5 my-3 text-xs text-foreground">
            {[
              "Image Compressor",   "Image Converter",   "Image Resizer",
              "Image Cropper",      "Background Remover","Watermark Remover",
              "Image Upscaler",     "Face Blur",         "Photo Colorizer",
              "HEIC Converter",     "EXIF Stripper",     "OCR (Text Extract)",
              "PDF Converter",      "PDF Annotator",     "E-Signature",
              "Password Generator", "QR Code Generator", "WhatsApp Link",
              "Unit Converter",     "Word Counter",       "Text Cleaner",
              "Color Palette",      "Color Picker",       "Favicon Generator",
              "Resume Builder",     "Pomodoro Timer",     "Video to GIF",
            ].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-primary/60 shrink-0" />
                <span>{t}</span>
              </div>
            ))}
          </div>
          <p>
            All processing happens entirely in your browser. No files or personal data are uploaded to any server.
            We reserve the right to add, modify, or remove tools at any time.
          </p>
        </Section>

        <Section number={3} icon={CheckCircle2} title="Use of the Service — What Is Allowed">
          <p>
            ToolsHub is provided free of charge for personal, educational, and commercial use. You are welcome to:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-1">
            <li>Process files that you own or have legal rights to use</li>
            <li>Use output files in personal or commercial projects</li>
            <li>Share the ToolsHub website with others</li>
            <li>Use ToolsHub as part of your professional workflow</li>
          </ul>
        </Section>

        <Section number={4} icon={Ban} title="Prohibited Use">
          <p>
            You must not use ToolsHub to:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-1">
            <li>Process content that is illegal, obscene, defamatory, or infringes on the rights of others</li>
            <li>Attempt to reverse-engineer, scrape, crawl, or disrupt the operation of the Service</li>
            <li>Misrepresent your identity or impersonate any person or entity</li>
            <li>Circumvent any technical measures we put in place to protect the Service</li>
            <li>Use automated scripts or bots to access the Service at a rate that degrades performance for others</li>
          </ul>
        </Section>

        <Section number={5} icon={AlertTriangle} title="No Warranty">
          <p>
            ToolsHub is provided <strong className="text-foreground">"as is"</strong> and{" "}
            <strong className="text-foreground">"as available"</strong>, without any warranty of any kind —
            express, implied, or statutory. We make no guarantee that:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-1">
            <li>The Service will be uninterrupted, error-free, or secure</li>
            <li>Results produced by any tool will be accurate or fit for a specific purpose</li>
            <li>The Service will be available in all countries or on all devices</li>
          </ul>
          <p>
            <strong className="text-foreground">Always keep a backup</strong> of your original files before
            processing. We are not responsible for any data loss.
          </p>
        </Section>

        <Section number={6} icon={Scale} title="Limitation of Liability">
          <p>
            To the maximum extent permitted by applicable law, ToolsHub and its developers, operators, and
            affiliates shall not be liable for any direct, indirect, incidental, special, or consequential
            damages arising from:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-1">
            <li>Your use of, or inability to use, the Service</li>
            <li>Loss, corruption, or alteration of data or files</li>
            <li>Errors or inaccuracies in tool outputs</li>
            <li>Any interruption or cessation of the Service</li>
          </ul>
          <p>
            In jurisdictions that do not allow the exclusion of certain warranties or limitations of liability,
            our liability is limited to the fullest extent permitted by law.
          </p>
        </Section>

        <Section number={7} icon={Layers} title="Intellectual Property">
          <p>
            The ToolsHub name, logo, brand identity, and interface design are the intellectual property of
            ToolsHub and are protected under applicable trademark and copyright law. You may not copy,
            imitate, or use them without prior written consent.
          </p>
          <p>
            All tool outputs generated using your own input files remain entirely your property. ToolsHub
            claims no ownership over any file you process through the Service.
          </p>
        </Section>

        <Section number={8} icon={RefreshCw} title="Modifications to the Service or Terms">
          <p>
            We reserve the right to modify, suspend, or discontinue any feature or tool of ToolsHub at any
            time without prior notice. We also reserve the right to update these Terms &amp; Conditions. The
            "Last updated" date at the top of this page reflects when changes were last made. We encourage
            you to review this page periodically.
          </p>
        </Section>

        <Section number={9} icon={Gavel} title="Governing Law">
          <p>
            These Terms &amp; Conditions shall be governed by and construed in accordance with applicable laws.
            Any disputes arising out of or in connection with these terms or your use of the Service shall
            be subject to the exclusive jurisdiction of the competent courts in the applicable territory.
          </p>
        </Section>

        <Section number={10} icon={Mail} title="Contact">
          <p>
            If you have any questions about these Terms &amp; Conditions, please contact us at{" "}
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

      {/* Bottom note */}
      <div className="rounded-2xl border border-border bg-muted/40 px-5 py-4 flex items-start gap-3 mt-2">
        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          These terms were last revised in {LAST_UPDATED}. If you have been using ToolsHub prior to this date,
          please review the updated terms. For questions, email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">{CONTACT_EMAIL}</a>.
        </p>
      </div>

    </div>
  );
}
