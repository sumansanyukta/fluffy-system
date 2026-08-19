# OH-SO AGENTIC ENGINEER — FULL INTERVIEW PREPARATION

## CANDIDATE PROFILE
- 5 years data products experience
- Currently building Xonects: AI productivity SaaS (context-aware chat across tasks, calendar, emails)
- Built solo: two-tier routing, tool-calling agents, Supabase data layer
- Previous: Data analyst at Datadice (Shopify/Amazon data, LTV models, dashboards)
- Previous: Gottdata (recommendation model, data infrastructure)
- Stack: Gemini (tool calling), OpenCode (coding assistant), OpenRouter (model routing)
- Target: Junior AI/Agentic Engineer at OH-SO Digital

---

## XONENTS SYSTEM ARCHITECTURE (THEIR PRODUCT)

### Three-Layer Model
```
1. CLASSIFY — "What does the user want?"
   Context Planner (regex) → Pattern Match
   if no match → LLM Router

2. EXECUTE — "Get or create the data"
   Tool Agent → Supabase query
   or → External API (Trello/Notion/GCal)

3. RENDER — "Show the result in the chat"
   Timeline block (events/tasks/emails)
```

### Decision Tree
```
User types a message
    │
    ▼
Context Planner (regex, no LLM)
  - What kind? (list / create / update / draft / chat)
  - About what? (task / email / event / unknown)
  - Needs data or can answer directly?
    │
    ├─ CAN ANSWER → respond directly (no tool call)
    ├─ NEEDS CLARIFICATION → ask follow-up
    └─ NEEDS DATA ↓
         │
         ▼
    Pattern Router (regex, fast)
      - Matches common patterns: "list my events"
      - Extracts filters: date, provider, search
        │
        ├─ MATCHED → return tool call (no LLM needed)
        └─ NO MATCH ↓
             │
             ▼
        LLM Router (Gemini Flash)
          - Returns JSON with tool call(s)
             │
             ▼
        Execute Tool
          - Query Supabase (integrated_objects table)
          - or call external API (Trello/Notion/GCal)
             │
             ▼
        Render in Chat
          - Timeline block with results
```

### Key Architecture Facts
- **No RAG** — all data access is structured SQL queries against `integrated_objects`
- **Prompt-based routing** — LLM returns JSON with `{ toolCalls: [...] }`, not native function calling
- **Two-tier routing** — Pattern Router (regex, instant) catches common patterns; LLM Router is fallback
- **Client-side tool execution** — frontend sends tool calls to `/execute-tools`
- **Supabase, not Prisma** in chat path — Prisma only in Express backend for background sync
- **Single tool per turn** — LLM returns one tool call; multi-step requires multiple messages
- **Central table: `integrated_objects`** — tasks, emails, events in one denormalized table
- **Context engine runs before LLM** — `buildContextPlan()` uses regex/NLP to classify intent
- **`create_event` is not implemented** — only `create_event_draft` and `update_event` exist
- **Draft vs. live** — drafts save to Supabase only; live writes call external APIs

### All Tools
| Domain | Tool | Read/Write | Where it writes |
|--------|------|-----------|-----------------|
| Tasks | `list_tasks` | Read | Supabase |
| Tasks | `create_task_draft` | Write | Supabase only (safe) |
| Tasks | `create_task` | Write | Notion or Trello API (live) |
| Tasks | `update_task` | Write | Notion or Trello API (live) |
| Tasks | `resolve_task_by_title` | Read | Supabase (search) |
| Tasks | `get_trello_lists_for_user` | Read | Trello API |
| Tasks | `get_notion_databases_for_user` | Read | Notion API |
| Emails | `list_emails` | Read | Supabase |
| Emails | `draft_email` | Write | LLM generates content |
| Events | `list_events` | Read | Supabase |
| Events | `create_event_draft` | Write | Supabase only (safe) |
| Events | `update_event` | Write | Google Calendar / Outlook API |
| Events | `create_event` | — | **Not implemented** |

### Tech Stack
- Frontend: Next.js 15 App Router, React, Redux Toolkit, Zustand
- Backend: Express, Prisma, BullMQ
- Database: Supabase (PostgreSQL)
- AI: Gemini 2.5 Flash (routing, generation), OpenRouter (fallback)
- Auth: Clerk
- Integrations: Trello, Notion, Gmail, Outlook, Google Calendar

