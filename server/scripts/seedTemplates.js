require('dotenv').config();
const mongoose = require('mongoose');
const sampleTemplate = require('../templates/sample');
const Template = require('../models/Template');
const User = require('../models/User');
const logger = require('../utils/logger');

const seedTemplates = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });

    logger.info('Connected to MongoDB');

    // Find or create admin user
    let admin = await User.findOne({ email: 'admin@example.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
      logger.info('Created admin user');
    }

    // Check if template already exists
    const existingTemplate = await Template.findOne({ 
      name: sampleTemplate.metadata.name 
    });

    if (existingTemplate) {
      logger.info('Template already exists, skipping...');
      process.exit(0);
    }

    // Create template
    const template = await Template.create({
      ...sampleTemplate.metadata,
      code: sampleTemplate.code,
      parameters: Object.values(sampleTemplate.parameters),
      dependencies: sampleTemplate.dependencies,
      author: admin._id
    });

    logger.info(`Created template: ${template._id}`);

    // Create initial version
    const version = new TemplateVersion({
      template: template._id,
      version: template.version,
      changes: 'Initial version',
      code: template.code,
      parameters: template.parameters,
      dependencies: template.dependencies,
      author: admin._id
    });

    await version.save();
    logger.info(`Created template version: ${version._id}`);

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding templates:', error);
    process.exit(1);
  }
};

seedTemplates(); 