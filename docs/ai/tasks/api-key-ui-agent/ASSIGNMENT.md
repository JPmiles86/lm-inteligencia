# Task Assignment: Frontend API Key Management UI
## Agent: API Key UI Agent  
## Date: 2025-08-25
## Priority: CRITICAL - Required for Client Testing

### Objective
Implement a complete frontend UI for managing AI provider API keys. The client needs to add and manage API keys through the admin interface, not through environment variables. This is essential for production use on Vercel.

### Context
- The AI system is ready for deployment but needs API key management
- Client has an OpenAI key ready to test
- System supports 4 providers: OpenAI, Anthropic, Google, Perplexity
- Keys must be securely stored and used for all AI operations
- This will be deployed on Vercel for production testing

### Current State
- Admin settings (`/admin/settings`) only handles content visibility
- No UI for API key management exists
- Backend expects API keys but currently reads from env vars
- Database has aiProviders table ready for storing provider configs

### Requirements

#### Frontend UI Components Needed
1. **API Key Management Section in Settings**
   - List of 4 providers with status indicators
   - Add/Edit/Delete API keys for each provider
   - Test connection button for each provider
   - Show usage stats if available

2. **Provider Configuration Interface**
   - Provider selection dropdown (OpenAI, Anthropic, Google, Perplexity)
   - Secure API key input field (masked/hidden)
   - Model selection based on provider
   - Save and test functionality

3. **Security Features**
   - Keys shown as masked (••••••) with reveal toggle
   - Encryption before sending to backend
   - Secure storage in database (already has encryption field)
   - No keys in environment variables or client-side storage

#### Backend Integration Required
1. **API Endpoints** (may exist in `/api/ai/providers.js`)
   - GET /api/ai/providers - List configured providers
   - POST /api/ai/providers - Add/update provider config
   - DELETE /api/ai/providers/:id - Remove provider
   - POST /api/ai/providers/test - Test provider connection

2. **Service Layer Updates**
   - Read API keys from database, not env vars
   - Decrypt keys when needed for API calls
   - Cache decrypted keys in memory for performance

### Implementation Plan

#### Phase 1: UI Components
1. Create new settings section for AI Configuration
2. Build provider management interface
3. Add secure key input and management

#### Phase 2: Backend Integration  
1. Update provider endpoints to handle key management
2. Modify ProviderService to use database keys
3. Implement key encryption/decryption

#### Phase 3: Testing & Security
1. Test all 4 providers with real keys
2. Verify encryption is working
3. Ensure no keys leak to frontend

### Files to Create/Modify

#### Frontend
- `/src/components/admin/Settings/AIConfiguration.tsx` - New component
- `/src/components/admin/Settings/ProviderKeyManager.tsx` - Key management UI
- `/src/components/admin/Settings.tsx` - Add AI Configuration section
- `/src/services/aiProviderService.ts` - Frontend service for API calls

#### Backend (if needed)
- `/api/ai/providers.js` - Enhance with key management
- `/src/services/ai/ProviderService.js` - Use database keys
- `/src/repositories/aiRepository.ts` - Key encryption methods

### User Flow
1. Admin navigates to Settings → AI Configuration
2. Sees list of 4 AI providers with status
3. Clicks "Configure" on a provider (e.g., OpenAI)
4. Enters API key (shown as masked)
5. Clicks "Test Connection" to verify
6. Saves configuration
7. Key is encrypted and stored in database
8. All AI features now use this key

### Security Considerations
- Never store keys in plain text
- Use strong encryption (AES-256 or similar)
- Keys only decrypted server-side
- Implement rate limiting on key operations
- Log key usage but never log the keys themselves

### Testing Checklist
- [ ] Can add API key for each provider
- [ ] Keys are masked in UI
- [ ] Test connection works
- [ ] Keys are encrypted in database
- [ ] AI generation uses the stored keys
- [ ] Can update existing keys
- [ ] Can remove keys
- [ ] No keys visible in network requests

### Success Criteria
- [ ] Client can add OpenAI key through UI
- [ ] Test generation works with UI-added key
- [ ] All 4 providers supported
- [ ] Secure storage and transmission
- [ ] Clean, intuitive UI
- [ ] Ready for Vercel production deployment

### Important Notes
- Client needs this immediately for testing
- Must work on Vercel (no local env vars)
- Security is critical - no key leaks
- UI should be intuitive and professional
- Test with the actual OpenAI key provided

Begin by creating the UI components, then integrate with backend, ensuring secure key management throughout.