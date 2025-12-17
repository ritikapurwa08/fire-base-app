import { questions } from '@/store/question';
import { Question } from '@/types';

type QuestionType = Question['type'];

export const QuestionService = {
  getQuestions: (
    category: QuestionType,
    answeredIds: string[] = [],
    limit: number = 10,
  ): Question[] => {
    // 1. Filter by category
    const categoryQuestions = questions.filter((q) => q.type === category);

    // 2. Filter out already answered questions
    const availableQuestions = categoryQuestions.filter((q) => !answeredIds.includes(q.id));

    // 3. Shuffle (Fisher-Yates algorithm)
    const shuffled = [...availableQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 4. Return subset
    // If we run out of new questions, we could potentially return old ones (optional logic)
    // For now, let's strictly return new ones so the user knows they are "done"
    return shuffled.slice(0, limit);
  },

  getAllCategories: () => {
    // Extract unique categories from the questions array
    const categories = new Set(questions.map((q) => q.type));
    return Array.from(categories);
  },

  getTotalCountByCategory: (category: QuestionType) => {
    return questions.filter((q) => q.type === category).length;
  },
};
