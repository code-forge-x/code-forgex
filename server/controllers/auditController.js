const AuditLog = require('../models/AuditLog');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

class AuditController {
  async getLogs(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        startDate,
        endDate,
        action,
        userId,
        entityType,
        entityId
      } = req.query;

      const query = {};

      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      if (action) query.action = action;
      if (userId) query.userId = userId;
      if (entityType) query.entityType = entityType;
      if (entityId) query.entityId = entityId;

      const total = await AuditLog.countDocuments(query);
      const logs = await AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      res.json({
        logs,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      logger.error('Error fetching audit logs:', error);
      res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  }

  async getStatistics(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const query = {};

      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      const [
        totalLogs,
        uniqueUsers,
        uniqueEntities,
        actions,
        hourlyDistribution,
        dailyDistribution
      ] = await Promise.all([
        AuditLog.countDocuments(query),
        AuditLog.distinct('userId', query),
        AuditLog.distinct('entityType', query),
        AuditLog.aggregate([
          { $match: query },
          { $group: { _id: '$action', count: { $sum: 1 } } },
          { $project: { action: '$_id', count: 1, _id: 0 } }
        ]),
        AuditLog.aggregate([
          { $match: query },
          {
            $group: {
              _id: { $hour: '$timestamp' },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } },
          { $project: { hour: '$_id', count: 1, _id: 0 } }
        ]),
        AuditLog.aggregate([
          { $match: query },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$timestamp'
                }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } },
          { $project: { date: '$_id', count: 1, _id: 0 } }
        ])
      ]);

      res.json({
        totalLogs,
        users: uniqueUsers.length,
        entities: uniqueEntities.length,
        actions,
        hourlyDistribution,
        dailyDistribution
      });
    } catch (error) {
      logger.error('Error fetching audit statistics:', error);
      res.status(500).json({ error: 'Failed to fetch audit statistics' });
    }
  }

  async getLogById(req, res) {
    try {
      const log = await AuditLog.findById(req.params.id);
      if (!log) {
        return res.status(404).json({ error: 'Audit log not found' });
      }
      res.json(log);
    } catch (error) {
      logger.error('Error fetching audit log:', error);
      res.status(500).json({ error: 'Failed to fetch audit log' });
    }
  }

  async exportToCSV(req, res) {
    try {
      const {
        startDate,
        endDate,
        action,
        userId,
        entityType,
        entityId
      } = req.query;

      const query = {};

      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      if (action) query.action = action;
      if (userId) query.userId = userId;
      if (entityType) query.entityType = entityType;
      if (entityId) query.entityId = entityId;

      const logs = await AuditLog.find(query).sort({ timestamp: -1 });

      const csv = [
        ['Timestamp', 'Action', 'User ID', 'Entity Type', 'Entity ID', 'IP Address', 'Changes', 'Metadata', 'Error']
      ];

      logs.forEach(log => {
        csv.push([
          log.timestamp.toISOString(),
          log.action,
          log.userId,
          log.entityType,
          log.entityId,
          log.ipAddress || '',
          JSON.stringify(log.changes || {}),
          JSON.stringify(log.metadata || {}),
          log.error || ''
        ]);
      });

      const csvString = csv.map(row => row.join(',')).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit_logs.csv');
      res.send(csvString);
    } catch (error) {
      logger.error('Error exporting audit logs:', error);
      res.status(500).json({ error: 'Failed to export audit logs' });
    }
  }
}

module.exports = new AuditController();