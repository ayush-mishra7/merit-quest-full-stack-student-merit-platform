/*
 * LandingPage – Premium 3D landing page with FluidGlass hero and scroll animations.
 * Uses framer-motion for scroll-triggered animations and Three.js for the 3D glass effect.
 */
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  GraduationCap,
  Shield,
  BarChart3,
  Award,
  Users,
  Brain,
  ChevronRight,
  Star,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Zap,
  Globe,
  Lock,
  TrendingUp,
  FileCheck,
} from 'lucide-react';
import BlurText from '../components/ui/BlurText';
import GradientText from '../components/ui/GradientText';
import CountUp from '../components/ui/CountUp';
import GlowButton from '../components/ui/GlowButton';
import Particles from '../components/ui/Particles';
import GooeyNav from '../components/ui/GooeyNav';
import LiquidEther from '../components/ui/LiquidEther';

/* ─── Section wrapper with scroll-triggered reveal ─── */
function RevealSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ─── Floating 3D-like card with parallax ─── */
function FloatingCard({ children, className = '', index = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 80, rotateX: 15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{
        duration: 0.7,
        delay: index * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={className}
      style={{ perspective: 1000 }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Hero Section with LiquidEther ─── */
function HeroSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

  return (
    <motion.div
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden"
      style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
    >
      {/* LiquidEther Background */}
      <div className="absolute inset-0 z-0">
        <LiquidEther
          colors={['#4f46e5', '#7c3aed', '#a855f7', '#6366f1']}
          autoDemo={true}
          autoSpeed={0.6}
          autoIntensity={2.5}
          mouseForce={25}
          cursorSize={120}
          resolution={0.5}
        />
      </div>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-[#020617]/40" />
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-[#020617]" />

      {/* Hero content overlay */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-center pointer-events-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-white/70">AI-Powered Student Merit Tracking</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-4 tracking-tight">
            Merit <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300 bg-clip-text text-transparent">Quest</span>
          </h1>
          <p className="text-lg md:text-xl text-white/50 max-w-xl mx-auto mb-8">
            The next-generation platform for tracking, verifying, and celebrating student achievements
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register">
              <GlowButton variant="primary" size="lg" icon={ArrowRight}>
                Get Started Free
              </GlowButton>
            </Link>
            <Link to="/login">
              <GlowButton variant="ghost" size="lg">
                Sign In
              </GlowButton>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-indigo-400"
            animate={{ opacity: [1, 0], y: [0, 16] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Trusted-by logos strip ─── */
const TRUST_ITEMS = [
  'Government of India',
  'CBSE Board',
  'UGC',
  'AICTE',
  'National Scholarship Portal',
];

function TrustStrip() {
  return (
    <RevealSection className="py-16 border-y border-white/5">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-white/30 mb-8">
          Trusted by institutions across India
        </p>
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
          {TRUST_ITEMS.map((item) => (
            <span
              key={item}
              className="text-white/20 text-lg font-display font-semibold tracking-wide hover:text-white/40 transition-colors"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}

/* ─── Features Section ─── */
const FEATURES = [
  {
    icon: GraduationCap,
    title: 'Academic Tracking',
    description: 'Comprehensive tracking of grades, rank, CGPA across semesters with intelligent analytics.',
    color: 'from-indigo-500 to-purple-500',
    glow: 'rgba(99, 102, 241, 0.15)',
  },
  {
    icon: Shield,
    title: 'Verified Credentials',
    description: 'Blockchain-grade verification of certificates, achievements, and academic records.',
    color: 'from-emerald-500 to-teal-500',
    glow: 'rgba(16, 185, 129, 0.15)',
  },
  {
    icon: Brain,
    title: 'AI-Powered Insights',
    description: 'Machine learning models detect anomalies, predict performance, and flag discrepancies.',
    color: 'from-amber-500 to-orange-500',
    glow: 'rgba(245, 158, 11, 0.15)',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Real-time dashboards with institutional, regional, and national benchmark comparisons.',
    color: 'from-sky-500 to-blue-500',
    glow: 'rgba(14, 165, 233, 0.15)',
  },
  {
    icon: Award,
    title: 'Scholarship Matching',
    description: 'Auto-match students with eligible scholarships from NGOs, government, and private bodies.',
    color: 'from-rose-500 to-pink-500',
    glow: 'rgba(244, 63, 94, 0.15)',
  },
  {
    icon: Users,
    title: 'Multi-Role Access',
    description: 'Students, parents, schools, verifiers, NGOs, and government — all on one platform.',
    color: 'from-violet-500 to-indigo-500',
    glow: 'rgba(139, 92, 246, 0.15)',
  },
];

function FeaturesSection() {
  return (
    <RevealSection className="py-28 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs uppercase tracking-wider text-indigo-300">Features</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Everything You Need to{' '}
            <GradientText
              colors={['#818cf8', '#6366f1', '#a78bfa', '#818cf8']}
              animationSpeed={6}
              className="inline"
            >
              Excel
            </GradientText>
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            A unified platform where academic merit is tracked, verified, and rewarded transparently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <FloatingCard
              key={feature.title}
              index={i}
              className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 hover:border-white/[0.12] transition-all duration-500"
            >
              {/* Glow effect on hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ boxShadow: `inset 0 0 60px ${feature.glow}` }}
              />
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-display font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-white/40 leading-relaxed">{feature.description}</p>
            </FloatingCard>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}

/* ─── Stats Section with animated counters ─── */
const STATS = [
  { value: 10849, label: 'Student Records', suffix: '+' },
  { value: 500, label: 'Institutions', suffix: '+' },
  { value: 99.9, label: 'Uptime', suffix: '%', decimals: 1 },
  { value: 1200, label: 'Scholarships Matched', suffix: '+' },
];

function StatsSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);

  return (
    <section ref={ref} className="relative py-28 overflow-hidden">
      {/* Parallax background */}
      <motion.div
        className="absolute inset-0 -z-10"
        style={{ y: bgY }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-[#020617] to-purple-950/30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px]" />
      </motion.div>

      <div className="max-w-6xl mx-auto px-6">
        <RevealSection>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
                  <CountUp
                    to={stat.value}
                    duration={2}
                    suffix={stat.suffix || ''}
                    decimals={stat.decimals || 0}
                    className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400"
                  />
                </div>
                <p className="text-white/40 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </RevealSection>
      </div>
    </section>
  );
}

/* ─── How It Works ─── */
const STEPS = [
  {
    icon: Users,
    title: 'Register & Onboard',
    description: 'Schools and students register on the platform. Institutions verify student identities.',
  },
  {
    icon: FileCheck,
    title: 'Upload & Verify',
    description: 'Academic records, certificates, and achievements are uploaded and verified by authorized verifiers.',
  },
  {
    icon: TrendingUp,
    title: 'Track & Analyze',
    description: 'AI analyzes performance data, generates merit lists, and identifies scholarship opportunities.',
  },
  {
    icon: Award,
    title: 'Reward & Excel',
    description: 'Students are matched with scholarships, recognized for merit, and empowered to excel.',
  },
];

function HowItWorksSection() {
  return (
    <RevealSection className="py-28 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs uppercase tracking-wider text-amber-300">How It Works</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Simple.{' '}
            <GradientText
              colors={['#fbbf24', '#f59e0b', '#d97706', '#fbbf24']}
              animationSpeed={6}
              className="inline"
            >
              Powerful.
            </GradientText>
            {' '}Transparent.
          </h2>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-24 left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step, i) => (
              <FloatingCard key={step.title} index={i} className="text-center relative">
                {/* Step number */}
                <div className="relative inline-flex mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-amber-400" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[10px] font-bold text-white flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-display font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{step.description}</p>
              </FloatingCard>
            ))}
          </div>
        </div>
      </div>
    </RevealSection>
  );
}

/* ─── Technology Cards ─── */
const TECH_HIGHLIGHTS = [
  {
    icon: Lock,
    title: 'Enterprise Security',
    items: ['Role-based access control', 'JWT + secure sessions', 'Full audit logging', 'Data encryption at rest'],
  },
  {
    icon: Brain,
    title: 'Machine Learning',
    items: ['Anomaly detection', 'Grade prediction models', 'Smart scholarship matching', 'Automated risk scoring'],
  },
  {
    icon: Zap,
    title: 'Modern Stack',
    items: ['Spring Boot 3.2 backend', 'React 18 + Vite frontend', 'PostgreSQL + Redis', 'Docker containerized'],
  },
];

function TechSection() {
  return (
    <RevealSection className="py-28 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Built with{' '}
            <GradientText
              colors={['#10b981', '#14b8a6', '#06b6d4', '#10b981']}
              animationSpeed={6}
              className="inline"
            >
              Cutting-Edge
            </GradientText>
            {' '}Technology
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            Enterprise-grade architecture designed for scale, security, and performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TECH_HIGHLIGHTS.map((tech, i) => (
            <FloatingCard
              key={tech.title}
              index={i}
              className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 hover:border-white/[0.12] transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-6">
                <tech.icon className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-display font-semibold text-white mb-4">{tech.title}</h3>
              <ul className="space-y-3">
                {tech.items.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-white/40 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400/60 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </FloatingCard>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}

/* ─── Testimonials ─── */
const TESTIMONIALS = [
  {
    name: 'Dr. Priya Sharma',
    role: 'Principal, Delhi Public School',
    quote: 'Merit Quest has transformed how we manage student records and scholarship applications. The verification system is unmatched.',
    rating: 5,
  },
  {
    name: 'Rahul Verma',
    role: 'Student, IIT Delhi',
    quote: 'I discovered 3 scholarships I was eligible for through the auto-matching feature. The AI insights helped me improve my weak areas.',
    rating: 5,
  },
  {
    name: 'Anita Desai',
    role: 'NGO Director, Education First',
    quote: 'Finally a platform where we can verify student credentials before disbursing scholarships. Transparent and reliable.',
    rating: 5,
  },
];

function TestimonialsSection() {
  return (
    <RevealSection className="py-28 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4"
          >
            <Star className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs uppercase tracking-wider text-purple-300">Testimonials</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white">
            Loved by{' '}
            <GradientText
              colors={['#c084fc', '#a855f7', '#7c3aed', '#c084fc']}
              animationSpeed={6}
              className="inline"
            >
              Thousands
            </GradientText>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <FloatingCard
              key={t.name}
              index={i}
              className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 hover:border-white/[0.12] transition-all duration-500"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-white/60 italic leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
              <div>
                <p className="text-white font-semibold">{t.name}</p>
                <p className="text-white/30 text-sm">{t.role}</p>
              </div>
            </FloatingCard>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}

/* ─── CTA Section ─── */
function CTASection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <section ref={ref} className="py-28 px-6 relative">
      <motion.div
        style={{ scale, opacity }}
        className="max-w-4xl mx-auto relative rounded-3xl border border-white/[0.08] overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-[#0f172a] to-purple-950/60" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px]" />

        <div className="relative z-10 py-20 px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Ready to Transform{' '}
              <GradientText
                colors={['#818cf8', '#a78bfa', '#c084fc', '#818cf8']}
                animationSpeed={6}
                className="inline"
              >
                Student Merit?
              </GradientText>
            </h2>
            <p className="text-lg text-white/40 max-w-xl mx-auto mb-10">
              Join hundreds of institutions already using Merit Quest to track, verify, and
              reward academic excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <GlowButton variant="primary" size="lg" icon={ArrowRight}>
                  Create Free Account
                </GlowButton>
              </Link>
              <Link to="/login">
                <GlowButton variant="ghost" size="lg" icon={ChevronRight}>
                  Explore Dashboard
                </GlowButton>
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="border-t border-white/[0.05] py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-white text-lg">Merit Quest</span>
        </div>
        <div className="flex gap-8 text-sm text-white/30">
          <Link to="/login" className="hover:text-white/60 transition-colors">Login</Link>
          <Link to="/register" className="hover:text-white/60 transition-colors">Register</Link>
          <a href="https://github.com/ayush-mishra7/merit-quest-full-stack-student-merit-platform" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">GitHub</a>
        </div>
        <p className="text-xs text-white/20">&copy; {new Date().getFullYear()} Merit Quest. All rights reserved.</p>
      </div>
    </footer>
  );
}

/* ─── Main Landing Page ─── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden relative">
      <Particles count={25} />

      {/* Fixed navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#020617]/70 border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-glow-sm">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-white text-xl">Merit Quest</span>
          </Link>
          <div className="hidden md:flex items-center">
            <GooeyNav
              items={[
                { label: 'Features', href: '#features' },
                { label: 'How It Works', href: '#how-it-works' },
                { label: 'Stats', href: '#stats' },
                { label: 'Tech', href: '#tech' },
                { label: 'Testimonials', href: '#testimonials' },
              ]}
              animationTime={600}
              particleCount={15}
              particleDistances={[90, 10]}
              particleR={100}
              timeVariance={300}
              colors={[1, 2, 3, 1, 2, 3, 1, 4]}
              initialActiveIndex={0}
            />
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <GlowButton variant="ghost" size="sm">Sign In</GlowButton>
            </Link>
            <Link to="/register">
              <GlowButton variant="primary" size="sm">Get Started</GlowButton>
            </Link>
          </div>
        </div>
      </nav>

      {/* Page sections */}
      <HeroSection />
      <TrustStrip />
      <div id="features">
        <FeaturesSection />
      </div>
      <div id="stats">
        <StatsSection />
      </div>
      <div id="how-it-works">
        <HowItWorksSection />
      </div>
      <div id="tech">
        <TechSection />
      </div>
      <div id="testimonials">
        <TestimonialsSection />
      </div>
      <CTASection />
      <Footer />
    </div>
  );
}
