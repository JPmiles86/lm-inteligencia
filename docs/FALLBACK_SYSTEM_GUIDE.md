# Intelligent Fallback System Guide

## Overview

The Intelligent Fallback System automatically selects the best available AI provider based on task requirements, provider health, and availability. It provides robust error handling, cost optimization, and real-time monitoring capabilities.

## 🚀 Quick Start

### Basic Usage

```typescript
import { intelligentProviderSelector } from '../api/services/intelligentProviderSelector';

// Select provider for a task
const provider = await intelligentProviderSelector.selectProvider(
  'writing',
  { capability: 'text', maxCost: 0.03 }
);

console.log(`Selected provider: ${provider.provider}`);
console.log(`Model: ${provider.model}`);
console.log(`Fallback chain: ${provider.fallbackChain.join(' → ')}`);
```

### With Retry Logic

```typescript
import { retryHandler } from '../api/services/retryHandler';

const result = await retryHandler.executeWithFallback(
  () => primaryProviderCall(),
  fallbackProviders.map(p => () => p.call()),
  { maxAttempts: 3, initialDelay: 1000 }
);
```

## 📋 How Fallback Chains Work

### Default Fallback Chains

The system uses task-optimized fallback chains:

| Task Type | Fallback Chain |
|-----------|----------------|
| **Research** | Perplexity → Anthropic → Google → OpenAI |
| **Writing** | Anthropic → OpenAI → Google |
| **Image** | Google → OpenAI |
| **Creative** | OpenAI → Anthropic → Google |
| **Analysis** | Anthropic → Google → OpenAI |
| **Multimodal** | Google → OpenAI |

### How Selection Works

1. **Preferred Provider Check**: If specified, tries preferred provider first
2. **Health Check**: Skips unhealthy providers unless no alternatives
3. **Capability Match**: Ensures provider supports required capabilities
4. **Cost Constraints**: Respects maximum cost requirements
5. **Fallback Execution**: Proceeds through chain until success

### Example: Research Task Flow

```
User Request: Research task
    ↓
1. Try Perplexity (specialized for research)
    ↓ (if fails)
2. Try Anthropic (excellent reasoning)
    ↓ (if fails)
3. Try Google (large context)
    ↓ (if fails)
4. Try OpenAI (reliable fallback)
    ↓ (if all fail)
5. Return error
```

## ⚙️ Customizing Fallback Order

### API Configuration

```typescript
// Custom provider selection
const customProvider = await intelligentProviderSelector.selectProvider(
  'writing',
  {
    capability: 'text',
    maxCost: 0.025,
    preferredModels: ['claude-3-5-sonnet-20241022'],
    minTokens: 50000
  },
  'anthropic' // Preferred provider
);
```

### Environment Variables

```bash
# Override health check interval (default: 5 minutes)
HEALTH_CHECK_INTERVAL_MS=300000

# Override base URL for health checks
BASE_URL=https://your-domain.com
```

### Provider-Specific Settings

Update provider settings through the API:

```bash
curl -X POST /api/providers/openai \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "your-key",
    "settings": {
      "temperature": 0.7,
      "maxTokens": 4000,
      "rateLimitRpm": 500
    }
  }'
```

## 🏥 Understanding Health Monitoring

### Health Metrics

Each provider is continuously monitored for:

- **Health Status**: Overall healthy/unhealthy status
- **Success Rate**: Percentage of successful requests (0-100%)
- **Average Latency**: Mean response time in milliseconds
- **Failure Count**: Number of consecutive failures
- **Last Check**: Timestamp of most recent health check

### Health Check Process

1. **Automated Checks**: Every 5 minutes, system tests all providers
2. **Lightweight Tests**: Minimal test requests to avoid costs
3. **Exponential Smoothing**: Metrics use moving averages for stability
4. **Smart Thresholds**: Providers marked unhealthy after repeated failures

### Health-Based Selection

```typescript
// Health influences selection:
// 1. Healthy providers are preferred
// 2. Unhealthy providers are skipped if alternatives exist
// 3. If all providers in chain are unhealthy, system still attempts requests
// 4. Recent performance data influences provider ordering
```

### Monitoring Health Status

```bash
# Get all provider health
curl /api/providers/health

# Get specific provider health
curl /api/providers/openai/health

# Example response:
{
  "provider": "openai",
  "isHealthy": true,
  "lastCheck": "2025-08-31T10:30:00Z",
  "failureCount": 0,
  "averageLatency": 1250,
  "successRate": 0.98
}
```

