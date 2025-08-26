// Generation Service - Core orchestration for AI content generation
// Handles all generation modes: structured, direct, multi-vertical, batch, editing

import { ProviderService } from './ProviderService.js';
import { TreeService } from './TreeService.js';
import { aiRepository } from '../../repositories/aiRepository.js';

export class GenerationService {
  constructor() {
    this.providerService = new ProviderService();
    this.treeService = new TreeService();
  }

  // ================================
  // MAIN GENERATION ORCHESTRATOR
  // ================================

  async generate(config, streamResponse = null) {
    const {
      task,
      mode = 'direct',
      vertical = 'all',
      verticalMode = 'parallel',
      prompt,
      context,
      provider,
      model,
      outputCount = 1,
      parentNodeId,
      rootNodeId
    } = config;

    const startTime = Date.now();
    
    try {
      let result;

      // Route to appropriate generation mode
      switch (mode) {
        case 'structured':
          result = await this.structuredGeneration(config, streamResponse);
          break;
        case 'direct':
          result = await this.directGeneration(config, streamResponse);
          break;
        case 'multi_vertical':
          result = await this.multiVerticalGeneration(config, streamResponse);
          break;
        case 'batch':
          result = await this.batchGeneration(config, streamResponse);
          break;
        case 'edit_existing':
          result = await this.editExisting(config, streamResponse);
          break;
        default:
          throw new Error(`Unsupported generation mode: ${mode}`);
      }

      // Add timing information
      result.timing = {
        totalMs: Date.now() - startTime,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date().toISOString()
      };

      return result;

    } catch (error) {
      console.error('Generation service error:', error);
      throw new Error(`Generation failed: ${error.message}`);
    }
  }

  // ================================
  // STRUCTURED GENERATION WORKFLOW
  // ================================

  async structuredGeneration(config, streamResponse = null) {
    const { prompt, vertical, context, parentNodeId, rootNodeId } = config;
    
    // Create root node if not provided
    let currentRootId = rootNodeId;
    if (!currentRootId) {
      const rootNode = await this.createGenerationNode({
        type: 'idea',
        content: prompt,
        mode: 'structured',
        vertical,
        context,
        selected: true
      });
      currentRootId = rootNode.id;
    }

    const workflow = this.getStructuredWorkflow(config.task);
    const results = {};
    let currentParentId = parentNodeId || currentRootId;

    // Execute workflow steps
    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      
      if (workflow.canSkip && workflow.canSkip[i] && config.skipSteps?.includes(step)) {
        continue;
      }

      if (streamResponse) {
        streamResponse.write(`data: ${JSON.stringify({
          type: 'step_start',
          step,
          progress: i / workflow.steps.length
        })}\n\n`);
      }

      // Generate content for this step
      const stepResult = await this.generateStep({
        step,
        parentContent: results[workflow.steps[i - 1]]?.content || prompt,
        vertical,
        context,
        parentNodeId: currentParentId,
        rootNodeId: currentRootId,
        config
      }, streamResponse);

      results[step] = stepResult;
      currentParentId = stepResult.nodeId;

      if (streamResponse) {
        streamResponse.write(`data: ${JSON.stringify({
          type: 'step_complete',
          step,
          result: stepResult,
          progress: (i + 1) / workflow.steps.length
        })}\n\n`);
      }
    }