### Prompt Engineering (current state)
- Manual testing, instinct-based
- No version control for prompts
- No formal eval harness
- Has designed one: golden dataset + LLM-as-judge + production monitoring

---

## THE CLEAR FRAMEWORK (for case studies)

| Step | What you do | What you say |
|------|-------------|--------------|
| C — Clarify | Ask questions before designing | "Before I design, I need to understand..." |
| L — Landscape | What exists today | "What systems are in place? What data is available?" |
| E — Engineer | Design the solution | "Here's how I'd architect this..." |
| A — Alternatives | Discuss trade-offs | "I considered X and Y, but chose Z because..." |
| R — Risks | What could go wrong | "The main risks are... and here's how I'd mitigate..." |
| E — Evaluate | How to measure success | "I'd know it's working when..." |

### 15 Clarifying Questions (pick 5-8)
1. What data exists today? (format, quality, volume)
2. What's the current process? (manual, automated, broken)
3. Who are the users? (technical, non-technical, how many)
4. What does "done" look like? (success criteria)
5. What's the timeline? (urgent vs. planned)
6. What's the budget? (cost constraints)
7. What integrations exist? (APIs, databases, tools)
8. What's been tried before? (and why it didn't work)
9. What are the constraints? (compliance, latency, scale)
10. Who reviews/approves? (stakeholders)
11. What happens if we do nothing? (cost of inaction)
12. Is this a prototype or production? (scope)
13. What's the fallback if AI fails? (manual override)
14. Are there similar products we should reference? (benchmarks)
15. What's the biggest risk the client is worried about? (their fear)

---

## LIVE PROMPTING FORMULA

### Step 1: UNDERSTAND (30 seconds)
- What's the input? (data, user message, context)
- What's the output? (format, fields, constraints)
- What's the constraint? (cost, latency, accuracy)

### Step 2: DESIGN (2-3 minutes)
```
ROLE:     Who the LLM is
TASK:     What it should do
INPUT:    What data it receives
OUTPUT:   Exact format it should return
RULES:    Constraints and edge cases
EXAMPLES: 1-2 few-shot examples (if needed)
```

### Step 3: EVALUATE (1 minute)
- Correct? — Does it match the expected result?
- Complete? — Are all fields filled?
- Grounded? — No hallucinated facts?
- Consistent? — Run it 3 times, same quality?

### Step 4: ITERATE (1-2 minutes)
- Wrong format? → Add explicit output schema
- Wrong content? → Add more specific instructions or examples
- Hallucination? → Add grounding constraints
- Inconsistent? → Lower temperature, add examples

---

## TECHNICAL CONCEPTS TO KNOW COLD

### RAG vs. Tool Calling
- **RAG**: Retrieves unstructured information via embeddings + vector search. "Find me documents about X."
- **Tool Calling**: Selects a function with structured parameters. "Do this action with these parameters."
- Xonects uses tool calling, not RAG.

### What is a Token?
- Subword unit, ~3/4 of a word
- Matters for: cost (pay per token), context window (max tokens per request), latency (more tokens = slower)
- Xonects loads last 8 messages as context

### Temperature
- Low (0.1-0.3) = deterministic, for structured outputs
- High (0.7-1.0) = creative, for conversation
- Xonects: routing=0.2, chat=0.7, email drafting=0.2

### Context Window
- Maximum tokens an LLM can process in one request
- Includes: system prompt + conversation history + tool definitions + response

### Retry Logic
- 4 retries with exponential backoff
- Falls back to alternate model (Gemini → Claude via OpenRouter)
- Degrades gracefully if both fail

### Guardrails
- Intent classification before LLM (prevents off-scope requests)
- Pattern routing (reduces hallucination risk)
- JSON validation on outputs (prevents malformed tool calls)
- Clarification fallback (asks user rather than guessing)

### MCP (Model Context Protocol)
- Open standard for LLMs to access tools, data, prompts
- Standardized interface — any MCP client can use any MCP server
- OH-SO building shared MCP backbone for reusable tools

### ReAct Loop
- Reason + Act pattern
- LLM reasons → calls tool → observes result → reasons again
- Loop repeats until done
- Xonects doesn't have this (single-turn tool router)

### Hallucination
- LLM confidently stating something false
- Mitigated by: deterministic pattern matching, structured JSON, clarification fallback

