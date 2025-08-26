# Subagent Communication Protocol
## Critical: All Work Must Be Documented in .md Files

---

## 🚨 THE .MD RULE

**All orchestrator ↔ subagent communication and work MUST be in `.md` files — NO EXCEPTIONS.**

This preserves context, recovers from crashes, and ensures new agents know exactly where to continue.

---

## 📝 REQUIRED DOCUMENTATION STRUCTURE

### For Each Subagent Task:

```
docs/ai/tasks/[AGENT_NAME]/
├── ASSIGNMENT.md           # What was assigned
├── PROGRESS.md             # Current status
├── FINDINGS.md             # Discoveries and decisions
├── BLOCKERS.md             # Issues encountered
├── HANDOFF.md              # Next steps for takeover
└── work/                   # Actual work files
    ├── completed/          # Finished items
    └── in-progress/        # Current work
```

---

## 📋 ASSIGNMENT TEMPLATE

```markdown
# Task Assignment: [Task Name]
## Agent: [Agent Type]
## Date: [Date]
## Priority: [High/Medium/Low]

### Objective
[Clear description of what needs to be accomplished]

### Context
[Background information and why this is needed]

### Requirements
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

### Dependencies
- [List any prerequisites or blocking tasks]

### Success Criteria
- [How we know the task is complete]

### Resources
- [Links to relevant docs]
- [API keys location]
- [Related files]
```

---

## 📊 PROGRESS TRACKING

```markdown
# Progress Report: [Task Name]
## Last Updated: [Timestamp]

### Completed ✅
- [x] Task 1 - [Brief description]
- [x] Task 2 - [Brief description]

### In Progress 🔄
- [ ] Task 3 - [Current status]
  - Subtask 3.1 [Status]
  - Subtask 3.2 [Status]

### Pending ⏳
- [ ] Task 4
- [ ] Task 5

### Time Spent
- Total: X hours
- Today: Y hours

### Next Actions
1. [Immediate next step]
2. [Following step]
```

---

## 🔍 FINDINGS DOCUMENTATION

```markdown
# Findings: [Task Name]
## Date: [Date]

### Key Discoveries
1. **[Discovery Title]**
   - What: [Description]
   - Why Important: [Impact]
   - Action Required: [Next steps]

### Technical Decisions
1. **[Decision Point]**
   - Options Considered: [List]
   - Choice Made: [Decision]
   - Reasoning: [Why]

### Code Insights
- [Important patterns found]
- [Architecture observations]
- [Performance considerations]
```

---

## 🚧 BLOCKER REPORTING

```markdown
# Blockers: [Task Name]
## Reported: [Timestamp]
## Status: [Active/Resolved]

### Issue Description
[Detailed description of the problem]

### Impact
- Blocks: [What tasks are blocked]
- Severity: [Critical/High/Medium/Low]

### Attempted Solutions
1. [What was tried]
   - Result: [What happened]
2. [Another attempt]
   - Result: [Outcome]

### Required Help
- [What's needed to unblock]
- [Who can help]
- [Alternative approaches]
```

---

## 🤝 HANDOFF PROTOCOL

```markdown
# Handoff Document: [Task Name]
## From: [Current Agent]
## To: [Next Agent/Any Agent]
## Date: [Date]

### Current State
[Where things stand right now]

### Completed Work
- Location: [Path to completed files]
- Summary: [What was done]

### Remaining Work
1. [Task with estimated time]
2. [Task with dependencies]

### Critical Context
- [Important discoveries]
- [Decisions made and why]
- [Pitfalls to avoid]

### Environment Setup
- API Keys: [Location/status]
- Dependencies: [What's installed]
- Configuration: [Key settings]

### Next Steps
1. [Immediate action]
2. [Following action]
3. [Verification steps]
```

---

## 🔄 CRASH RECOVERY PROTOCOL

When an agent crashes or loses context:

1. **Check PROGRESS.md** - See what was completed
2. **Read FINDINGS.md** - Understand decisions made
3. **Review BLOCKERS.md** - Check for unresolved issues
4. **Read HANDOFF.md** - Get continuation instructions
5. **Resume from work/** - Continue from last checkpoint

---

## 💡 BEST PRACTICES

### DO:
✅ Update .md files IMMEDIATELY after completing tasks
✅ Document decisions AS YOU MAKE THEM
✅ Create checkpoints before complex operations
✅ Include code snippets in markdown for context
✅ Link to actual code files from .md docs
✅ Use clear, descriptive filenames
✅ Timestamp all updates

### DON'T:
❌ Wait to document until "later"
❌ Assume the next agent will "figure it out"
❌ Skip documenting "obvious" things
❌ Put documentation only in code comments
❌ Use vague descriptions
❌ Forget to update status

---

## 📁 FILE NAMING CONVENTIONS

```
YYYY-MM-DD_[AGENT]_[TASK]_[STATUS].md

Examples:
2025-08-25_DATABASE_SCHEMA_COMPLETE.md
2025-08-25_FRONTEND_COMPONENTS_IN_PROGRESS.md
2025-08-25_API_AUTH_BLOCKED.md
```

---

## 🔍 VERIFICATION CHECKLIST

Before marking any task complete:

- [ ] ASSIGNMENT.md requirements all checked
- [ ] PROGRESS.md shows 100% complete
- [ ] FINDINGS.md documents key decisions
- [ ] BLOCKERS.md shows all resolved
- [ ] HANDOFF.md prepared for next agent
- [ ] All code tested and working
- [ ] Documentation reflects actual state

---

## 🚀 SUBAGENT STARTUP CHECKLIST

When starting work:

1. [ ] Read ALL .md files in your task directory
2. [ ] Verify you understand the assignment
3. [ ] Check for blockers from previous agent
4. [ ] Set up your work environment
5. [ ] Create initial PROGRESS.md
6. [ ] Begin work with documentation

---

## ⚠️ CRITICAL REMINDERS

1. **NO ORAL AGREEMENTS** - If it's not in .md, it didn't happen
2. **NO ASSUMPTIONS** - Document everything explicitly
3. **NO SHORTCUTS** - Follow the protocol always
4. **NO DELAYS** - Update docs in real-time
5. **NO EXCEPTIONS** - The .md rule is absolute

---

## 📞 ESCALATION

If unable to follow protocol:
1. Document the issue in BLOCKERS.md
2. Request orchestrator assistance
3. Wait for resolution before proceeding
4. Document resolution in FINDINGS.md

Remember: **Documentation IS the work, not an addition to it.**