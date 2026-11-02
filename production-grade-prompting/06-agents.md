# 6. Agents

## Workflow vs Agent (أهم سؤال في الـ domain ده)

| | **Workflow** | **Agent** |
|---|---|---|
| مين بيقرر الخطوة الجاية | **الكود بتاعك** (مسار محدد مسبقًا) | **الموديل** (بيقرر ديناميكيًا) |
| مثال | classify → route → draft → review | "صلّح الـ bug ده في الـ repo" |
| Predictable | عالي | أقل |
| Cost / latency | أقل ومتوقع | أعلى ومتغير |
| مناسب لـ | مهمة خطواتها معروفة | مهمة open-ended مش هتعرف خطواتها مقدمًا |

**القاعدة:** ابدأ **بأبسط حاجة تشتغل**: single call → workflow → agent.
متبنيش agent غير لو الأربعة دول "آه":

1. **Complexity:** المهمة multi-step وصعب تحددها مقدمًا؟
2. **Value:** النتيجة تستاهل الـ cost والـ latency الزيادة؟
3. **Viability:** Claude شاطر في النوع ده من المهام؟
4. **Cost of error:** الأخطاء ممكن تتكشف وتتصلح (tests، review، rollback)؟

### Workflow patterns شائعة
- **Prompt chaining:** خطوة تطلّع input للي بعدها (مع checks بينهم: gates).
- **Routing:** classify الأول، وبعدين ابعت لـ prompt/model متخصص (سهل → Haiku، صعب → Opus).
- **Parallelization:** نفس المهمة على أجزاء (sectioning) أو نفس السؤال كذا مرة (voting).
- **Orchestrator–workers:** موديل يقسم المهمة ويوزعها على workers (ده قريب من agent).
- **Evaluator–optimizer:** موديل يكتب، وموديل تاني يقيّم، ويتكرر.

## بناء loop شغال

الـ agent في الآخر = **tool-use loop** ([03](03-tool-use.md)) + **ضوابط**:

```ts
const MAX_TURNS = 25;
for (let turn = 0; turn < MAX_TURNS; turn++) {
  const res = await client.messages.create({ model, max_tokens: 16000, system, tools, messages });
  messages.push({ role: "assistant", content: res.content });
  totalTokens += res.usage.input_tokens + res.usage.output_tokens;

  if (res.stop_reason === "end_turn") return finalText(res);
  if (res.stop_reason === "refusal") return handleRefusal(res);
  if (res.stop_reason === "max_tokens") { /* متنفذش tool_use ناقص */ }
  if (totalTokens > TOKEN_BUDGET) return stopGracefully("budget exceeded");

  const results = await executeTools(res.content); // فيها approval gate (تحت)
  messages.push({ role: "user", content: results });
}
return stopGracefully("max turns reached");
```

الضوابط اللي **لازم** تكون موجودة في production:
- **Stop conditions:** `end_turn`، max iterations، token/cost budget، timeout.
- **Budget:** الـ "agents that blow their budget" اللي في وصف الكورس. حط سقف على عدد الـ turns
  والتوكنز. (فيه كمان **task budgets** beta: الموديل نفسه بيعرف الـ budget ويخلّص قبله.)
- **Error handling:** tool errors بترجع `is_error`، API errors retryable بـ backoff.
- **Observability:** log لكل turn (الـ tool calls، الـ inputs، الـ usage) عشان تقدر تعمل
  **trace analysis** لما حاجة تبوظ.

## Human-in-the-loop checkpoints (للـ irreversible actions)

**Irreversible action** = حاجة متترجعش: دفع، مسح data، إرسال email لعميل، deploy لـ production،
`DROP TABLE`.

```ts
const NEEDS_APPROVAL = new Set(["issue_refund", "delete_record", "send_email"]);

async function executeTool(block: Anthropic.ToolUseBlock) {
  if (NEEDS_APPROVAL.has(block.name)) {
    const ok = await askHuman(`Agent wants to ${block.name} with ${JSON.stringify(block.input)}. Approve?`);
    if (!ok) {
      return { type: "tool_result", tool_use_id: block.id, is_error: true,
               content: "The user declined this action. Do not retry it; ask what they want instead." };
    }
  }
  return run(block);
}
```

المبادئ:
- **الـ enforcement في الكود، مش في الـ prompt.** "Ask before deleting" في الـ system prompt
  **مش ضمانة**. الـ gate لازم يكون deterministic في الـ harness (أو **hooks** في Claude Code /
  Agent SDK، زي `PreToolUse` hook يرفض أمر خطير).
- **صنّف الـ tools:** read-only (يتنفذ على طول) / reversible / irreversible (محتاج approval).
- **اعرض للإنسان input واضح:** هيتعمل إيه بالظبط، على مين، بكام.
- **لو اترفض:** رجّع `tool_result` بيقول إنه اترفض (مش تقطع الـ loop فجأة) عشان Claude يتصرف.
- **Least privilege:** الـ agent ميكونش معاه صلاحية أصلًا لحاجة مش محتاجها (API key read-only،
  DB user من غير DELETE). أحسن guardrail هو إن الـ action مش ممكن أصلًا.
- **Dry-run / preview** قبل الـ action الحقيقي لو ممكن.

## Architecture: supervisor + subagents

- **Manager/supervisor** بيقسم ويوزع على **subagents** متخصصين، وبيجمّع النتايج.
- فايدته: **context isolation** + parallelism + تخصص (system prompt و tools مختلفة لكل subagent).
- عيبه: cost أعلى + تعقيد + الـ handoffs ممكن تضيّع معلومات.

## إزاي تبني agent: 4 طرق

| الطريقة | مين بيكتب الـ loop | مين بيستضيف |
|---|---|---|
| Manual loop على الـ Messages API | أنت | أنت |
| **Tool Runner** (في الـ Anthropic SDK) | الـ SDK (لـ tools أنت عرّفتها) | أنت |
| **Claude Agent SDK** | الـ SDK (= Claude Code كـ library + built-in tools + hooks + subagents) | أنت |
| **Managed Agents** | Anthropic | Anthropic (sandbox لكل session) |

دي اسمها في الـ exam guide: "managed agent deployment models (self-hosted vs. Anthropic-hosted)".

## الغلطة الشائعة في الامتحان

- ❌ بناء agent لمهمة خطواتها ثابتة ومعروفة. ✅ workflow.
- ❌ "Instruct the agent in the system prompt to always confirm before deleting" كضمانة.
  ✅ approval gate / hook في الكود + least privilege.
- ❌ loop من غير max iterations أو budget.
- ❌ لما المستخدم يرفض action، توقف الـ loop من غير tool_result.