---

## BEHAVIORAL ANSWERS (STAR Format)

### Mistake: Revenue Dashboard (Datadice)
- **S**: Monthly revenue dashboard, quarterly audit deadline
- **T**: After API crash, reloaded dataset, showed 18% revenue increase (80K euros phantom)
- **A**: Cross-checked against bank statements, found duplicate rows from reload. Added deduplication, audited joins, added validation steps. Proactively emailed client.
- **R**: Revenue went from 18% to 0.5%. Saved 15 hours. Added permanent validation checklist.

### Learning: API Integration (Xonects)
- **S**: Needed to integrate Google Calendar, Outlook, Notion, Trello into unified data layer
- **T**: Pull data from 4 platforms with different APIs/auth into one Supabase table
- **A**: Read official docs, used Perplexity for guidance, forums for edge cases. Redesigned schema from rigid to flexible (common columns + JSON text for everything else)
- **R**: All 4 integrations working in 3 weeks. Unified layer became foundation for all tool-calling agents.

### Feedback: Over-Reliance (Datadice)
- **S**: Data lead told me to rely less on feedback and take ownership
- **T**: Shift from feedback-dependent to independently making decisions
- **A**: Realized feedback was about symptom (relying on feedback) not cause (no context from client meetings). Proposed plan: include me in meetings for 2 low-stake clients. Took structured notes.
- **R**: Lead attended 5 fewer meetings/week. Got ownership of 4 more clients.

### Ambiguity: Feature Switching (Xonects)
- **S**: Calendar integration in morning, notification system in afternoon
- **T**: Context-switch between completely different architectures in one day
- **A**: Framework: What's input? What's output? Design pipeline between them. Take short breaks. Keep running documentation.
- **R**: Both features shipped on time.

---

## BLOCK 1: INTRO & MOTIVATION

### "Tell me about yourself" (~90 seconds)
"I'm a full-stack developer with five years in data products. I started at Datadice as a data analyst working across 15 client projects — taking messy data from Shopify, Amazon, and legacy databases and turning it into dashboards and reports. One key project was building an LTV model where I found an 18% revenue discrepancy caused by duplicate rows from a bad data reload. I fixed it, added validation steps, and saved 15 hours of investigation time.

Alongside that, I worked at Gottdata building their recommendation model and data infrastructure from scratch.

For the last nine months, I've been building my own AI productivity SaaS — a context-aware chat across tasks, calendar, and emails. I built a two-tier routing system: a Pattern Router for common queries and an LLM Router as fallback. I have tool-calling agents for tasks, emails, and events querying a unified Supabase table. I use Gemini for tool calling, OpenRouter for model routing, and OpenCode as my coding assistant. All integrations — Trello, Notion, Gmail, Outlook, Google Calendar — pull data into one layer.

I'm drawn to OH-SO because your agentic-first approach matches how I already work, and I want to learn from a team that's pushing AI engineering further."

### "Why OH-SO?" (~60 seconds)
"Two things. First, your work on [specific client/project] — combining structured ecommerce data with LLM interfaces is exactly what I've been building. Second, your posting says 'prompt engineering as a code discipline.' I'll be honest — my current prompt iteration is instinct-based. I've designed a three-layer eval system with a golden dataset, LLM-as-judge, and production monitoring, but I haven't implemented it yet. I want to be in an environment where that discipline is expected and taught."

---

## BLOCK 3: TECHNICAL ANSWERS

### Tokens
"A token is a subword unit — roughly 3/4 of a word. The tokenizer breaks text into tokens and maps each to an integer ID the model processes. Tokens matter for three reasons: cost (you pay per token), context window (maximum tokens the model can handle in one request), and latency (more tokens = slower). In my system, I keep context to the last 8 messages and use structured JSON output to minimize wasted tokens."

### Temperature
"Temperature controls randomness in token selection. Low (0.1-0.3) = deterministic, good for structured outputs. High (0.7-1.0) = creative, good for conversation. In my system: routing uses 0.2 for consistent classification, chat uses 0.7 for natural conversation, and email drafting uses 0.2 because it returns structured JSON. The creativity comes from the prompt design and few-shot examples, not the temperature."

