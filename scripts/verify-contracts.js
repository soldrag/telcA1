#!/usr/bin/env node
/**
 * Static Architectural Contract Validator.
 * Verifies that all ports, hooks, DTO builders, and method calls satisfy declared contracts.
 * Exits with code 1 on any violation to block faulty production builds.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  timerContract,
  sessionContract,
  loaderContract,
  assignmentContract,
  screenContracts,
} from '../src/contracts/index.js';
import { buildScreenProps } from '../src/utils/appPropsBuilder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.resolve(__dirname, '../src');

function validateContractObject(name, obj, contract, errors) {
  if (!obj || typeof obj !== 'object') {
    errors.push(`[${name}] Must return a valid object.`);
    return;
  }
  for (const method of contract.requiredMethods) {
    if (typeof obj[method] !== 'function') {
      errors.push(`[${name}] Missing required method '${method}'.`);
    }
  }
  for (const prop of contract.requiredProperties) {
    if (!(prop in obj)) {
      errors.push(`[${name}] Missing required property '${prop}'.`);
    }
  }
}

function validateScreenProps(errors) {
  const mockController = {
    screen: 'welcome',
    exams: [],
    testTypes: [],
    activeTestType: 'lesen',
    currentExamId: 'modellsatz-1',
    examData: { exam: { id: 'modellsatz-1', test_type: 'lesen' }, questions: [] },
    isLoadingExam: false,
    session: { answers: {}, results: null, answeredCount: 0, isSubmitted: false },
    timer: { isTimed: true, totalSeconds: 1500, secondsLeft: 1500, secondsElapsed: 0, isPaused: false },
    history: { recentAttempts: [], historyAttempts: [], historyLoading: false },
    reviewMode: { isTeacherReview: false },
    assignmentMode: { isAssignmentMode: false, assignmentData: null, lockoutState: null },
    modals: {},
  };

  const props = buildScreenProps(mockController);
  for (const [screen, requiredKeys] of Object.entries(screenContracts)) {
    const screenProp = props[screen];
    if (!screenProp) {
      errors.push(`[screenContracts] buildScreenProps does not provide props for screen '${screen}'.`);
      continue;
    }
    for (const key of requiredKeys) {
      if (!(key in screenProp)) {
        errors.push(`[screenContracts] Screen '${screen}' props missing key '${key}'.`);
      }
    }
  }
}

function scanCallsInFile(filePath, regex, contract, errors) {
  const content = fs.readFileSync(filePath, 'utf8');
  let match;
  while ((match = regex.exec(content)) !== null) {
    const methodName = match[1];
    if (!contract.requiredMethods.includes(methodName)) {
      errors.push(
        `[${contract.name} VIOLATION] ${path.relative(SRC_DIR, filePath)} calls unauthorized method '${methodName}'.`
      );
    }
  }
}

function scanDirectoryForContractCalls(errors) {
  const hooksDir = path.join(SRC_DIR, 'hooks');
  const files = fs.readdirSync(hooksDir).filter((f) => f.endsWith('.js'));

  const patterns = [
    { regex: /timer(?:\.|\?\.)([a-zA-Z0-9_]+)\s*\(/g, contract: timerContract },
    { regex: /session(?:\.|\?\.)([a-zA-Z0-9_]+)\s*\(/g, contract: sessionContract },
    { regex: /loader(?:\.|\?\.)([a-zA-Z0-9_]+)\s*\(/g, contract: loaderContract },
    { regex: /assignmentMode(?:\.|\?\.)([a-zA-Z0-9_]+)\s*\(/g, contract: assignmentContract },
  ];

  for (const file of files) {
    const fullPath = path.join(hooksDir, file);
    for (const { regex, contract } of patterns) {
      scanCallsInFile(fullPath, regex, contract, errors);
    }
  }
}

function runVerification() {
  console.log('🔍 Validating architecture and interface contracts...');
  const errors = [];

  validateScreenProps(errors);
  scanDirectoryForContractCalls(errors);

  if (errors.length > 0) {
    console.error('\n❌ BUILD FAILED: Contract Violations Detected:');
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    console.error('\nFix the broken contracts before assembling production artifacts.\n');
    process.exit(1);
  }

  console.log('✔ All architectural contracts and DTOs verified successfully.');
  process.exit(0);
}

runVerification();
