import { useSEO } from "@/hooks/useSEO";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPolicy() {
  useSEO({
    title: "Privacy Policy — ToolsHub",
    description: "ToolsHub privacy policy. We don't collect, store, or upload your files. Everything runs in your browser.",
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Last updated: June 2025</p>
        </div>
      </div>

      <div className="space-y-7 text-sm leading-relaxed text-foreground/90">

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">1. No Data Collection</h2>
          <p className="text-muted-foreground">
            ToolsHub does <strong className="text-foreground">not</strong> collect, store, transmit, or process any of your files or personal data on any server. All operations — image compression, PDF conversion, QR generation, text cleaning — run entirely inside your own browser using JavaScript. Your files never leave your device.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">2. No Account Required</h2>
          <p className="text-muted-foreground">
            We do not ask you to create an account, provide an email address, or share any personal information to use any tool on ToolsHub.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">3. Local Storage</h2>
          <p className="text-muted-foreground">
            ToolsHub saves your preferences (theme, default quality setting) and usage counts in your browser's <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">localStorage</code>. This data stays on your device and is never sent anywhere. You can clear it at any time from your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">4. Analytics</h2>
          <p className="text-muted-foreground">
            We may use privacy-respecting, anonymous page-view analytics (no cookies, no fingerprinting, no personal identifiers) solely to understand which tools are used most. No file content is ever part of any analytics event.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">5. Third-Party Services</h2>
          <p className="text-muted-foreground">
            ToolsHub does not embed third-party advertising networks, trackers, or social media widgets that would observe your activity.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">6. Changes to This Policy</h2>
          <p className="text-muted-foreground">
            If we update this policy, the "Last updated" date above will change. Continued use of ToolsHub after a change means you accept the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">7. Contact</h2>
          <p className="text-muted-foreground">
            Questions? Reach us via the feedback option in Settings, or open an issue on our public repository.
          </p>
        </section>

        <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 text-sm text-primary font-medium">
          <ShieldCheck className="w-4 h-4 inline-block mr-2 mb-0.5" />
          Your files are processed <strong>100% in your browser</strong>. Nothing is ever uploaded to a server.
        </div>
      </div>
    </div>
  );
}
