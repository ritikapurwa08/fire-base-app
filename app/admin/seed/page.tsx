'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QuestionService } from '@/services/question-service';
import synonyms from '@/data/question/synonyms.json';
import antonyms from '@/data/question/antonyms.json';
import idioms from '@/data/question/idioms.json';
import grammar from '@/data/question/grammar.json';
import proverbs from '@/data/question/proverbs.json';
import { Question } from '@/data/question/types';

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  const handleSeed = async () => {
    if (!confirm('This will overwrite existing questions with the same IDs. Contine?')) return;

    setLoading(true);
    setStatus('Seeding started...');

    try {
      const allQuestions = [
        ...synonyms,
        ...antonyms,
        ...idioms,
        ...grammar,
        ...proverbs,
      ] as Question[];

      console.log(`Seeding ${allQuestions.length} questions...`);
      await QuestionService.seedQuestions(allQuestions);

      setStatus(`Success! Seeded ${allQuestions.length} questions.`);
    } catch (error) {
      console.error(error);
      setStatus('Error seeding data. Check console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-8">
      <h1 className="text-2xl font-bold">Database Seeding</h1>
      <p>Click below to populate the Firestore database with the mock data from JSON files.</p>

      <div className="bg-muted/40 rounded border p-4 font-mono text-sm">
        <p>Synonyms: {synonyms.length}</p>
        <p>Antonyms: {antonyms.length}</p>
        <p>Idioms: {idioms.length}</p>
        <p>Grammar: {grammar.length}</p>
        <p>Proverbs: {proverbs.length}</p>
      </div>

      <Button onClick={handleSeed} disabled={loading}>
        {loading ? 'Seeding...' : 'Seed Database'}
      </Button>

      {status && (
        <div
          className={`rounded p-4 ${status.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
        >
          {status}
        </div>
      )}
    </div>
  );
}
