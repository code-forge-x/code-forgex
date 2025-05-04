import axios from 'axios';

class AuditService {
  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async getLogs(options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options.page) params.append('page', options.page);
      if (options.limit) params.append('limit', options.limit);
      if (options.startDate) params.append('startDate', options.startDate.toISOString());
      if (options.endDate) params.append('endDate', options.endDate.toISOString());
      if (options.action) params.append('action', options.action);
      if (options.userId) params.append('userId', options.userId);
      if (options.entityType) params.append('entityType', options.entityType);
      if (options.entityId) params.append('entityId', options.entityId);

      const response = await this.api.get(`/audit/logs?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  }

  async getStatistics(options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options.startDate) params.append('startDate', options.startDate.toISOString());
      if (options.endDate) params.append('endDate', options.endDate.toISOString());

      const response = await this.api.get(`/audit/statistics?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching audit statistics:', error);
      throw error;
    }
  }

  async getLogById(logId) {
    try {
      const response = await this.api.get(`/audit/logs/${logId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching audit log:', error);
      throw error;
    }
  }

  async exportToCSV(options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options.startDate) params.append('startDate', options.startDate.toISOString());
      if (options.endDate) params.append('endDate', options.endDate.toISOString());
      if (options.action) params.append('action', options.action);
      if (options.userId) params.append('userId', options.userId);
      if (options.entityType) params.append('entityType', options.entityType);
      if (options.entityId) params.append('entityId', options.entityId);

      const response = await this.api.get(`/audit/export?${params.toString()}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      throw error;
    }
  }
}

export default new AuditService();