import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Upload, FileText, Type, Sparkles, PlayCircle, Check, File, X,
  Loader2, BrainCircuit
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { ai } from '../services/aiService';
import { useApp } from '../context/AppContext';
import { validateFile, MAX_FILE_MB } from '../services/pdfMeta';

const TABS = [
  { id: 'pdf', label: 'Upload PDF', icon: FileText },
  { id: 'paste', label: 'Paste Notes', icon: Type },
  { id: 'topic', label: 'Enter Topic', icon: Sparkles }
];

export default function CreateMapPage() {
  const navigate = useNavigate();
  const { addMap, toast, recordActivity } = useApp();
  const [tab, setTab] = useState('topic');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [phase, setPhase] = useState(0);
  const [extracting, setExtracting] = useState(false);
  const [extractProgress, setExtractProgress] = useState(null);
  const fileInputRef = useRef(null);

  const phases = [
    'Extracting key concepts…',
    'Identifying relationships…',
    'Building your knowledge map…'
  ];

  const handleFile = (f) => {
    if (!f) return;
    const check = validateFile(f);
    if (!check.ok) {
      toast(check.message, 'error');
      return;
    }
    setFile(f);
    setFileName(f.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let content = '';
    if (tab === 'topic') {
      content = topic.trim();
      if (!content) { toast('Please enter a topic to continue.', 'error'); return; }
    } else if (tab === 'paste') {
      content = notes.trim();
      if (!content) { toast('Please paste some notes to continue.', 'error'); return; }
    } else if (tab === 'pdf') {
      if (!file) { toast('Please choose a file to continue.', 'error'); return; }
      setExtracting(true);
      setExtractProgress({ page: 0, total: 0 });
      try {
        const { extractTextFromPdf } = await import('../services/pdfExtract');
        const { buildBookDigest } = await import('../utils/bookDigest');
        content = await extractTextFromPdf(file, {
          onProgress: (p) => setExtractProgress(p)
        });
        if (content.replace(/\s+/g, '').length < 200) {
          toast('That PDF has very little readable text. Try a different file or paste the text.', 'error');
          setExtracting(false);
          setExtractProgress(null);
          return;
        }
        // For full books, condense to a representative digest so the AI sees
        // the entire book — otherwise it only reads the first chapters.
        content = buildBookDigest(content);
      } catch (err) {
        const msg = err?.name === 'PdfTextError' ? err.message : 'Could not read that PDF. It may be corrupt or password-protected.';
        toast(msg, 'error');
        setExtracting(false);
        setExtractProgress(null);
        return;
      } finally {
        setExtracting(false);
        setExtractProgress(null);
      }
    }

    setProcessing(true);
    setPhase(0);
    const phaseTimer = setInterval(() => {
      setPhase((p) => Math.min(p + 1, phases.length - 1));
    }, 900);

    try {
      const titleHint = tab === 'pdf' ? fileName.replace(/\.pdf$/i, '') : '';
      const map = await ai.generateKnowledgeMap({ text: content, topic: content, title: titleHint });
      const saved = addMap(map);
      recordActivity('create', `Created map: ${map.title}`);
      toast(`Knowledge map for "${map.title}" is ready!`, 'success');
      navigate(`/map/${saved.id}`);
    } catch (err) {
      toast(`Something went wrong: ${err.message || 'AI unavailable'}`, 'error');
    } finally {
      clearInterval(phaseTimer);
      setProcessing(false);
    }
  };

  const tryDemo = () => {
    navigate('/map/demo-electrostatics');
  };

  return (
    <div className="landing">
      <div className="bg-scene">
        <div className="bg-blob blob-1" />
        <div className="bg-blob blob-2" />
      </div>
      <Navbar />

      <div className="container" style={{ padding: '50px 24px 80px', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', marginBottom: 8, textAlign: 'center' }}>
            Create a <span className="gradient-text">Knowledge Map</span>
          </h1>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 30 }}>
            Give MemoryMap something to learn from — we handle the rest.
          </p>
        </motion.div>

        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {/* Tab selector */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 26, flexWrap: 'wrap' }}>
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  className={`chip ${tab === t.id ? 'active' : ''}`}
                  onClick={() => setTab(t.id)}
                  style={{ padding: '10px 18px', fontSize: 14 }}
                >
                  <Icon size={15} /> {t.label}
                </button>
              );
            })}
          </div>

          <motion.form
            className="card"
            onSubmit={handleSubmit}
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ padding: 30 }}
          >
            {tab === 'topic' && (
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>What would you like to learn?</label>
                <input
                  className="input"
                  style={{ marginTop: 10 }}
                  placeholder="e.g. Electrostatics, Photosynthesis, The French Revolution…"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  autoFocus
                />
                <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 10 }}>
                  Try <strong>Electrostatics</strong> for the full demo experience.
                </p>
              </div>
            )}

            {tab === 'paste' && (
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Paste your study notes</label>
                <textarea
                  className="textarea"
                  style={{ marginTop: 10, minHeight: 220 }}
                  placeholder="Paste your lecture notes, textbook passages, or revision notes here…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  autoFocus
                />
                <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 10 }}>
                  The AI will extract concepts, find relationships, and organise them into a map.
                </p>
              </div>
            )}

            {tab === 'pdf' && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                <div
                  onClick={() => { if (!extracting) fileInputRef.current?.click(); }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    if (!extracting) handleFile(e.dataTransfer.files?.[0]);
                  }}
                  style={{
                    border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border-strong)'}`,
                    borderRadius: 14,
                    padding: '44px 24px',
                    textAlign: 'center',
                    cursor: extracting ? 'wait' : 'pointer',
                    transition: 'border-color 0.2s',
                    background: dragOver ? 'rgba(99,102,241,0.06)' : 'transparent'
                  }}
                >
                  {extracting ? (
                    <>
                      <Loader2 size={28} color="var(--primary-soft)" style={{ animation: 'spin 1s linear infinite' }} />
                      <p style={{ margin: '10px 0 4px', fontWeight: 600 }}>
                        Reading your PDF…
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: 0 }}>
                        {extractProgress?.total
                          ? `Extracting text — page ${extractProgress.page} of ${extractProgress.total}`
                          : 'Parsing document…'}
                      </p>
                    </>
                  ) : file ? (
                    <>
                      <Check size={28} color="var(--success)" />
                      <p style={{ margin: '10px 0 4px', fontWeight: 600 }}>{fileName}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: 0 }}>
                        Click or drop to replace
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload size={28} color="var(--primary-soft)" />
                      <p style={{ margin: '10px 0 4px', fontWeight: 600 }}>Drop your PDF here</p>
                      <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: 0 }}>
                        or click to browse · PDF · up to {MAX_FILE_MB} MB
                      </p>
                    </>
                  )}
                </div>
                {file && (
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    style={{ marginTop: 12 }}
                    onClick={() => { setFile(null); setFileName(''); }}
                  >
                    <X size={14} /> Remove file
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 26 }}
              disabled={processing || (tab === 'topic' && !topic.trim()) || (tab === 'paste' && !notes.trim()) || (tab === 'pdf' && !file)}
            >
              {processing ? (
                <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> Generating…</>
              ) : (
                <><Sparkles size={17} /> Generate Knowledge Map</>
              )}
            </button>
          </motion.form>

          {processing && (
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: 22, padding: 26 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 14,
                  background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
                  display: 'grid', placeItems: 'center',
                  animation: 'pulseGlow 1.6s ease-in-out infinite'
                }}>
                  <BrainCircuit size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{phases[phase]}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 3 }}>
                    Analysing structure and relationships…
                  </div>
                </div>
              </div>
              <div style={{ height: 6, borderRadius: 4, background: 'var(--surface-strong)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 4,
                  background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                  transition: 'width 0.9s ease',
                  width: `${((phase + 1) / phases.length) * 100}%`
                }} />
              </div>
            </motion.div>
          )}

          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <button className="btn btn-accent btn-lg" onClick={tryDemo} disabled={processing}>
              <PlayCircle size={18} /> Try the Electrostatics Demo
            </button>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 12 }}>
              No API key, no sign-up — the demo runs entirely in your browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}