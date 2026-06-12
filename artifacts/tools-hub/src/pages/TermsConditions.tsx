import { useSEO } from "@/hooks/useSEO";
import { FileText } from "lucide-react";

export default function TermsConditions() {
  useSEO({
    title: "Terms & Conditions — ToolsHub",
    description: "ToolsHub terms and conditions of use. Free browser-based tools with no warranties.",
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Terms &amp; Conditions</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Last updated: June 2025</p>
        </div>
      </div>

      <div className="space-y-7 text-sm leading-relaxed text-foreground/90">

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By accessing or using ToolsHub, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the service.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">2. Free to Use</h2>
          <p className="text-muted-foreground">
            ToolsHub is provided free of charge for personal and commercial use. You do not need to pay, register, or sign up to use any feature.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">3. Permitted Use</h2>
          <p className="text-muted-foreground">
            You may use ToolsHub to process files you own or have the legal right to process. You must not use ToolsHub to process illegal, copyrighted, or harmful content, or to attempt to bypass, reverse-engineer, or disrupt the service.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">4. No Warranty</h2>
          <p className="text-muted-foreground">
            ToolsHub is provided <strong className="text-foreground">"as is"</strong> without warranty of any kind. We do not guarantee that the tools will be error-free, uninterrupted, or produce results suitable for any particular purpose. Always keep a copy of your original files.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">5. Limitation of Liability</h2>
          <p className="text-muted-foreground">
            To the maximum extent permitted by law, ToolsHub and its developers shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of the service, including loss of data or files.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">6. Intellectual Property</h2>
          <p className="text-muted-foreground">
            The ToolsHub name, logo, and interface design are the property of their respective owners. The underlying open-source libraries used (jszip, browser-image-compression, pdf-lib, etc.) are subject to their own licenses.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">7. Changes to the Service</h2>
          <p className="text-muted-foreground">
            We reserve the right to modify, suspend, or discontinue any part of ToolsHub at any time without notice.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">8. Governing Law</h2>
          <p className="text-muted-foreground">
            These terms are governed by applicable law. Any disputes shall be resolved in the appropriate jurisdiction.
          </p>
        </section>

      </div>
    </div>
  );
}
