'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Quote, Shuffle, MessageSquare, Scale, History } from 'lucide-react';

const CATEGORIES = [
  {
    id: 'syn',
    title: 'Synonyms',
    icon: Scale,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    desc: 'Find words with similar meanings.',
  },
  {
    id: 'ant',
    title: 'Antonyms',
    icon: Shuffle,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    desc: 'Find words with opposite meanings.',
  },
  {
    id: 'idi',
    title: 'Idioms',
    icon: Quote,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    desc: 'Understand common expressions.',
  },
  {
    id: 'gra',
    title: 'Grammar',
    icon: BookOpen,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    desc: 'Master English grammar rules.',
  },
  {
    id: 'phv',
    title: 'Phrasal Verbs',
    icon: MessageSquare,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    desc: 'Learn verb combinations.',
  },
];

export default function PracticePage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Practice Arena</h1>
        <p className="text-muted-foreground">
          Select a category to start a new quiz session. The system will automatically serve you new
          questions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <Link key={cat.id} href={`/test/${cat.id}`}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group bg-card relative flex h-full flex-col justify-between overflow-hidden rounded-xl border p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-4">
                <div className={`inline-flex rounded-lg p-3 ${cat.bg}`}>
                  <cat.icon className={`h-6 w-6 ${cat.color}`} />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">{cat.title}</h3>
                <p className="text-muted-foreground text-sm">{cat.desc}</p>
              </div>

              <div className="text-primary mt-4 flex items-center text-sm font-medium">
                Start Quiz{' '}
                <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </div>
            </motion.div>
          </Link>
        ))}

        {/* History Card */}
        <Link href="/test/history">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group bg-muted/40 relative flex h-full flex-col justify-between overflow-hidden rounded-xl border p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="mb-4">
              <div className="inline-flex rounded-lg bg-gray-500/10 p-3">
                <History className="h-6 w-6 text-gray-500" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Test History</h3>
              <p className="text-muted-foreground text-sm">View your past results.</p>
            </div>

            <div className="text-foreground mt-4 flex items-center text-sm font-medium">
              View History{' '}
              <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
            </div>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
