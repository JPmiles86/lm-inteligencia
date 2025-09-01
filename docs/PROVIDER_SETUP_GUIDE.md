# Provider Setup Guide - AI API Key Management

**Version:** 1.0  
**Last Updated:** 2025-08-31  
**Audience:** Admin Users

## 📋 Overview

This guide explains how to configure and manage AI provider API keys using the Provider Settings interface. The system supports four major AI providers with secure database storage and automatic fallback capabilities.

## 🚀 Getting Started

### Accessing Provider Settings

1. **Login to Admin Panel**
   - Navigate to `/admin` on your website
   - Enter your admin credentials

2. **Navigate to Provider Settings**
   - Click **Settings** in the admin sidebar
   - Select the **Provider Settings** tab
   - You'll see the provider management interface

## 🔑 Adding API Keys

### Step-by-Step Process

1. **Choose a Provider**
   - Select from: OpenAI, Anthropic, Google AI, or Perplexity
   - Each provider card shows capabilities and status

2. **Add API Key**
   - Click **Add API Key** button on the provider card
   - Enter your API key in the secure input field
   - Use the eye icon to show/hide the key while typing
   - Click **Save Key** to store securely

3. **Test Connection**
   - After saving, click **Test Connection**
   - The system will verify your API key works correctly
   - Status indicator will show green checkmark if successful

### Provider-Specific Instructions

#### OpenAI
- **Get API Key:** Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
- **Format:** Starts with `sk-`
- **Capabilities:** Text generation, image creation, research
- **Models:** GPT-4o, GPT-4o-mini, GPT-4, GPT-3.5-turbo

