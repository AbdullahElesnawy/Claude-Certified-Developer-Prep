# 3. Tool Use (Function Calling)

## الفكرة

Claude **مش بينفّذ** الـ tool. هو بيقول "عايز أنادي tool كذا بالـ input ده"، و**الكود بتاعك**
هو اللي بينفّذ ويرجّع النتيجة. ده اسمه **client-side tool**.
(فيه **server-side tools** زي `web_search` و `code_execution`؛ دول Anthropic بتنفذهم
والنتيجة بترجع في نفس الـ response.)

## 1) Tool schema اللي Claude يختاره صح

```ts
const tools: Anthropic.Tool[] = [
  {
    name: "get_order_status",
    description:
      "Look up the current shipping status of a customer order by its order ID. " +
      "Use this when the user asks where their order is or when it will arrive. " +
      "Do not use it for refunds; use issue_refund for that. " +
      "Returns status, carrier, and estimated delivery date.",
    input_schema: {
      type: "object",
      properties: {
        order_id: {
          type: "string",
          description: "Order ID in the format ORD-12345",
        },
      },
      required: ["order_id"],
      additionalProperties: false,
    },
    strict: true, // يضمن إن الـ input مطابق للـ schema بالظبط
  },
];
```

**الـ description هو أهم جزء**: ده اللي Claude بيقرر بيه. يكون فيه:
- **بيعمل إيه** و**إمتى يتستخدم** و**إمتى لأ** (خصوصًا لو فيه tools شبه بعض).
- **بيرجّع إيه.**
- وصف كل parameter وشكله (format، أمثلة).

**Tool set construction:**
- tools قليلة وواضحة أحسن من tools كتير متداخلة.
- أسماء واضحة ومتسقة (`get_`, `create_`, `search_`).
- لو عندك tools كتير جدًا: **tool search** (`defer_loading`) بدل ما تحمّلهم كلهم في الـ context.

## 2) Tool-use loop

```ts
const messages: Anthropic.MessageParam[] = [{ role: "user", content: userInput }];

while (true) {
  const res = await client.messages.create({
    model: "claude-opus-5-5", max_tokens: 16000, tools, messages,
  });

  // 1. ضيف رد الـ assistant كامل (بما فيه thinking + tool_use)
  messages.push({ role: "assistant", content: res.content });

  // 2. لو مش طالب tool، خلصنا
  if (res.stop_reason !== "tool_use") break;

  // 3. نفّذ كل الـ tool calls ورجّعهم في user message واحدة
  const toolResults: Anthropic.ToolResultBlockParam[] = [];
  for (const block of res.content) {
    if (block.type !== "tool_use") continue;
    try {
      const output = await runTool(block.name, block.input);
      toolResults.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify(output) });
    } catch (err) {
      toolResults.push({
        type: "tool_result", tool_use_id: block.id,
        content: `Error: ${(err as Error).message}`, is_error: true,
      });
    }
  }
  messages.push({ role: "user", content: toolResults });
}
```

النقط المهمة:
- الـ loop بيقف على **`stop_reason`**، مش على شكل النص. القيم: `end_turn`, `tool_use`,
  `max_tokens`, `stop_sequence`, `pause_turn`, `refusal`.
- كل `tool_result` لازم يكون ليه **`tool_use_id`** مطابق.
- **Error handling:** لو الـ tool فشل، **رجّع `is_error: true`** برسالة مفيدة، متوقفش
  الـ loop ومتتجاهلش الـ call. Claude هيحاول يصلّح (يغير الـ input أو يجرب tool تاني).
- حط **حد أقصى للـ iterations** (والـ budget) عشان الـ agent ميلفّش للأبد. (شوف [06](06-agents.md))
- **Tool Runner** في الـ SDK (`client.beta.messages.toolRunner`) بيعمل الـ loop ده بدالك،
  لكن الامتحان بيتوقع إنك فاهم الـ loop نفسه.
- بدل الـ loop اليدوي، الـ **Claude Agent SDK** بيدّيك loop كامل + tools جاهزة.

## 3) Single vs parallel tool calls

- **Parallel tool use** شغال by default: Claude ممكن يطلب **كذا `tool_use`** في نفس الرد
  (مثلًا: weather في 3 مدن).
- نفّذهم **concurrently** (`Promise.all`) لو مستقلين عن بعض.
- رجّع **كل** الـ `tool_result` blocks في **user message واحدة**. لو فرقتهم على كذا message،
  بتعلّم Claude إنه يبطّل parallel calls.

```ts
const toolUses = res.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
const results = await Promise.all(toolUses.map(async (b) => ({
  type: "tool_result" as const, tool_use_id: b.id, content: JSON.stringify(await runTool(b.name, b.input)),
})));
messages.push({ role: "user", content: results });
```

**إمتى تمنع الـ parallel؟** لما الـ calls **معتمدة على بعض** أو بتعمل side effects لازم تتعمل
بترتيب (مثلًا: create ثم update). استخدم `disable_parallel_tool_use: true` في `tool_choice`.

## `tool_choice`

| القيمة | المعنى |
|---|---|
| `auto` (default) | Claude يقرر يستخدم tool ولا لأ |
| `any` | لازم يستخدم tool (أي واحدة) |
| `tool` + name | لازم يستخدم tool معينة |
| `none` | ممنوع tools |

> على الموديلات الأحدث (Opus 5.5، Sonnet 5.5، Fable 5.1) الـ `any` و `tool` بيرجعوا 400؛
> البديل `auto` + تعليمات + `strict: true`، أو structured outputs لو الهدف JSON بس.

## Approval patterns

قبل tool بيعمل **side effect** خطير (يدفع، يمسح، يبعت email): الكود بتاعك يوقف ويطلب
موافقة إنسان قبل التنفيذ. Claude بيطلب، أنت بتقرر. (التفاصيل في [06](06-agents.md).)

## الغلطة الشائعة في الامتحان

- ❌ description قصير "Gets order". ✅ إمتى تستخدمه، إمتى لأ، بيرجع إيه.
- ❌ tool فشل → ترمي exception وتوقف. ✅ `is_error: true` وخلّي Claude يتعامل.
- ❌ ترجّع parallel results في messages منفصلة.
- ❌ تفترض إن Claude نفّذ الـ tool بنفسه (client tools).
- ❌ "Built-in tools can reach any internal API". لأ، للـ internal API اعمل custom tool أو
  MCP server (لو هيتستخدم في كذا app).
