const codeAnalysisService = require('../services/codeAnalysisService');
const { validateRequest } = require('../middleware/validation');
const logger = require('../utils/logger');

class CodeAnalysisController {
  async analyzeCode(req, res) {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({
          error: 'Code is required'
        });
      }

      const analysis = await codeAnalysisService.analyzeCode(code);

      logger.info('Code analysis completed successfully', {
        metrics: analysis.metrics,
        issueCount: analysis.issues.length
      });

      res.json(analysis);
    } catch (error) {
      logger.error('Code analysis failed', { error: error.message });
      res.status(500).json({
        error: 'Failed to analyze code',
        details: error.message
      });
    }
  }

  async getAnalysisHistory(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 10, offset = 0 } = req.query;

      // TODO: Implement analysis history retrieval from database
      const history = [];

      res.json({
        history,
        pagination: {
          total: history.length,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    } catch (error) {
      logger.error('Failed to retrieve analysis history', { error: error.message });
      res.status(500).json({
        error: 'Failed to retrieve analysis history',
        details: error.message
      });
    }
  }

  async saveAnalysis(req, res) {
    try {
      const { code, analysis, metadata } = req.body;

      if (!code || !analysis) {
        return res.status(400).json({
          error: 'Code and analysis are required'
        });
      }

      // TODO: Implement analysis saving to database
      const savedAnalysis = {
        id: Date.now(),
        code,
        analysis,
        metadata,
        timestamp: new Date().toISOString()
      };

      logger.info('Analysis saved successfully', {
        analysisId: savedAnalysis.id
      });

      res.status(201).json(savedAnalysis);
    } catch (error) {
      logger.error('Failed to save analysis', { error: error.message });
      res.status(500).json({
        error: 'Failed to save analysis',
        details: error.message
      });
    }
  }
}

module.exports = new CodeAnalysisController();