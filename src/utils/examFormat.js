export function getExamNumber(examId = '') {
  if (!examId) return 0;
  const match = String(examId).match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

export function formatExamName(examId = '') {
  const num = getExamNumber(examId);
  return num ? `Modellsatz ${num}` : String(examId);
}

export function sortExamsNumerically(exams = []) {
  if (!Array.isArray(exams) || exams.length === 0) return [];
  return [...exams].sort((examA, examB) => getExamNumber(examA.id) - getExamNumber(examB.id));
}