### Pattern Router Advantage
"Three advantages: latency — regex runs in 5ms vs 500ms+ for an LLM call. Cost — zero API calls means zero spend. Reliability — regex doesn't hallucinate; same input always produces same output. The Pattern Router handles 80% of common queries without touching the LLM."

### Retry Logic
"Four retries with exponential backoff. If JSON parsing fails, retry with the same model. After 4 failures, fall back to the alternate model — Gemini to Claude via OpenRouter. If both fail, degrade gracefully and ask the user to rephrase."

### Testing LLM Decisions
"I've designed a three-layer eval system. Layer one: a golden dataset of 50-100 prompts with known correct answers for regression testing. Layer two: LLM-as-judge scoring responses on relevance, completeness, and groundedness. Layer three: production monitoring where user clarification requests become failure signals."

### Guardrails
"Constraints that prevent harmful or incorrect outputs. My system has implicit ones: intent classification before the LLM, pattern routing to reduce hallucination, JSON validation on outputs, and clarification fallback when uncertain. I don't have explicit content filtering, output validation before tool execution, or rate limiting yet — those are on my roadmap."

### MCP
"Model Context Protocol — an open standard that provides a standardized interface for LLMs to access tools, data, and prompts. Instead of hardcoding tool definitions in each app, MCP servers expose a discoverable interface. Any MCP-compatible client — Claude Code, Cursor — can connect automatically. OH-SO is building a shared MCP backbone so tools and prompts are reusable across projects."

### RAG vs. Tool Calling
"RAG retrieves unstructured information via embeddings and vector search — 'find me documents about X.' Tool calling selects a function with structured parameters — 'do this action with these parameters.' My system uses tool calling because tasks, emails, and events are structured data that fits SQL queries."

### ReAct Loop
"Reason plus Act — the LLM reasons, calls a tool, observes the result, then reasons again. Loop repeats until done. My system is single-turn: the LLM returns a tool call, the client executes it, next message starts fresh. I'd add ReAct when multi-step reasoning is needed."

### Biggest Risk
"Hallucination — the model confidently stating something false. If my system misclassifies intent and calls the wrong tool, the user gets wrong data as truth. I mitigate this through deterministic pattern matching, structured JSON output, and clarification fallback."

---

## BLOCK 4: CASE STUDY EXAMPLE (Fashion Product Descriptions)

### System Design
Two-stage pipeline:
1. **Gemini Vision** — extracts visual attributes from product images (color, texture, fit, style)
2. **Claude Haiku** — generates description using image JSON, metadata, 50 gold standards as few-shot, brand guidelines

### Why Two Models
Each calibrated for specific task — Gemini for vision, Haiku for concise writing. Reduces hallucination through narrower scope, lowers cost.

### Cost Estimate
- Gemini: ~$0.0003 per product
- Haiku: ~$0.005 per product
- Total: ~$50 for 10,000 products (well under $0.50 budget)

### Evaluation
- Completeness: check all metadata fields mentioned (programmatic)
- Groundedness: parse claims, compare against metadata (deterministic)
- Relevance: LLM-as-judge comparing against gold standards
- SEO: keyword presence check, length validation

### Guardrails
- Before generation: validate metadata completeness
- After generation: deterministic validation of claims against metadata
- Before publishing: human review (marketing approval)

### Phased Delivery
- Phase 1: Generate 50, marketing reviews, iterate prompt
- Phase 2: Build pipeline + eval harness + review UI
- Phase 3: Scale to 10,000 in batches of 50-100

---

## QUESTIONS TO ASK THEM
1. "What does the shared MCP backbone look like today? How do engineers contribute to it?"
2. "How do you handle evaluation across client projects — shared framework or per-project?"
3. "What's the typical lifecycle from client brief to production?"
4. "How do you balance agentic-first with client constraints?"
5. "How do engineers stay current with the AI landscape?"

---

## TOP 10 MISTAKES TO AVOID
1. Calling tool calling "RAG"
2. Saying LLMs learn between API calls (they're stateless)
3. Using LLM to validate LLM output (circular)
4. Saying temperature should be high for creative tasks (put creativity in the prompt)
5. Not knowing your own config (temperature, model names)
6. Being vague about guardrails (name what you already have)
7. Jumping to implementation without asking questions in case study
8. Not mentioning phased delivery in case study
9. Generic "why OH-SO" (reference specific work)
10. Not knowing RAG vs. tool calling distinction
