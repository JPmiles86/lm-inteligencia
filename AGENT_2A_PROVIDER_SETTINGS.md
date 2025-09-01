# Agent-2A: Provider Settings UI Implementation
**Priority:** 🔴 CRITICAL
**Duration:** 16 hours
**Dependencies:** Phase 1 complete (TypeScript, API, Tests)
**Created:** 2025-08-31

## 🎯 MISSION
Implement a complete Provider Settings UI in the admin area where users can manage their AI provider API keys. Keys must be stored in the database (NOT env vars) and properly encrypted.

## 📋 CONTEXT
- **Current State:** OpenAI key in .env (temporary, not for production use)
- **Database Table:** `providerSettings` already exists in schema
- **API Endpoints:** Created by Agent-1B in `/api/routes/provider.routes.ts`
- **Requirement:** Users manage their own API keys via UI

## ✅ SUCCESS CRITERIA
1. Provider settings page accessible from admin dashboard
2. Users can add/update/remove API keys for all 4 providers
3. Keys are encrypted before database storage
4. Test connection feature for each provider
5. Visual indication of which providers are configured
6. Fallback configuration interface

## 🔧 SPECIFIC TASKS

### 1. Create Provider Settings Page Component (3 hours)

#### `/src/components/admin/ProviderSettings.tsx`
```typescript
import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Loader2, Key, AlertCircle } from 'lucide-react';
import { useProviderStore } from '@/stores/providerStore';

interface Provider {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'perplexity';
  hasKey: boolean;
  active: boolean;
  lastTested?: string;
  testSuccess?: boolean;
  capabilities: {
    text: boolean;
    image: boolean;
    research: boolean;
  };
}

export const ProviderSettings: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  
  // Load providers on mount
  useEffect(() => {
    loadProviders();
  }, []);
  
  const loadProviders = async () => {
    try {
      const response = await fetch('/api/providers');
      const data = await response.json();
      setProviders(data);
    } catch (error) {
      console.error('Failed to load providers:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Component implementation...
};
```

### 2. Create Individual Provider Card Component (2 hours)

#### `/src/components/admin/ProviderCard.tsx`
```typescript
interface ProviderCardProps {
  provider: Provider;
  onUpdate: (provider: string, apiKey: string) => Promise<void>;
  onTest: (provider: string) => Promise<void>;
  onRemove: (provider: string) => Promise<void>;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  onUpdate,
  onTest,
  onRemove
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getProviderIcon(provider.provider)}
          <div>
            <h3 className="text-lg font-semibold">{provider.name}</h3>
            <p className="text-sm text-gray-500">
              {getProviderDescription(provider.provider)}
            </p>
          </div>
        </div>
        {provider.hasKey ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <XCircle className="h-5 w-5 text-gray-400" />
        )}
      </div>
      
      {/* Capabilities badges */}
      <div className="flex gap-2 mb-4">
        {provider.capabilities.text && (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
            Text Generation
          </span>
        )}
        {provider.capabilities.image && (
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
            Image Generation
          </span>
        )}
        {provider.capabilities.research && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
            Research
          </span>
        )}
      </div>
      
      {/* API Key input/display */}
      {isEditing ? (
        <div className="space-y-3">
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API key..."
              className="w-full px-3 py-2 border rounded-md pr-10"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-2"
            >
              {showKey ? "Hide" : "Show"}
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                await onUpdate(provider.provider, apiKey);
                setIsEditing(false);
                setApiKey('');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Save Key
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setApiKey('');
              }}
              className="px-4 py-2 bg-gray-300 rounded-md"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          {provider.hasKey ? (
            <>
              <button
                onClick={() => onTest(provider.provider)}
                className="px-3 py-1 bg-green-600 text-white rounded-md text-sm"
              >
                Test Connection
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
              >
                Update Key
              </button>
              <button
                onClick={() => onRemove(provider.provider)}
                className="px-3 py-1 bg-red-600 text-white rounded-md text-sm"
              >
                Remove
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
            >
              Add API Key
            </button>
          )}
        </div>
      )}
      
      {/* Test results */}
      {provider.lastTested && (
        <div className="mt-3 text-sm">
          Last tested: {new Date(provider.lastTested).toLocaleString()}
          {provider.testSuccess ? (
            <span className="text-green-600 ml-2">✓ Success</span>
          ) : (
            <span className="text-red-600 ml-2">✗ Failed</span>
          )}
        </div>
      )}
    </div>
  );
};
```

