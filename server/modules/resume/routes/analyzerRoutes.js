import express from 'express';
import { 
  analyzeResume, 
  getHistory,
  getAnalysisById,
  getAnalysisStatus,
  deleteAnalysis,
  retryAnalysis,
  reanalyzeResume
} from '../controllers/AnalyzerController.js';
import isUserAuth from '../../../middlewares/isUserAuth.js';
import { handleAnalyzerUpload } from '../../../middlewares/upload.js';
import { analysisLimiter } from '../../../middlewares/rateLimiter.js';
import { aiQuotaLimiter } from '../../../middlewares/aiQuotaLimiter.js';
import { aiGlobalLimiter } from '../../../middlewares/aiGlobalLimiter.js';

const router = express.Router();

// Require authentication for all routes
router.use(isUserAuth);

// Collection level routes
router.get('/history', getHistory);
router.post('/analyze', analysisLimiter, aiGlobalLimiter, aiQuotaLimiter('resume'), handleAnalyzerUpload, analyzeResume);

// Individual analysis routes
router.get('/:id', getAnalysisById);
router.get('/:id/status', getAnalysisStatus);
router.delete('/:id', deleteAnalysis);

// Action routes
router.post('/:id/retry', retryAnalysis);
router.post('/:id/reanalyze', aiGlobalLimiter, aiQuotaLimiter('resume'), reanalyzeResume);

export default router;
