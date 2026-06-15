import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Plus, Trash2, ChevronDown, ChevronUp, FileUser, Home, Link2 } from "lucide-react";

const LS_KEY = "toolshub:resume";

function loadSaved() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

const TEMPLATES = [
  { id: "classic",   label: "Classic",   accent: "#2563eb" },
  { id: "modern",    label: "Modern",    accent: "#7c3aed" },
  { id: "minimal",   label: "Minimal",   accent: "#0f172a" },
  { id: "elegant",   label: "Elegant",   accent: "#be123c" },
  { id: "creative",  label: "Creative",  accent: "#0891b2" },
  { id: "executive", label: "Executive", accent: "#15803d" },
  { id: "bold",      label: "Bold",      accent: "#ea580c" },
  { id: "clean",     label: "Clean",     accent: "#475569" },
];

interface Experience { id: number; title: string; company: string; period: string; desc: string; }
interface Education  { id: number; degree: string; school: string; year: string; }
interface Skill      { id: number; name: string; }

export default function ResumeBuilder() {
  useSEO({
    title: "Resume Builder — ToolsHub",
    description: "Create a professional resume with free templates. Fill in your details, preview live, and download as PDF.",
  });

  const printRef = useRef<HTMLDivElement>(null);
  const saved = loadSaved();

  const [template, setTemplate] = useState(() => {
    const t = saved?.templateId ? TEMPLATES.find(t => t.id === saved.templateId) : null;
    return t ?? TEMPLATES[0];
  });
  const [name, setName]         = useState(saved?.name       ?? "Your Name");
  const [title, setTitle]       = useState(saved?.title      ?? "Software Engineer");
  const [email, setEmail]       = useState(saved?.email      ?? "you@example.com");
  const [phone, setPhone]       = useState(saved?.phone      ?? "+91 98765 43210");
  const [location, setLocation] = useState(saved?.location   ?? "Mumbai, India");
  const [summary, setSummary]   = useState(saved?.summary    ?? "Passionate professional with experience in building impactful products. Eager to contribute to a dynamic team.");

  const [experiences, setExperiences] = useState<Experience[]>(saved?.experiences ?? [
    { id: 1, title: "Senior Developer", company: "Tech Corp", period: "2022 – Present", desc: "Led development of key product features and mentored junior developers." },
    { id: 2, title: "Junior Developer", company: "StartupXYZ", period: "2020 – 2022", desc: "Built responsive web applications using React and Node.js." },
  ]);
  const [educations, setEducations] = useState<Education[]>(saved?.educations ?? [
    { id: 1, degree: "B.Tech Computer Science", school: "Mumbai University", year: "2020" },
  ]);
  const [skills, setSkills] = useState<Skill[]>(saved?.skills ?? [
    { id: 1, name: "React" }, { id: 2, name: "TypeScript" }, { id: 3, name: "Node.js" },
    { id: 4, name: "Python" }, { id: 5, name: "SQL" }, { id: 6, name: "Git" },
  ]);
  const [newSkill, setNewSkill] = useState("");
  const [openSections, setOpenSections] = useState({ personal: true, experience: true, education: true, skills: true });

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        templateId: template.id, name, title, email, phone, location, summary,
        experiences, educations, skills,
      }));
    } catch { /* quota exceeded — ignore */ }
  }, [template, name, title, email, phone, location, summary, experiences, educations, skills]);

  const toggle = (s: keyof typeof openSections) => setOpenSections(p => ({ ...p, [s]: !p[s] }));

  const addExp = () => setExperiences(p => [...p, { id: Date.now(), title: "", company: "", period: "", desc: "" }]);
  const delExp = (id: number) => setExperiences(p => p.filter(e => e.id !== id));
  const updExp = (id: number, field: keyof Experience, val: string) =>
    setExperiences(p => p.map(e => e.id === id ? { ...e, [field]: val } : e));

  const addEdu = () => setEducations(p => [...p, { id: Date.now(), degree: "", school: "", year: "" }]);
  const delEdu = (id: number) => setEducations(p => p.filter(e => e.id !== id));
  const updEdu = (id: number, field: keyof Education, val: string) =>
    setEducations(p => p.map(e => e.id === id ? { ...e, [field]: val } : e));

  const addSkill = () => {
    if (!newSkill.trim()) return;
    setSkills(p => [...p, { id: Date.now(), name: newSkill.trim() }]);
    setNewSkill("");
  };

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>${name} — Resume</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a1a1a; background:#fff; }
        .resume { max-width: 800px; margin: 0 auto; }
        @page { size: A4; margin: 0; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style></head><body>${content.innerHTML}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 400);
  };

  const acc = template.accent;

  const [linkCopied, setLinkCopied] = useState(false);
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* ── Page header ── */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-3">
          <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <Home className="w-3 h-3" /> Home
          </Link>
          <span>/</span>
          <span className="flex items-center gap-1 text-foreground font-medium">
            <FileUser className="w-3 h-3" /> Resume Builder
          </span>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Resume Builder</h1>
        <p className="text-muted-foreground max-w-lg mx-auto mb-4">
          Fill in your details, pick a template, and download as PDF — free, no signup, nothing uploaded.
        </p>
        <button
          onClick={copyLink}
          className="inline-flex items-center gap-2 text-xs text-muted-foreground border border-border rounded-full px-4 py-1.5 hover:bg-accent hover:text-foreground transition-colors"
        >
          <Link2 className="w-3.5 h-3.5" />
          {linkCopied ? "Link copied!" : "Share this tool"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Left: Form ── */}
        <div className="w-full lg:w-[380px] flex-shrink-0 space-y-4">
          {/* Template picker */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Template</p>
            <div className="grid grid-cols-4 gap-2">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t)}
                  className={`relative h-12 rounded-lg border-2 text-xs font-semibold transition-all ${
                    template.id === t.id ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/40"
                  }`}
                  style={{ backgroundColor: t.accent + "18" }}
                >
                  <div className="w-full h-2 rounded-t-md" style={{ backgroundColor: t.accent }} />
                  <span className="absolute bottom-1 left-0 right-0 text-center text-[9px] font-semibold" style={{ color: t.accent }}>
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Personal Info */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <button onClick={() => toggle("personal")} className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold">
              Personal Info {openSections.personal ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {openSections.personal && (
              <div className="px-4 pb-4 space-y-2">
                {[
                  { label: "Full Name", val: name, set: setName },
                  { label: "Job Title", val: title, set: setTitle },
                  { label: "Email", val: email, set: setEmail },
                  { label: "Phone", val: phone, set: setPhone },
                  { label: "Location", val: location, set: setLocation },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-xs text-muted-foreground mb-0.5 block">{f.label}</label>
                    <Input value={f.val} onChange={e => f.set(e.target.value)} className="h-8 text-sm" />
                  </div>
                ))}
                <div>
                  <label className="text-xs text-muted-foreground mb-0.5 block">Summary</label>
                  <textarea
                    value={summary}
                    onChange={e => setSummary(e.target.value)}
                    rows={3}
                    className="w-full text-sm rounded-md border border-input bg-background px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Experience */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <button onClick={() => toggle("experience")} className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold">
              Experience {openSections.experience ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {openSections.experience && (
              <div className="px-4 pb-4 space-y-4">
                {experiences.map(exp => (
                  <div key={exp.id} className="border border-border rounded-lg p-3 space-y-2 relative">
                    <button onClick={() => delExp(exp.id)} className="absolute top-2 right-2 text-muted-foreground hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {(["title", "company", "period"] as const).map(f => (
                      <div key={f}>
                        <label className="text-xs text-muted-foreground capitalize mb-0.5 block">{f}</label>
                        <Input value={exp[f]} onChange={e => updExp(exp.id, f, e.target.value)} className="h-7 text-sm" />
                      </div>
                    ))}
                    <div>
                      <label className="text-xs text-muted-foreground mb-0.5 block">Description</label>
                      <textarea value={exp.desc} onChange={e => updExp(exp.id, "desc", e.target.value)} rows={2}
                        className="w-full text-sm rounded-md border border-input bg-background px-3 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={addExp}>
                  <Plus className="w-3.5 h-3.5" /> Add Experience
                </Button>
              </div>
            )}
          </div>

          {/* Education */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <button onClick={() => toggle("education")} className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold">
              Education {openSections.education ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {openSections.education && (
              <div className="px-4 pb-4 space-y-3">
                {educations.map(edu => (
                  <div key={edu.id} className="border border-border rounded-lg p-3 space-y-2 relative">
                    <button onClick={() => delEdu(edu.id)} className="absolute top-2 right-2 text-muted-foreground hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {(["degree", "school", "year"] as const).map(f => (
                      <div key={f}>
                        <label className="text-xs text-muted-foreground capitalize mb-0.5 block">{f}</label>
                        <Input value={edu[f]} onChange={e => updEdu(edu.id, f, e.target.value)} className="h-7 text-sm" />
                      </div>
                    ))}
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={addEdu}>
                  <Plus className="w-3.5 h-3.5" /> Add Education
                </Button>
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <button onClick={() => toggle("skills")} className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold">
              Skills {openSections.skills ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {openSections.skills && (
              <div className="px-4 pb-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {skills.map(sk => (
                    <span key={sk.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-border text-xs font-medium">
                      {sk.name}
                      <button onClick={() => setSkills(p => p.filter(s => s.id !== sk.id))} className="text-muted-foreground hover:text-red-500 ml-0.5">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={newSkill} onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addSkill()}
                    placeholder="Add skill…" className="h-8 text-sm flex-1" />
                  <Button size="sm" onClick={addSkill} className="h-8 px-3"><Plus className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            )}
          </div>

          <Button onClick={handlePrint} className="w-full gap-2" size="lg">
            <Download className="w-4 h-4" /> Download PDF
          </Button>
        </div>

        {/* ── Right: Preview ── */}
        <div className="flex-1">
          <div className="sticky top-20">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Live Preview</p>
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 h-7 text-xs">
                <Download className="w-3 h-3" /> Print / Save PDF
              </Button>
            </div>
            <div className="rounded-2xl border border-border overflow-hidden shadow-lg bg-white">
              <div ref={printRef} style={{ fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: "13px", color: "#1a1a1a", background: "#fff" }}>
                {/* Header */}
                <div style={{ backgroundColor: acc, color: "#fff", padding: "28px 32px 20px" }}>
                  <div style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.5px" }}>{name}</div>
                  <div style={{ fontSize: "14px", opacity: 0.85, marginTop: "4px", fontWeight: 500 }}>{title}</div>
                  <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "11px", opacity: 0.8 }}>
                    {email && <span>✉ {email}</span>}
                    {phone && <span>📞 {phone}</span>}
                    {location && <span>📍 {location}</span>}
                  </div>
                </div>

                <div style={{ padding: "24px 32px" }}>
                  {/* Summary */}
                  {summary && (
                    <div style={{ marginBottom: "20px" }}>
                      <div style={{ color: acc, fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", borderBottom: `2px solid ${acc}`, paddingBottom: "4px", marginBottom: "8px" }}>
                        Summary
                      </div>
                      <p style={{ color: "#444", lineHeight: 1.6 }}>{summary}</p>
                    </div>
                  )}

                  {/* Experience */}
                  {experiences.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                      <div style={{ color: acc, fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", borderBottom: `2px solid ${acc}`, paddingBottom: "4px", marginBottom: "10px" }}>
                        Experience
                      </div>
                      {experiences.map(exp => (
                        <div key={exp.id} style={{ marginBottom: "12px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <span style={{ fontWeight: 700, fontSize: "14px" }}>{exp.title || "Job Title"}</span>
                            <span style={{ fontSize: "11px", color: "#888" }}>{exp.period}</span>
                          </div>
                          <div style={{ color: acc, fontWeight: 600, fontSize: "12px", marginBottom: "3px" }}>{exp.company}</div>
                          {exp.desc && <p style={{ color: "#555", lineHeight: 1.5 }}>{exp.desc}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Education */}
                  {educations.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                      <div style={{ color: acc, fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", borderBottom: `2px solid ${acc}`, paddingBottom: "4px", marginBottom: "10px" }}>
                        Education
                      </div>
                      {educations.map(edu => (
                        <div key={edu.id} style={{ marginBottom: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontWeight: 700 }}>{edu.degree || "Degree"}</span>
                            <span style={{ fontSize: "11px", color: "#888" }}>{edu.year}</span>
                          </div>
                          <div style={{ color: "#555", fontSize: "12px" }}>{edu.school}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Skills */}
                  {skills.length > 0 && (
                    <div>
                      <div style={{ color: acc, fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", borderBottom: `2px solid ${acc}`, paddingBottom: "4px", marginBottom: "10px" }}>
                        Skills
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {skills.map(sk => (
                          <span key={sk.id} style={{ backgroundColor: acc + "18", color: acc, border: `1px solid ${acc}40`, padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 600 }}>
                            {sk.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
