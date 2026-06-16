import { useState } from "react";
import { Mail, MessageSquare, Send, MapPin, Shield, Clock } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";

export default function Contact() {
  useSEO({
    title: "Contact ToolsHub — Get Help, Report Issues, or Send Feedback",
    description:
      "Reach out to the ToolsHub team for support, feature requests, bug reports, or general questions. We respond within 24 hours.",
    canonical: `${typeof window !== "undefined" ? window.location.origin : ""}/contact`,
    keywords: "contact toolshub, support, feedback, bug report",
  });

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nSubject: ${form.subject}\n\n${form.message}`
    );
    window.open(`mailto:hello@toolshub.app?subject=${encodeURIComponent(form.subject)}&body=${body}`, "_blank");
    setSent(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <Mail className="w-3.5 h-3.5" />
          <span>Get in Touch</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Contact Us</h1>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          Have a question, found a bug, or want to suggest a new tool? We'd love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { icon: Mail, title: "Email", detail: "hello@toolshub.app", sub: "Best for general inquiries" },
          { icon: Clock, title: "Response Time", detail: "Within 24 hours", sub: "Mon–Fri, usually faster" },
          { icon: Shield, title: "Privacy", detail: "No tracking in contact", sub: "Your data stays yours" },
        ].map(({ icon: Icon, title, detail, sub }) => (
          <div key={title} className="bg-card border border-border rounded-xl px-5 py-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{title}</p>
              <p className="text-sm text-foreground mt-0.5">{detail}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">Send a Message</h2>
          {sent ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-5 py-6 text-center">
              <Send className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-foreground">Your message is ready!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your email client has opened with the message pre-filled. Just click Send.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setSent(false)}>
                Send Another
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Name</label>
                  <input
                    name="name"
                    required
                    value={form.name}
                    onChange={handle}
                    placeholder="Your name"
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handle}
                    placeholder="you@example.com"
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Subject</label>
                <select
                  name="subject"
                  required
                  value={form.subject}
                  onChange={handle}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Select a topic…</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Tool Suggestion">Tool Suggestion</option>
                  <option value="General Question">General Question</option>
                  <option value="Privacy Inquiry">Privacy Inquiry</option>
                  <option value="Business / Partnership">Business / Partnership</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Message</label>
                <textarea
                  name="message"
                  required
                  value={form.message}
                  onChange={handle}
                  rows={5}
                  placeholder="Describe your question, bug, or idea in detail…"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
              <Button type="submit" className="gap-2 w-full">
                <Send className="w-4 h-4" />
                Open Email Client
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                This opens your email client with the message pre-filled. No data is sent through our servers.
              </p>
            </form>
          )}
        </div>

        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">Common Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "How do I report a tool that isn't working?",
                a: "Select 'Bug Report' as the subject and describe which tool, what you were doing, your browser and OS, and any error message shown.",
              },
              {
                q: "Can I request a new tool?",
                a: "Yes! We love suggestions. Select 'Tool Suggestion' and describe the tool you need. Popular requests get prioritized.",
              },
              {
                q: "Do you offer API access?",
                a: "All processing runs client-side in browsers. There is no server API to expose. The full code is available for inspection.",
              },
              {
                q: "I have a privacy concern — who do I contact?",
                a: "Select 'Privacy Inquiry' and describe your concern. We take privacy seriously — see our Privacy Policy and Security pages for details.",
              },
              {
                q: "Is there a business or white-label option?",
                a: "Select 'Business / Partnership' to discuss custom deployments, integrations, or white-label arrangements.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-muted/30 border border-border/50 rounded-xl px-4 py-3">
                <p className="font-semibold text-sm text-foreground">{q}</p>
                <p className="text-sm text-muted-foreground mt-1">{a}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-primary/5 border border-primary/15 rounded-xl px-4 py-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm text-foreground">About ToolsHub</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ToolsHub is an independent, privacy-first tool platform. We are not backed by any company that monetizes user data. All tools run in your browser — your files stay on your device.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-border pt-8">
        <h2 className="text-lg font-bold text-foreground mb-4">
          <MessageSquare className="inline w-5 h-5 mr-2 text-primary" />
          Frequently Asked Support Questions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { q: "Why does the background remover take time on first use?", a: "The AI model (~20 MB) downloads to your browser once and is cached for instant use afterwards." },
            { q: "Why does the HEIC converter not work on some files?", a: "Some HEIC files use advanced HEVC compression. Try updating your browser to the latest version." },
            { q: "Can ToolsHub work offline?", a: "After the initial page load, most tools work offline. AI tools require the model to be cached first." },
            { q: "Are my files stored anywhere?", a: "No. All processing is local. No files, data, or usage information leaves your device." },
          ].map(({ q, a }) => (
            <div key={q} className="bg-card border border-border rounded-xl px-4 py-3">
              <p className="font-semibold text-sm text-foreground">{q}</p>
              <p className="text-sm text-muted-foreground mt-1">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
