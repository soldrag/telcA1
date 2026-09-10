import { Router } from 'express';
import crypto from 'node:crypto';
import { extractUserId } from '../services/user-context.js';
import { selectBalancedRandomExam } from '../services/exam-balancer.js';
import { evaluateExamSubmission } from '../services/exam-evaluator.js';

export function createExamsRouter(db) {
  const router = Router();

  router.get('/', (req, res) => {
    try {
      const testType = req.query.type || 'lesen';
      const exams = db.prepare(`
        SELECT * FROM exams 
        WHERE test_type = ?
        ORDER BY sort_order ASC, id ASC
      `).all(testType);
      res.json({ exams });
    } catch (err) {
      console.error('Error fetching exams:', err);
      res.status(500).json({ error: 'Failed to fetch exams' });
    }
  });

  router.get('/next-random', (req, res) => {
    try {
      const userId = extractUserId(req);
      const testType = req.query.type || 'lesen';
      const selection = selectBalancedRandomExam({ db, userId, testType });
      if (!selection || !selection.exam) {
        return res.status(404).json({ error: 'No exams available for this test type' });
      }
      res.json(selection);
    } catch (err) {
      console.error('Error selecting random exam:', err);
      res.status(500).json({ error: 'Failed to select random exam' });
    }
  });

  router.get('/:id', (req, res) => {
    try {
      const exam = db.prepare('SELECT * FROM exams WHERE id = ?').get(req.params.id);
      if (!exam) return res.status(404).json({ error: 'Exam not found' });

      const questions = db.prepare(`
        SELECT id, exam_id, teil, question_number, title, situation, 
               context_header, context_body, options_json, statement
        FROM questions 
        WHERE exam_id = ? 
        ORDER BY question_number ASC
      `).all(req.params.id).map(parseQuestionOptions);

      res.json({ exam, questions });
    } catch (err) {
      console.error('Error fetching exam details:', err);
      res.status(500).json({ error: 'Failed to fetch exam details' });
    }
  });

  router.post('/:id/submit', (req, res) => {
    try {
      const exam = db.prepare('SELECT * FROM exams WHERE id = ?').get(req.params.id);
      if (!exam) return res.status(404).json({ error: 'Exam not found' });

      const { answers = {}, timeSpentSeconds = 0 } = req.body;
      const questions = db.prepare('SELECT * FROM questions WHERE exam_id = ? ORDER BY question_number ASC').all(req.params.id);
      const { score, reviewItems, teilBreakdown } = evaluateExamSubmission(questions, answers);

      const totalQuestions = questions.length;
      const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 1000) / 10 : 0;
      const passed = score >= exam.pass_score;
      const attemptId = crypto.randomUUID();

      const resultsPayload = {
        attemptId,
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

      res.json(resultsPayload);
    } catch (err) {
      console.error('Error submitting exam:', err);
      res.status(500).json({ error: 'Failed to process exam submission' });
    }
  });

  return router;
}

function parseQuestionOptions(question) {
  return {
    ...question,
    options_json: question.options_json ? JSON.parse(question.options_json) : null,
  };
}
