// server/src/services/extraction/basicExtractionService.js
const fs = require('fs').promises;
const path = require('path');

/**
 * Basic Extraction Service
 * Analyzes code files to extract information about components, dependencies, and functions
 * Provides the foundation for the self-building system
 */

class BasicExtractionService {
  /**
   * Extract code from a file
   * @param {string} filePath - Path to the file
   * @returns {Promise<Object>} - Extracted code information
   */
  async extractFromFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const extension = path.extname(filePath).toLowerCase();
      const fileName = path.basename(filePath);
      
      // Basic language detection based on file extension
      const language = this.detectLanguage(extension);
      
      // Extract imports/dependencies
      const dependencies = this.extractDependencies(content, language);
      
      // Extract functions/classes
      const functions = this.extractFunctions(content, language);
      
      // Extract potential components
      const components = this.extractComponents(content, language);
      
      return {
        fileName,
        language,
        dependencies,
        functions,
        components,
        rawContent: content
      };
    } catch (error) {
      console.error('Error extracting from file:', error);
      throw error;
    }
  }
  
  /**
   * Detect programming language based on file extension
   * @param {string} extension - File extension
   * @returns {string} - Detected language
   */
  detectLanguage(extension) {
    const languageMap = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.rb': 'ruby',
      '.java': 'java',
      '.c': 'c',
      '.cpp': 'cpp',
      '.cs': 'csharp',
      '.go': 'go',
      '.php': 'php',
      '.html': 'html',
      '.css': 'css'
    };
    
    return languageMap[extension] || 'unknown';
  }
  
  /**
   * Extract dependencies/imports from code
   * @param {string} content - File content
   * @param {string} language - Programming language
   * @returns {Array} - Extracted dependencies
   */
  extractDependencies(content, language) {
    const dependencies = [];
    
    try {
      if (language === 'javascript' || language === 'typescript') {
        // Match ES6 imports
        const es6ImportRegex = /import\s+(?:{[^}]+}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;
        let match;
        
        while ((match = es6ImportRegex.exec(content)) !== null) {
          dependencies.push(match[1]);
        }
        
        // Match require statements
        const requireRegex = /(?:const|let|var)\s+(?:{[^}]+}|\w+)\s+=\s+require\(['"]([^'"]+)['"]\)/g;
        
        while ((match = requireRegex.exec(content)) !== null) {
          dependencies.push(match[1]);
        }
      } else if (language === 'python') {
        // Match Python imports
        const importRegex = /(?:from\s+(\w+)(?:\.\w+)*\s+import|import\s+(\w+)(?:\.\w+)*)/g;
        let match;
        
        while ((match = importRegex.exec(content)) !== null) {
          dependencies.push(match[1] || match[2]);
        }
      }
      // Add more language-specific extraction as needed
    } catch (error) {
      console.error('Error extracting dependencies:', error);
    }
    
    return dependencies;
  }
  
  /**
   * Extract functions from code
   * @param {string} content - File content
   * @param {string} language - Programming language
   * @returns {Array} - Extracted functions
   */
  extractFunctions(content, language) {
    const functions = [];
    
    try {
      if (language === 'javascript' || language === 'typescript') {
        // Match function declarations
        const functionRegex = /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s+=\s+(?:function|\([^)]*\)\s*=>))/g;
        let match;
        
        while ((match = functionRegex.exec(content)) !== null) {
          functions.push(match[1] || match[2]);
        }
        
        // Match class methods
        const methodRegex = /(?:async\s+)?(\w+)\s*\([^)]*\)\s*{/g;
        
        while ((match = methodRegex.exec(content)) !== null) {
          // Exclude constructor
          if (match[1] !== 'constructor') {
            functions.push(match[1]);
          }
        }
      } else if (language === 'python') {
        // Match Python function definitions
        const functionRegex = /def\s+(\w+)\s*\(/g;
        let match;
        
        while ((match = functionRegex.exec(content)) !== null) {
          functions.push(match[1]);
        }
      }
      // Add more language-specific extraction as needed
    } catch (error) {
      console.error('Error extracting functions:', error);
    }
    
    return functions;
  }
  
  /**
   * Extract potential UI components from code
   * @param {string} content - File content
   * @param {string} language - Programming language
   * @returns {Array} - Extracted components
   */
  extractComponents(content, language) {
    const components = [];
    
    try {
      if (language === 'javascript' || language === 'typescript') {
        // Look for React components (functions that return JSX or classes that extend React.Component)
        const componentRegex = /(?:function\s+(\w+)|const\s+(\w+)\s+=\s+(?:\([^)]*\)|_ref|props)\s*=>|class\s+(\w+)\s+extends\s+(?:React\.)?Component)/g;
        let match;
        
        while ((match = componentRegex.exec(content)) !== null) {
          const componentName = match[1] || match[2] || match[3];
          
          // Simple heuristic: components typically start with an uppercase letter
          if (componentName && /^[A-Z]/.test(componentName)) {
            components.push(componentName);
          }
        }
      }
      // Add more component extraction logic as needed
    } catch (error) {
      console.error('Error extracting components:', error);
    }
    
    return components;
  }
  
  /**
   * Extract multiple files from a directory
   * @param {string} directoryPath - Path to the directory
   * @param {Object} options - Extraction options
   * @returns {Promise<Array>} - Array of extracted file data
   */
  async extractFromDirectory(directoryPath, options = {}) {
    try {
      const fileResults = [];
      const files = await fs.readdir(directoryPath);
      
      // Filter files based on options
      const extensions = options.extensions || ['.js', '.jsx', '.ts', '.tsx', '.py'];
      const excludeDirs = options.excludeDirs || ['node_modules', '.git', 'dist', 'build'];
      
      for (const file of files) {
        const fullPath = path.join(directoryPath, file);
        const stats = await fs.stat(fullPath);
        
        if (stats.isDirectory()) {
          // Skip excluded directories
          if (excludeDirs.includes(file)) {
            continue;
          }
          
          // Recursively process subdirectories
          if (options.recursive) {
            const subResults = await this.extractFromDirectory(fullPath, options);
            fileResults.push(...subResults);
          }
        } else if (stats.isFile()) {
          // Check if file extension matches
          const ext = path.extname(file).toLowerCase();
          if (extensions.includes(ext)) {
            const result = await this.extractFromFile(fullPath);
            fileResults.push(result);
          }
        }
      }
      
      return fileResults;
    } catch (error) {
      console.error('Error extracting from directory:', error);
      throw error;
    }
  }
}

module.exports = new BasicExtractionService();