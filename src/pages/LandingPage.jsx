import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain, Network, Zap, GraduationCap, Target, BarChart3, ArrowRight,
  Sparkles, BookOpen, FileUp, PlayCircle, ChevronDown
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { buildDemoMap } from '../data/demoData';
import { MiniMapPreview } from '../features/knowledge-map/KnowledgeGraph';

const features = [
  { icon: Network, title: 'Visual Knowledge Maps', desc: 'Upload or paste material and watch it become an interactive, zoomable knowledge graph of connected concepts.' },
  { icon: Zap, title: 'AI Concept Tutor', desc: 'Every concept gets a plain-English explanation, real-world example, key points, and formulas at your level.' },
  { icon: Target, title: 'Adaptive Quizzes', desc: 'Auto-generated quizzes adapt to your knowledge and pinpoint exactly which concepts need review.' },
  { icon: BarChart3, title: 'Progress Tracking', desc: 'Watch concepts move from Unknown to Mastered as you learn, with streaks and per-subject insight.' },
  { icon: Brain, title: 'Spaced Review', desc: 'Weak areas are flagged automatically and turned into a focused review plan so nothing slips through.' },
  { icon: GraduationCap, title: 'Study Plan Generator', desc: 'Turn your weak concepts into a concrete, timed study session — no more deciding what to study next.' }
];

const steps = [
  { icon: FileUp, title: 'Upload your material', desc: 'Drop in a PDF, paste notes, or just type a topic. No account, no setup.' },
  { icon: Sparkles, title: 'AI builds the map', desc: 'Key concepts are extracted and wired into a hierarchical knowledge graph in seconds.' },
  { icon: Network, title: 'Explore & learn', desc: 'Pan, zoom, and click any node for a full tutor explanation of that concept.' },
  { icon: Target, title: 'Quiz & improve', desc: 'Take adaptive quizzes. Weak concepts are detected and folded into a review plan.' }
];

export default function LandingPage() {
  const [demoMap, setDemoMap] = useState(null);

  useEffect(() => {
    setDemoMap(buildDemoMap());
  }, []);

  return (
    <div className="landing">
      <div className="bg-scene">
        <div className="bg-blob blob-1" />
        <div className="bg-blob blob-2" />
        <div className="bg-blob blob-3" />
      </div>
      <Navbar />

      {/* Hero */}
      <section className="hero">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <span className="badge" style={{ marginBottom: 22 }}>
            <Sparkles size={13} /> AI-powered knowledge mapping
          </span>
          <h1>Turn information into <span className="gradient-text">connections.</span></h1>
          <p className="subtitle">
            Upload your study material and MemoryMap transforms it into an interactive
            knowledge map — then tutors you, quizzes you, and tracks your mastery to
            make learning stick.
          </p>
          <div className="cta-row">
            <Link to="/create" className="btn btn-primary btn-lg">
              <Sparkles size={17} /> Create Your Map
            </Link>
            <Link to="/map/demo-electrostatics" className="btn btn-accent btn-lg">
              <PlayCircle size={17} /> Try Live Demo
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Live preview */}
      <section style={{ padding: '20px 24px 60px' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {demoMap ? (
            <MiniMapPreview map={demoMap} />
          ) : (
            <div className="card" style={{ height: 460, display: 'grid', placeItems: 'center' }}>
              <span className="skeleton" style={{ width: 300, height: 40 }} />
            </div>
          )}
        </motion.div>
      </section>

      {/* Features */}
      <section className="container" style={{ padding: '40px 24px' }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="section-title">Everything you need to <span className="gradient-text">learn deeply</span></h2>
          <p className="section-sub">From first upload to mastery — one connected learning experience.</p>
        </motion.div>
        <div className="feature-grid">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
            >
              <div className="icon"><f.icon size={20} /></div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="how-section container">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="section-title">How it works</h2>
          <p className="section-sub">A learning loop designed to move you from unknown to mastered.</p>
        </motion.div>
        <div className="feature-grid">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              className="step-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <div className="step-num">{i + 1}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="container" style={{ padding: '40px 24px 80px' }}>
        <motion.div
          className="card"
          style={{ padding: '56px 32px', textAlign: 'center', background: 'linear-gradient(145deg, rgba(99,102,241,0.15), rgba(34,211,238,0.08))' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title" style={{ marginBottom: 14 }}>
            Your next topic is one upload away
          </h2>
          <p className="section-sub" style={{ marginBottom: 28 }}>
            See it work instantly with the built-in Electrostatics demo — no sign-up, no API key.
          </p>
          <div className="cta-row">
            <Link to="/create" className="btn btn-primary btn-lg">
              <BookOpen size={17} /> Get Started
            </Link>
            <Link to="/map/demo-electrostatics" className="btn btn-lg" style={{ background: 'var(--surface-strong)' }}>
              <PlayCircle size={17} /> Open the Demo Map
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
          <span className="logo-mark" style={{ width: 26, height: 26 }}><Brain size={15} /></span>
          <strong>MemoryMap</strong>
        </div>
        Turn information into connections. Built for students who want to truly understand.
      </footer>
    </div>
  );
}