#### Anthropic (Claude)
- **Get API Key:** Visit [Anthropic Console](https://console.anthropic.com/)
- **Format:** Starts with `sk-ant-`
- **Capabilities:** Text generation, advanced reasoning
- **Models:** Claude-3.5-Sonnet, Claude-3.5-Haiku

#### Google AI (Gemini)
- **Get API Key:** Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Format:** Alphanumeric string
- **Capabilities:** Text generation, image creation, multimodal
- **Models:** Gemini-1.5-Pro, Gemini-1.5-Flash

#### Perplexity
- **Get API Key:** Visit [Perplexity API](https://www.perplexity.ai/settings/api)
- **Format:** Starts with `pplx-`
- **Capabilities:** Research, real-time web data
- **Models:** Llama-3.1-Sonar variants

## 🔄 Managing Existing Keys

### Updating API Keys
1. Click **Update Key** on any configured provider
2. Enter the new API key
3. Click **Save Key** to update
4. Test the connection to verify the new key works

### Removing API Keys
1. Click **Remove** on the provider card
2. Confirm the removal in the dialog
3. The provider will be removed from your configuration
4. ⚠️ **Warning:** This action cannot be undone

### Testing Connections
- Click **Test Connection** anytime to verify a provider
- Tests are performed using actual API calls
- Results are stored and displayed with timestamps
- Green checkmark = successful connection
- Red X = connection failed
- Yellow warning = configured but not tested

## 🛡️ Security Best Practices

### API Key Security
- **Never share your API keys** with unauthorized users
- **Store keys securely** - our system encrypts them automatically
- **Rotate keys regularly** for enhanced security
- **Monitor usage** on your provider dashboards for unusual activity

### Access Control
- Only admin users can access provider settings
- API keys are never displayed in full after saving
- Keys are encrypted with military-grade AES-256-GCM encryption
- Each key has a unique encryption salt

### Safe Practices
- Test connections before using in production
- Keep backup of working configurations
- Monitor your provider billing dashboards
- Remove unused providers to reduce attack surface

## 🔄 Understanding Fallback Chains

### How Fallback Works
The system automatically selects the best available provider for each task:

1. **Primary Selection:** Uses your preferred provider if available
2. **Automatic Fallback:** If primary fails, tries the next in chain
3. **Task Optimization:** Different tasks use different fallback orders

### Fallback Chain Priorities

#### Research Tasks
1. **Perplexity** - Real-time web data and research
2. **Anthropic** - Advanced reasoning and analysis  
3. **Google** - Multimodal capabilities
4. **OpenAI** - General knowledge and creativity

#### Writing Tasks  
1. **Anthropic** - Superior reasoning and writing quality
2. **OpenAI** - Creative and engaging content
3. **Google** - Fast processing and reliability

#### Image Generation
1. **Google** - Advanced image generation capabilities
2. **OpenAI** - DALL-E image generation

#### Creative Tasks
1. **OpenAI** - Leading creative AI capabilities
2. **Anthropic** - Thoughtful and nuanced creativity
3. **Google** - Reliable creative assistance

### Optimizing Your Setup
- **Configure multiple providers** for maximum reliability
- **Test all connections** to ensure fallback works
- **Monitor which providers work best** for your specific use cases
- **Keep at least one provider per capability** (text, image, research)

## 📊 Provider Status Indicators

### Status Icons Explained
- 🟢 **Green Checkmark:** Successfully tested and working
- 🔴 **Red X:** Connection test failed or not configured
- 🟡 **Yellow Warning:** Configured but not tested
- ⚪ **Gray Circle:** Not configured

### Status Overview Dashboard
The main dashboard shows:
- **Total Providers:** 4 available providers
- **Configured:** Number of providers with API keys
- **Connected:** Number successfully tested
- **Last Tested:** Timestamp of most recent test

## 🚨 Troubleshooting

### Common Issues

#### "Connection Test Failed"
- **Check API Key:** Ensure key is copied correctly
- **Verify Account Status:** Check if your provider account is active
- **Check Billing:** Some providers require billing setup
- **Network Issues:** Retry after a few minutes

#### "Invalid API Key Format"  
- **OpenAI:** Must start with `sk-`
- **Anthropic:** Must start with `sk-ant-`
- **Perplexity:** Must start with `pplx-`
- **Google:** Check for extra spaces or characters

#### "Provider Not Responding"
1. Wait a few minutes and retry
2. Check provider status pages for outages
3. Verify your internet connection
4. Try testing a different provider

### Error Messages
- **"API key is required":** Enter a valid API key
- **"Failed to save API key":** Check network connection and try again
- **"Connection test failed":** API key may be invalid or account issues
- **"Provider not configured":** Add an API key first

## 📞 Getting Help

### Support Resources
- **Provider Documentation:** Check your provider's official docs
- **Admin Support:** Contact your system administrator
- **Provider Support:** Contact provider support for account issues

### Additional Resources
- [OpenAI Documentation](https://platform.openai.com/docs)
- [Anthropic Documentation](https://docs.anthropic.com/)
- [Google AI Documentation](https://ai.google.dev/)
- [Perplexity API Documentation](https://docs.perplexity.ai/)

## 📋 Quick Reference

### Supported Providers
| Provider | Text | Images | Research | Key Format |
|----------|------|--------|----------|------------|
| OpenAI | ✅ | ✅ | ✅ | `sk-...` |
| Anthropic | ✅ | ❌ | ✅ | `sk-ant-...` |
| Google AI | ✅ | ✅ | ✅ | Alphanumeric |
| Perplexity | ✅ | ❌ | ✅ | `pplx-...` |

### Task-Based Recommendations
- **Blog Writing:** Anthropic or OpenAI
- **Research Articles:** Perplexity or Anthropic  
- **Image Generation:** Google AI or OpenAI
- **Technical Documentation:** Anthropic or Google
- **Creative Content:** OpenAI or Anthropic

---

## 🎯 Success Checklist

Before going live, ensure:
- [ ] At least one provider configured and tested
- [ ] All desired capabilities covered (text/images/research)
- [ ] API keys tested successfully  
- [ ] Provider accounts have adequate billing setup
- [ ] Fallback chains understood and verified
- [ ] Admin team trained on provider management

**You're ready to use the AI content generation system!**

---

*For technical support or questions about this guide, contact your system administrator.*