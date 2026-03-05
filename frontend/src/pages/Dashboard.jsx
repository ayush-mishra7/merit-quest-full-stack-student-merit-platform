import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import {
  BarChart3, Users, ClipboardCheck, Award, GraduationCap, Shield, BookOpen,
} from 'lucide-react';

const ROLE_CONFIG = {
  STUDENT: {
    title: 'Student Dashboard',
    subtitle: 'Track your academic performance and discover scholarships',
    icon: GraduationCap,
    color: 'primary',
    cards: [
      { title: 'My Performance',  desc: 'View grades, ranking, and trends',     icon: BarChart3 },
      { title: 'Merit Score',     desc: 'Your composite merit ranking',          icon: Award },
      { title: 'Scholarships',    desc: 'Discover and apply for scholarships',   icon: BookOpen },
    ],
  },
  PARENT: {
    title: 'Parent Dashboard',
    subtitle: "Monitor your child's academic journey",
    icon: Users,
    color: 'primary',
    cards: [
      { title: 'Child Performance', desc: 'Track academic progress',      icon: BarChart3 },
      { title: 'Merit Ranking',     desc: 'See ranking across schools',    icon: Award },
      { title: 'Scholarships',      desc: 'Scholarship opportunities',     icon: BookOpen },
    ],
  },
  SCHOOL_ADMIN: {
    title: 'School Administrator',
    subtitle: 'Manage student records and institutional data',
    icon: Shield,
    color: 'accent',
    cards: [
      { title: 'Student Records',  desc: 'Manage and upload student data',     icon: Users },
      { title: 'Bulk Uploads',     desc: 'CSV / Excel batch import',            icon: ClipboardCheck },
      { title: 'School Analytics', desc: 'Performance overview & trends',       icon: BarChart3 },
      { title: 'Merit Lists',     desc: 'View school-level rankings',           icon: Award },
    ],
  },
  DATA_VERIFIER: {
    title: 'Data Verifier',
    subtitle: 'Review and approve submitted student records',
    icon: ClipboardCheck,
    color: 'amber',
    cards: [
      { title: 'Verification Queue', desc: 'Pending records to review',      icon: ClipboardCheck },
      { title: 'Approved Records',   desc: 'Previously verified records',    icon: Award },
      { title: 'Audit Log',          desc: 'Activity history',               icon: BarChart3 },
    ],
  },
  NGO_REP: {
    title: 'NGO Dashboard',
    subtitle: 'Post scholarships and track student outreach impact',
    icon: BookOpen,
    color: 'green',
    cards: [
      { title: 'Post Scholarship',  desc: 'Create new scholarship offers',     icon: BookOpen },
      { title: 'Applicants',        desc: 'Review student applications',        icon: Users },
      { title: 'Impact Analytics',  desc: 'Track reach and outcomes',           icon: BarChart3 },
    ],
  },
  GOV_AUTHORITY: {
    title: 'Government Dashboard',
    subtitle: 'Regional analytics, merit insights, and policy tools',
    icon: Shield,
    color: 'indigo',
    cards: [
      { title: 'Regional Analytics', desc: 'District and state performance',   icon: BarChart3 },
      { title: 'Merit Rankings',     desc: 'Cross-school merit comparisons',   icon: Award },
      { title: 'Scholarships',       desc: 'Manage government scholarships',   icon: BookOpen },
      { title: 'Audit Logs',         desc: 'System activity audit trail',      icon: ClipboardCheck },
    ],
  },
  SYSTEM_ADMIN: {
    title: 'System Administration',
    subtitle: 'Full platform management and monitoring',
    icon: Shield,
    color: 'red',
    cards: [
      { title: 'User Management',   desc: 'Manage all users and roles',       icon: Users },
      { title: 'Institutions',      desc: 'Manage schools and colleges',      icon: Shield },
      { title: 'System Analytics',  desc: 'Platform-wide stats',              icon: BarChart3 },
      { title: 'Audit Logs',        desc: 'Complete audit trail',             icon: ClipboardCheck },
      { title: 'ML Models',         desc: 'Manage prediction models',         icon: Award },
    ],
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' },
  }),
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const config = ROLE_CONFIG[user?.role] || ROLE_CONFIG.STUDENT;
  const Icon = config.icon;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary-100 text-primary-600">
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
          <p className="text-gray-500">{config.subtitle}</p>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {config.cards.map((card, i) => {
          const CardIcon = card.icon;
          return (
            <motion.div
              key={card.title}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              className="card cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-primary-50 text-primary-600">
                  <CardIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{card.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{card.desc}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="card bg-gradient-to-r from-primary-600 to-accent-600 text-white"
      >
        <h2 className="text-xl font-bold">
          Welcome, {user?.firstName} {user?.lastName}!
        </h2>
        <p className="mt-2 text-primary-100">
          You are signed in as <strong>{user?.role?.replace('_', ' ')}</strong>.
          Use the sidebar to navigate through available features.
        </p>
      </motion.div>
    </div>
  );
}
