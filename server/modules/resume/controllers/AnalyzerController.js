import fs from 'fs';
import ResumeAnalysisOrchestrator from '../services/ResumeAnalysisOrchestrator.js';
import ResumeAnalysisRepository from '../repositories/ResumeAnalysisRepository.js';
import logger from '../../../utils/logger.js';
import ResumeAnalysisError, { ErrorCategories } from '../errors/ResumeAnalysisError.js';
import quotaService from '../../ai/services/quotaService.js';

const repository = new ResumeAnalysisRepository();

export const analyzeResume = async (req, res) => {
  try {
    const userId = req.authTokenData.id;
    const { targetRole, targetCompany, jobDescription } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Resume document is required.' });
    }

    // Input Validation & Bounds Checking
    if (!targetRole || typeof targetRole !== 'string' || targetRole.length > 100) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ error: 'Target role is required and must be under 100 characters.' });
    }
    
    if (targetCompany && (typeof targetCompany !== 'string' || targetCompany.length > 100)) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ error: 'Target company must be under 100 characters.' });
    }
    
    if (jobDescription && (typeof jobDescription !== 'string' || jobDescription.length > 3000)) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ error: 'Job description must be under 3000 characters.' });
    }

    logger.info('Received resume analysis request', { userId, targetRole });

    // The file is now on disk
    const filePath = file.path;
    const mimetype = file.mimetype;
    const originalName = file.originalname;

    try {
      const analysis = await ResumeAnalysisOrchestrator.executeAnalysis(
        userId,
        filePath,
        mimetype,
        originalName,
        targetRole,
        targetCompany,
        jobDescription
      );

      res.status(200).json({
        message: 'Resume analyzed successfully',
        data: analysis
      });
    } finally {
      // Secure cleanup of temporary file
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupError) {
        logger.error('Failed to clean up temporary resume file', { filePath, error: cleanupError.message });
      }
    }
  } catch (error) {
    if (req.aiQuotaKey) quotaService.releaseQuota(req.aiQuotaKey).catch(console.error);
    if (error instanceof ResumeAnalysisError) {
      // Log the categorized error so we can see the internalDetails
      logger.error('Categorized Resume Analysis Error', { 
        category: error.category, 
        internalDetails: error.internalDetails, 
        message: error.message 
      });
      // Handle categorized errors gracefully
      const statusCode = error.category === ErrorCategories.VALIDATION_ERROR ? 400 : 500;
      return res.status(statusCode).json({ 
        error: error.userMessage,
        category: error.category
      });
    }

    // Fallback for unhandled internal errors
    logger.error('Unhandled Analyze Resume Error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'An unexpected internal error occurred. Please try again later.' });
  }
};

