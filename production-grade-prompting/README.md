# Production-Grade Prompting, Agents & Tool Use — شرح بالعربي

شرح للكورس اللي في الـ **Claude Certified Developer – Foundations Prep Course**.
المصطلحات سايبها بالإنجليزي زي ما هتلاقيها في الامتحان وفي الـ docs.

> **ملحوظة:** صفحات الدروس محتاجة login، فالشرح ده مبني على الـ **learning objectives** بتاعة
> الكورس + الـ Claude API docs الحالية. لو لقيت حاجة في الدرس مختلفة، الدرس هو المرجع.

## فكرة الكورس في سطر

مش "إزاي تكلّم Claude"، لكن **إزاي الكود اللي بيكلّم Claude ميقعش في production**:
prompt بيتكسر على input حقيقي، stream بيقف في النص، agent بيصرف أكتر من الـ budget،
و action مينفعش يترجع (irreversible) اتعمل من غير ما حد يوافق.

## الملفات

| # | الملف | الموضوع | وزنه في الامتحان (تقريبًا) |
|---|---|---|---|
| 1 | [01-prompting.md](01-prompting.md) | System prompt, XML tags, few-shot, output constraints, diagnosis | Prompt Engineering 4.6% |
| 2 | [02-extended-thinking.md](02-extended-thinking.md) | Extended / adaptive thinking, effort, thinking blocks مع tools | LLM Fundamentals 5.2% |
| 3 | [03-tool-use.md](03-tool-use.md) | Tool schemas, tool-use loop, parallel tool calls | Tool Implementation 4.4% |
| 4 | [04-streaming.md](04-streaming.md) | Stream events, تجميع الـ content blocks, recovery | API Mechanics 6.8% |
| 5 | [05-context-engineering.md](05-context-engineering.md) | Compaction, clearing tool results, subagent handoff | Context Engineering 3.8% |
| 6 | [06-agents.md](06-agents.md) | Workflow vs agent, الـ loop, human-in-the-loop | Agents & Workflows 14.7% |
| 7 | [07-memory.md](07-memory.md) | Persisting state across sessions بتكلفة context قليلة | Context Engineering |
| 8 | [08-multimodal-and-batch.md](08-multimodal-and-batch.md) | Images, PDFs, Files API, Message Batches API | API Mechanics 6.8% |
| — | [09-exam-traps.md](09-exam-traps.md) | ملخص الفخاخ + cheat sheet | — |
| — | [10-quiz.md](10-quiz.md) | Practice quiz بالإنجليزي (24 سؤال + answer key) | — |

## إزاي تذاكر الملفات دي

1. اقرأ الملف قبل الدرس أو بعده على طول.
2. ركّز على جزء **"ليه؟"** و **"الغلطة الشائعة"**: أسئلة الامتحان scenario-based
   ("أنهي approach أنسب؟")، والـ wrong answers دايمًا حاجة شكلها معقول بس مش بتحل المشكلة.
3. الكود TypeScript (`@anthropic-ai/sdk`) عشان ده الـ stack بتاع الكورس عندك.
