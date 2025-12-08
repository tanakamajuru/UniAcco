import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function AnimatedBackground({ variant = 'default', children }) {
  const { scrollYProgress } = useScroll();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Transform scroll into various animated properties
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.2, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.6, 0.3]);

  if (!mounted) return <div className="relative">{children}</div>;

  const renderBackground = () => {
    switch (variant) {
      case 'gradient':
        return (
          <>
            {/* Animated gradient orbs */}
            <motion.div
              style={{ y: y1, scale, opacity }}
              className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-600/30 dark:from-blue-600/20 dark:to-purple-800/20 rounded-full blur-3xl"
            />
            <motion.div
              style={{ y: y2, scale }}
              className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-400/30 to-blue-600/30 dark:from-cyan-600/20 dark:to-blue-800/20 rounded-full blur-3xl"
            />
            <motion.div
              style={{ rotate, opacity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-300/20 to-indigo-600/20 dark:from-blue-700/10 dark:to-indigo-900/10 rounded-full blur-3xl"
            />
          </>
        );

      case 'particles':
        return (
          <>
            {/* Floating particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                }}
                animate={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute w-2 h-2 bg-blue-500/40 dark:bg-blue-400/30 rounded-full"
              />
            ))}
            {/* Gradient overlay */}
            <motion.div
              style={{ opacity }}
              className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/30 dark:to-purple-950/30"
            />
          </>
        );

      case 'waves':
        return (
          <>
            {/* Animated wave layers */}
            <motion.div
              style={{ y: y1 }}
              className="absolute inset-0 opacity-30 dark:opacity-20"
            >
              <svg className="w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="none">
                <motion.path
                  animate={{
                    d: [
                      'M0,400 C320,300 420,500 740,400 C1060,300 1160,500 1440,400 L1440,800 L0,800 Z',
                      'M0,400 C320,500 420,300 740,400 C1060,500 1160,300 1440,400 L1440,800 L0,800 Z',
                      'M0,400 C320,300 420,500 740,400 C1060,300 1160,500 1440,400 L1440,800 L0,800 Z',
                    ],
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  fill="url(#wave-gradient-1)"
                />
                <defs>
                  <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="rgb(147, 51, 234)" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
            <motion.div
              style={{ y: y2 }}
              className="absolute inset-0 opacity-20 dark:opacity-15"
            >
              <svg className="w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="none">
                <motion.path
                  animate={{
                    d: [
                      'M0,500 C360,400 540,600 900,500 C1260,400 1440,600 1440,500 L1440,800 L0,800 Z',
                      'M0,500 C360,600 540,400 900,500 C1260,600 1440,400 1440,500 L1440,800 L0,800 Z',
                      'M0,500 C360,400 540,600 900,500 C1260,400 1440,600 1440,500 L1440,800 L0,800 Z',
                    ],
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                  fill="url(#wave-gradient-2)"
                />
                <defs>
                  <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgb(6, 182, 212)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
          </>
        );

      case 'morphing':
        return (
          <>
            {/* Morphing gradient blobs */}
            <motion.div
              animate={{
                background: [
                  'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.4) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 50%, rgba(147, 51, 234, 0.4) 0%, transparent 50%)',
                  'radial-gradient(circle at 50% 80%, rgba(6, 182, 212, 0.4) 0%, transparent 50%)',
                  'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.4) 0%, transparent 50%)',
                ],
                scale: [1, 1.2, 1.1, 1],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
              style={{ y: y1 }}
              className="absolute top-0 left-0 w-full h-full dark:opacity-60"
            />
            <motion.div
              animate={{
                background: [
                  'radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 50% 20%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
                ],
                scale: [1, 1.1, 1.2, 1],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              style={{ y: y2 }}
              className="absolute top-0 left-0 w-full h-full dark:opacity-50"
            />
            <motion.div
              animate={{
                background: [
                  'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.25) 0%, transparent 50%)',
                  'radial-gradient(circle at 30% 70%, rgba(245, 158, 11, 0.25) 0%, transparent 50%)',
                  'radial-gradient(circle at 70% 30%, rgba(139, 92, 246, 0.25) 0%, transparent 50%)',
                  'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.25) 0%, transparent 50%)',
                ],
                rotate: [0, 180, 360],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              style={{ scale }}
              className="absolute top-0 left-0 w-full h-full dark:opacity-40"
            />
            {/* Animated mesh gradient overlay */}
            <motion.div
              animate={{
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10 dark:from-blue-600/5 dark:via-purple-600/5 dark:to-pink-600/5"
            />
          </>
        );

      case 'geometric':
        return (
          <>
            {/* Animated geometric shapes */}
            <motion.div
              style={{ rotate, y: y1 }}
              className="absolute top-20 left-20 w-64 h-64 border-4 border-blue-400/30 dark:border-blue-600/20 rounded-3xl"
            />
            <motion.div
              style={{ rotate: useTransform(scrollYProgress, [0, 1], [360, 0]), y: y2 }}
              className="absolute bottom-20 right-20 w-80 h-80 border-4 border-purple-400/30 dark:border-purple-600/20 rounded-full"
            />
            <motion.div
              style={{ scale, opacity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-600/10 dark:from-blue-600/5 dark:to-purple-800/5 rounded-2xl rotate-45"
            />
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:50px_50px] dark:bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)]" />
          </>
        );

      default:
        return (
          <>
            {/* Default animated gradient background */}
            <motion.div
              style={{ y: y1, opacity }}
              className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/50 via-purple-100/50 to-cyan-100/50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-cyan-950/30"
            />
            <motion.div
              style={{ y: y2, scale }}
              className="absolute top-1/4 right-0 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl"
            />
            <motion.div
              style={{ rotate }}
              className="absolute bottom-1/4 left-0 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl"
            />
          </>
        );
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Animated background layer */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        {renderBackground()}
      </div>
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
