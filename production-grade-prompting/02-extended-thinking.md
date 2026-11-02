# 2. Extended Thinking

## الفكرة

**Extended thinking** معناه إن Claude "يفكر" قبل ما يرد: بيطلّع **thinking blocks**
(reasoning داخلي) وبعدين الـ **text** النهائي. ده بيحسّن الجودة في المسائل الصعبة
(math، coding، multi-step reasoning، planning) **على حساب** latency وتوكنز أكتر (والـ
thinking tokens بتتحسب كـ **output tokens**، يعني أغلى).

## إمتى تفعّله؟

| فعّله | متفعّلوش (أو قلّله) |
|---|---|
| Reasoning متعدد الخطوات | Classification بسيط |
| Coding / debugging صعب | Extraction لحقل من نص |
| Agents بتقرر بين tools كتير | Chat سريع latency-sensitive |
| تحليل بيقارن constraints كتير | High-volume ورخيص |

القاعدة: **قيس**. لو الجودة مش بتتحسن بالـ thinking، أنت بتدفع على الفاضي.

## الـ API: قديم vs حالي (مهم جدًا)

الكورس بيقول "set a thinking budget". في الـ API فيه شكلين:

### الشكل القديم: `budget_tokens` (الموديلات الأقدم زي Haiku 4.5 و Sonnet 4.5)

```ts
thinking: { type: "enabled", budget_tokens: 4000 } // لازم >= 1024 و < max_tokens
```
- الـ budget = الحد الأقصى لتوكنز التفكير.
- **لازم** يكون أقل من `max_tokens`.

### الشكل الحالي: **adaptive thinking** + **effort** (Claude 4.6 وما بعده)

```ts
const res = await client.messages.create({
  model: "claude-opus-5-5",
  max_tokens: 16000,
  thinking: { type: "adaptive" },          // Claude يقرر هو هيفكر قد إيه
  output_config: { effort: "high" },       // low | medium | high | xhigh | max
  messages: [{ role: "user", content: "..." }],
});
```
- **Adaptive:** الموديل بيقرر لوحده يفكر قد إيه حسب صعوبة السؤال.
- **Effort** هو الـ "budget" الجديد: بيتحكم في عمق التفكير وفي إجمالي التوكنز.
  `low` للمهام البسيطة والـ subagents، `high`/`xhigh` للـ coding والـ agentic work.
- على الموديلات الأحدث، `budget_tokens` بيرجع **400 error**.
- `display: "summarized"` لو عايز تعرض ملخص التفكير للمستخدم؛ الـ default على الموديلات
  الحديثة `omitted` (الـ thinking text فاضي بس لسه بتدفع عليه).

> للامتحان: افهم الـ **concept** (budget = سقف على تفكير الموديل، تبادل بين quality و
> cost/latency). لو سؤال قال "budget_tokens" فهو بيتكلم عن الـ fixed-budget model.

## Thinking blocks مع tool use (أهم نقطة في الدرس)

لما Claude يفكر ويطلب tool:

```
assistant: [thinking block] [tool_use block]
user:      [tool_result block]
assistant: [thinking block] [text]   ← بيكمل
```

**القاعدة الذهبية:** لما ترجع الـ `tool_result`، لازم تبعت الـ **assistant message كاملة
زي ما هي** — بما فيها الـ thinking blocks **من غير أي تعديل** (فيها `signature` بيتأكد إنها
مش متعدلة).

```ts
// ✅ صح
messages.push({ role: "assistant", content: response.content });
messages.push({ role: "user", content: toolResults });

// ❌ غلط: بتشيل الـ thinking أو بتبعت الـ text بس
messages.push({ role: "assistant", content: [toolUseBlockOnly] });
```

ليه؟ الـ reasoning بتاع Claude لازم يفضل متصل عبر الـ tool call، وإلا هيفقد خيط تفكيره
أو الـ API هيرفض الـ request.

- **Interleaved thinking:** الموديل يقدر يفكر **بين** الـ tool calls (يشوف نتيجة الـ tool،
  يفكر، يطلب tool تاني). مع adaptive thinking ده شغال تلقائي.
- متعدّلش الـ history القديمة: تعديل turns قديمة ممكن يبوّظ الـ thinking blocks
  (اعمل الـ harness **append-only**).

## الغلطة الشائعة في الامتحان

- ❌ تفعيل thinking عالي لكل request "عشان الجودة". ✅ حسب المهمة؛ الـ cost والـ latency بيزيدوا.
- ❌ شيل الـ thinking blocks من الـ history عشان توفّر توكنز أثناء tool loop.
  ✅ رجّعها كاملة. (لو عايز تقلل الـ context في conversation طويلة جدًا فيه
  `clear_thinking` في context editing، شوف [05](05-context-engineering.md).)
- ❌ `budget_tokens` >= `max_tokens`. ده error.
