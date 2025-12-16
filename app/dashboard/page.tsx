'use client';

import * as React from 'react';
import {
  TrendingUp,
  BarChart2,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  Brain,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  Bar,
  BarChart,
  Pie,
  PieChart,
  Label,
  Sector,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

// --- Mock Data ---

const accuracyData = [
  { day: 'Mon', accuracy: 65, attempts: 12 },
  { day: 'Tue', accuracy: 72, attempts: 15 },
  { day: 'Wed', accuracy: 68, attempts: 8 },
  { day: 'Thu', accuracy: 85, attempts: 20 },
  { day: 'Fri', accuracy: 82, attempts: 18 },
  { day: 'Sat', accuracy: 90, attempts: 25 },
  { day: 'Sun', accuracy: 88, attempts: 22 },
];

const categoryData = [
  { category: 'Synonyms', score: 85, fill: 'var(--color-synonyms)' },
  { category: 'Antonyms', score: 62, fill: 'var(--color-antonyms)' },
  { category: 'Idioms', score: 78, fill: 'var(--color-idioms)' },
  { category: 'Grammar', score: 92, fill: 'var(--color-grammar)' },
  { category: 'Proverbs', score: 45, fill: 'var(--color-proverbs)' },
];

const masteryData = [
  { name: 'Mastered', value: 120, fill: 'var(--color-mastered)' },
  { name: 'Learning', value: 85, fill: 'var(--color-learning)' },
  { name: 'New', value: 250, fill: 'var(--color-new)' },
];

// --- Chart Configs ---

const accuracyConfig = {
  accuracy: {
    label: 'Accuracy (%)',
    color: 'hsl(var(--primary))',
  },
  attempts: {
    label: 'Attempts',
    color: 'hsl(var(--muted-foreground))',
  },
} satisfies ChartConfig;

const categoryConfig = {
  score: {
    label: 'Score',
  },
  synonyms: {
    label: 'Synonyms',
    color: 'hsl(var(--chart-1))',
  },
  antonyms: {
    label: 'Antonyms',
    color: 'hsl(var(--chart-2))',
  },
  idioms: {
    label: 'Idioms',
    color: 'hsl(var(--chart-3))',
  },
  grammar: {
    label: 'Grammar',
    color: 'hsl(var(--chart-4))',
  },
  proverbs: {
    label: 'Proverbs',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig;

const masteryConfig = {
  mastered: {
    label: 'Mastered',
    color: 'hsl(var(--chart-2))',
  },
  learning: {
    label: 'Learning',
    color: 'hsl(var(--chart-4))',
  },
  new: {
    label: 'New',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col gap-6 bg-transparent p-6">
      {/* Header Cards (Summary) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <BookOpen className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-muted-foreground text-xs">+18 from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78.2%</div>
            <p className="text-muted-foreground text-xs">+2.1% this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12h 45m</div>
            <p className="text-muted-foreground text-xs">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5 Days</div>
            <p className="text-muted-foreground text-xs">Keep it up!</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart: Accuracy Over Time */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <CardDescription>Your daily accuracy over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={accuracyConfig} className="h-[300px] w-full">
              <LineChart
                accessibilityLayer
                data={accuracyData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Line
                  dataKey="accuracy"
                  type="natural"
                  stroke="var(--color-accuracy)"
                  strokeWidth={2}
                  dot={{
                    fill: 'var(--color-accuracy)',
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Categories Bar Chart */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Average score by topic</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={categoryConfig} className="h-[300px] w-full">
              <BarChart
                accessibilityLayer
                data={categoryData}
                layout="vertical"
                margin={{
                  left: 20, // increased for labels
                }}
              >
                <CartesianGrid horizontal={false} />
                <XAxis type="number" dataKey="score" hide />
                <Bar
                  dataKey="score"
                  layout="vertical"
                  fill="var(--color-score)" // fallback
                  radius={4}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Mastery Radial/Pie */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Content Mastery</CardTitle>
            <CardDescription>Knowledge distribution</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={masteryConfig} className="mx-auto aspect-square max-h-[250px]">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={masteryData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              {masteryData.reduce((acc, curr) => acc + curr.value, 0)}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground text-xs"
                            >
                              Questions
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 leading-none font-medium">
              Keep learning to grow your mastery! <Brain className="h-4 w-4" />
            </div>
          </CardFooter>
        </Card>

        {/* Recent Activity List (Simplified) */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest test sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: 'Synonyms Practice',
                  date: 'Today, 10:42 AM',
                  score: '5/5',
                  color: 'text-green-500',
                },
                {
                  title: 'Grammar Quiz',
                  date: 'Yesterday, 4:15 PM',
                  score: '8/10',
                  color: 'text-blue-500',
                },
                {
                  title: 'Idioms Challenge',
                  date: 'Yesterday, 2:30 PM',
                  score: '3/5',
                  color: 'text-yellow-500',
                },
                {
                  title: 'Vocabulary Mix',
                  date: 'Oct 24, 9:00 AM',
                  score: '9/10',
                  color: 'text-green-500',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-muted rounded-full p-2">
                      <BarChart2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-muted-foreground text-xs">{item.date}</p>
                    </div>
                  </div>
                  <div className={`font-bold ${item.color}`}>{item.score}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
