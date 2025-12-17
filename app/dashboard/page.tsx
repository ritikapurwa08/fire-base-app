'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Quote,
  Shuffle,
  MessageSquare,
  Scale,
  History,
  TrendingUp,
  Award,
  Target,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { TestService } from '@/services/test-service';
import { QuestionService } from '@/services/question-service';
import { UserProgress } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

const CATEGORIES = [
  { id: 'syn', title: 'Synonyms', icon: Scale, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'ant', title: 'Antonyms', icon: Shuffle, color: 'text-red-500', bg: 'bg-red-500/10' },
  { id: 'idi', title: 'Idioms', icon: Quote, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'gra', title: 'Grammar', icon: BookOpen, color: 'text-green-500', bg: 'bg-green-500/10' },
  {
    id: 'phv',
    title: 'Phrasal Verbs',
    icon: MessageSquare,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      try {
        const data = await TestService.getUserProgress(user.uid);
        setProgress(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [user]);

  // Transform data for Radar Chart
  const radarData = CATEGORIES.map((cat) => {
    const stat = progress?.stats[cat.id as keyof typeof progress.stats];
    return {
      subject: cat.title,
      A: stat ? Math.round(stat.accuracy) : 0,
      fullMark: 100,
    };
  });

  // Transform data for Bar Chart
  const barData = CATEGORIES.map((cat) => {
    const totalAvailable = QuestionService.getTotalCountByCategory(cat.id as any);
    const stat = progress?.stats[cat.id as keyof typeof progress.stats];
    const answered = stat?.totalAttempted || 0;

    return {
      name: cat.title,
      answered: answered,
      total: totalAvailable,
    };
  });

  const totalTests = progress?.totalTestsTaken || 0;
  const overallaccuracy = progress?.overallAccuracy ? Math.round(progress.overallAccuracy) : 0;
  const totalQuestionsAnswered = progress?.answeredQuestionIds?.length || 0;

  return (
    <div className="flex flex-col gap-6 p-6 md:p-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.displayName?.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground">Here is your learning progress overview.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTests}</div>
            <p className="text-muted-foreground text-xs">Sessions completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <Target className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallaccuracy}%</div>
            <p className="text-muted-foreground text-xs">Overall performance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mastery</CardTitle>
            <Award className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuestionsAnswered}</div>
            <p className="text-muted-foreground text-xs">Questions answered</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Skill Balance</CardTitle>
            <CardDescription>Your accuracy across different categories.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                  />
                  <Radar
                    name="Accuracy"
                    dataKey="A"
                    stroke="#2563eb"
                    fill="#3b82f6"
                    fillOpacity={0.4}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Category Progress</CardTitle>
            <CardDescription>Completion status per category.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px' }}
                  />
                  <Bar
                    dataKey="answered"
                    fill="#10b981"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                    name="Answered"
                  />
                  <Bar
                    dataKey="total"
                    fill="#f3f4f6"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                    name="Total Available"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Quick Practice</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.slice(0, 4).map((cat) => (
            <Link key={cat.id} href={`/test/${cat.id}`}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group bg-card relative flex items-center gap-4 overflow-hidden rounded-xl border p-4 shadow-sm transition-all hover:shadow-md"
              >
                <div className={`rounded-lg p-2 ${cat.bg}`}>
                  <cat.icon className={`h-5 w-5 ${cat.color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{cat.title}</h3>
                  <p className="text-muted-foreground text-xs">Start Now</p>
                </div>
                <div className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="text-primary">→</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