### 3. Create Provider Store for State Management (2 hours)

#### `/src/stores/providerStore.ts`
```typescript
import { create } from 'zustand';

interface ProviderState {
  providers: Map<string, Provider>;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadProviders: () => Promise<void>;
  updateProvider: (provider: string, apiKey: string) => Promise<void>;
  testProvider: (provider: string) => Promise<boolean>;
  removeProvider: (provider: string) => Promise<void>;
  getAvailableProviders: (capability: 'text' | 'image' | 'research') => Provider[];
  selectProvider: (task: string, preferred?: string) => Provider | null;
}

export const useProviderStore = create<ProviderState>((set, get) => ({
  providers: new Map(),
  loading: false,
  error: null,
  
  loadProviders: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/providers');
      const data = await response.json();
      
      const providerMap = new Map();
      data.forEach(p => providerMap.set(p.provider, p));
      
      set({ providers: providerMap, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  updateProvider: async (provider, apiKey) => {
    try {
      const response = await fetch(`/api/providers/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey })
      });
      
      if (!response.ok) throw new Error('Failed to update provider');
      
      // Reload providers
      await get().loadProviders();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  testProvider: async (provider) => {
    try {
      const response = await fetch(`/api/providers/${provider}/test`, {
        method: 'POST'
      });
      
      const result = await response.json();
      
      // Update provider test status
      const providers = get().providers;
      const providerData = providers.get(provider);
      if (providerData) {
        providerData.lastTested = new Date().toISOString();
        providerData.testSuccess = result.success;
        set({ providers: new Map(providers) });
      }
      
      return result.success;
    } catch (error) {
      return false;
    }
  },
  
  removeProvider: async (provider) => {
    try {
      const response = await fetch(`/api/providers/${provider}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to remove provider');
      
      await get().loadProviders();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  getAvailableProviders: (capability) => {
    const providers = Array.from(get().providers.values());
    return providers.filter(p => 
      p.hasKey && 
      p.active && 
      p.capabilities[capability]
    );
  },
  
  selectProvider: (task, preferred) => {
    const providers = get().providers;
    
    // Try preferred first
    if (preferred && providers.has(preferred)) {
      const provider = providers.get(preferred);
      if (provider?.hasKey && provider.active) {
        return provider;
      }
    }
    
    // Use fallback chain
    const fallbackChains = {
      research: ['perplexity', 'anthropic', 'google', 'openai'],
      writing: ['anthropic', 'openai', 'google'],
      image: ['google', 'openai'],
      creative: ['openai', 'anthropic', 'google']
    };
    
    const chain = fallbackChains[task] || fallbackChains.writing;
    
    for (const providerName of chain) {
      const provider = providers.get(providerName);
      if (provider?.hasKey && provider.active) {
        return provider;
      }
    }
    
    return null;
  }
}));
```

### 4. Create Fallback Configuration UI (3 hours)

#### `/src/components/admin/FallbackConfiguration.tsx`
```typescript
interface FallbackConfig {
  task: string;
  chain: string[];
}

export const FallbackConfiguration: React.FC = () => {
  const [configs, setConfigs] = useState<FallbackConfig[]>([
    { task: 'research', chain: ['perplexity', 'anthropic', 'google', 'openai'] },
    { task: 'writing', chain: ['anthropic', 'openai', 'google'] },
    { task: 'image', chain: ['google', 'openai'] },
    { task: 'creative', chain: ['openai', 'anthropic', 'google'] }
  ]);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Fallback Configuration</h3>
      <p className="text-sm text-gray-600 mb-6">
        Configure the order in which providers are tried when your preferred provider is unavailable.
      </p>
      
      {configs.map((config) => (
        <div key={config.task} className="mb-6">
          <h4 className="font-medium mb-2 capitalize">{config.task} Tasks</h4>
          <div className="flex items-center space-x-2">
            {config.chain.map((provider, index) => (
              <React.Fragment key={provider}>
                <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded">
                  {provider}
                </div>
                {index < config.chain.length - 1 && (
                  <span className="text-gray-400">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
      
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> The system will automatically use the first available provider 
          in each chain. Make sure to configure API keys for at least one provider in each chain.
        </p>
      </div>
    </div>
  );
};
```

### 5. Add Provider Settings to Admin Dashboard (2 hours)

#### Update `/src/components/admin/SimplifiedAdminDashboard.tsx`
Add navigation item and route:
```typescript
// Add to navigation items
{
  name: 'Provider Settings',
  icon: Key,
  path: '/admin/providers',
  description: 'Manage AI provider API keys'
}

// Add route handling
{activeSection === 'providers' && <ProviderSettings />}
```

### 6. Create API Key Encryption Service (2 hours)

#### Already created by Agent-1B in `/api/utils/encryption.ts`
Verify and enhance if needed:
```typescript
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const password = process.env.ENCRYPTION_PASSWORD || 'default-dev-password';

export function encrypt(text: string): { encrypted: string; salt: string } {
  const salt = crypto.randomBytes(32);
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted: iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted,
    salt: salt.toString('hex')
  };
}

export function decrypt(encryptedData: string, salt: string): string {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const key = crypto.pbkdf2Sync(
    password, 
    Buffer.from(salt, 'hex'), 
    100000, 
    32, 
    'sha256'
  );
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

### 7. Create Provider Testing Service (2 hours)

#### `/api/services/providerTesting.ts`
```typescript
export async function testOpenAI(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function testAnthropic(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 10
      })
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function testGoogle(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
    );
    return response.ok;
  } catch {
    return false;
  }
}

export async function testPerplexity(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 10
      })
    });
    return response.ok;
  } catch {
    return false;
  }
}
```

## 📝 REQUIRED DELIVERABLES

### 1. Implementation Report
**File:** `/docs/agent-reports/AGENT-2A-PROVIDER-SETTINGS.md`
- List all components created
- Document API integration points
- Note any issues encountered

### 2. User Guide
**File:** `/docs/PROVIDER_SETUP_GUIDE.md`
- How to add API keys
- How to test connections
- Understanding fallback chains
- Security best practices

### 3. Update Master Progress Log
Add completion status to `/MASTER_PROGRESS_LOG.md`

## 🔍 TESTING REQUIREMENTS

1. **UI Testing:**
- Can access provider settings from admin dashboard
- Can add API key for each provider
- Can update existing API keys
- Can remove API keys
- Test connection button works

2. **API Testing:**
- Keys are encrypted before storage
- Keys are never sent to frontend in plain text
- Test connection validates actual API keys

3. **Fallback Testing:**
- System selects correct provider based on availability
- Fallback chain works when preferred unavailable

## ⚠️ IMPORTANT NOTES

1. **Security Critical:**
- NEVER store API keys in plain text
- NEVER send decrypted keys to frontend
- Use secure encryption (AES-256-GCM)
- Generate unique salts per key

2. **User Experience:**
- Show clear success/failure indicators
- Provide helpful error messages
- Show which providers are ready to use
- Indicate provider capabilities clearly

3. **Database Integration:**
- Use existing `providerSettings` table
- Maintain schema compatibility
- Handle migration of any env keys

## 🚫 DO NOT

1. Store API keys in environment variables
2. Log or display API keys in plain text
3. Send keys over unencrypted connections
4. Skip validation when saving keys
5. Allow invalid keys to be saved

## 💡 PROVIDER-SPECIFIC NOTES

### OpenAI
- Test endpoint: GET /v1/models
- Header: `Authorization: Bearer {key}`

### Anthropic
- Test with minimal message
- Header: `x-api-key: {key}`
- Requires anthropic-version header

### Google (Gemini)
- Test endpoint: GET /v1/models
- Query param: `key={key}`

### Perplexity
- Test with minimal completion
- Header: `Authorization: Bearer {key}`
- Supports online models for research

---

*Report completion to `/docs/agent-reports/` and update `/MASTER_PROGRESS_LOG.md`*