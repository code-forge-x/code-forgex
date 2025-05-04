const TestHelper = require('../helpers/testHelper');
const requirementsService = require('../../services/requirementsService');
const logger = require('../../utils/logger');

describe('RequirementsService', () => {
  beforeAll(async () => {
    await TestHelper.setupTestEnvironment();
  });

  afterAll(async () => {
    await TestHelper.teardownTestEnvironment();
  });

  beforeEach(async () => {
    await TestHelper.clearMongoDB();
    await TestHelper.clearTimescaleDB();
    await TestHelper.clearMilvus();
  });

  describe('collectRequirements', () => {
    it('should collect and store requirements successfully', async () => {
      const project = TestHelper.generateTestProject();
      const requirements = TestHelper.generateTestRequirements();

      const result = await requirementsService.collectRequirements(project, requirements);

      expect(result).toBeDefined();
      expect(result.requirements).toBeDefined();
      expect(result.analysis).toBeDefined();
      expect(result.validation).toBeDefined();
      expect(result.validation.isValid).toBe(true);
    });

    it('should handle invalid requirements', async () => {
      const project = TestHelper.generateTestProject();
      const invalidRequirements = {
        components: [
          {
            name: '', // Invalid: empty name
            type: 'api',
            description: 'Test component'
          }
        ]
      };

      await expect(requirementsService.collectRequirements(project, invalidRequirements))
        .rejects
        .toThrow();
    });
  });

  describe('analyzeRequirements', () => {
    it('should analyze requirements correctly', async () => {
      const requirements = TestHelper.generateTestRequirements();

      const analysis = await requirementsService.analyzeRequirements(requirements);

      expect(analysis).toBeDefined();
      expect(analysis.components).toHaveLength(2);
      expect(analysis.dependencies).toBeDefined();
      expect(analysis.patterns).toBeDefined();
      expect(analysis.complexity).toBeDefined();
    });

    it('should handle empty requirements', async () => {
      const emptyRequirements = { components: [] };

      const analysis = await requirementsService.analyzeRequirements(emptyRequirements);

      expect(analysis).toBeDefined();
      expect(analysis.components).toHaveLength(0);
      expect(analysis.dependencies).toHaveLength(0);
      expect(analysis.patterns).toHaveLength(0);
    });
  });

  describe('validateRequirements', () => {
    it('should validate requirements correctly', async () => {
      const requirements = TestHelper.generateTestRequirements();
      const analysis = await requirementsService.analyzeRequirements(requirements);

      const validation = await requirementsService.validateRequirements(analysis);

      expect(validation).toBeDefined();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect invalid components', async () => {
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

      const validation = await requirementsService.validateRequirements(invalidAnalysis);

      expect(validation).toBeDefined();
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('structureRequirements', () => {
    it('should structure requirements correctly', async () => {
      const requirements = TestHelper.generateTestRequirements();
      const analysis = await requirementsService.analyzeRequirements(requirements);

      const structured = await requirementsService.structureRequirements(analysis);

      expect(structured).toBeDefined();
      expect(structured.components).toHaveLength(2);
      expect(structured.dependencies).toBeDefined();
      expect(structured.patterns).toBeDefined();
      expect(structured.metadata).toBeDefined();
      expect(structured.metadata.complexity).toBeDefined();
      expect(structured.metadata.createdAt).toBeDefined();
    });
  });

  describe('storeRequirements', () => {
    it('should store requirements successfully', async () => {
      const project = TestHelper.generateTestProject();
      const requirements = TestHelper.generateTestRequirements();
      const analysis = await requirementsService.analyzeRequirements(requirements);
      const structured = await requirementsService.structureRequirements(analysis);

      const stored = await requirementsService.storeRequirements(project, structured);

      expect(stored).toBeDefined();
      expect(stored.project).toBeDefined();
      expect(stored.requirements).toBeDefined();
      expect(stored.embeddings).toBeDefined();
    });
  });
});