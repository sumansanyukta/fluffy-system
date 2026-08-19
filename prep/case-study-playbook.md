# Case Study Playbook

Reusable answers and frameworks for product/engineering case studies.

---

## 1. CLARIFY BEFORE YOU DESIGN

Never jump to architecture. Ask these first (pick 5-8 per case study):

| Category | Question | Why it matters |
|----------|----------|----------------|
| Data | What data exists today? Format, quality, volume? | Defines your input pipeline |
| Users | Who uses this? Technical or non-technical? How many? | Shapes UX complexity |
| Budget | What's the cost constraint per unit? | Determines model choice and pipeline depth |
| Timeline | Urgent or planned? Prototype or production? | Determines scope |
| Success | What does "done" look like? How do we know it worked? | Defines evaluation criteria |
| Integrations | What systems/APIs are already in place? | Avoids reinventing the wheel |
| Fallback | What happens if the AI fails? Is there a manual override? | Defines guardrails |
| Constraints | Latency requirements? Compliance? Scale? | Shapes architecture decisions |

**What to say:**

> "Before I design, I need to understand a few things..."

**What NOT to do:**
- Don't ask all 15 questions — pick the 5-8 most relevant
- Don't ask questions you could figure out yourself
- Don't skip this step to "save time" — it saves rework

---

## 2. ARCHITECTURE DESIGN

### The pattern: Input → Process → Output → Evaluate

For any AI system, answer these four questions:

1. **Input:** What goes in? (images, text, structured data, user prompts)
2. **Process:** What does the AI do? (classify, extract, generate, score)
3. **Output:** What comes out? (text, JSON, categories, scores)
4. **Evaluate:** How do we know it's correct? (programmatic checks, LLM-as-judge, human review)

### Model selection framework

| Task | Best model type | Example |
|------|----------------|---------|
| Vision / image understanding | Multimodal (Gemini Vision, GPT-4o) | Extracting product attributes from photos |
| Structured text generation | Fast LLM (Gemini Flash, Claude Haiku) | Generating descriptions from JSON input |
| Complex reasoning | Frontier LLM (GPT-4o, Claude Sonnet) | Multi-step analysis, nuanced decisions |
| Classification | Small LLM or fine-tuned model | Intent routing, sentiment analysis |

**What to say:**

> "I'd use [Model X] for [specific task] because [reason]. I considered [alternative] but chose this because [trade-off]."

### Pipeline design: when to add stages

| Single stage | Multi-stage |
|-------------|-------------|
| Simple task, one clear input/output | Complex task with distinct sub-problems |
| Low hallucination risk | High hallucination risk |
| No need for intermediate validation | Need to validate before final output |
| Cost-sensitive | Quality matters more than cost |

**Example (fashion descriptions):**

> "Three stages: extraction → generation → scoring. Extraction grounds the generation in structured data, reducing hallucination. Scoring catches quality issues before human review. It's more expensive than a single pass, but the quality gain justifies the cost."

---

## 3. TRADE-OFFS AND ALTERNATIVES

Always mention what you considered and why you chose differently.

### Common trade-offs

| Trade-off | Option A | Option B | How to decide |
|-----------|----------|----------|---------------|
| Speed vs. Quality | Single-pass generation | Multi-stage pipeline with scoring | What's the cost of a bad output? |
| Cost vs. Accuracy | Cheap model + more retries | Expensive model + fewer calls | Budget per unit × volume |
| Automation vs. Control | Fully automated | Human-in-the-loop | What's the risk of errors? |
| Complexity vs. Reliability | Sophisticated orchestration | Simple, proven patterns | What's the team's expertise? |
| Build vs. Buy | Custom pipeline | Existing tools (LangChain, etc.) | How unique is the problem? |

**What to say:**

> "I considered [alternative] but chose [this] because [reason]. The trade-off is [what you lose], which is acceptable because [why]."

---

## 4. GUARDRAILS AND RISK

### The guardrail stack (layer from cheap to expensive)

| Layer | What it does | Example |
|-------|-------------|---------|
| Input validation | Reject bad inputs before they hit the LLM | Check image exists, metadata complete |
| Deterministic checks | Regex/pattern matching before LLM | Classify intent without API call |
| Output validation | Verify LLM output matches expected schema | JSON parsing, field presence checks |
| LLM-as-judge | Use a second LLM to score the first | Relevance, groundedness, completeness |
| Human review | Human approves before publishing | Review dashboard, approve/reject |
| Fallback | What happens when everything fails | Ask user to rephrase, retry with different model |

**What to say:**

> "The main risk is [specific risk]. I mitigate it with [layer 1], [layer 2], and [layer 3]. If all else fails, [fallback]."

### Hallucination mitigation