    return {
      mode: 'structured',
      workflow,
      results,
      rootNodeId: currentRootId,
      finalNodeId: currentParentId,
      usage: this.aggregateUsage(results)
    };
  }

  async generateStep(stepConfig, streamResponse = null) {
    const { step, parentContent, vertical, context, parentNodeId, rootNodeId, config } = stepConfig;
    
    // Build step-specific prompt
    const stepPrompt = this.buildStepPrompt(step, parentContent, vertical, context);
    
    // Select appropriate provider for step
    const providerResult = await this.providerService.selectProviderForTask(
      this.mapStepToTask(step),
      { vertical, complexity: this.getStepComplexity(step) }
    );

    // Generate content
    const generationResult = await this.providerService.generate({
      task: this.mapStepToTask(step),
      prompt: stepPrompt,
      provider: providerResult.provider,
      model: providerResult.model,
      options: {
        vertical,
        context,
        ...this.getStepOptions(step)
      }
    });

    // Create generation node
    const node = await this.createGenerationNode({
      type: step,
      content: generationResult.content,
      mode: 'structured',
      vertical,
      parentId: parentNodeId,
      rootId: rootNodeId,
      provider: providerResult.provider,
      model: providerResult.model,
      prompt: stepPrompt,
      context: JSON.stringify(context || {}),
      tokensUsed: generationResult.usage?.totalTokens || 0,
      cost: generationResult.usage?.cost || 0,
      selected: true
    });

    return {
      nodeId: node.id,
      content: generationResult.content,
      provider: providerResult.provider,
      model: providerResult.model,
      usage: generationResult.usage
    };
  }

  // ================================
  // DIRECT GENERATION
  // ================================

  async directGeneration(config, streamResponse = null) {
    const { 
      task, 
      prompt, 
      vertical, 
      context, 
      provider, 
      model, 
      outputCount = 1,
      parentNodeId,
      rootNodeId 
    } = config;

    if (streamResponse) {
      streamResponse.write(`data: ${JSON.stringify({
        type: 'generation_start',
        task,
        outputCount
      })}\n\n`);
    }

    const results = [];
    
    // Generate multiple outputs if requested
    for (let i = 0; i < outputCount; i++) {
      if (streamResponse) {
        streamResponse.write(`data: ${JSON.stringify({
          type: 'output_start',
          index: i,
          progress: i / outputCount
        })}\n\n`);
      }

      // Generate content
      const generationResult = await this.providerService.generate({
        task,
        prompt,
        provider,
        model,
        options: {
          vertical,
          context,
          temperature: i > 0 ? 0.8 + (i * 0.1) : undefined // Vary temperature for alternatives
        }
      });

      // Create generation node
      const node = await this.createGenerationNode({
        type: this.mapTaskToNodeType(task),
        content: generationResult.content,
        mode: 'direct',
        vertical,
        parentId: parentNodeId,
        rootId: rootNodeId || (i === 0 ? null : results[0].nodeId),
        provider: generationResult.provider,
        model: generationResult.model,
        prompt,
        context: JSON.stringify(context || {}),
        tokensUsed: generationResult.usage?.totalTokens || 0,
        cost: generationResult.usage?.cost || 0,
        selected: i === 0 // First one is selected by default
      });

      const result = {
        nodeId: node.id,
        content: generationResult.content,
        provider: generationResult.provider,
        model: generationResult.model,
        usage: generationResult.usage,
        index: i
      };

      results.push(result);

      if (streamResponse) {
        streamResponse.write(`data: ${JSON.stringify({
          type: 'output_complete',
          index: i,
          result,
          progress: (i + 1) / outputCount
        })}\n\n`);
      }
    }

    return {
      mode: 'direct',
      task,
      results,
      selectedIndex: 0,
      rootNodeId: results[0].nodeId,
      usage: this.aggregateUsage(results)
    };
  }

  // ================================
  // MULTI-VERTICAL GENERATION
  // ================================

  async multiVerticalGeneration(config, streamResponse = null) {
    const { 
      task, 
      prompt, 
      vertical, 
      verticalMode = 'parallel', 
      context, 
      provider, 
      model 
    } = config;

    // Determine target verticals
    const targetVerticals = vertical === 'all' ? 
      ['hospitality', 'healthcare', 'tech', 'athletics'] : 
      Array.isArray(vertical) ? vertical : [vertical];

    if (streamResponse) {
      streamResponse.write(`data: ${JSON.stringify({
        type: 'multi_vertical_start',
        verticals: targetVerticals,
        mode: verticalMode
      })}\n\n`);
    }

    let results = {};
    let baseContent = null;

    // Create root node for multi-vertical generation
    const rootNode = await this.createGenerationNode({
      type: 'idea',
      content: prompt,
      mode: 'multi_vertical',
      vertical: 'all',
      context: JSON.stringify(context || {}),
      selected: true
    });

    if (verticalMode === 'parallel') {
      // Generate for all verticals simultaneously
      const promises = targetVerticals.map(vert => 
        this.generateForVertical({
          task,
          prompt,
          vertical: vert,
          context,
          provider,
          model,
          parentNodeId: rootNode.id,
          rootNodeId: rootNode.id
        })
      );

      const parallelResults = await Promise.allSettled(promises);
      
      targetVerticals.forEach((vert, index) => {
        const result = parallelResults[index];
        if (result.status === 'fulfilled') {
          results[vert] = result.value;
        } else {
          console.error(`Failed to generate for ${vert}:`, result.reason);
          results[vert] = { error: result.reason.message };
        }
      });

    } else if (verticalMode === 'sequential') {
      // Generate for first vertical, then adapt for others
      for (let i = 0; i < targetVerticals.length; i++) {
        const vert = targetVerticals[i];
        
        if (streamResponse) {
          streamResponse.write(`data: ${JSON.stringify({
            type: 'vertical_start',
            vertical: vert,
            progress: i / targetVerticals.length
          })}\n\n`);
        }

        if (i === 0) {
          // Generate base content for first vertical
          results[vert] = await this.generateForVertical({
            task,
            prompt,
            vertical: vert,
            context,
            provider,
            model,
            parentNodeId: rootNode.id,
            rootNodeId: rootNode.id
          });
          baseContent = results[vert].content;
        } else {
          // Adapt base content for other verticals
          results[vert] = await this.adaptContentForVertical({
            baseContent,
            fromVertical: targetVerticals[0],
            toVertical: vert,
            task,
            context,
            provider,
            model,
            parentNodeId: rootNode.id,
            rootNodeId: rootNode.id
          });
        }

        if (streamResponse) {
          streamResponse.write(`data: ${JSON.stringify({
            type: 'vertical_complete',
            vertical: vert,
            result: results[vert],
            progress: (i + 1) / targetVerticals.length
          })}\n\n`);
        }
      }

    } else if (verticalMode === 'adaptive') {
      // Each builds on the previous
      for (let i = 0; i < targetVerticals.length; i++) {
        const vert = targetVerticals[i];
        const previousVert = i > 0 ? targetVerticals[i - 1] : null;
        
        results[vert] = await this.generateForVertical({
          task,
          prompt,
          vertical: vert,
          context: {
            ...context,
            previousContent: previousVert ? results[previousVert].content : undefined
          },
          provider,
          model,
          parentNodeId: rootNode.id,
          rootNodeId: rootNode.id
        });
      }
    }

    return {
      mode: 'multi_vertical',
      verticalMode,
      targetVerticals,
      results,
      rootNodeId: rootNode.id,
      usage: this.aggregateUsage(Object.values(results).filter(r => !r.error))
    };
  }

  async generateForVertical(config) {
    const { task, prompt, vertical, context, provider, model, parentNodeId, rootNodeId } = config;
    
    // Generate content for specific vertical
    const generationResult = await this.providerService.generate({
      task,
      prompt,
      provider,
      model,
      options: {
        vertical,
        context,
        systemInstruction: `You are generating content specifically for the ${vertical} industry.`
      }
    });

    // Create generation node
    const node = await this.createGenerationNode({
      type: this.mapTaskToNodeType(task),
      content: generationResult.content,
      mode: 'multi_vertical',
      vertical,
      parentId: parentNodeId,
      rootId: rootNodeId,
      provider: generationResult.provider,
      model: generationResult.model,
      prompt,
      context: JSON.stringify(context || {}),
      tokensUsed: generationResult.usage?.totalTokens || 0,
      cost: generationResult.usage?.cost || 0,
      selected: true
    });

    return {
      nodeId: node.id,
      content: generationResult.content,
      provider: generationResult.provider,
      model: generationResult.model,
      usage: generationResult.usage,
      vertical
    };
  }

  async adaptContentForVertical(config) {
    const { 
      baseContent, 
      fromVertical, 
      toVertical, 
      task, 
      context, 
      provider, 
      model,
      parentNodeId,
      rootNodeId 
    } = config;

    const adaptationPrompt = `Adapt the following content from ${fromVertical} to ${toVertical}:\n\n${baseContent}\n\nMaintain the core message and structure while making it relevant to the ${toVertical} industry.`;

    const generationResult = await this.providerService.generate({
      task: 'blog_adaptation',
      prompt: adaptationPrompt,
      provider,
      model,
      options: {
        vertical: toVertical,
        context,
        systemInstruction: `You are adapting content for the ${toVertical} industry.`
      }
    });

    // Create generation node
    const node = await this.createGenerationNode({
      type: this.mapTaskToNodeType(task),
      content: generationResult.content,
      mode: 'multi_vertical',
      vertical: toVertical,
      parentId: parentNodeId,
      rootId: rootNodeId,
      provider: generationResult.provider,
      model: generationResult.model,
      prompt: adaptationPrompt,
      context: JSON.stringify(context || {}),
      tokensUsed: generationResult.usage?.totalTokens || 0,
      cost: generationResult.usage?.cost || 0,
      selected: true
    });

    return {
      nodeId: node.id,
      content: generationResult.content,
      provider: generationResult.provider,
      model: generationResult.model,
      usage: generationResult.usage,
      vertical: toVertical,
      adaptedFrom: fromVertical
    };
  }

  // ================================
  // BATCH GENERATION
  // ================================

  async batchGeneration(config, streamResponse = null) {
    const { prompts, task, vertical, context, provider, model } = config;
    
    if (!Array.isArray(prompts)) {
      throw new Error('Batch generation requires an array of prompts');
    }

    if (streamResponse) {
      streamResponse.write(`data: ${JSON.stringify({
        type: 'batch_start',
        count: prompts.length
      })}\n\n`);
    }

    const results = [];
    
    // Process prompts in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < prompts.length; i += batchSize) {
      const batch = prompts.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (prompt, batchIndex) => {
        const actualIndex = i + batchIndex;
        
        if (streamResponse) {
          streamResponse.write(`data: ${JSON.stringify({
            type: 'batch_item_start',
            index: actualIndex
          })}\n\n`);
        }

        try {
          const result = await this.directGeneration({
            task,
            prompt,
            vertical,
            context,
            provider,
            model,
            outputCount: 1
          });

          if (streamResponse) {
            streamResponse.write(`data: ${JSON.stringify({
              type: 'batch_item_complete',
              index: actualIndex,
              result: result.results[0]
            })}\n\n`);
          }

          return { index: actualIndex, result: result.results[0] };
        } catch (error) {
          console.error(`Batch item ${actualIndex} failed:`, error);
          return { index: actualIndex, error: error.message };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        }
      });
    }

    return {
      mode: 'batch',
      results: results.sort((a, b) => a.index - b.index),
      usage: this.aggregateUsage(results.filter(r => !r.error).map(r => r.result))
    };
  }

  // ================================
  // EDIT EXISTING CONTENT
  // ================================

  async editExisting(config, streamResponse = null) {
    const { 
      existingContent, 
      editInstructions, 
      task = 'blog_editing', 
      vertical, 
      context, 
      provider, 
      model 
    } = config;

    if (!existingContent || !editInstructions) {
      throw new Error('Editing requires existing content and edit instructions');
    }

    const editPrompt = `Please edit the following content according to these instructions:\n\nInstructions: ${editInstructions}\n\nContent to edit:\n${existingContent}`;

    const generationResult = await this.providerService.generate({
      task,
      prompt: editPrompt,
      provider,
      model,
      options: {
        vertical,
        context,
        systemInstruction: 'You are an expert editor. Make the requested changes while maintaining the quality and voice of the content.'
      }
    });

    // Create generation node for edited content
    const node = await this.createGenerationNode({
      type: 'blog',
      content: generationResult.content,
      mode: 'edit_existing',
      vertical,
      provider: generationResult.provider,
      model: generationResult.model,
      prompt: editPrompt,
      context: JSON.stringify(context || {}),
      tokensUsed: generationResult.usage?.totalTokens || 0,
      cost: generationResult.usage?.cost || 0,
      selected: true
    });

    return {
      mode: 'edit_existing',
      nodeId: node.id,
      originalContent: existingContent,
      editedContent: generationResult.content,
      instructions: editInstructions,
      usage: generationResult.usage
    };
  }

  // ================================
  // HELPER METHODS
  // ================================

  async createGenerationNode(nodeData) {
    return await aiRepository.createGenerationNode({
      type: nodeData.type,
      content: nodeData.content,
      mode: nodeData.mode,
      vertical: nodeData.vertical,
      parentId: nodeData.parentId || null,
      rootId: nodeData.rootId || null,
      provider: nodeData.provider,
      model: nodeData.model,
      prompt: nodeData.prompt,
      context: nodeData.context,
      tokensUsed: nodeData.tokensUsed || 0,
      cost: nodeData.cost ? parseFloat(nodeData.cost) : 0,
      selected: nodeData.selected || false,
      visible: true
    });
  }

  getStructuredWorkflow(task) {
    const workflows = {
      'blog_complete': {
        steps: ['idea', 'title', 'synopsis', 'outline', 'blog'],
        canSkip: [false, false, true, true, false]
      },
      'blog_with_research': {
        steps: ['idea', 'research', 'title', 'synopsis', 'outline', 'blog'],
        canSkip: [false, true, false, true, true, false]
      },
      'social_campaign': {
        steps: ['idea', 'title', 'blog', 'social'],
        canSkip: [false, false, false, false]
      }
    };

    return workflows[task] || workflows['blog_complete'];
  }

  buildStepPrompt(step, parentContent, vertical, context) {
    const stepPrompts = {
      'idea': `Generate a comprehensive blog idea based on: ${parentContent}`,
      'title': `Create compelling blog titles for: ${parentContent}`,
      'synopsis': `Write a brief synopsis for a blog about: ${parentContent}`,
      'outline': `Create a detailed outline for: ${parentContent}`,
      'blog': `Write a complete blog post based on: ${parentContent}`,
      'social': `Create social media posts to promote: ${parentContent}`
    };

    let prompt = stepPrompts[step] || parentContent;
    
    if (vertical && vertical !== 'all') {
      prompt = `[Industry: ${vertical}] ${prompt}`;
    }

    return prompt;
  }

  mapStepToTask(step) {
    const stepTaskMap = {
      'idea': 'idea_generation',
      'title': 'title_generation', 
      'synopsis': 'synopsis_generation',
      'outline': 'outline_creation',
      'blog': 'blog_writing_complete',
      'social': 'social_post_generation'
    };

    return stepTaskMap[step] || step;
  }

  mapTaskToNodeType(task) {
    const taskNodeMap = {
      'blog_writing_complete': 'blog',
      'idea_generation': 'idea',
      'title_generation': 'title',
      'synopsis_generation': 'synopsis',
      'outline_creation': 'outline',
      'social_post_generation': 'social'
    };

    return taskNodeMap[task] || 'blog';
  }

  getStepComplexity(step) {
    const complexityMap = {
      'idea': 'medium',
      'title': 'low',
      'synopsis': 'low',
      'outline': 'medium',
      'blog': 'high',
      'social': 'low'
    };

    return complexityMap[step] || 'medium';
  }

  getStepOptions(step) {
    const optionsMap = {
      'title': { outputCount: 5, temperature: 0.8 },
      'idea': { outputCount: 3, temperature: 0.9 },
      'blog': { maxTokens: 3000, temperature: 0.7 },
      'social': { outputCount: 3, temperature: 0.8 }
    };

    return optionsMap[step] || {};
  }

  aggregateUsage(results) {
    if (!Array.isArray(results)) {
      return results.usage || {};
    }

    return results.reduce((total, result) => {
      const usage = result.usage || {};
      return {
        inputTokens: (total.inputTokens || 0) + (usage.inputTokens || 0),
        outputTokens: (total.outputTokens || 0) + (usage.outputTokens || 0),
        totalTokens: (total.totalTokens || 0) + (usage.totalTokens || 0),
        cost: (total.cost || 0) + (usage.cost || 0)
      };
    }, {});
  }
}