## 💰 Cost Optimization Strategies

### 1. Provider Cost Hierarchy

Providers are automatically ranked by cost efficiency:

| Provider | Cost per 1K tokens | Best for |
|----------|-------------------|----------|
| **Perplexity** | $0.015 | Research, fact-finding |
| **Google** | $0.020 | General tasks, multimodal |
| **Anthropic** | $0.025 | Complex reasoning, writing |
| **OpenAI** | $0.030 | Creative tasks, reliability |

### 2. Monthly Usage Limits

Set usage limits to control costs:

```bash
curl -X POST /api/providers/openai \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "your-key",
    "monthlyLimit": 100.00  # $100 monthly limit
  }'
```

### 3. Smart Model Selection

The system automatically selects optimal models:

```typescript
// Writing task - cost-optimized
'anthropic' → 'claude-3-5-sonnet-20241022'  // High quality, reasonable cost
'openai' → 'gpt-4o'                         // Reliable fallback
'google' → 'gemini-1.5-pro-latest'          // Cost-effective

// Research task - capability-optimized  
'perplexity' → 'llama-3.1-sonar-large-128k-online'  // Best for research
'anthropic' → 'claude-3-5-sonnet-20241022'          // Strong reasoning
```

### 4. Usage Monitoring

Monitor costs in real-time:

```bash
# Get usage statistics
curl /api/providers/usage?days=30

# Get cost breakdown
curl /api/providers/cost-breakdown?days=7

# Get monthly usage status
curl /api/providers/monthly-usage
```

### 5. Cost Alerts

The system provides automatic cost management:

- **75% Usage**: Warning logged, monitoring increases
- **90% Usage**: Alert logged, consider reviewing usage
- **100% Usage**: Provider automatically disabled to prevent overage

## 🔧 Advanced Configuration

### Retry Strategy Customization

```typescript
import { RetryStrategies } from '../api/services/retryHandler';

// Use pre-configured strategies
const result = await retryHandler.executeWithRetry(
  yourFunction,
  RetryStrategies.conservative  // or aggressive, fast, patient
);

// Custom retry configuration
const result = await retryHandler.executeWithRetry(
  yourFunction,
  {
    maxAttempts: 5,
    initialDelay: 2000,
    maxDelay: 30000,
    backoffMultiplier: 2.5,
    jitter: true
  }
);
```

### Circuit Breaker Pattern

```typescript
// Automatic circuit breaking for repeated failures
const result = await retryHandler.executeWithCircuitBreaker(
  yourFunction,
  'my-operation',
  {
    failureThreshold: 5,      // Open circuit after 5 failures
    resetTimeout: 60000       // Try again after 1 minute
  }
);
```

### Custom Health Checks

```typescript
// Manual health update (useful for integration with your own monitoring)
intelligentProviderSelector.updateProviderHealth(
  'openai',
  true,    // success
  1250     // latency in ms
);
```

## 📊 Dashboard Usage

### Accessing the Dashboard

The Provider Health Dashboard is available at `/admin/providers` and provides:

1. **Real-time Health Status**: Live provider health indicators
2. **Usage Statistics**: Token usage, costs, and request counts
3. **Monthly Limits**: Visual progress bars for usage limits
4. **Fallback Chains**: Visual representation of current chains
5. **Performance Comparison**: Side-by-side provider metrics

### Dashboard Features

- **Auto-refresh**: Updates every 30 seconds
- **Time Range Selection**: View data for different periods
- **Export Capabilities**: Download usage data as JSON/CSV
- **Interactive Elements**: Click providers for detailed information
- **Dark Mode Support**: Automatically adapts to system theme

## 🧪 Testing Your Configuration

### Basic Fallback Test

```typescript
import { fallbackTester } from '../api/utils/fallbackTester';

// Test a specific task with simulated failures
const result = await fallbackTester.testFallbackChain(
  'writing',
  ['anthropic'],  // Simulate Anthropic failure
  { includeUsageTracking: true }
);

console.log('Test Results:', result);
```

### Load Testing

```typescript
// Test system under load
const loadTest = await fallbackTester.runLoadTest(
  'research',
  10,   // 10 concurrent requests
  100   // 100 total requests
);

console.log(`Success rate: ${loadTest.successRate}%`);
console.log(`Average latency: ${loadTest.averageLatency}ms`);
```

