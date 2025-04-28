const Project = require('../../models/Project');
const claudeClient = require('../ai/claudeClient');

class BlueprintService {
  async generateBlueprint(projectId, requirements, techStack) {
    try {
      // Get project details
      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }
      
      // Build prompt for blueprint generation
      const prompt = this.buildBlueprintPrompt(project, requirements, techStack);
      
      // Call Claude API
      const response = await claudeClient.generateCompletion(prompt, 8000);
      
      // Extract JSON blueprint from text response
      const blueprintJson = this.extractJsonFromText(response.content);
      
      // Update project with blueprint
      project.blueprint = blueprintJson;
      project.status = 'blueprint_generated';
      project.updatedAt = new Date();
      await project.save();
      
      return {
        blueprint: blueprintJson,
        usage: response.usage
      };
    } catch (error) {
      console.error('Error generating blueprint:', error);
      throw error;
    }
  }
  
  buildBlueprintPrompt(project, requirements, techStack) {
    return `
You are an expert financial software architect specialized in trading systems. Please create a detailed blueprint for a new project based on these details:

Project Name: ${project.name}
Description: ${project.description}
Financial Domain: ${project.financialDomain}
Requirements: ${requirements}
Tech Stack: ${techStack.join(', ')}

The blueprint should include:
1. System overview
2. Component hierarchy
3. Data models
4. API endpoints
5. Implementation considerations

Please format your response as a JSON object with the following structure:
{
  "overview": "string",
  "components": [
    {
      "name": "string",
      "description": "string",
      "dependencies": ["string"],
      "implementation": "string",
      "priority": "high|medium|low"
    }
  ],
  "dataModels": [
    {
      "name": "string",
      "fields": [
        {
          "name": "string",
          "type": "string",
          "description": "string"
        }
      ]
    }
  ],
  "apis": [
    {
      "endpoint": "string",
      "method": "string",
      "description": "string",
      "request": "string",
      "response": "string"
    }
  ]
}`;
  }
  
  extractJsonFromText(text) {
    try {
      // Find JSON in the text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Error extracting JSON:', error);
      throw new Error('Failed to parse blueprint JSON');
    }
  }
}

module.exports = new BlueprintService();