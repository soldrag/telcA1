import { useState, useCallback } from 'react';
import { submitExamAnswers } from '../services/api.js';
import { attemptStorage as defaultAttemptStorage } from '../services/storage/index.js';
import { getTestTypeById } from '../../shared/testTypes.js';

function createAttemptRecord({ resultData, examId, answers, timeSpent }) {
  return {
    id: resultData.attemptId,
    exam_id: examId,
    exam_title: resultData.exam?.title,
    test_type: resultData.exam?.test_type || 'lesen',
    score: resultData.score,
    total_questions: resultData.totalQuestions,
    percentage: resultData.percentage,
    passed: resultData.passed,
    time_spent_seconds: Math.max(1, timeSpent),
    answers,
    results: resultData,
    created_at: new Date().toISOString()
  };
}

export function useExamSession({ storage = defaultAttemptStorage, submitService = submitExamAnswers } = {}) {
  const [answers, setAnswers] = useState({});
  const [activeTeil, setActiveTeil] = useState(1);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [scrollTargetId, setScrollTargetId] = useState(null);

  const resetSession = useCallback(() => {
    setAnswers({});
    setActiveTeil(1);
    setActiveQuestionIndex(0);
    setIsSubmitted(false);
    setResults(null);
  }, []);

  const selectAnswer = useCallback((questionId, value) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }, [isSubmitted]);

  const selectTeil = useCallback((teilNumber) => {
    setActiveTeil(teilNumber);
  }, []);

  const nextTeil = useCallback((maxTeile = 3) => {
    setActiveTeil(prev => Math.min(maxTeile, prev + 1));
  }, []);

  const previousTeil = useCallback(() => {
    setActiveTeil(prev => Math.max(1, prev - 1));
  }, []);

  const jumpToQuestion = useCallback((index, questionId) => {
    setActiveQuestionIndex(index);
    setScrollTargetId(questionId);
  }, []);

  const clearScrollTarget = useCallback(() => {
    setScrollTargetId(null);
  }, []);

  const submitCurrentExam = useCallback(async ({ examId, isTimed, secondsLeft, secondsElapsed, totalSeconds }) => {
    if (isSubmitted || isSubmitting) return;
    setIsSubmitting(true);
    const timeSpent = isTimed ? (totalSeconds - secondsLeft) : secondsElapsed;

    try {
      const resultData = await submitService(examId, {
        answers,
        timeSpentSeconds: Math.max(1, timeSpent)
      });

      const attemptRecord = createAttemptRecord({ resultData, examId, answers, timeSpent });
      await storage.saveAttempt(attemptRecord);

      setResults(resultData);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, isSubmitted, isSubmitting, storage, submitService]);

  const retakeMistakes = useCallback(() => {
    if (!results?.reviewItems) return;
    const incorrectQuestionIds = new Set(
      results.reviewItems.filter(item => !item.is_correct).map(item => item.id)
    );
    const preservedAnswers = Object.fromEntries(
      Object.entries(answers).filter(([id]) => !incorrectQuestionIds.has(id))
    );
    setAnswers(preservedAnswers);
    setIsSubmitted(false);
    setResults(null);
  }, [results, answers]);

  const loadPastAttempt = useCallback((attempt) => {
    setResults(attempt.results);
    setAnswers(attempt.answers || {});
    setIsSubmitted(true);
  }, []);

  const updateItemScore = useCallback((itemId, newPoints, newBreakdown) => {
    setResults((prev) => {
      if (!prev || !prev.reviewItems) return prev;
      const updatedItems = prev.reviewItems.map((item) => {
        if (item.id !== itemId) return item;
        const isCorrect = newPoints >= Math.ceil((item.max_points || 10) * 0.6);
        return {
          ...item,
          points_earned: newPoints,
          is_correct: isCorrect,
          criteria_breakdown: newBreakdown || item.criteria_breakdown
        };
      });

      const newTotalScore = updatedItems.reduce((acc, it) => {
        const pts = it.points_earned !== undefined ? it.points_earned : (it.is_correct ? 1 : 0);
        return acc + pts;
      }, 0);

      const maxScore = prev.maxScore || prev.exam?.max_score || getTestTypeById(prev.exam?.test_type || 'lesen').maxScore;
      const updatedTeilBreakdown = { ...(prev.teilBreakdown || {}) };
      const currentItem = prev.reviewItems.find((it) => it.id === itemId);
      const itemTeil = currentItem?.teil;

      if (itemTeil && updatedTeilBreakdown[itemTeil]) {
        const teilScore = updatedItems
          .filter((it) => it.teil === itemTeil)
          .reduce((sum, it) => sum + (it.points_earned !== undefined ? it.points_earned : (it.is_correct ? 1 : 0)), 0);
        updatedTeilBreakdown[itemTeil] = {
          ...updatedTeilBreakdown[itemTeil],
          score: teilScore,
        };
      }

      return {
        ...prev,
        score: newTotalScore,
        maxScore,
        passed: newTotalScore >= (prev.passScore || Math.ceil(maxScore * 0.6)),
        percentage: maxScore > 0 ? Math.round((newTotalScore / maxScore) * 100) : 0,
        reviewItems: updatedItems,
        teilBreakdown: updatedTeilBreakdown,
      };
    });
  }, []);

  return {
    answers,
    answeredCount: Object.keys(answers).length,
    activeTeil,
    activeQuestionIndex,
    isSubmitted,
    isSubmitting,
    results,
    scrollTargetId,
    clearScrollTarget,
    resetSession,
    selectAnswer,
    selectTeil,
    nextTeil,
    previousTeil,
    jumpToQuestion,
    submitCurrentExam,
    retakeMistakes,
    loadPastAttempt,
    updateItemScore,
  };
}