1. Ground the LLM in structured data (don't let it make things up)
2. Use few-shot examples (show, don't just tell)
3. Score outputs against source data (programmatic checks)
4. Human review for high-stakes outputs
5. Clarification fallback (ask rather than guess)

---

## 5. EVALUATION

### The three-layer evaluation framework

| Layer | Method | What it catches |
|-------|--------|----------------|
| Programmatic | Schema validation, field checks, format verification | Malformed outputs, missing fields |
| Statistical | Compare against source data, check claims against metadata | Factual errors, hallucination |
| LLM-as-judge | Second model scores relevance, completeness, groundedness | Semantic quality, tone, brand alignment |

### What to measure

| Metric | How | Target |
|--------|-----|--------|
| Completeness | Are all required fields present? | 100% |
| Groundedness | Do claims match source data? | >95% |
| Relevance | Does it match the prompt/task? | >90% |
| Consistency | Same input, same quality across runs | Low variance |
| Cost | API calls per unit × price per call | Under budget |
| Latency | Time from request to output | Under SLA |

**What to say:**

> "I'd measure success with three layers: programmatic checks for format, statistical comparison against source data for accuracy, and LLM-as-judge for semantic quality. I'd know it's working when [specific metric] hits [target]."

---

## 6. BATCH PROCESSING AND SCALE

### When to process in batches

| Small batch (10-50) | Large batch (100-1000) | Streaming (1000+) |
|---------------------|----------------------|-------------------|
| Human reviews each output | Progress indicators needed | Job queue + async processing |
| Simple retry on failure | Checkpoint/resume on failure | Distributed processing |
| Synchronous is fine | Background job preferred | Event-driven architecture |

### Failure recovery

| Strategy | When to use |
|----------|-------------|
| Retry from failed item | Checkpoint progress, resume from last success |
| Skip and log | Non-critical items, log failures for review |
| Retry entire batch | Small batch, fast operation, low cost |
| Dead letter queue | Items that repeatedly fail, need investigation |

**What to say:**

> "For [volume], I'd process in batches of [size] with [concurrency]. If an item fails, I'd [strategy] because [reason]. Progress would be shown via [indicator]."

---

## 7. COST ESTIMATION

### Framework for estimating cost

1. Identify every API call in the pipeline
2. Look up pricing per call (or per token)
3. Multiply by volume
4. Add buffer for retries and failures

**Example calculation:**

| Stage | Model | Tokens/call | Cost/call | Calls/unit | Cost/unit |
|-------|-------|-------------|-----------|------------|-----------|
| Extraction | Gemini Vision | ~1000 input + 500 output | ~$0.0003 | 1 | $0.0003 |
| Generation | Gemini Flash | ~500 input + 300 output | ~$0.0002 | 1 | $0.0002 |
| Scoring | Gemini Flash | ~500 input + 100 output | ~$0.0001 | 1 | $0.0001 |
| **Total** | | | | | **$0.0006/unit** |

**What to say:**

> "Estimated cost per unit is $[X], based on [model] at [pricing]. For [volume], that's $[total]. Well within the $[budget] constraint."

---

## 8. THE PITCH

### Structure: Problem → Solution → Outcome → Next

| Section | What to say | Time |
|---------|-------------|------|
| Problem | What's broken today? | 10 sec |
| Solution | What did you build? | 15 sec |
| Outcome | What's the business impact? (time, cost, quality) | 20 sec |
| Next | What's the future roadmap? | 15 sec |

### Rules

1. Lead with business outcomes, not architecture
2. Use numbers (time saved, cost reduced, volume handled)
3. Mention the human in the loop (trust, not full automation)
4. Keep it under 60 seconds
5. No jargon the client wouldn't understand

**Bad:**

> "I built a three-stage AI pipeline with Gemini Vision for feature extraction and Gemini Flash for description generation with few-shot learning and LLM-as-judge scoring."

**Good:**

> "We cut description production from 2 weeks to 3 days, at 1/10th the cost. Your team reviews every description before it goes live. The AI learns from your feedback, so quality improves with every batch."

---

## 9. BEHAVIORAL QUESTIONS (STAR format)

### Framework

| Letter | What | Time |
|--------|------|------|
| S | Situation — set the context | 10 sec |
| T | Task — what was your responsibility | 5 sec |
| A | Action — what you specifically did | 20 sec |
| R | Result — measurable outcome | 10 sec |

### Tips

- Use "I" not "we" — they want to know what YOU did
- Quantify results (saved 15 hours, reduced errors by 18%, handled 8000 products)
- Have 3-4 stories ready: a mistake, a learning, a success, handling ambiguity
- Keep each answer under 60 seconds

---

## 10. QUESTIONS TO ASK THEM

Always have 2-3 questions ready. They show you're thinking about the role, not just answering questions.

1. "What does the shared [MCP/backbone/tool library] look like today? How do engineers contribute to it?"
2. "How do you handle evaluation across client projects — shared framework or per-project?"
3. "What's the typical lifecycle from client brief to production?"
4. "How do you balance [agentic-first / AI-native] with client constraints?"
5. "What's the biggest technical challenge the team is facing right now?"

---

## QUICK REFERENCE: COMMON MISTAKES

| Mistake | Fix |
|---------|-----|
| Calling tool calling "RAG" | They're different: RAG = search, tool calling = action |
| Saying LLMs learn between calls | LLMs are stateless — context is injected each call |
| Using LLM to validate LLM output | Use programmatic checks, not circular validation |
| Jumping to implementation without asking questions | Always clarify first |
| Not mentioning phased delivery | Show you think in iterations, not big bangs |
| Generic "why this company" | Reference specific work they've done |
| Being vague about guardrails | Name exactly what you have and what's missing |
| Not knowing your own config | Know your model, temperature, token limits |
