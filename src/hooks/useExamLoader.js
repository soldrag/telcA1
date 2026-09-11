import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchExams as defaultFetchExams,
  fetchExamDetails as defaultFetchExamDetails,
  fetchTestTypes as defaultFetchTestTypes
} from '../services/api.js';
import { sortExamsNumerically } from '../utils/examFormat.js';

const DEFAULT_API = {
  fetchExams: defaultFetchExams,
  fetchExamDetails: defaultFetchExamDetails,
  fetchTestTypes: defaultFetchTestTypes,
};

export function useExamLoader({
  api = DEFAULT_API,
  onError,
} = {}) {
  const [exams, setExams] = useState([]);
  const [testTypes, setTestTypes] = useState([]);
  const [activeTestType, setActiveTestType] = useState('lesen');
  const [currentExamId, setCurrentExamId] = useState('modellsatz-1');
  const [examData, setExamData] = useState(null);
  const [isLoadingExam, setIsLoadingExam] = useState(false);

  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const activeApi = api || DEFAULT_API;

  useEffect(() => {
    activeApi.fetchTestTypes()
      .then((response) => setTestTypes(response.testTypes || []))
      .catch(() => onErrorRef.current?.('Не удалось загрузить список модулей'));
  }, [activeApi]);

  useEffect(() => {
    activeApi.fetchExams(activeTestType)
      .then((response) => {
        if (!response.exams?.length) return;
        const sorted = sortExamsNumerically(response.exams);
        setExams(sorted);
        setCurrentExamId((prevId) => {
          if (sorted.some(exam => exam.id === prevId)) {
            return prevId;
          }
          return sorted[0].id;
        });
      })
      .catch(() => onErrorRef.current?.('Не удалось загрузить варианты'));
  }, [activeTestType, activeApi]);

  const loadExamById = useCallback(async (examId) => {
    setIsLoadingExam(true);
    try {
      const data = await activeApi.fetchExamDetails(examId);
      setExamData(data);
      return data;
    } catch {
      onErrorRef.current?.(`Ошибка при загрузке теста ${examId}`);
      return null;
    } finally {
      setIsLoadingExam(false);
    }
  }, [activeApi]);

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
    isLoadingExam,
    changeTestType,
    selectExam,
    loadExamById,
  };
}
