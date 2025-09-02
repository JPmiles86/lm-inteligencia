/**
 * Fallback Testing Utility
 * 
 * Provides comprehensive testing capabilities for the intelligent fallback system:
 * - Test fallback chains with simulated failures
 * - Validate provider selection logic
 * - Performance benchmarking
 * - Integration testing
 */

import { intelligentProviderSelector } from '../services/intelligentProviderSelector';
import { retryHandler } from '../services/retryHandler';
import { usageTracker } from '../services/usageTracker';

interface FallbackTestResult {
  provider: string;
  success: boolean;
  latency: number;
  error?: string;
  model?: string;
  tokensUsed?: number;
  cost?: number;
}

interface FallbackChainTestResult {
  taskType: string;
  chainTested: string[];
  results: FallbackTestResult[];
  finalProvider?: string;
  totalTime: number;
  fallbacksTriggered: number;
  success: boolean;
  summary: {
    attemptsCount: number;
    averageLatency: number;
    totalCost: number;
    firstSuccessAttempt: number;
  };
}

interface LoadTestResult {
  taskType: string;
  concurrentRequests: number;
  totalRequests: number;
  successRate: number;
  averageLatency: number;
  p95Latency: number;
  p99Latency: number;
  errorsPerProvider: Record<string, number>;
  fallbacksTriggered: Record<string, number>;
  totalCost: number;
}

interface ProviderReliabilityTest {
  provider: string;
  requests: number;
  successCount: number;
  failureCount: number;
  averageLatency: number;
  errors: Array<{
    timestamp: Date;
    error: string;
    taskType: string;
  }>;
  reliability: number; // 0-1 score
}

export class FallbackTester {
  private readonly testPrompts: Record<string, string> = {
    writing: 'Write a brief introduction about artificial intelligence.',
    research: 'What are the latest developments in renewable energy?',
    creative: 'Create a short story about a robot learning to paint.',
    analysis: 'Analyze the pros and cons of remote work.',
    ideation: 'Generate 3 innovative app ideas for productivity.',
    image: 'A serene mountain landscape at sunset'
  };

