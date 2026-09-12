import { Router } from 'express';
import { TEST_TYPES } from '../../shared/testTypes.js';

export function createTestTypesRouter(database) {
  const router = Router();

  router.get('/', (req, res) => {
    let counts = {};
    if (database && typeof database.prepare === 'function') {
      try {
        const rows = database.prepare('SELECT test_type, COUNT(*) as count FROM exams GROUP BY test_type').all();
        counts = Object.fromEntries(rows.map(r => [r.test_type, r.count]));
      } catch {
        // Fallback to static values
      }
    }

    const testTypes = TEST_TYPES.map(type => ({
      ...type,
      variantsCount: counts[type.id] !== undefined ? counts[type.id] : (type.variantsCount ?? 0)
    }));

    res.json({ testTypes });
  });

  return router;
}
