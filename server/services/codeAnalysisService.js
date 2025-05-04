const { ESLint } = require('eslint');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const temp = require('temp');

class CodeAnalysisService {
  constructor() {
    this.eslint = new ESLint({
      useEslintrc: false,
      baseConfig: {
        extends: ['eslint:recommended'],
        parserOptions: {
          ecmaVersion: 2020,
          sourceType: 'module'
        },
        env: {
          browser: true,
          node: true,
          es6: true
        },
        rules: {
          'no-unused-vars': 'warn',
          'no-console': 'warn',
          'no-debugger': 'error'
        }
      }
    });
  }

  async analyzeCode(code) {
    try {
      // Create temporary file
      const tempFile = temp.path({ suffix: '.js' });
      fs.writeFileSync(tempFile, code);

      // Run ESLint analysis
      const eslintResults = await this.eslint.lintText(code);

      // Run complexity analysis
      const complexity = await this.calculateComplexity(tempFile);

      // Calculate metrics
      const metrics = this.calculateMetrics(code);

      // Clean up
      fs.unlinkSync(tempFile);

      return {
        issues: this.processESLintResults(eslintResults),
        metrics: {
          complexity,
          ...metrics
        }
      };
    } catch (error) {
      console.error('Code analysis error:', error);
      throw new Error('Failed to analyze code');
    }
  }

  async calculateComplexity(filePath) {
    try {
      const command = `npx complexity-report ${filePath} --format json`;
      const output = execSync(command, { encoding: 'utf8' });
      const result = JSON.parse(output);
      return result.complexity;
    } catch (error) {
      console.error('Complexity calculation error:', error);
      return 0;
    }
  }

  calculateMetrics(code) {
    const lines = code.split('\n');
    const loc = lines.length;
    const commentLines = lines.filter(line => 
      line.trim().startsWith('//') || 
      line.trim().startsWith('/*') || 
      line.trim().endsWith('*/')
    ).length;

    const maintainability = this.calculateMaintainabilityIndex(
      loc,
      commentLines
    );

    return {
      loc,
      commentLines,
      maintainability
    };
  }

  calculateMaintainabilityIndex(loc, commentLines) {
    // Simplified maintainability index calculation
    const commentRatio = commentLines / loc;
    const maintainability = Math.min(100, Math.max(0, 
      (commentRatio * 50) + // Comments contribute to maintainability
      (1 / Math.log(loc + 1) * 50) // Smaller files are more maintainable
    ));
    return Math.round(maintainability);
  }

  processESLintResults(results) {
    return results[0].messages.map(message => ({
      line: message.line,
      column: message.column,
      message: message.message,
      severity: this.mapSeverity(message.severity),
      ruleId: message.ruleId,
      description: this.getRuleDescription(message.ruleId),
      suggestion: this.getSuggestion(message)
    }));
  }

  mapSeverity(eslintSeverity) {
    switch (eslintSeverity) {
      case 2:
        return 'error';
      case 1:
        return 'warning';
      default:
        return 'info';
    }
  }

  getRuleDescription(ruleId) {
    // This would typically come from ESLint's rule documentation
    const descriptions = {
      'no-unused-vars': 'Variables that are declared but never used',
      'no-console': 'Use of console statements in production code',
      'no-debugger': 'Debugger statements should not be committed',
      // Add more rule descriptions as needed
    };
    return descriptions[ruleId] || 'No description available';
  }

  getSuggestion(message) {
    // This would provide suggested fixes based on the rule
    const suggestions = {
      'no-unused-vars': 'Remove the unused variable or use it in your code',
      'no-console': 'Remove the console statement or use a proper logging system',
      'no-debugger': 'Remove the debugger statement before committing',
      // Add more suggestions as needed
    };
    return suggestions[message.ruleId] || null;
  }
}

module.exports = new CodeAnalysisService();