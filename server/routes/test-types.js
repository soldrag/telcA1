import { Router } from 'express';
import { TEST_TYPES } from '../../shared/testTypes.js';

export function createTestTypesRouter() {
  const router = Router();

  router.get('/', (req, res) => {
    res.json({ testTypes: TEST_TYPES });
  });

  return router;
}
