import { useState, useCallback } from 'react';
import { submitExamAnswers } from '../services/api.js';
import { attemptStorage } from '../services/storage/index.js';

export function useExamSession() {
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

  const jumpToQuestion = useCallback((index, questionId) => {
    setActiveQuestionIndex(index);
    setScrollTargetId(questionId);
  }, []);

  const submitCurrentExam = useCallback(async ({ examId, isTimed, secondsLeft, secondsElapsed, totalSeconds }) => {
    if (isSubmitted || isSubmitting) return null;
    setIsSubmitting(true);
    const timeSpent = isTimed ? (totalSeconds - secondsLeft) : secondsElapsed;

    try {
      const resultData = await submitExamAnswers(examId, {
        answers,
        timeSpentSeconds: Math.max(1, timeSpent)
      });

      const attemptRecord = {
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

      await attemptStorage.saveAttempt(attemptRecord);

      setResults(resultData);
      setIsSubmitted(true);
      return resultData;
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, isSubmitted, isSubmitting]);

  const retakeMistakes = useCallback(() => {
    if (!results?.reviewItems) return;
    const correctedAnswers = { ...answers };
    results.reviewItems.forEach(item => {
      if (!item.is_correct) delete correctedAnswers[item.id];
    });
    setAnswers(correctedAnswers);
    setIsSubmitted(false);
    setResults(null);
  }, [results, answers]);

  const loadPastAttempt = useCallback((attempt) => {
    setResults(attempt.results);
    setAnswers(attempt.answers || {});
    setIsSubmitted(true);
  }, []);

  return {
    answers,
    activeTeil,
    setActiveTeil,
    activeQuestionIndex,
    isSubmitted,
    isSubmitting,
    results,
    scrollTargetId,
    setScrollTargetId,
    resetSession,
    selectAnswer,
    jumpToQuestion,
    submitCurrentExam,
    retakeMistakes,
    loadPastAttempt,
  };
}
