import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchExams as defaultFetchExams,
  fetchExamDetails as defaultFetchExamDetails,
  fetchTestTypes as defaultFetchTestTypes
} from '../services/examService.js';
import { sortExamsNumerically } from '../utils/examFormat.js';
import { localModulePreference } from '../services/storage/modulePreferenceStorage.js';

const DEFAULT_API = {
  fetchExams: defaultFetchExams,
  fetchExamDetails: defaultFetchExamDetails,
  fetchTestTypes: defaultFetchTestTypes,
};

export function useExamLoader({
  api = DEFAULT_API,
  onError,
  modulePreference = localModulePreference,
} = {}) {
  const [exams, setExams] = useState([]);
  const [testTypes, setTestTypes] = useState([]);
  const [activeTestType, setActiveTestType] = useState(() => modulePreference.read());
  const [currentExamId, setCurrentExamId] = useState(null);
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
      .catch(() => onErrorRef.current?.('errors.loadModules'));
  }, [activeApi]);

  useEffect(() => {
    let isStale = false;
    activeApi.fetchExams(activeTestType)
      .then((response) => {
        if (isStale || !response.exams?.length) return;
        const sorted = sortExamsNumerically(response.exams);
        setExams(sorted);
        setCurrentExamId((prevId) => {
          if (sorted.some(exam => exam.id === prevId)) {
            return prevId;
          }
          return sorted[0].id;
        });
      })
      .catch(() => { if (!isStale) onErrorRef.current?.('errors.loadVariants'); });
    return () => { isStale = true; };
  }, [activeTestType, activeApi]);

  // Loads are not ordered: a late answer to an earlier request must not replace the exam the student started.
  const latestExamRequestRef = useRef(0);

  const loadExamById = useCallback(async (examId) => {
    const requestId = ++latestExamRequestRef.current;
    const isLatest = () => requestId === latestExamRequestRef.current;
    setIsLoadingExam(true);
    try {
      const data = await activeApi.fetchExamDetails(examId);
      if (isLatest()) setExamData(data);
      return data;
    } catch {
      if (isLatest()) onErrorRef.current?.('errors.loadExamFailed');
      return null;
    } finally {
      if (isLatest()) setIsLoadingExam(false);
    }
  }, [activeApi]);

  useEffect(() => {
    if (currentExamId) {
      loadExamById(currentExamId);
    }
  }, [currentExamId, loadExamById]);

  // A module opened by an assignment or review link is not the student's choice: only chooseTestType remembers it.
  const changeTestType = useCallback((typeId) => {
    setActiveTestType(typeId);
  }, []);

  const chooseTestType = useCallback((typeId) => {
    setActiveTestType(typeId);
    modulePreference.save(typeId);
  }, [modulePreference]);

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
    chooseTestType,
    selectExam,
    loadExamById,
  };
}
