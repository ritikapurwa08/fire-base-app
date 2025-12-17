'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { TestService } from '@/services/test-service';
import { TestSession } from '@/types';
import { format } from 'date-fns';
import { History, Calendar } from 'lucide-react';

export default function HistoryPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      if (!user) return;
      try {
        const history = await TestService.getHistory(user.uid);
        setSessions(history);
      } catch (error) {
        console.error('Failed to load history', error);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [user]);

  if (loading) {
    return <div className="p-10 text-center">Loading history...</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-10">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 rounded-lg p-2">
          <History className="text-primary h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Test History</h1>
          <p className="text-muted-foreground text-sm">Your recent practice sessions.</p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {sessions.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <p className="text-muted-foreground">No history found. Start practicing!</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className="bg-card flex flex-col justify-between gap-4 rounded-xl border p-4 shadow-sm sm:flex-row sm:items-center"
            >
              <div className="flex gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    session.score / session.totalQuestions >= 0.8
                      ? 'bg-green-100 text-green-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  <span className="font-bold">
                    {Math.round((session.score / session.totalQuestions) * 100)}%
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold">Practice Session</h3>
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(session.date), 'PPP p')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-muted-foreground text-xs font-medium uppercase">Score</p>
                  <p className="font-bold">
                    {session.score} / {session.totalQuestions}
                  </p>
                </div>
                {/* Can add 'View Details' later if we allow deep linking to past result */}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
