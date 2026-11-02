# 5. Context Engineering

## الفكرة

الـ **context window** هو كل حاجة Claude شايفها في الـ request: system + tools + messages
(بما فيها كل tool result). الـ API **stateless**: كل request بتبعت الـ history كاملة.

في agent بيشتغل 50 turn، الـ context بيتملي بـ tool outputs قديمة. ده بيعمل 3 مشاكل:

1. **Cost:** بتدفع على نفس التوكنز في كل request.
2. **Context bloat / rot:** الجودة بتقل لما الـ context مليان حاجات مش مهمة. المعلومة
   المهمة بتتدفن.
3. **Context drift:** الـ agent بينسى الهدف الأصلي أو بيمشي ورا حاجة قديمة.
4. وفي الآخر: **الـ window بيتملي** والـ request يفشل.

**Context engineering** = إنك تقرر بوعي إيه اللي يدخل الـ context وإيه اللي يطلع.

## الأدوات التلاتة

### 1) Compaction (تلخيص)

لما الـ context يقرب من حد معين، **لخّص** الجزء القديم من المحادثة واستبدله بالملخص.

- **Server-side compaction** (beta): الـ API بيعملها لوحده لما توصل لـ threshold.

```ts
const res = await client.beta.messages.create({
  betas: ["compact-2026-01-12"],
  model: "claude-opus-5-5",
  max_tokens: 16000,
  messages,
  context_management: { edits: [{ type: "compact_20260112" }] },
});
messages.push({ role: "assistant", content: res.content }); // ⚠️ content كامل
```

  **أهم نقطة:** لازم ترجّع `response.content` **كامل** (فيه `compaction` block). لو أخدت
  الـ text بس، هتضيّع الـ compaction state.
- **Client-side compaction:** أنت تعمل call تلخّص بيه الـ history وتبدأ بالملخص.
- **العيب:** التلخيص بيضيّع تفاصيل. فكّر إيه اللي لازم يتحفظ (القرارات، الـ IDs، الـ open tasks).

### 2) History / tool-result clearing (حذف، مش تلخيص)

**Context editing** (beta): بيمسح الـ **tool results القديمة** (أو thinking blocks قديمة)
ويسيب مكانها placeholder. الـ structure بتاع المحادثة بيفضل.

```ts
await client.beta.messages.create({
  betas: ["context-management-2025-06-27"],
  model: "claude-opus-5-5", max_tokens: 4096, tools, messages,
  context_management: { edits: [{ type: "clear_tool_uses_20250919" }] },
});
```

- `clear_tool_uses_20250919`: يمسح tool results قديمة (و `clear_tool_inputs: true` يمسح الـ inputs كمان).
- `clear_thinking_20251015`: يمسح thinking blocks قديمة.
- **مناسب لما:** الـ tool output اتستخدم وخلاص (قريت ملف، أخدت منه اللي عايزه).

**Tool output pruning من عندك كمان:** خلّي الـ tools نفسها ترجّع **أقل حاجة مفيدة**:
- رجّع الحقول المهمة بس، مش الـ JSON كله.
- pagination / truncation مع رسالة "showing 20 of 3,000 results; refine your query".
- ده أرخص وأنضف من إنك تمسح بعدين.

**Compaction vs clearing:**

| | Compaction | Clearing |
|---|---|---|
| بيعمل إيه | يلخّص | يحذف |
| بيحتفظ بـ | المعنى (ملخص) | الـ structure (placeholders) |
| مناسب لـ | محادثة طويلة فيها قرارات | tool outputs كبيرة خلص استخدامها |

### 3) Subagent handoffs (عزل الـ context)

بدل ما الـ agent الرئيسي يقرأ 30 ملف بنفسه ويملأ الـ context بتاعه:

```
Main agent (orchestrator)
   │  task: "find where auth tokens are validated; return file paths + 3-line summary"
   ▼
Subagent ← context جديد ونضيف، يقرأ 30 ملف، يحرق 80K token
   │
   ▼  يرجّع ملخص 300 token بس
Main agent ← الـ context بتاعه فضل نضيف
```

- **Context isolation:** الـ subagent ليه context window لوحده؛ الـ noise بيفضل عنده.
- **الـ handoff نفسه هو المهم:**
  - **Brief واضح:** الهدف، الـ constraints، الـ subagent يعرف إيه من قبل (هو مش شايف المحادثة!).
  - **شكل الرد المطلوب:** "return a list of file paths with one-line reasons" مش "tell me what you find".
  - **Self-contained:** كل اللي محتاجه لازم يكون في الـ brief.
- بيسمح بـ **parallel** subagents (كل واحد يبحث في حتة).
- **العيب:** تكلفة أعلى إجمالًا (كل subagent بيحمّل context من الأول) و latency. استخدمه لما
  المهمة **read-heavy** والنتيجة ملخّصة.
- ممكن الـ subagent يكون موديل أرخص (Haiku / Sonnet) و `effort: "low"`.

## مبادئ عامة

- **Just-in-time context:** متحمّلش كل حاجة مقدمًا؛ ادّي الـ agent tools يجيب بيها اللي محتاجه
  وقت ما يحتاجه.
- **حط الثابت في الأول** (system، tools) عشان الـ prompt caching، والمتغير في الآخر.
- **ذكّر بالهدف:** في agents طويلة، الـ task الأصلي ممكن يتحفظ في ملف/memory ويتقري تاني
  (ضد الـ drift).

## الغلطة الشائعة في الامتحان

- ❌ "Use a model with a bigger context window" كحل لـ context bloat. الجودة لسه هتقل والـ cost هيزيد.
- ❌ ترجّع الـ text بس من response فيه compaction block.
- ❌ subagent بـ brief "investigate this" من غير context ولا output format.
- ✅ context isolation عن طريق subagents للـ exploration الكبيرة.