### Provider Reliability Testing

```typescript
// Test individual provider reliability
const reliabilityTest = await fallbackTester.testProviderReliability(
  'openai',
  50,    // 50 requests
  1000   // 1 second interval
);

console.log(`Reliability: ${reliabilityTest.reliability * 100}%`);
```

## 🚨 Troubleshooting

### Common Issues

#### 1. All Providers Failing

**Symptoms**: All requests return "No suitable provider available"

**Diagnosis**:
```bash
# Check provider health
curl /api/providers/health

# Check provider configurations
curl /api/providers
```

**Solutions**:
- Verify API keys are correctly configured
- Check monthly usage limits haven't been exceeded
- Ensure providers are marked as active
- Test individual provider connections

#### 2. High Latency

**Symptoms**: Slow response times, frequent timeouts

**Diagnosis**:
```bash
# Check performance metrics
curl /api/providers/performance-comparison?days=1
```

**Solutions**:
- Review health check results for latency issues
- Consider adjusting retry timeouts
- Check if preferred providers are healthy
- Review network connectivity

#### 3. Unexpected Fallbacks

**Symptoms**: System using fallback providers unexpectedly

**Diagnosis**:
```bash
# Check health status
curl /api/providers/health

# Review usage statistics
curl /api/providers/usage?days=1
```

**Solutions**:
- Review provider health scores
- Check for rate limiting issues
- Verify API key validity
- Review error logs for specific failures

#### 4. Cost Overruns

**Symptoms**: Unexpected high costs, providers being disabled

**Diagnosis**:
```bash
# Check monthly usage
curl /api/providers/monthly-usage

# Get cost breakdown
curl /api/providers/cost-breakdown?days=30
```

**Solutions**:
- Review usage patterns and optimize
- Set appropriate monthly limits
- Consider switching to more cost-effective providers
- Implement usage alerts

### Debug Mode

Enable detailed logging by setting environment variable:

```bash
export DEBUG=fallback-system
```

This will log:
- Provider selection decisions
- Health check results  
- Fallback triggers
- Cost calculations
- Error details

## 🔒 Security Considerations

### API Key Management
- API keys are always encrypted in database
- Keys are never logged or exposed in responses
- Health checks use minimal test requests
- Failed authentication is logged securely

### Usage Data Privacy
- Usage statistics can be anonymized
- Export functionality respects data privacy
- Historical data has configurable retention periods
- PII is never stored in usage logs

### Rate Limiting
- Built-in rate limiting prevents abuse
- Circuit breakers protect against cascading failures
- Health checks are lightweight and rate-limited
- Usage tracking prevents excessive requests

## 📈 Performance Tips

### Optimization Strategies

1. **Cache Health Status**: Health checks run every 5 minutes and are cached
2. **Minimize Test Requests**: Use shortest possible test prompts
3. **Efficient Fallbacks**: System fails fast on 4xx errors, retries 5xx
4. **Smart Timeouts**: Different timeouts for different provider types

### Best Practices

1. **Set Realistic Limits**: Configure monthly limits based on actual usage
2. **Monitor Regularly**: Check dashboard weekly for trends
3. **Test Periodically**: Run fallback tests monthly
4. **Update Configurations**: Review provider settings quarterly

## 🚀 Getting Started Checklist

1. ✅ **Configure Providers**: Set up API keys for desired providers
2. ✅ **Set Usage Limits**: Configure monthly spending limits
3. ✅ **Test Connections**: Use `/test` endpoint to verify each provider
4. ✅ **Review Fallback Chains**: Ensure chains match your priorities
5. ✅ **Monitor Dashboard**: Check health status regularly
6. ✅ **Run Initial Tests**: Execute fallback tests to verify system
7. ✅ **Set Alerts**: Configure monitoring for critical thresholds

## 🆘 Support

For issues or questions:

1. **Check Health Dashboard**: Start with real-time system status
2. **Review Logs**: Enable debug logging for detailed information
3. **Test Manually**: Use testing utilities to isolate issues
4. **Consult Documentation**: Review API documentation for endpoints
5. **Check Configuration**: Verify provider settings and limits

The intelligent fallback system is designed to be self-managing and reliable. Most issues resolve automatically through the health monitoring and fallback mechanisms.