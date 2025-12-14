"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, writeBatch, doc, serverTimestamp } from "firebase/firestore";
import wordsData from "../../words.json";
import questionsData from "../../questions.json";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminPage() {
  const [uploadingWords, setUploadingWords] = useState(false);
  const [uploadingQuestions, setUploadingQuestions] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUploadWords = async () => {
    setUploadingWords(true);
    setProgress(0);
    const BATCH_SIZE = 400;
    const chunks = [];
    for (let i = 0; i < wordsData.length; i += BATCH_SIZE) {
      chunks.push(wordsData.slice(i, i + BATCH_SIZE));
    }

    try {
      let count = 0;
      for (const chunk of chunks) {
        const batch = writeBatch(db);
        chunk.forEach((word: any) => {
          const docRef = doc(collection(db, "words"));
          batch.set(docRef, { ...word, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        });
        await batch.commit();
        count += chunk.length;
        setProgress(count);
      }
      toast.success(`Uploaded ${count} words!`);
    } catch (error) {
      console.error(error);
      toast.error("Word upload failed.");
    } finally {
      setUploadingWords(false);
    }
  };

  const handleUploadQuestions = async () => {
    setUploadingQuestions(true);
    setProgress(0);
    const BATCH_SIZE = 400;
    const chunks = [];
    for (let i = 0; i < questionsData.length; i += BATCH_SIZE) {
      chunks.push(questionsData.slice(i, i + BATCH_SIZE));
    }

    try {
      let count = 0;
      for (const chunk of chunks) {
        const batch = writeBatch(db);
        chunk.forEach((q: any) => {
          const docRef = doc(collection(db, "questions")); // New Collection
          batch.set(docRef, { ...q, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        });
        await batch.commit();
        count += chunk.length;
        setProgress(count);
      }
      toast.success(`Uploaded ${count} questions!`);
    } catch (error) {
      console.error(error);
      toast.error("Question upload failed.");
    } finally {
      setUploadingQuestions(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto space-y-8">
      <Card>
        <CardHeader><CardTitle>1. Upload Words</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p>Total Words: {wordsData.length}</p>
          {uploadingWords && <p>Progress: {progress}</p>}
          <Button className="w-full" onClick={handleUploadWords} disabled={uploadingWords || uploadingQuestions}>
            {uploadingWords ? <Loader2 className="animate-spin mr-2" /> : null}
            {uploadingWords ? "Uploading..." : "Start Words Upload"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>2. Upload Questions</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p>Total Questions: {questionsData.length}</p>
          {uploadingQuestions && <p>Progress: {progress}</p>}
          <Button className="w-full" variant="secondary" onClick={handleUploadQuestions} disabled={uploadingWords || uploadingQuestions}>
            {uploadingQuestions ? <Loader2 className="animate-spin mr-2" /> : null}
            {uploadingQuestions ? "Uploading..." : "Start Questions Upload"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
