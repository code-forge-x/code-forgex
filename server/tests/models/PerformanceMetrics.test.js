const mongoose = require('mongoose');
const PerformanceMetrics = require('../../models/PerformanceMetrics');
const Prompt = require('../../models/Prompt');
const User = require('../../models/User');

describe('PerformanceMetrics Model', () => {
  let user;
  let prompt;

  beforeAll(async () => {
    // Create a test user
    user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    await user.save();

    // Create a test prompt
    prompt = new Prompt({
      template_id: 'test-template-1',
      name: 'Test Prompt',
      content: 'Test content',
      version: '1.0.0',
      createdBy: user._id
    });
    await prompt.save();
  });

  it('should create a new performance metric successfully', async () => {
    const metricData = {
      prompt_id: prompt._id,
      timestamp: new Date(),
      success_rate: 0.95,
      token_usage: 100,
      response_time: 500,
      error_count: 0,
      user_id: user._id,
      environment: 'development',
      metadata: {
        method: 'POST',
        path: '/api/prompts',
        statusCode: 200
      }
    };

    const metric = new PerformanceMetrics(metricData);
    const savedMetric = await metric.save();

    expect(savedMetric._id).toBeDefined();
    expect(savedMetric.prompt_id.toString()).toBe(prompt._id.toString());
    expect(savedMetric.success_rate).toBe(metricData.success_rate);
    expect(savedMetric.token_usage).toBe(metricData.token_usage);
    expect(savedMetric.response_time).toBe(metricData.response_time);
    expect(savedMetric.error_count).toBe(metricData.error_count);
    expect(savedMetric.user_id.toString()).toBe(user._id.toString());
    expect(savedMetric.environment).toBe(metricData.environment);
  });

  it('should set default timestamp if not provided', async () => {
    const metricData = {
      prompt_id: prompt._id,
      success_rate: 0.95,
      token_usage: 100,
      response_time: 500,
      user_id: user._id
    };

    const metric = new PerformanceMetrics(metricData);
    const savedMetric = await metric.save();

    expect(savedMetric.timestamp).toBeDefined();
    expect(savedMetric.timestamp instanceof Date).toBe(true);
  });

  it('should validate environment enum', async () => {
    const metricData = {
      prompt_id: prompt._id,
      success_rate: 0.95,
      token_usage: 100,
      response_time: 500,
      user_id: user._id,
      environment: 'invalid_environment'
    };

    const metric = new PerformanceMetrics(metricData);
    await expect(metric.save()).rejects.toThrow();
  });

  it('should validate success rate range', async () => {
    const metricData = {
      prompt_id: prompt._id,
      success_rate: 1.5, // Invalid success rate
      token_usage: 100,
      response_time: 500,
      user_id: user._id
    };

    const metric = new PerformanceMetrics(metricData);
    await expect(metric.save()).rejects.toThrow();
  });

  it('should validate required fields', async () => {
    const metricData = {
      // Missing required fields
      success_rate: 0.95,
      token_usage: 100
    };

    const metric = new PerformanceMetrics(metricData);
    await expect(metric.save()).rejects.toThrow();
  });
});