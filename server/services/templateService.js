const Template = require('../models/Template');
const TemplateVersion = require('../models/TemplateVersion');
const logger = require('../utils/logger');

class TemplateService {
  // Create a new template
  async createTemplate(data, userId) {
    try {
      const template = new Template({
        ...data,
        author: userId
      });

      await template.save();

      // Create initial version
      const version = new TemplateVersion({
        template: template._id,
        version: template.version,
        changes: 'Initial version',
        code: template.code,
        parameters: template.parameters,
        dependencies: template.dependencies,
        author: userId
      });

      await version.save();

      logger.info(`Template created: ${template._id}`);
      return template;
    } catch (error) {
      logger.error('Error creating template:', error);
      throw error;
    }
  }

  // Update a template
  async updateTemplate(id, data, userId) {
    try {
      const template = await Template.findById(id);
      
      if (!template) {
        throw new Error('Template not found');
      }

      // Check if user is author or admin
      if (template.author.toString() !== userId) {
        throw new Error('Not authorized');
      }

      // Update template
      Object.assign(template, data);
      await template.save();

      // Create new version if code or parameters changed
      if (data.code || data.parameters) {
        const version = new TemplateVersion({
          template: template._id,
          version: template.version,
          changes: data.changes || 'Updated template',
          code: template.code,
          parameters: template.parameters,
          dependencies: template.dependencies,
          author: userId
        });

        await version.save();
      }

      logger.info(`Template updated: ${template._id}`);
      return template;
    } catch (error) {
      logger.error('Error updating template:', error);
      throw error;
    }
  }

  // Get templates with pagination and filtering
  async getTemplates(query = {}, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const [templates, total] = await Promise.all([
        Template.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('author', 'name email')
          .lean(),
        Template.countDocuments(query)
      ]);

      return {
        templates,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      };
    } catch (error) {
      logger.error('Error getting templates:', error);
      throw error;
    }
  }

  // Get template by ID
  async getTemplate(id) {
    try {
      const template = await Template.findById(id)
        .populate('author', 'name email')
        .populate('performanceMetrics');

      if (!template) {
        throw new Error('Template not found');
      }

      return template;
    } catch (error) {
      logger.error('Error getting template:', error);
      throw error;
    }
  }

  // Delete template
  async deleteTemplate(id, userId) {
    try {
      const template = await Template.findById(id);
      
      if (!template) {
        throw new Error('Template not found');
      }

      // Check if user is author or admin
      if (template.author.toString() !== userId) {
        throw new Error('Not authorized');
      }

      await template.remove();
      await TemplateVersion.deleteMany({ template: template._id });

      logger.info(`Template deleted: ${template._id}`);
      return { message: 'Template deleted' };
    } catch (error) {
      logger.error('Error deleting template:', error);
      throw error;
    }
  }

  // Get template versions
  async getTemplateVersions(templateId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const [versions, total] = await Promise.all([
        TemplateVersion.find({ template: templateId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('author', 'name email')
          .lean(),
        TemplateVersion.countDocuments({ template: templateId })
      ]);

      return {
        versions,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      };
    } catch (error) {
      logger.error('Error getting template versions:', error);
      throw error;
    }
  }

  // Get specific version
  async getTemplateVersion(templateId, version) {
    try {
      const versionDoc = await TemplateVersion.findOne({ 
        template: templateId, 
        version 
      }).populate('author', 'name email');

      if (!versionDoc) {
        throw new Error('Version not found');
      }

      return versionDoc;
    } catch (error) {
      logger.error('Error getting template version:', error);
      throw error;
    }
  }

  // Generate code from template
  async generateCode(templateId, parameters) {
    try {
      const template = await Template.findById(templateId);
      
      if (!template) {
        throw new Error('Template not found');
      }

      // Validate parameters
      const validationErrors = template.validateParameters(parameters);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      // Generate code
      const generatedCode = template.generateCode(parameters);

      // Log generation
      logger.info(`Code generated from template: ${template._id}`);

      return {
        code: generatedCode,
        template: template._id,
        version: template.version
      };
    } catch (error) {
      logger.error('Error generating code:', error);
      throw error;
    }
  }
}

module.exports = new TemplateService(); 