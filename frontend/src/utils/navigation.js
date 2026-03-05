import {
  LayoutDashboard, Users, ClipboardCheck, Award, BookOpen,
  BarChart3, Shield, Bell, Settings, GraduationCap, Upload,
} from 'lucide-react';

// Sidebar navigation items per role
const NAV_ITEMS = {
  STUDENT: [
    { label: 'Dashboard',    path: '/dashboard',    icon: LayoutDashboard },
    { label: 'My Performance', path: '/performance', icon: BarChart3 },
    { label: 'Merit Score',  path: '/merit',        icon: Award },
    { label: 'Scholarships', path: '/scholarships', icon: BookOpen },
    { label: 'Alerts',       path: '/alerts',       icon: Bell },
  ],
  PARENT: [
    { label: 'Dashboard',    path: '/dashboard',     icon: LayoutDashboard },
    { label: 'Child Performance', path: '/performance', icon: BarChart3 },
    { label: 'Merit Score',  path: '/merit',         icon: Award },
    { label: 'Scholarships', path: '/scholarships',  icon: BookOpen },
  ],
  SCHOOL_ADMIN: [
    { label: 'Dashboard',      path: '/dashboard',      icon: LayoutDashboard },
    { label: 'Students',       path: '/students',       icon: Users },
    { label: 'Bulk Upload',    path: '/upload',         icon: Upload },
    { label: 'Merit Lists',    path: '/merit',          icon: Award },
    { label: 'Analytics',      path: '/analytics',      icon: BarChart3 },
    { label: 'Certificates',   path: '/certificates',   icon: GraduationCap },
  ],
  DATA_VERIFIER: [
    { label: 'Dashboard',        path: '/dashboard',      icon: LayoutDashboard },
    { label: 'Verification Queue', path: '/verification', icon: ClipboardCheck },
    { label: 'Merit Lists',      path: '/merit',          icon: Award },
    { label: 'Audit Log',        path: '/audit-log',      icon: Shield },
  ],
  NGO_REP: [
    { label: 'Dashboard',     path: '/dashboard',      icon: LayoutDashboard },
    { label: 'Scholarships',  path: '/scholarships',   icon: BookOpen },
    { label: 'Applicants',    path: '/applicants',     icon: Users },
    { label: 'Analytics',     path: '/analytics',      icon: BarChart3 },
    { label: 'Merit Lists',   path: '/merit',          icon: Award },
  ],
  GOV_AUTHORITY: [
    { label: 'Dashboard',      path: '/dashboard',      icon: LayoutDashboard },
    { label: 'Regional Analytics', path: '/analytics',  icon: BarChart3 },
    { label: 'Merit Rankings', path: '/merit',          icon: Award },
    { label: 'Scholarships',  path: '/scholarships',   icon: BookOpen },
    { label: 'Audit Logs',    path: '/audit-log',      icon: Shield },
  ],
  SYSTEM_ADMIN: [
    { label: 'Dashboard',     path: '/dashboard',       icon: LayoutDashboard },
    { label: 'Users',         path: '/admin/users',     icon: Users },
    { label: 'Institutions',  path: '/admin/institutions', icon: Shield },
    { label: 'Analytics',     path: '/analytics',       icon: BarChart3 },
    { label: 'Merit Lists',   path: '/merit',           icon: Award },
    { label: 'Audit Logs',    path: '/audit-log',       icon: ClipboardCheck },
    { label: 'ML Models',     path: '/admin/ml-models', icon: Settings },
  ],
};

export function getNavItems(role) {
  return NAV_ITEMS[role] || NAV_ITEMS.STUDENT;
}
