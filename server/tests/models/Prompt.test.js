const mongoose = require('mongoose');
const Prompt = require('../../models/Prompt');
const User = require('../../models/User');

describe('Prompt Model', () => {
  let user;

  beforeAll(async () => {
    // Create a test user
    user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    await user.save();
  });

  it('should create a new prompt successfully', async () => {
    const promptData = {
      template_id: 'test-template-1',
      name: 'Test Prompt',
      content: 'This is a test prompt',
      version: '1.0.0',
      categories: ['test'],
      roles: ['user'],
      parameters: [{
        name: 'testParam',
        type: 'string',
        required: true,
        description: 'Test parameter'
      }],
      createdBy: user._id
    };

    const prompt = new Prompt(promptData);
    const savedPrompt = await prompt.save();

    expect(savedPrompt._id).toBeDefined();
    expect(savedPrompt.template_id).toBe(promptData.template_id);
    expect(savedPrompt.name).toBe(promptData.name);
    expect(savedPrompt.content).toBe(promptData.content);
    expect(savedPrompt.version).toBe(promptData.version);
    expect(savedPrompt.categories).toEqual(promptData.categories);
    expect(savedPrompt.roles).toEqual(promptData.roles);
    expect(savedPrompt.parameters).toHaveLength(1);
    expect(savedPrompt.createdBy.toString()).toBe(user._id.toString());
  });

  it('should not create a prompt with duplicate template_id', async () => {
    const promptData = {
      template_id: 'test-template-2',
      name: 'Test Prompt',
      content: 'This is a test prompt',
      version: '1.0.0',
      createdBy: user._id
    };

    const prompt1 = new Prompt(promptData);
    await prompt1.save();

    const prompt2 = new Prompt(promptData);
    await expect(prompt2.save()).rejects.toThrow();
  });

  it('should update version history when content changes', async () => {
    const prompt = new Prompt({
      template_id: 'test-template-3',
      name: 'Test Prompt',
      content: 'Initial content',
      version: '1.0.0',
      createdBy: user._id
    });

    await prompt.save();
    prompt.content = 'Updated content';
    const updatedPrompt = await prompt.save();

    expect(updatedPrompt.version_history).toHaveLength(1);
    expect(updatedPrompt.version_history[0].version).toBe('1.0.0');
    expect(updatedPrompt.version_history[0].changes).toBe('Content or parameters updated');
  });

  it('should validate parameter types', async () => {
    const prompt = new Prompt({
      template_id: 'test-template-4',
      name: 'Test Prompt',
      content: 'Test content',
      version: '1.0.0',
      parameters: [{
        name: 'testParam',
        type: 'invalid_type',
        required: true
      }],
      createdBy: user._id
    });

    await expect(prompt.save()).rejects.toThrow();
  });

  it('should validate dependencies', async () => {
    const prompt1 = new Prompt({
      template_id: 'test-template-5',
      name: 'Test Prompt 1',
      content: 'Test content 1',
      version: '1.0.0',
      createdBy: user._id
    });

    const prompt2 = new Prompt({
      template_id: 'test-template-6',
      name: 'Test Prompt 2',
      content: 'Test content 2',
      version: '1.0.0',
      dependencies: [prompt1._id],
      createdBy: user._id
    });

    await prompt1.save();
    const savedPrompt2 = await prompt2.save();

    expect(savedPrompt2.dependencies).toHaveLength(1);
    expect(savedPrompt2.dependencies[0].toString()).toBe(prompt1._id.toString());
  });
});