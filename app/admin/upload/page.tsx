'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { QuestionService } from '@/services/question-service';
import { Question, QuestionCategory } from '@/data/question/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Upload, FileJson, CheckCircle, AlertTriangle, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

const ADMIN_EMAILS = ['ritikapurwa08@gmail.com', 'ritikapurwa@gmail.com'];

const AI_PROMPT = `**System Prompt for AI:**

You are a data formatting assistant. Convert the provided educational text (which may contain questions, idioms, or vocabulary) into a JSON array of Question objects.

**Required JSON Schema:**
\`\`\`json
[
  {
    "questionId": "unique_id_string_no_spaces",
    "type": "MULTIPLE_CHOICE",
    "category": "SYNONYMS",
    "questionText": "The question content here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Brief explanation of why this is correct"
  }
]
\`\`\`

**Instructions:**
1. Extract ALL questions from the text.
2. Ensure correctAnswer is exactly identical to one string in options.
3. Output ONLY the raw JSON array.`;

export default function AdminUploadPage() {
  const { user, loading: authLoading } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [category, setCategory] = useState<QuestionCategory | ''>('');
  const [copied, setCopied] = useState(false);

  // Copy AI Prompt handler
  const copyPrompt = () => {
    navigator.clipboard.writeText(AI_PROMPT);
    setCopied(true);
    toast.info('AI Prompt copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile || null);
    setValidationError(null);
    setParsedQuestions([]);

    if (selectedFile) {
      if (!selectedFile.name.endsWith('.json')) {
        setValidationError('Please select a valid JSON file.');
        return;
      }

      try {
        const text = await selectedFile.text();
        const json = JSON.parse(text);

        if (!Array.isArray(json)) {
          throw new Error('File must contain an array of questions.');
        }

        // Basic schema validation
        const isValid = json.every((q) => q.questionId && q.questionText && q.type);

        if (!isValid) {
          throw new Error('Invalid question format. Missing required fields.');
        }

        setParsedQuestions(json as Question[]);
      } catch (err) {
        setValidationError((err as Error).message);
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!parsedQuestions.length || !category) return;

    setUploading(true);
    try {
      // 1. Get next set number base
      let currentSetNum = await QuestionService.getNextSetNumber(category);

      // 2. Chunk questions into sets of 10
      const CHUNK_SIZE = 10;
      const chunks = [];
      for (let i = 0; i < parsedQuestions.length; i += CHUNK_SIZE) {
        chunks.push(parsedQuestions.slice(i, i + CHUNK_SIZE));
      }

      let totalUploaded = 0;

      // 3. Process each chunk
      for (const chunk of chunks) {
        const setId = `${category.toLowerCase()}_${currentSetNum}`;

        // Force category to match selection
        const cleanedQuestions = chunk.map((q) => ({
          ...q,
          category: category as QuestionCategory,
          // Ensure ID is unique if user messed up
          questionId: q.questionId.startsWith(category.toLowerCase())
            ? q.questionId
            : `${category.toLowerCase()}_${q.questionId}`,
        }));

        await QuestionService.createQuestionSet({
          id: setId,
          category: category as QuestionCategory,
          setNumber: currentSetNum,
          questions: cleanedQuestions,
          totalQuestions: cleanedQuestions.length,
          createdAt: new Date().toISOString(),
        });

        totalUploaded += cleanedQuestions.length;
        currentSetNum++;
      }

      toast.success(`Success! Created ${chunks.length} Sets with ${totalUploaded} questions.`);
      setFile(null);
      setParsedQuestions([]);
    } catch (error) {
      console.error(error);
      toast.error('Failed to create sets.');
    } finally {
      setUploading(false);
    }
  };

  if (authLoading)
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="animate-spin" />
      </div>
    );

  if (!user || (user.email && !ADMIN_EMAILS.includes(user.email))) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center p-4 text-center">
        <AlertTriangle className="text-destructive mb-4 h-10 w-10" />
        <h1 className="text-xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You are not authorized to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-lg space-y-6 p-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Set Upload Manager</h1>
        <p className="text-muted-foreground text-sm">
          Upload bulk questions. System will automatically split them into{' '}
          <strong>Sets of 10</strong>.
        </p>
      </div>

      <Card className="bg-muted/50 border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm font-medium">
            <span>AI Helper</span>
            <Button variant="ghost" size="sm" onClick={copyPrompt} className="h-8">
              {copied ? (
                <Check className="mr-2 h-4 w-4 text-green-500" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              {copied ? 'Copied!' : 'Copy Prompt'}
            </Button>
          </CardTitle>
          <CardDescription className="text-xs">
            Copy this prompt to ChatGPT/Gemini to convert your PDFs into the correct JSON format.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label>Target Category</Label>
            <Select onValueChange={(val) => setCategory(val as QuestionCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SYNONYMS">Synonyms</SelectItem>
                <SelectItem value="ANTONYMS">Antonyms</SelectItem>
                <SelectItem value="IDIOMS">Idioms</SelectItem>
                <SelectItem value="GRAMMAR">Grammar</SelectItem>
                <SelectItem value="PROVERBS">Proverbs</SelectItem>
                <SelectItem value="SPELLING">Spelling</SelectItem>
                <SelectItem value="ONE_WORD_SUBSTITUTION">One Word Sub.</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>JSON File</Label>
            <Input
              type="file"
              accept="application/json"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>

          {validationError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Invalid File</AlertTitle>
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {parsedQuestions.length > 0 && category && (
            <Alert className="border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-300">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Ready to Batch</AlertTitle>
              <AlertDescription>
                System will create <strong>{Math.ceil(parsedQuestions.length / 10)}</strong> new
                sets (starting from Set #{parsedQuestions.length > 0 ? '...' : 1}).
              </AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full"
            onClick={handleUpload}
            disabled={!parsedQuestions.length || !category || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Batches...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload & Create Sets
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
