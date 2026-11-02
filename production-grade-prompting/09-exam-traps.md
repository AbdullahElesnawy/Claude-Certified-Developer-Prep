# 9. Exam Traps

> أسئلة التدريب بقت بالإنجليزي في [10-quiz.md](10-quiz.md).

## القاعدة العامة للـ wrong answers

الإجابات الغلط في الامتحان غالبًا واحدة من دول:

1. **"Ask nicely in the prompt"** كـ control: "add an instruction telling the model not to...".
   التعليمات مش enforcement.
2. **"Use a bigger/smarter model"** لمشكلة architecture (cost، injection، context bloat).
3. **"Change temperature"** لمشكلة ملهاش علاقة بالـ sampling.
4. **حل بيعالج العَرَض مش السبب** (truncate بدل context management، lower max_tokens بدل batch).
5. **"Hard-code / paste everything into the prompt"** بدل tool أو MCP أو retrieval.

الإجابة الصح غالبًا: **deterministic control في الكود** + **أقل privilege** + **أبسط architecture
تحل المشكلة**.

## Cheat sheet

| السيناريو | الإجابة |
|---|---|
| Bulk، مش مستعجل، cost أولوية | Message Batches API |
| نفس الـ system prompt / document الطويل في كل request | Prompt caching |
| نفس الملف في requests كتير (upload) | Files API |
| Tool output كبير مالي الـ context | Prune في الـ tool + context editing (clear tool uses) |
| محادثة طويلة جدًا | Compaction |
| Exploration هيحرق context الـ agent | Subagent (context isolation) |
| Action مش ممكن يترجع | Human-in-the-loop approval gate / hook في الكود |
| خطوات المهمة معروفة | Workflow، مش agent |
| JSON مضمون الشكل | Structured outputs / `strict: true` |
| Tool فشل | `tool_result` بـ `is_error: true` |
| كذا tool call مستقلة | Parallel، كلهم في user message واحدة |
| Stream اتقطع وفيه `tool_use` ناقص | متنفذهوش؛ retry |
| Thinking + tools | رجّع الـ thinking blocks كاملة من غير تعديل |
| Persistence بين sessions | Memory tool / external store، مش context |
| Untrusted input (web، docs، emails) | افصله بـ XML tags + guardrails + least privilege |

