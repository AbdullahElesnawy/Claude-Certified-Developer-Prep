# 2. Agentic Frameworks: LangGraph، Strands، PydanticAI

الـ exam guide بيذكر بالاسم **"agentic abstraction frameworks (e.g., Strands, LangGraph, PydanticAI)"** تحت
Agent Patterns and Frameworks. المطلوب على مستوى الـ **concept**: كل واحد بيحل إيه، وإمتى تستخدم framework
أصلًا. مش هتتسأل عن API signatures.

> الـ frameworks دي بتتطور بسرعة. التفاصيل هنا عامة؛ ارجع للـ docs بتاعة كل واحد قبل ما تستخدمه.

## الأول: محتاج framework أصلًا؟

| بدون framework (Claude API مباشرة + tool loop) | Framework |
|---|---|
| تحكم كامل، dependencies أقل، أسهل في الـ debugging | abstractions جاهزة (state، graphs، persistence، multi-agent) |
| loop بسيط ومهام واضحة | workflows معقدة، branching، human-in-the-loop، state طويل |
| أنت بتكتب الـ retries والـ state | جاهزين، بس بقواعد الـ framework |

**القاعدة:** ابدأ بأبسط حاجة. الـ framework يستاهل لما الـ orchestration نفسها تبقى معقدة. abstraction زيادة
بتخبّي اللي بيحصل فعلًا (prompts، tool calls) وبتصعّب الـ debugging.

وفي طرف Anthropic نفسها: **Tool Runner** في الـ SDK (loop جاهز لـ tools أنت عرّفتها)، **Claude Agent SDK**
(الـ Claude Code harness كـ library)، و **Managed Agents** (Anthropic بتشغّل الـ loop والـ sandbox).

## LangGraph

- من فريق LangChain. بيمثّل الـ workflow أو الـ agent كـ **graph**: **nodes** (خطوات: LLM call، tool، function)
  و **edges** (مين بعد مين، ومنها conditional edges حسب الـ state).
- **Typed shared state** بيتنقل بين الـ nodes.
- قوته: **persistence / checkpointing** (تكمّل من حيث وقفت)، **human-in-the-loop** (توقف الـ graph تستنى موافقة
  وتكمّل)، cycles (loops)، fan-out و fan-in، multi-agent.
- مناسب لـ: workflows فيها branching واضح، long-running، محتاجة pause/resume وموافقات.
- (ده الـ framework اللي في module 6 من الـ ai-engineer-course.)

## Strands Agents

- Open-source SDK من **AWS**.
- أسلوب **model-driven**: بتدّي الموديل prompt و tools، والموديل هو اللي بيخطط ويقرر الخطوات (agent loop بسيط)،
  بدل ما تكتب graph بإيدك.
- Tools بتتعرّف كـ functions، وفيه دعم لـ **MCP**، و multi-agent patterns.
- مرتبط بـ AWS (Bedrock كـ provider أساسي، و deployment على AWS)، وبيدعم providers تانية منهم Anthropic.
- مناسب لـ: فرق على AWS عايزة agent بسرعة بكود قليل.

## PydanticAI

- من فريق **Pydantic** (Python).
- تركيزه **type safety**: الـ output structured ومتحقق منه بـ Pydantic models، و tools typed.
- **Dependency injection** للـ tools (DB connection، API clients) فالـ testing أسهل.
- Model-agnostic (منهم Claude).
- مناسب لـ: Python teams عايزة structured outputs و validation قوي في الـ agent.

## مقارنة سريعة

| | LangGraph | Strands | PydanticAI |
|---|---|---|---|
| الفكرة | Graph صريح (nodes / edges / state) | Model-driven loop | Typed agents + validation |
| أقوى في | Orchestration معقد، persistence، HITL | البساطة، AWS integration | Type safety، structured output |
| اللغة | Python و JS | Python (وغيرها) | Python |

## الغلطة الشائعة في الامتحان

- ❌ Framework لمهمة بسيطة (classification أو loop صغير).
- ❌ "The framework handles security." ✅ الـ guardrails و الـ approval gates والـ least privilege مسؤوليتك في أي framework.
- ✅ Workflow فيه branching و pause لموافقة إنسان و resume بعد ساعات → graph framework بـ checkpointing (زي LangGraph).
- ✅ Structured, validated outputs في Python agent → PydanticAI-style typed outputs (أو structured outputs في الـ API).
