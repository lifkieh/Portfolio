'use client';

import React, { useState, useEffect, useCallback } from 'react';

const TABS = ['about', 'projects', 'certificates', 'skills'] as const;
type Tab = typeof TABS[number];

type AboutData = {
  name: string; avatar: string; resumeUrl: string;
  subtitle: string; bio: string; githubUrl: string; linkedinUrl: string;
};
type ProjectItem = {
  id: number; title: string; description: string; longDescription?: string;
  img: string; tech: string[]; link: string; github: string; documentUrl?: string;
};
type CertificateItem = {
  id: number; title: string; platform: string;
  description: string; img: string; date: string; credentialUrl?: string;
};
type SkillsData = { skills: string[]; tools: string[]; frameworks?: string[] };

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('about');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const [about, setAbout] = useState<AboutData | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [skills, setSkills] = useState<SkillsData | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchData = useCallback(async () => {
    const [a, p, c, s] = await Promise.all([
      fetch('/api/cms?section=about').then(r => r.json()),
      fetch('/api/cms?section=projects').then(r => r.json()),
      fetch('/api/cms?section=certificates').then(r => r.json()),
      fetch('/api/cms?section=skills').then(r => r.json()),
    ]);
    setAbout(a); setProjects(p); setCertificates(c); setSkills(s);
  }, []);

  useEffect(() => { if (authed) fetchData(); }, [authed, fetchData]);

  const saveSection = async (section: Tab, data: unknown) => {
    setSaving(true);
    const res = await fetch('/api/cms', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, section, data, username }),
    });
    if (res.ok) showToast(`✅ ${section} saved!`);
    else showToast('❌ Failed to save');
    setSaving(false);
  };

  const handleLogin = async () => {
    const res = await fetch('/api/cms', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, username, action: 'verify' }),
    });
    if (res.status === 401) { setAuthError('Wrong password'); return; }
    if (res.ok) { setAuthed(true); setAuthError(''); }
    else { setAuthError('Server error'); }
  };

  // ─── LOGIN SCREEN ───
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0e0a12] via-[#1a0f1f] to-[#120b18]">
        <div className="w-full max-w-sm p-8 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/25">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Welcome Master</h1>
            <p className="text-sm text-slate-400 mt-1">Shine your handsomeness </p>
          </div>
          <input
            type="text"
            value={username}
            onChange={e => { setUsername(e.target.value); setAuthError(''); }}
            placeholder="Name Of Greatest Demon King"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 mb-4"
          />
          <input
            type="password" value={password}
            onChange={e => { setPassword(e.target.value); setAuthError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Most Handsome Demon King Keyword"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 mb-4"
          />
          {authError && <p className="text-red-400 text-sm mb-3">{authError}</p>}
          <button onClick={handleLogin} className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold shadow-lg shadow-pink-500/25 hover:brightness-110 active:scale-[0.98] transition">
            Login
          </button>
        </div>
      </div>
    );
  }

  // ─── DASHBOARD ───
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0e0a12] via-[#1a0f1f] to-[#120b18] text-white">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl bg-slate-800/90 backdrop-blur-xl border border-white/10 text-sm font-semibold shadow-xl animate-fade-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0e0a12]/80 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </div>
            <h1 className="text-lg font-bold">Master Mode</h1>
          </div>
          <div className="flex gap-2">
            <a href="/" className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition">← Back to Site</a>
            <button onClick={() => { setAuthed(false); setPassword(''); }} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition">Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/5 backdrop-blur-lg w-fit mb-8">
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${activeTab === t ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'about' && about && <AboutEditor data={about} onChange={setAbout} onSave={() => saveSection('about', about)} saving={saving} password={password} />}
        {activeTab === 'projects' && <ProjectsEditor projects={projects} onChange={setProjects} onSave={() => saveSection('projects', projects)} saving={saving} password={password} />}
        {activeTab === 'certificates' && <CertificatesEditor certificates={certificates} onChange={setCertificates} onSave={() => saveSection('certificates', certificates)} saving={saving} password={password} />}
        {activeTab === 'skills' && skills && <SkillsEditor data={skills} onChange={setSkills} onSave={() => saveSection('skills', skills)} saving={saving} />}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   ABOUT EDITOR
   ════════════════════════════════════════════════ */
function AboutEditor({ data, onChange, onSave, saving, password }: { data: AboutData; onChange: (d: AboutData) => void; onSave: () => void; saving: boolean; password: string }) {
  const update = (key: keyof AboutData, val: string) => onChange({ ...data, [key]: val });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">About Section</h2>
        <button onClick={onSave} disabled={saving} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold shadow-lg shadow-pink-500/20 hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      <div className="grid gap-5 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
        <Field label="Name" value={data.name} onChange={v => update('name', v)} />
        <FileUploadField label="Avatar Image" value={data.avatar} onChange={v => update('avatar', v)} password={password} accept="image/*" />
        <FileUploadField label="Resume PDF" value={data.resumeUrl} onChange={v => update('resumeUrl', v)} password={password} accept=".pdf" />
        <Field label="Subtitle" value={data.subtitle} onChange={v => update('subtitle', v)} />
        <Field label="GitHub URL" value={data.githubUrl} onChange={v => update('githubUrl', v)} />
        <Field label="LinkedIn URL" value={data.linkedinUrl} onChange={v => update('linkedinUrl', v)} />
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">Bio</label>
          <textarea value={data.bio} onChange={e => update('bio', e.target.value)} rows={4}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none" />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   PROJECTS EDITOR
   ════════════════════════════════════════════════ */
function ProjectsEditor({ projects, onChange, onSave, saving, password }: { projects: ProjectItem[]; onChange: (p: ProjectItem[]) => void; onSave: () => void; saving: boolean; password: string }) {
  const updateProject = (idx: number, key: keyof ProjectItem, val: string | string[]) => {
    const updated = [...projects];
    (updated[idx] as Record<string, unknown>)[key] = val;
    onChange(updated);
  };
  const addProject = () => {
    const newId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;
    onChange([...projects, { id: newId, title: '', description: '', longDescription: '', img: '', tech: [], link: '', github: '', documentUrl: '' }]);
  };
  const removeProject = (idx: number) => { const u = [...projects]; u.splice(idx, 1); onChange(u); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Projects ({projects.length})</h2>
        <div className="flex gap-3">
          <button onClick={addProject} className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white font-semibold hover:bg-white/15 transition">+ Add Project</button>
          <button onClick={onSave} disabled={saving} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold shadow-lg shadow-pink-500/20 hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
      {projects.map((p, i) => (
        <div key={p.id} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-pink-400">Project #{p.id}</span>
            <button onClick={() => removeProject(i)} className="text-sm text-red-400 hover:text-red-300 transition">Delete</button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Title" value={p.title} onChange={v => updateProject(i, 'title', v)} />
            <FileUploadField label="Project Image" value={p.img} onChange={v => updateProject(i, 'img', v)} password={password} accept="image/*" />
            <Field label="Demo Link" value={p.link} onChange={v => updateProject(i, 'link', v)} />
            <Field label="GitHub Link" value={p.github} onChange={v => updateProject(i, 'github', v)} />
          </div>
          <FileUploadField label="Document/Report File (Optional)" value={p.documentUrl || ''} onChange={v => updateProject(i, 'documentUrl', v)} password={password} accept="*/*" />
          <Field label="Short Description" value={p.description} onChange={v => updateProject(i, 'description', v)} />
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Long Essay Description</label>
            <textarea value={p.longDescription || ''} onChange={e => updateProject(i, 'longDescription', e.target.value)} rows={6}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Tech (comma-separated)</label>
            <TechInput initialTech={p.tech} onChange={val => updateProject(i, 'tech', val)} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════
   CERTIFICATES EDITOR
   ════════════════════════════════════════════════ */
function CertificatesEditor({ certificates, onChange, onSave, saving, password }: { certificates: CertificateItem[]; onChange: (c: CertificateItem[]) => void; onSave: () => void; saving: boolean; password: string }) {
  const updateCert = (idx: number, key: keyof CertificateItem, val: string) => {
    const updated = [...certificates];
    (updated[idx] as Record<string, unknown>)[key] = val;
    onChange(updated);
  };
  const addCert = () => {
    const newId = certificates.length > 0 ? Math.max(...certificates.map(c => c.id)) + 1 : 1;
    onChange([...certificates, { id: newId, title: '', platform: '', description: '', img: '', date: '', credentialUrl: '' }]);
  };
  const removeCert = (idx: number) => { const u = [...certificates]; u.splice(idx, 1); onChange(u); };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const u = [...certificates];
    [u[idx - 1], u[idx]] = [u[idx], u[idx - 1]];
    onChange(u);
  };
  const moveDown = (idx: number) => {
    if (idx === certificates.length - 1) return;
    const u = [...certificates];
    [u[idx + 1], u[idx]] = [u[idx], u[idx + 1]];
    onChange(u);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Certificates ({certificates.length})</h2>
        <div className="flex gap-3">
          <button onClick={addCert} className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white font-semibold hover:bg-white/15 transition">+ Add Certificate</button>
          <button onClick={onSave} disabled={saving} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold shadow-lg shadow-pink-500/20 hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
      {certificates.map((c, i) => (
        <div key={c.id} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-pink-400">Certificate #{c.id}</span>
              <div className="flex gap-1">
                <button onClick={() => moveUp(i)} disabled={i === 0} className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed">↑</button>
                <button onClick={() => moveDown(i)} disabled={i === certificates.length - 1} className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed">↓</button>
              </div>
            </div>
            <button onClick={() => removeCert(i)} className="text-sm text-red-400 hover:text-red-300 transition">Delete</button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Certificate Title" value={c.title} onChange={v => updateCert(i, 'title', v)} />
            <Field label="Platform/Issuer" value={c.platform} onChange={v => updateCert(i, 'platform', v)} />
            <Field label="Date (e.g. May 2025)" value={c.date} onChange={v => updateCert(i, 'date', v)} />
            <Field label="Credential URL (Optional)" value={c.credentialUrl || ''} onChange={v => updateCert(i, 'credentialUrl', v)} />
          </div>
          <FileUploadField label="Certificate Image/File" value={c.img} onChange={v => updateCert(i, 'img', v)} password={password} accept="*/*" />
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Description</label>
            <textarea value={c.description} onChange={e => updateCert(i, 'description', e.target.value)} rows={3}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════
   SKILLS EDITOR
   ════════════════════════════════════════════════ */
function SkillsEditor({ data, onChange, onSave, saving }: { data: SkillsData; onChange: (d: SkillsData) => void; onSave: () => void; saving: boolean }) {
  const [skillsText, setSkillsText] = useState(data.skills.join(', '));
  const [toolsText, setToolsText] = useState(data.tools.join(', '));
  const [frameworksText, setFrameworksText] = useState((data.frameworks || []).join(', '));

  const parseList = (text: string) => text.split(',').map(s => s.trim()).filter(Boolean);

  const handleSkillsBlur = () => onChange({ ...data, skills: parseList(skillsText) });
  const handleToolsBlur = () => onChange({ ...data, tools: parseList(toolsText) });
  const handleFrameworksBlur = () => onChange({ ...data, frameworks: parseList(frameworksText) });

  // Preview tags dari teks saat ini (real-time)
  const skillsPreview = parseList(skillsText);
  const toolsPreview = parseList(toolsText);
  const frameworksPreview = parseList(frameworksText);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Skills, Tools & Frameworks</h2>
        <button onClick={() => { handleSkillsBlur(); handleToolsBlur(); handleFrameworksBlur(); setTimeout(onSave, 50); }} disabled={saving} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold shadow-lg shadow-pink-500/20 hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">Skills (comma-separated)</label>
          <textarea value={skillsText} onChange={e => setSkillsText(e.target.value)} onBlur={handleSkillsBlur} rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none" />
          <div className="flex flex-wrap gap-2 mt-2">
            {skillsPreview.map(s => <span key={s} className="px-3 py-1 text-xs rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/20 capitalize break-all max-w-full inline-block text-center">{s}</span>)}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">Tools (comma-separated)</label>
          <textarea value={toolsText} onChange={e => setToolsText(e.target.value)} onBlur={handleToolsBlur} rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none" />
          <div className="flex flex-wrap gap-2 mt-2">
            {toolsPreview.map(t => <span key={t} className="px-3 py-1 text-xs rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/20 capitalize break-all max-w-full inline-block text-center">{t}</span>)}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">Frameworks & Libraries (comma-separated)</label>
          <textarea value={frameworksText} onChange={e => setFrameworksText(e.target.value)} onBlur={handleFrameworksBlur} rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none" />
          <div className="flex flex-wrap gap-2 mt-2">
            {frameworksPreview.map(f => <span key={f} className="px-3 py-1 text-xs rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/20 capitalize break-all max-w-full inline-block text-center">{f}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   SHARED INPUT FIELD
   ════════════════════════════════════════════════ */
function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-300 mb-1.5">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50" />
    </div>
  );
}

/* ════════════════════════════════════════════════
   TECH INPUT FIELD
   ════════════════════════════════════════════════ */
function TechInput({ initialTech, onChange }: { initialTech: string[]; onChange: (v: string[]) => void }) {
  const [text, setText] = useState(initialTech.join(', '));

  // Sync state if initialTech changes externally (e.g., when adding/deleting projects)
  useEffect(() => {
    setText(initialTech.join(', '));
  }, [initialTech]);

  const handleBlur = () => {
    onChange(text.split(',').map(s => s.trim()).filter(Boolean));
  };

  return (
    <input
      value={text}
      onChange={e => setText(e.target.value)}
      onBlur={handleBlur}
      placeholder="e.g. React, Next.js, Tailwind"
      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
    />
  );
}

/* ════════════════════════════════════════════════
   FILE UPLOAD FIELD
   ════════════════════════════════════════════════ */
function FileUploadField({ label, value, onChange, password, accept }: { label: string; value: string; onChange: (v: string) => void; password: string; accept?: string }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        onChange(data.url);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      alert('Error uploading file');
    }
    setUploading(false);
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-300 mb-1.5">{label}</label>
      <div className="flex gap-2">
        <input value={value} onChange={e => onChange(e.target.value)} placeholder="URL or upload file..."
          className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50" />
        <label className={`cursor-pointer px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white font-semibold hover:bg-white/20 transition flex items-center justify-center ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          {uploading ? 'Uploading...' : 'Upload'}
          <input type="file" className="hidden" accept={accept} onChange={handleFileChange} />
        </label>
      </div>
    </div>
  );
}
