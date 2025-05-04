const request = require('supertest');
const app = require('../../app');
const TestHelper = require('../helpers/testHelper');
const { generateToken } = require('../../utils/auth');

describe('Requirements Routes', () => {
  let testToken;
  let testUser;

  beforeAll(async () => {
    await TestHelper.setupTestEnvironment();
    testUser = TestHelper.generateTestUser();
    testToken = generateToken(testUser);
  });

  afterAll(async () => {
    await TestHelper.teardownTestEnvironment();
  });

  beforeEach(async () => {
    await TestHelper.clearMongoDB();
    await TestHelper.clearTimescaleDB();
    await TestHelper.clearMilvus();
  });

  describe('POST /api/requirements/collect', () => {
    it('should collect requirements successfully', async () => {
      const project = TestHelper.generateTestProject();
      const requirements = TestHelper.generateTestRequirements();

      const response = await request(app)
        .post('/api/requirements/collect')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ project, requirements });

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.requirements).toBeDefined();
      expect(response.body.analysis).toBeDefined();
      expect(response.body.validation).toBeDefined();
    });

    it('should return 401 without authentication', async () => {
      const project = TestHelper.generateTestProject();
      const requirements = TestHelper.generateTestRequirements();

      const response = await request(app)
        .post('/api/requirements/collect')
        .send({ project, requirements });

      expect(response.status).toBe(401);
    });

    it('should return 400 with invalid data', async () => {
      const invalidData = {
        project: { name: '' }, // Invalid: missing required fields
        requirements: { components: [] }
      };

      const response = await request(app)
        .post('/api/requirements/collect')
        .set('Authorization', `Bearer ${testToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/requirements/analyze', () => {
    it('should analyze requirements successfully', async () => {
      const requirements = TestHelper.generateTestRequirements();

      const response = await request(app)
        .post('/api/requirements/analyze')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ requirements });

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.components).toBeDefined();
      expect(response.body.dependencies).toBeDefined();
      expect(response.body.patterns).toBeDefined();
      expect(response.body.complexity).toBeDefined();
    });

    it('should return 401 without authentication', async () => {
      const requirements = TestHelper.generateTestRequirements();

      const response = await request(app)
        .post('/api/requirements/analyze')
        .send({ requirements });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/requirements/validate', () => {
    it('should validate requirements successfully', async () => {
      const requirements = TestHelper.generateTestRequirements();
      const analysis = await request(app)
        .post('/api/requirements/analyze')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ requirements });

      const response = await request(app)
        .post('/api/requirements/validate')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ analysis: analysis.body });

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.isValid).toBe(true);
      expect(response.body.errors).toHaveLength(0);
    });

    it('should detect invalid requirements', async () => {
      const invalidAnalysis = {
        components: [
          {
            name: '', // Invalid: empty name
            type: 'api',
            description: 'Test component'
          }
        ],
        dependencies: [],
        patterns: [],
        complexity: { score: 1, factors: [] }
      };

      const response = await request(app)
        .post('/api/requirements/validate')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ analysis: invalidAnalysis });

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.isValid).toBe(false);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 401 without authentication', async () => {
      const analysis = { components: [], dependencies: [], patterns: [], complexity: {} };

      const response = await request(app)
        .post('/api/requirements/validate')
        .send({ analysis });

      expect(response.status).toBe(401);
    });
  });
});