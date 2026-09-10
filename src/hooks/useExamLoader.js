import { useState, useEffect, useCallback } from 'react';
import {
  fetchExams as defaultFetchExams,
  fetchExamDetails as defaultFetchExamDetails,
  fetchTestTypes as defaultFetchTestTypes
} from '../services/api.js';
import { sortExamsNumerically } from '../utils/examFormat.js';

export function useExamLoader({
  api = {
    fetchExams: defaultFetchExams,
    fetchExamDetails: defaultFetchExamDetails,
    fetchTestTypes: defaultFetchTestTypes,
  },
  onError,
} = {}) {
  const [exams, setExams] = useState([]);
  const [testTypes, setTestTypes] = useState([]);
  const [activeTestType, setActiveTestType] = useState('lesen');
  const [currentExamId, setCurrentExamId] = useState('modellsatz-1');
  const [examData, setExamData] = useState(null);

  useEffect(() => {
    api.fetchTestTypes()
      .then((response) => setTestTypes(response.testTypes || []))
      .catch(() => onError?.('Не удалось загрузить список модулей'));

    api.fetchExams(activeTestType)
      .then((response) => {
        if (!response.exams?.length) return;
        const sorted = sortExamsNumerically(response.exams);
        setExams(sorted);
        setCurrentExamId(sorted[0].id);
      })
      .catch(() => onError?.('Не удалось загрузить варианты'));
  }, [activeTestType, api, onError]);

  const loadExamById = useCallback(async (examId) => {
    try {
      const data = await api.fetchExamDetails(examId);
      setExamData(data);
      return data;
    } catch {
      onError?.(`Ошибка при загрузке теста ${examId}`);
      return null;
    }
  }, [api, onError]);

  useEffect(() => {
    if (currentExamId) {
      loadExamById(currentExamId);
    }
  }, [currentExamId, loadExamById]);

  const changeTestType = useCallback((typeId) => {
    setActiveTestType(typeId);
  }, []);

  const selectExam = useCallback((examId) => {
    setCurrentExamId(examId);
  }, []);

  return {
    exams,
    testTypes,
    activeTestType,
    currentExamId,
    examData,
    changeTestType,
    selectExam,
    loadExamById,
  };
}
