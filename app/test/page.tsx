import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Repeat2, BrainCircuit, Languages } from 'lucide-react';

const categories = [
  {
    id: 'synonym',
    title: 'Synonyms',
    description: 'Find similar meanings',
    icon: Repeat2,
    color: 'text-blue-500',
  },
  {
    id: 'antonym',
    title: 'Antonyms',
    description: 'Identify opposites',
    icon: Repeat2,
    color: 'text-red-500',
  },
  {
    id: 'idiom',
    title: 'Idioms & Phrases',
    description: 'Master figurative language',
    icon: BrainCircuit,
    color: 'text-purple-500',
  },
  {
    id: 'grammar',
    title: 'Grammar',
    description: 'Perfect your syntax',
    icon: Languages,
    color: 'text-green-500',
  },
  {
    id: 'proverb',
    title: 'Proverbs',
    description: 'Ancient wisdom & sayings',
    icon: BookOpen,
    color: 'text-amber-500',
  },
];

export default function TestDashboard() {
  return (
    <div className="container mx-auto space-y-8 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Practice Tests</h1>
        <p className="text-muted-foreground">Select a category to start your assessment.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <Link key={category.id} href={`/test/${category.id}`}>
            <Card className="hover:bg-accent/50 h-full cursor-pointer transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <category.icon className={`h-8 w-8 ${category.color}`} />
                  <Badge variant="outline">Practice</Badge>
                </div>
                <CardTitle className="mt-4">{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground text-xs">5 Questions • Untimed</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
