'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';
import { CheckCircle2, ArrowRight, Zap, Target, Trophy } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-cyan-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-xl font-bold tracking-tight text-transparent">
              BananaLearning
            </span>
          </div>
          <div className="hidden items-center gap-8 text-sm font-medium text-white/70 md:flex">
            <a href="#features" className="transition-colors hover:text-white">
              Features
            </a>
            <a href="#demo" className="transition-colors hover:text-white">
              Showcase
            </a>
            <a href="#pricing" className="transition-colors hover:text-white">
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth"
              className="text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              Sign In
            </Link>
            <Link href="/auth?mode=signup">
              <Button className="rounded-full bg-white px-6 text-black hover:bg-white/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={targetRef}
        className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-blue-900/20 via-black to-black" />

        {/* Animated Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-size-[24px_24px]" />

        <div className="relative z-10 container grid gap-16 px-6 md:grid-cols-2 md:items-center">
          <motion.div style={{ opacity, y }} className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-cyan-400 backdrop-blur-md"
            >
              <Zap className="mr-2 h-4 w-4 fill-cyan-400" />
              <span>v2.0 is now live</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl leading-tight font-bold tracking-tight md:text-7xl"
            >
              Master English with <br />
              <span className="bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Nano Precision
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg leading-relaxed text-white/60 md:text-xl"
            >
              The smartest way to learn vocabulary. Powered by AI, designed for humans, and
              visualized with stunning 3D analytics.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link href="/auth?mode=signup">
                <Button
                  size="lg"
                  className="h-12 rounded-full bg-cyan-500 px-8 text-base font-semibold text-black hover:bg-cyan-400"
                >
                  Start Learning Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-white/20 text-white hover:bg-white/10"
              >
                View Showcase
              </Button>
            </motion.div>
          </motion.div>

          {/* Hero 3D Element Placeholder */}
          <motion.div style={{ scale }} className="relative h-100 w-full md:h-150">
            {/* This is where the NANO BANANA goes */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-full w-full">
                {/* Placeholder for 3D Banana */}
                <div className="absolute inset-0 animate-pulse rounded-full bg-linear-to-tr from-cyan-500/20 to-purple-500/20 blur-3xl" />
                <Image
                  src="/nano-banana-images/home_page.png"
                  alt="Futuristic Nano Banana"
                  width={1200}
                  height={12000}
                  className="h-full w-full transform object-contain drop-shadow-[0_0_50px_rgba(34,211,238,0.5)] transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative bg-zinc-950 py-32">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-20 max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">Features that wow.</h2>
            <p className="mt-4 text-lg text-white/50">
              Everything you need to master a new language, packaged in a beautiful interface.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Target,
                title: 'Smart Targeting',
                desc: 'Our algorithm adapts to your learning pace, showing you words right before you forget them.',
                color: 'text-red-400',
                bg: 'bg-red-400/10',
              },
              {
                icon: Trophy,
                title: 'Gamified Progress',
                desc: 'Earn streaks, badges, and complete daily challenges to keep your motivation high.',
                color: 'text-amber-400',
                bg: 'bg-amber-400/10',
              },
              {
                icon: Zap,
                title: 'Instant Analytics',
                desc: 'Visualize your mastery with real-time radar charts and progress tracking.',
                color: 'text-emerald-400',
                bg: 'bg-emerald-400/10',
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 transition-colors hover:border-white/20 hover:bg-white/10"
              >
                <div className={`mb-6 inline-flex rounded-2xl p-4 ${feature.bg}`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="mt-3 leading-relaxed text-white/60">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section id="demo" className="relative overflow-hidden py-32">
        <div className="container mx-auto px-6">
          <div className="relative rounded-3xl border border-white/10 bg-zinc-900/50 p-4 backdrop-blur-xl md:p-8">
            <div className="absolute -inset-px bg-gradient-to-r from-cyan-500 to-purple-500 opacity-20 blur-xl transition-opacity group-hover:opacity-30" />

            {/* Dashboard Mockup Placeholder */}
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold tracking-widest text-white/20 uppercase">
                Dashboard Interface Preview
              </div>
              {/* In real implementaton, embed a video or high-res screenshot here */}
              <div className="absolute right-0 bottom-0 left-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black py-12">
        <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <p className="text-sm text-white/40">© 2024 BananaLearning. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-white/60">
            <Link href="#" className="hover:text-white">
              Privacy
            </Link>
            <Link href="#" className="hover:text-white">
              Terms
            </Link>
            <Link href="#" className="hover:text-white">
              Twitter
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
