import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Fuse from 'fuse.js';
import { 
  RSpecGuideline, 
  CodeExample, 
  AntiPattern, 
  ConfigurationTemplate,
  SearchOptions 
} from '../types/index.js';

/**
 * Knowledge Base for Better RSpec guidelines, examples, and patterns
 */
export class KnowledgeBase {
  private guidelines: Map<string, RSpecGuideline> = new Map();
  private examples: Map<string, CodeExample> = new Map();
  private antiPatterns: Map<string, AntiPattern> = new Map();
  private configurations: Map<string, ConfigurationTemplate> = new Map();
  
  private guidelineSearchIndex?: Fuse<RSpecGuideline>;
  private exampleSearchIndex?: Fuse<CodeExample>;
  
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.loadGuidelines();
      await this.loadExamples();
      await this.loadAntiPatterns();
      await this.loadConfigurations();
      
      this.buildSearchIndices();
      this.initialized = true;
      
      console.error(`Knowledge base initialized with:
        - ${this.guidelines.size} guidelines
        - ${this.examples.size} examples  
        - ${this.antiPatterns.size} anti-patterns
        - ${this.configurations.size} configuration templates`);
    } catch (error) {
      console.error('Failed to initialize knowledge base:', error);
      throw error;
    }
  }

  private async loadGuidelines(): Promise<void> {
    const dataDir = path.join(process.cwd(), 'data', 'guidelines');
    
    try {
      const files = await fs.readdir(dataDir);
      const markdownFiles = files.filter(f => f.endsWith('.md'));
      
      for (const file of markdownFiles) {
        const filePath = path.join(dataDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const parsed = matter(content);
        
        const guideline: RSpecGuideline = {
          id: path.basename(file, '.md'),
          title: parsed.data.title || this.extractTitleFromContent(parsed.content),
          category: parsed.data.category || this.inferCategoryFromFilename(file),
          content: parsed.content,
          examples: parsed.data.examples || [],
          tags: parsed.data.tags || [],
          relatedGuidelines: parsed.data.relatedGuidelines || [],
          priority: parsed.data.priority || 'medium',
          lastUpdated: parsed.data.lastUpdated,
        };
        
        this.guidelines.set(guideline.id, guideline);
      }
    } catch (error) {
      console.error('Error loading guidelines:', error);
      // Continue with empty guidelines if directory doesn't exist
    }
  }

  private async loadExamples(): Promise<void> {
    // Load examples from structured data files
    const examplesPath = path.join(process.cwd(), 'data', 'examples.json');
    
    try {
      const content = await fs.readFile(examplesPath, 'utf-8');
      const examplesData = JSON.parse(content);
      
      for (const example of examplesData) {
        this.examples.set(example.id, example);
      }
    } catch (error) {
      console.error('Error loading examples:', error);
      // Initialize with default examples if file doesn't exist
      this.initializeDefaultExamples();
    }
  }

  private async loadAntiPatterns(): Promise<void> {
    const antipatternsPath = path.join(process.cwd(), 'data', 'antipatterns.json');
    
    try {
      const content = await fs.readFile(antipatternsPath, 'utf-8');
      const antipatternsData = JSON.parse(content);
      
      for (const antiPattern of antipatternsData) {
        this.antiPatterns.set(antiPattern.id, antiPattern);
      }
    } catch (error) {
      console.error('Error loading anti-patterns:', error);
      this.initializeDefaultAntiPatterns();
    }
  }

  private async loadConfigurations(): Promise<void> {
    const configurationsPath = path.join(process.cwd(), 'data', 'configurations.json');
    
    try {
      const content = await fs.readFile(configurationsPath, 'utf-8');
      const configurationsData = JSON.parse(content);
      
      for (const config of configurationsData) {
        this.configurations.set(config.id, config);
      }
    } catch (error) {
      console.error('Error loading configurations:', error);
      this.initializeDefaultConfigurations();
    }
  }

  private buildSearchIndices(): void {
    // Build search index for guidelines
    this.guidelineSearchIndex = new Fuse(Array.from(this.guidelines.values()), {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'content', weight: 0.3 },
        { name: 'tags', weight: 0.2 },
        { name: 'category', weight: 0.1 }
      ],
      threshold: 0.3,
      includeScore: true,
    });

    // Build search index for examples
    this.exampleSearchIndex = new Fuse(Array.from(this.examples.values()), {
      keys: [
        { name: 'title', weight: 0.3 },
        { name: 'description', weight: 0.3 },
        { name: 'scenario', weight: 0.2 },
        { name: 'tags', weight: 0.2 }
      ],
      threshold: 0.3,
      includeScore: true,
    });
  }

  // Public API methods
  getGuideline(id: string): RSpecGuideline | undefined {
    return this.guidelines.get(id);
  }

  getAllGuidelines(): RSpecGuideline[] {
    return Array.from(this.guidelines.values());
  }

  getGuidelinesByCategory(category: string): RSpecGuideline[] {
    return Array.from(this.guidelines.values())
      .filter(g => g.category === category);
  }

  searchGuidelines(options: SearchOptions): RSpecGuideline[] {
    if (!this.guidelineSearchIndex) return [];
    
    const results = this.guidelineSearchIndex.search(options.query);
    return results
      .slice(0, options.limit)
      .map(result => result.item);
  }

  getExample(id: string): CodeExample | undefined {
    return this.examples.get(id);
  }

  getAllExamples(): CodeExample[] {
    return Array.from(this.examples.values());
  }

  getExamplesByType(specType: string): CodeExample[] {
    return Array.from(this.examples.values())
      .filter(e => e.specType === specType);
  }

  searchExamples(options: SearchOptions): CodeExample[] {
    if (!this.exampleSearchIndex) return [];
    
    const results = this.exampleSearchIndex.search(options.query);
    return results
      .slice(0, options.limit)
      .map(result => result.item);
  }

  getAntiPattern(id: string): AntiPattern | undefined {
    return this.antiPatterns.get(id);
  }

  getAllAntiPatterns(): AntiPattern[] {
    return Array.from(this.antiPatterns.values());
  }

  getConfiguration(id: string): ConfigurationTemplate | undefined {
    return this.configurations.get(id);
  }

  getAllConfigurations(): ConfigurationTemplate[] {
    return Array.from(this.configurations.values());
  }

  getConfigurationsByType(type: string): ConfigurationTemplate[] {
    return Array.from(this.configurations.values())
      .filter(c => c.type === type);
  }

  // Helper methods
  private extractTitleFromContent(content: string): string {
    const firstLine = content.split('\n')[0];
    return firstLine.replace(/^#+\s*/, '').trim();
  }

  private inferCategoryFromFilename(filename: string): string {
    const name = filename.toLowerCase();
    if (name.includes('describe') || name.includes('naming')) return 'naming';
    if (name.includes('context') || name.includes('organization')) return 'organization';
    if (name.includes('expect') || name.includes('subject')) return 'expectations';
    if (name.includes('let') || name.includes('factories')) return 'data-setup';
    if (name.includes('mock') || name.includes('stub')) return 'mocking';
    if (name.includes('shared') || name.includes('matcher')) return 'shared-examples';
    if (name.includes('speed') || name.includes('tooling')) return 'performance';
    if (name.includes('config')) return 'configuration';
    return 'organization';
  }

  private initializeDefaultExamples(): void {
    // Initialize with some basic examples
    const defaultExamples: CodeExample[] = [
      {
        id: 'model-basic',
        title: 'Basic Model Spec',
        description: 'Simple model validation spec',
        specType: 'model',
        scenario: 'Testing model validations',
        goodCode: `RSpec.describe User do
  subject(:user) { build(:user) }
  
  it { is_expected.to be_valid }
  it { is_expected.to validate_presence_of(:email) }
end`,
        explanation: 'Uses subject for DRY code and one expectation per test',
        tags: ['model', 'validation', 'subject'],
        complexity: 'beginner',
      }
    ];

    for (const example of defaultExamples) {
      this.examples.set(example.id, example);
    }
  }

  private initializeDefaultAntiPatterns(): void {
    const defaultAntiPatterns: AntiPattern[] = [
      {
        id: 'should-syntax',
        name: 'Using should syntax',
        description: 'Using deprecated should syntax instead of expect',
        problematicCode: 'user.should be_valid',
        improvedCode: 'expect(user).to be_valid',
        explanation: 'The should syntax is deprecated. Use expect syntax for better readability and future compatibility.',
        category: 'expectations',
        severity: 'medium',
        tags: ['syntax', 'deprecated'],
      }
    ];

    for (const antiPattern of defaultAntiPatterns) {
      this.antiPatterns.set(antiPattern.id, antiPattern);
    }
  }

  private initializeDefaultConfigurations(): void {
    const defaultConfigurations: ConfigurationTemplate[] = [
      {
        id: 'basic-spec-helper',
        name: 'Basic spec_helper.rb',
        description: 'Basic RSpec configuration following Better Specs guidelines',
        type: 'spec_helper',
        content: `RSpec.configure do |config|
  config.expect_with :rspec do |c|
    c.syntax = :expect
  end
  
  config.disable_monkey_patching!
  config.order = :random
  Kernel.srand config.seed
end`,
        dependencies: ['rspec'],
        notes: 'Enforces expect syntax and random test order',
      }
    ];

    for (const config of defaultConfigurations) {
      this.configurations.set(config.id, config);
    }
  }
}