export const getHistory = async (req, res) => {
  try {
    const userId = req.authTokenData.id;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10)); // Max 50 per page
    const skip = (page - 1) * limit;

    // Lazy Cleanup: Identify jobs stuck in 'processing' for > 5 mins and fail them
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const staleDocs = await repository.model.updateMany(
      { userId, status: 'processing', updatedAt: { $lt: fiveMinutesAgo } },
      { $set: { status: 'failed', 'executionInfo.failureReason': 'Analysis timed out or server crashed during generation.' } }
    );

    if (staleDocs.modifiedCount > 0) {
      logger.info(`Lazy cleanup: Marked ${staleDocs.modifiedCount} stale analysis jobs as failed for user ${userId}`);
    }

    const history = await repository.findByUserId(userId, skip, limit);
    res.status(200).json({ data: history, page, limit });
  } catch (error) {
    logger.error('Get Resume Analysis History Error', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
};

export const getAnalysisById = async (req, res) => {
  try {
    const userId = req.authTokenData.id;
    const analysisId = req.params.id;

    const analysis = await repository.findByIdAndUser(analysisId, userId);
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.status(200).json({ data: analysis });
  } catch (error) {
    logger.error('Get Analysis By ID Error', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch analysis.' });
  }
};

export const getAnalysisStatus = async (req, res) => {
  try {
    const userId = req.authTokenData.id;
    const analysisId = req.params.id;

    const analysis = await repository.findByIdAndUser(analysisId, userId);
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.status(200).json({ 
      data: {
        status: analysis.status,
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt
      } 
    });
  } catch (error) {
    logger.error('Get Analysis Status Error', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch status.' });
  }
};

export const deleteAnalysis = async (req, res) => {
  try {
    const userId = req.authTokenData.id;
    const analysisId = req.params.id;

    const analysis = await repository.findByIdAndUser(analysisId, userId);
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    await repository.model.findByIdAndDelete(analysisId);
    logger.info('Deleted resume analysis', { analysisId, userId });

    res.status(200).json({ message: 'Analysis deleted successfully' });
  } catch (error) {
    logger.error('Delete Analysis Error', { error: error.message });
    res.status(500).json({ error: 'Failed to delete analysis.' });
  }
};

export const retryAnalysis = async (req, res) => {
  try {
    const userId = req.authTokenData.id;
    const analysisId = req.params.id;

    // Fetch the existing failed analysis
    const existingAnalysis = await repository.findByIdAndUser(analysisId, userId);
    if (!existingAnalysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    if (existingAnalysis.status === 'completed') {
      return res.status(400).json({ error: 'This analysis is already completed. Use /reanalyze instead.' });
    }

    const { targetRole, targetCompany, jobDescription } = existingAnalysis.targetParams;

    logger.info('Retrying failed resume analysis', { userId, analysisId, targetRole });

    // Re-use executeReanalysis since it skips file upload and uses the persisted text
    const newAnalysis = await ResumeAnalysisOrchestrator.executeReanalysis(
      userId,
      analysisId,
      targetRole,
      targetCompany,
      jobDescription
    );

    res.status(200).json({
      message: 'Resume retry successful',
      data: newAnalysis
    });
  } catch (error) {
    if (error instanceof ResumeAnalysisError) {
      const statusCode = error.category === ErrorCategories.VALIDATION_ERROR ? 400 : 500;
      return res.status(statusCode).json({ 
        error: error.userMessage,
        category: error.category
      });
    }

    if (error.message.includes('not store extracted text')) {
      return res.status(400).json({ error: 'Cannot retry: The original extracted text was not stored. Please upload the resume again.' });
    }
    
    logger.error('Unhandled Retry Resume Error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'An unexpected internal error occurred during retry. Please try again later.' });
  }
};

export const reanalyzeResume = async (req, res) => {
  try {
    const userId = req.authTokenData.id;
    const analysisId = req.params.id;
    const { targetRole, targetCompany, jobDescription } = req.body;

    // Input Validation & Bounds Checking
    if (!targetRole || typeof targetRole !== 'string' || targetRole.length > 100) {
      return res.status(400).json({ error: 'Target role is required and must be under 100 characters.' });
    }
    
    if (targetCompany && (typeof targetCompany !== 'string' || targetCompany.length > 100)) {
      return res.status(400).json({ error: 'Target company must be under 100 characters.' });
    }
    
    if (jobDescription && (typeof jobDescription !== 'string' || jobDescription.length > 3000)) {
      return res.status(400).json({ error: 'Job description must be under 3000 characters.' });
    }

    logger.info('Received re-analysis request', { userId, analysisId, targetRole });

    const newAnalysis = await ResumeAnalysisOrchestrator.executeReanalysis(
      userId,
      analysisId,
      targetRole,
      targetCompany,
      jobDescription
    );

    res.status(200).json({
      message: 'Resume re-analyzed successfully',
      data: newAnalysis
    });
  } catch (error) {
    if (req.aiQuotaKey) quotaService.releaseQuota(req.aiQuotaKey).catch(console.error);
    if (error instanceof ResumeAnalysisError) {
      const statusCode = error.category === ErrorCategories.VALIDATION_ERROR ? 400 : 500;
      return res.status(statusCode).json({ 
        error: error.userMessage,
        category: error.category
      });
    }

    if (error.message.includes('not store extracted text')) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === 'Analysis not found') {
      return res.status(404).json({ error: error.message });
    }
    
    logger.error('Unhandled Reanalyze Resume Error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'An unexpected internal error occurred. Please try again later.' });
  }
};
