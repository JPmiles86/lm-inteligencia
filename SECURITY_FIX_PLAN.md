# Security Architecture Fix Plan

## Current Problem
- Frontend trying to decrypt API keys (WRONG!)
- API keys exposed to client-side code

## Correct Architecture
1. **Frontend** → Sends user's API key to backend (once, during setup)
2. **Backend** → Encrypts and stores in database
3. **Frontend** → Makes generation requests WITHOUT keys
4. **Backend** → Decrypts keys, calls AI APIs, returns results
5. **Frontend** → Displays results

## Implementation Steps
1. Create backend endpoints that handle all AI calls
2. Fix encryption/decryption to be backend-only
3. Update frontend to use backend endpoints
4. Test with real OpenAI key
5. Remove all mock data

Starting implementation...