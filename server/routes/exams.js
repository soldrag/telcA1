import { Router } from 'express';
import crypto from 'node:crypto';
import { extractUserId } from '../services/user-context.js';
import { selectBalancedRandomExam } from '../services/exam-balancer.js';
import { evaluateExamSubmission } from '../services/exam-evaluator.js';
import { ExamRepository } from '../repositories/exam.repository.js';
import { AttemptRepository } from '../repositories/attempt.repository.js';

function buildSubmissionPayload({ exam, questions, answers, timeSpentSeconds }) {
  const { score, reviewItems, teilBreakdown } = evaluateExamSubmission(questions, answers);
  const totalQuestions = questions.length;
  const maxScore = exam.max_score || 15;
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 1000) / 10 : 0;
  const passed = score >= exam.pass_score;

  return {
    attemptId: crypto.randomUUID(),
    exam,
    score,
    totalQuestions,
    percentage,
    passed,
    teilBreakdown,
    reviewItems,
    timeSpentSeconds,
    passScore: exam.pass_score,
  };
}

function validateSubmissionBody(body) {
  if (!body || typeof body !== 'object') {
    return 'Invalid request payload';
  }
  if (body.answers && (typeof body.answers !== 'object' || Array.isArray(body.answers))) {
    return 'Answers must be a valid key-value object';
  }
  if (body.timeSpentSeconds !== undefined && (typeof body.timeSpentSeconds !== 'number' || body.timeSpentSeconds < 0)) {
    return 'timeSpentSeconds must be a non-negative number';
  }
  return null;
}

export function createExamsRouter(databaseOrRepository) {
  const router = Router();
  const examRepository = databaseOrRepository instanceof ExamRepository
    ? databaseOrRepository
    : new ExamRepository(databaseOrRepository);
  const attemptRepository = new AttemptRepository(databaseOrRepository?.database || databaseOrRepository);

  router.get('/', (req, res) => {
    try {
      const testType = req.query.type || 'lesen';
      const exams = examRepository.findExamsByTestType(testType);
      res.json({ exams });
    } catch (error) {
      console.error('[ExamsRouter Error] Failed to fetch exams:', error);
      res.status(500).json({ error: 'Failed to fetch exams' });
    }
  });

  router.get('/next-random', (req, res) => {
    try {
      const userId = extractUserId(req);
      const testType = req.query.type || 'lesen';
      const selection = selectBalancedRandomExam({ examRepository, attemptRepository, userId, testType });
      if (!selection || !selection.exam) {
        return res.status(404).json({ error: 'No exams available for this test type' });
      }
      res.json(selection);
    } catch (error) {
      console.error('[ExamsRouter Error] Failed to select random exam:', error);
      res.status(500).json({ error: 'Failed to select random exam' });
    }
  });

  router.get('/:id', (req, res) => {
    try {
      const exam = examRepository.findExamById(req.params.id);
      if (!exam) return res.status(404).json({ error: 'Exam not found' });

      const questions = examRepository.findQuestionsByExamId(req.params.id, true);
      res.json({ exam, questions });
    } catch (error) {
      console.error('[ExamsRouter Error] Failed to fetch exam details:', error);
      res.status(500).json({ error: 'Failed to fetch exam details' });
    }
  });

  router.post('/:id/submit', (req, res) => {
    try {
      const validationError = validateSubmissionBody(req.body);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      const exam = examRepository.findExamById(req.params.id);
      if (!exam) return res.status(404).json({ error: 'Exam not found' });

      const { answers = {}, timeSpentSeconds = 0 } = req.body;
      const questions = examRepository.findQuestionsByExamId(req.params.id, false);
      const payload = buildSubmissionPayload({ exam, questions, answers, timeSpentSeconds });

      res.json(payload);
    } catch (error) {
      console.error('[ExamsRouter Error] Failed to process exam submission:', error);
      res.status(500).json({ error: 'Failed to process exam submission' });
    }
  });

  return router;
}