  /**
   * Test a complete fallback chain for a specific task type
   */
  async testFallbackChain(
    taskType: string,
    simulateFailures: string[] = [],
    options: {
      includeUsageTracking?: boolean;
      timeoutMs?: number;
      maxAttempts?: number;
    } = {}
  ): Promise<FallbackChainTestResult> {
    const startTime = Date.now();
    const chain = this.getFallbackChain(taskType);
    const results: FallbackTestResult[] = [];
    let finalProvider: string | undefined;
    let fallbacksTriggered = 0;
    let firstSuccessAttempt = -1;
    let totalCost = 0;
    
    console.log(`🧪 Testing fallback chain for task: ${taskType}`);
    console.log(`📋 Chain: ${chain.join(' → ')}`);
    console.log(`❌ Simulated failures: ${simulateFailures.join(', ') || 'none'}`);
    
    for (let i = 0; i < chain.length; i++) {
      const provider = chain[i];
      const startProviderTime = Date.now();
      
      console.log(`\n🔄 Testing provider: ${provider} (attempt ${i + 1}/${chain.length})`);
      
      if (simulateFailures.includes(provider)) {
        const result: FallbackTestResult = {
          provider,
          success: false,
          latency: 50, // Simulated quick failure
          error: 'Simulated failure for testing'
        };
        results.push(result);
        console.log(`❌ ${provider}: Simulated failure`);
        continue;
      }
      
      try {
        const testResult = await this.testProvider(
          provider, 
          taskType, 
          options.timeoutMs || 30000
        );
        
        const latency = Date.now() - startProviderTime;
        const result: FallbackTestResult = {
          provider,
          success: testResult.success,
          latency,
          model: testResult.model,
          tokensUsed: testResult.tokensUsed,
          cost: testResult.cost,
          error: testResult.error
        };
        
        results.push(result);
        
        if (testResult.success) {
          finalProvider = provider;
          firstSuccessAttempt = i + 1;
          totalCost += testResult.cost || 0;
          
          console.log(`✅ ${provider}: Success (${latency}ms, ${testResult.model})`);
          
          // Track usage if enabled
          if (options.includeUsageTracking && testResult.tokensUsed && testResult.cost) {
            await usageTracker.trackUsage({
              provider,
              task: taskType,
              tokensUsed: testResult.tokensUsed,
              cost: testResult.cost,
              duration: latency,
              success: true,
              timestamp: new Date(),
              model: testResult.model || 'test-model'
            });
          }
          
          break; // Success! Stop testing chain
        } else {
          fallbacksTriggered++;
          console.log(`❌ ${provider}: Failed - ${testResult.error}`);
        }
        
      } catch (error) {
        const latency = Date.now() - startProviderTime;
        const result: FallbackTestResult = {
          provider,
          success: false,
          latency,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        results.push(result);
        fallbacksTriggered++;
        console.log(`❌ ${provider}: Exception - ${result.error}`);
      }
    }
    
    const totalTime = Date.now() - startTime;
    const success = finalProvider !== undefined;
    const averageLatency = results.reduce((sum, r) => sum + r.latency, 0) / results.length;
    
    console.log(`\n📊 Test Results:`);
    console.log(`✨ Final result: ${success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`🎯 Final provider: ${finalProvider || 'none'}`);
    console.log(`⏱️  Total time: ${totalTime}ms`);
    console.log(`🔄 Fallbacks triggered: ${fallbacksTriggered}`);
    console.log(`💰 Total cost: $${totalCost.toFixed(6)}`);
    
    return {
      taskType,
      chainTested: chain,
      results,
      finalProvider,
      totalTime,
      fallbacksTriggered,
      success,
      summary: {
        attemptsCount: results.length,
        averageLatency,
        totalCost,
        firstSuccessAttempt
      }
    };
  }
  
  /**
   * Test all fallback chains
   */
  async testAllFallbackChains(
    simulateFailures: string[] = [],
    options: { includeUsageTracking?: boolean } = {}
  ): Promise<FallbackChainTestResult[]> {
    const taskTypes = ['writing', 'research', 'creative', 'analysis', 'ideation'];
    const results: FallbackChainTestResult[] = [];
    
    console.log(`🚀 Testing all fallback chains...`);
    console.log(`❌ Simulated failures: ${simulateFailures.join(', ') || 'none'}\n`);
    
    for (const taskType of taskTypes) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`📝 Testing ${taskType.toUpperCase()} task type`);
      console.log(`${'='.repeat(50)}`);
      
      const result = await this.testFallbackChain(taskType, simulateFailures, options);
      results.push(result);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Summary report
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 COMPREHENSIVE TEST SUMMARY`);
    console.log(`${'='.repeat(60)}`);
    
    const successRate = (results.filter(r => r.success).length / results.length) * 100;
    const totalTime = results.reduce((sum, r) => sum + r.totalTime, 0);
    const totalCost = results.reduce((sum, r) => sum + r.summary.totalCost, 0);
    const avgFallbacks = results.reduce((sum, r) => sum + r.fallbacksTriggered, 0) / results.length;
    
    console.log(`✨ Overall success rate: ${successRate.toFixed(1)}%`);
    console.log(`⏱️  Total test time: ${totalTime}ms`);
    console.log(`💰 Total test cost: $${totalCost.toFixed(6)}`);
    console.log(`🔄 Average fallbacks per task: ${avgFallbacks.toFixed(1)}`);
    
    return results;
  }
  
  /**
   * Run load test on fallback system
   */
  async runLoadTest(
    taskType: string,
    concurrentRequests: number,
    totalRequests: number,
    options: { simulateFailures?: string[]; timeoutMs?: number } = {}
  ): Promise<LoadTestResult> {
    console.log(`🏋️ Running load test: ${taskType}`);
    console.log(`🔥 Concurrent requests: ${concurrentRequests}`);
    console.log(`📊 Total requests: ${totalRequests}`);
    
    const startTime = Date.now();
    const results: Array<{ success: boolean; latency: number; provider: string; error?: string; cost?: number }> = [];
    const errorsPerProvider: Record<string, number> = {};
    const fallbacksTriggered: Record<string, number> = {};
    
    // Execute requests in batches
    for (let batch = 0; batch < Math.ceil(totalRequests / concurrentRequests); batch++) {
      const batchSize = Math.min(concurrentRequests, totalRequests - batch * concurrentRequests);
      const promises = [];
      
      for (let i = 0; i < batchSize; i++) {
        promises.push(this.executeLoadTestRequest(taskType, options));
      }
      
      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
      
      // Track errors and fallbacks
      batchResults.forEach(result => {
        if (!result.success) {
          errorsPerProvider[result.provider] = (errorsPerProvider[result.provider] || 0) + 1;
        }
        if (result.provider !== this.getFallbackChain(taskType)[0]) {
          fallbacksTriggered[result.provider] = (fallbacksTriggered[result.provider] || 0) + 1;
        }
      });
      
      console.log(`📦 Batch ${batch + 1}/${Math.ceil(totalRequests / concurrentRequests)} completed`);
    }
    
    const totalTime = Date.now() - startTime;
    const successfulRequests = results.filter(r => r.success);
    const successRate = (successfulRequests.length / results.length) * 100;
    const latencies = results.map(r => r.latency).sort((a, b) => a - b);
    const averageLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
    const p95Latency = latencies[Math.floor(latencies.length * 0.95)];
    const p99Latency = latencies[Math.floor(latencies.length * 0.99)];
    const totalCost = results.reduce((sum, r) => sum + (r.cost || 0), 0);
    
    console.log(`\n📊 Load Test Results:`);
    console.log(`✨ Success rate: ${successRate.toFixed(1)}%`);
    console.log(`⏱️  Average latency: ${averageLatency.toFixed(0)}ms`);
    console.log(`📈 P95 latency: ${p95Latency}ms`);
    console.log(`📈 P99 latency: ${p99Latency}ms`);
    console.log(`⏰ Total time: ${totalTime}ms`);
    console.log(`💰 Total cost: $${totalCost.toFixed(6)}`);
    
    return {
      taskType,
      concurrentRequests,
      totalRequests,
      successRate,
      averageLatency,
      p95Latency,
      p99Latency,
      errorsPerProvider,
      fallbacksTriggered,
      totalCost
    };
  }
  
  /**
   * Test provider reliability over time
   */
  async testProviderReliability(
    provider: string,
    requests: number = 50,
    intervalMs: number = 1000
  ): Promise<ProviderReliabilityTest> {
    console.log(`🔬 Testing provider reliability: ${provider}`);
    console.log(`📊 Requests: ${requests}, Interval: ${intervalMs}ms`);
    
    const errors: Array<{ timestamp: Date; error: string; taskType: string }> = [];
    const latencies: number[] = [];
    let successCount = 0;
    let failureCount = 0;
    
    for (let i = 0; i < requests; i++) {
      const taskType = ['writing', 'research', 'creative'][i % 3];
      const startTime = Date.now();
      
      try {
        const result = await this.testProvider(provider, taskType, 10000);
        const latency = Date.now() - startTime;
        latencies.push(latency);
        
        if (result.success) {
          successCount++;
        } else {
          failureCount++;
          errors.push({
            timestamp: new Date(),
            error: result.error || 'Unknown error',
            taskType
          });
        }
      } catch (error) {
        failureCount++;
        errors.push({
          timestamp: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error',
          taskType
        });
      }
      
      // Progress indicator
      if ((i + 1) % 10 === 0) {
        console.log(`📊 Progress: ${i + 1}/${requests} (${successCount}/${i + 1} success)`);
      }
      
      // Wait between requests
      if (i < requests - 1) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }
    
    const averageLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length || 0;
    const reliability = successCount / requests;
    
    console.log(`\n📊 Reliability Test Results for ${provider}:`);
    console.log(`✅ Success rate: ${(reliability * 100).toFixed(1)}%`);
    console.log(`❌ Failures: ${failureCount}/${requests}`);
    console.log(`⏱️  Average latency: ${averageLatency.toFixed(0)}ms`);
    
    return {
      provider,
      requests,
      successCount,
      failureCount,
      averageLatency,
      errors,
      reliability
    };
  }
  
  /**
   * Test individual provider
   */
  private async testProvider(
    provider: string, 
    taskType: string, 
    timeoutMs: number = 30000
  ): Promise<{
    success: boolean;
    model?: string;
    error?: string;
    tokensUsed?: number;
    cost?: number;
  }> {
    const prompt = this.testPrompts[taskType] || this.testPrompts.writing;
    
    try {
      const response = await Promise.race([
        fetch(`${process.env.BASE_URL || 'http://localhost:3000'}/api/providers/${provider}/test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            task: taskType, 
            prompt,
            test: true 
          })
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), timeoutMs)
        )
      ]);
      
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          model: data.model,
          tokensUsed: this.estimateTokens(prompt),
          cost: this.estimateCost(provider, this.estimateTokens(prompt))
        };
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        return {
          success: false,
          error: `HTTP ${response.status}: ${errorText}`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Execute single load test request
   */
  private async executeLoadTestRequest(
    taskType: string,
    options: { simulateFailures?: string[]; timeoutMs?: number }
  ): Promise<{ success: boolean; latency: number; provider: string; error?: string; cost?: number }> {
    const startTime = Date.now();
    
    try {
      const result = await this.testFallbackChain(taskType, options.simulateFailures || []);
      const latency = Date.now() - startTime;
      
      return {
        success: result.success,
        latency,
        provider: result.finalProvider || 'none',
        cost: result.summary.totalCost,
        error: result.success ? undefined : 'All providers failed'
      };
    } catch (error) {
      return {
        success: false,
        latency: Date.now() - startTime,
        provider: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Get fallback chain for task type
   */
  private getFallbackChain(taskType: string): string[] {
    const chains: Record<string, string[]> = {
      research: ['perplexity', 'anthropic', 'google', 'openai'],
      writing: ['anthropic', 'openai', 'google'],
      image: ['google', 'openai'],
      creative: ['openai', 'anthropic', 'google'],
      analysis: ['anthropic', 'google', 'openai'],
      ideation: ['openai', 'anthropic', 'google']
    };
    return chains[taskType] || chains.writing;
  }
  
  /**
   * Estimate tokens for test prompt (rough estimation)
   */
  private estimateTokens(prompt: string): number {
    return Math.ceil(prompt.length / 4); // Rough approximation
  }
  
  /**
   * Estimate cost based on provider and tokens
   */
  private estimateCost(provider: string, tokens: number): number {
    const costPer1k: Record<string, number> = {
      openai: 0.03,
      anthropic: 0.025,
      google: 0.02,
      perplexity: 0.015
    };
    
    return (costPer1k[provider] || 0.02) * (tokens / 1000);
  }
}

// Export singleton instance for testing
export const fallbackTester = new FallbackTester();