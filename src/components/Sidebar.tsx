import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  FileText,
  List,
  Users,
  UserCircle,
  ClipboardCheck,
  Activity,
  Dumbbell,
  BookOpen,
  Flag,
} from 'lucide-react';

const menuItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/abstract', label: 'Abstract', icon: FileText },
  { path: '/table-of-contents', label: 'Table of Contents', icon: List },
  { path: '/members', label: 'Members', icon: Users },
  { path: '/student-profile', label: 'Student Profile', icon: UserCircle },
  { path: '/parq', label: 'PAR-Q', icon: ClipboardCheck },
  { path: '/activities', label: 'Activities', icon: Activity },
  { path: '/individual-works', label: '4-Week Training', icon: Dumbbell },
  { path: '/reflections', label: 'Reflections', icon: BookOpen },
  { path: '/closing', label: 'Closing', icon: Flag },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-full w-[220px] bg-gradient-to-b from-[#2C0654] via-[#3D0A6E] to-[#2C0654] z-50 shadow-2xl flex flex-col overflow-y-auto">
      {/* Decorative top flowers */}
      <div className="relative pt-6 pb-4 px-4">
        {/* Animated floating flowers around wreath */}
        <motion.img
          src="/images/flower-small.png"
          alt=""
          className="absolute top-2 left-4 w-8 h-8 object-contain opacity-60"
          animate={{ y: [0, -8, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.img
          src="/images/flower-small.png"
          alt=""
          className="absolute top-4 right-4 w-6 h-6 object-contain opacity-50"
          animate={{ y: [0, -6, 0], rotate: [0, -10, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-center mb-4"
        >
          <motion.img
            src="/images/flower-wreath.png"
            alt=""
            className="w-24 h-24 object-contain opacity-80"
            animate={{ rotate: [0, 3, -3, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-white font-bold text-lg leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
            PATHFIT 2
          </h2>
          <p className="text-purple-300 text-xs mt-1">Compendium</p>
        </motion.div>
      </div>

      {/* Divider with flower */}
      <div className="mx-4 flex items-center gap-2">
        <div className="flex-1 border-t border-purple-500/30" />
        <motion.img
          src="/images/flower-small.png"
          alt=""
          className="w-4 h-4 object-contain opacity-50"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <div className="flex-1 border-t border-purple-500/30" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 relative">
        {/* Floating background flowers */}
        <motion.img
          src="/images/flower-corner.png"
          alt=""
          className="absolute bottom-10 left-0 w-16 h-16 object-contain opacity-10 pointer-events-none"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        />

        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index, duration: 0.4 }}
            >
              <NavLink
                to={item.path}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-yellow-400 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer decoration */}
      <div className="p-4 relative">
        <motion.img
          src="/images/flower-small.png"
          alt=""
          className="absolute -top-4 left-1/2 -translate-x-1/2 w-6 h-6 object-contain opacity-40"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <div className="text-center">
          <motion.img
            src="/images/flower-bouquet.png"
            alt=""
            className="w-16 h-16 mx-auto object-contain opacity-60"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 7, repeat: Infinity }}
          />
          <p className="text-purple-400 text-xs mt-2">Group 2</p>
          <p className="text-purple-500 text-[10px]">AY 2025-2026</p>
        </div>

        {/* Bottom corner flower */}
        <motion.img
          src="/images/flower-corner.png"
          alt=""
          className="absolute -bottom-2 -left-2 w-12 h-12 object-contain opacity-20 rotate-90"
          animate={{ rotate: [90, 95, 85, 90] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>
    </aside>
  );
}
