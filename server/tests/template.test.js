const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Template = require('../models/Template');
const User = require('../models/User');
const { setupTestDatabase, cleanupTestDatabase } = require('./testUtils');

describe('Template API', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    await setupTestDatabase();
    
    // Create test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'developer'
    });

    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    await cleanupTestDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Template.deleteMany({});
  });

  describe('POST /api/templates', () => {
    it('should create a new template', async () => {
      const templateData = {
        name: 'Test Template',
        description: 'A test template',
        code: 'console.log("Hello World");',
        version: '1.0.0',
        category: 'utility',
        parameters: [
          {
            name: 'message',
            type: 'string',
            description: 'Message to log',
            required: true
          }
        ],
        dependencies: [
          {
            name: 'lodash',
            version: '4.17.21',
            type: 'npm'
          }
        ],
        tags: ['test', 'utility']
      };

      const res = await request(app)
        .post('/api/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(templateData);

      expect(res.status).toBe(201);
      expect(res.body.name).toBe(templateData.name);
      expect(res.body.author).toBe(testUser._id.toString());
    });

    it('should validate template data', async () => {
      const invalidTemplateData = {
        name: 'T', // Too short
        description: 'D', // Too short
        version: 'invalid' // Invalid format
      };

      const res = await request(app)
        .post('/api/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTemplateData);

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('GET /api/templates', () => {
    it('should get all templates', async () => {
      // Create test templates
      await Template.create([
        {
          name: 'Template 1',
          description: 'First template',
          code: 'console.log("1");',
          version: '1.0.0',
          category: 'utility',
          author: testUser._id
        },
        {
          name: 'Template 2',
          description: 'Second template',
          code: 'console.log("2");',
          version: '1.0.0',
          category: 'utility',
          author: testUser._id
        }
      ]);

      const res = await request(app)
        .get('/api/templates')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.templates).toHaveLength(2);
    });

    it('should filter templates by category', async () => {
      // Create test templates
      await Template.create([
        {
          name: 'Template 1',
          description: 'First template',
          code: 'console.log("1");',
          version: '1.0.0',
          category: 'utility',
          author: testUser._id
        },
        {
          name: 'Template 2',
          description: 'Second template',
          code: 'console.log("2");',
          version: '1.0.0',
          category: 'strategy',
          author: testUser._id
        }
      ]);

      const res = await request(app)
        .get('/api/templates?category=utility')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.templates).toHaveLength(1);
      expect(res.body.templates[0].category).toBe('utility');
    });
  });

  describe('GET /api/templates/:id', () => {
    it('should get a template by ID', async () => {
      const template = await Template.create({
        name: 'Test Template',
        description: 'A test template',
        code: 'console.log("Hello World");',
        version: '1.0.0',
        category: 'utility',
        author: testUser._id
      });

      const res = await request(app)
        .get(`/api/templates/${template._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body._id).toBe(template._id.toString());
    });

    it('should return 404 for non-existent template', async () => {
      const res = await request(app)
        .get('/api/templates/123456789012')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/templates/:id', () => {
    it('should update a template', async () => {
      const template = await Template.create({
        name: 'Test Template',
        description: 'A test template',
        code: 'console.log("Hello World");',
        version: '1.0.0',
        category: 'utility',
        author: testUser._id
      });

      const updateData = {
        name: 'Updated Template',
        description: 'An updated template',
        version: '1.1.0'
      };

      const res = await request(app)
        .put(`/api/templates/${template._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe(updateData.name);
      expect(res.body.description).toBe(updateData.description);
      expect(res.body.version).toBe(updateData.version);
    });

    it('should not allow unauthorized updates', async () => {
      const template = await Template.create({
        name: 'Test Template',
        description: 'A test template',
        code: 'console.log("Hello World");',
        version: '1.0.0',
        category: 'utility',
        author: new mongoose.Types.ObjectId() // Different user
      });

      const res = await request(app)
        .put(`/api/templates/${template._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Template' });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/templates/:id', () => {
    it('should delete a template', async () => {
      const template = await Template.create({
        name: 'Test Template',
        description: 'A test template',
        code: 'console.log("Hello World");',
        version: '1.0.0',
        category: 'utility',
        author: testUser._id
      });

      const res = await request(app)
        .delete(`/api/templates/${template._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);

      const deletedTemplate = await Template.findById(template._id);
      expect(deletedTemplate).toBeNull();
    });

    it('should not allow unauthorized deletion', async () => {
      const template = await Template.create({
        name: 'Test Template',
        description: 'A test template',
        code: 'console.log("Hello World");',
        version: '1.0.0',
        category: 'utility',
        author: new mongoose.Types.ObjectId() // Different user
      });

      const res = await request(app)
        .delete(`/api/templates/${template._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/templates/:id/generate', () => {
    it('should generate code from template', async () => {
      const template = await Template.create({
        name: 'Test Template',
        description: 'A test template',
        code: 'console.log("{{message}}");',
        version: '1.0.0',
        category: 'utility',
        parameters: [
          {
            name: 'message',
            type: 'string',
            description: 'Message to log',
            required: true
          }
        ],
        author: testUser._id
      });

      const res = await request(app)
        .post(`/api/templates/${template._id}/generate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parameters: {
            message: 'Hello World'
          }
        });

      expect(res.status).toBe(200);
      expect(res.body.code).toBe('console.log("Hello World");');
    });

    it('should validate parameters', async () => {
      const template = await Template.create({
        name: 'Test Template',
        description: 'A test template',
        code: 'console.log("{{message}}");',
        version: '1.0.0',
        category: 'utility',
        parameters: [
          {
            name: 'message',
            type: 'string',
            description: 'Message to log',
            required: true
          }
        ],
        author: testUser._id
      });

      const res = await request(app)
        .post(`/api/templates/${template._id}/generate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parameters: {} // Missing required parameter
        });

      expect(res.status).toBe(400);
    });
  });
}); 