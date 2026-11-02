# 4. Streaming

## ليه streaming؟

1. **UX:** المستخدم يشوف الرد وهو بيتكتب بدل ما يستنى 30 ثانية.
2. **Timeouts:** الـ requests الطويلة (`max_tokens` كبير، thinking، documents كبيرة) ممكن
   تعمل HTTP timeout. الـ SDK **بيطلب streaming** للـ `max_tokens` الكبيرة جدًا.

## الـ events (Server-Sent Events)

الترتيب:

```
message_start                  ← metadata الرسالة (id, model, usage مبدئي)
  content_block_start (index 0)  ← بداية block (text / thinking / tool_use)
    content_block_delta (index 0)  ← قطعة صغيرة (تتكرر كتير)
    content_block_delta ...
  content_block_stop (index 0)
  content_block_start (index 1)
    ...
  content_block_stop (index 1)
message_delta                  ← stop_reason + usage النهائي (output_tokens)
message_stop                   ← خلاص
```

+ `ping` events (تجاهلها) و `error` events (لازم تتعامل معاها).

### أنواع الـ delta

| delta type | جاي في | بتعمل بيه إيه |
|---|---|---|
| `text_delta` | text block | `text += delta.text` |
| `input_json_delta` | tool_use block | `json += delta.partial_json` (**string ناقص**، متعملهوش parse لحد `content_block_stop`) |
| `thinking_delta` | thinking block | `thinking += delta.thinking` |
| `signature_delta` | thinking block | الـ signature بتاع الـ thinking block (لازم يتحفظ) |

## تجميع الـ content blocks (Assembly)

الفكرة: كل block ليه **`index`**. اعمل array، وكل delta تضيفه على الـ block بتاع الـ index بتاعه.

```ts
const blocks: any[] = [];
for await (const event of stream) {
  switch (event.type) {
    case "content_block_start":
      blocks[event.index] = { ...event.content_block, _json: "" };
      break;
    case "content_block_delta": {
      const b = blocks[event.index];
      if (event.delta.type === "text_delta") b.text += event.delta.text;
      else if (event.delta.type === "input_json_delta") b._json += event.delta.partial_json;
      else if (event.delta.type === "thinking_delta") b.thinking += event.delta.thinking;
      else if (event.delta.type === "signature_delta") b.signature = event.delta.signature;
      break;
    }
    case "content_block_stop": {
      const b = blocks[event.index];
      if (b.type === "tool_use") b.input = b._json ? JSON.parse(b._json) : {}; // دلوقتي بس
      delete b._json;
      break;
    }
  }
}
```

**عمليًا متكتبش ده بإيدك:** الـ SDK بيجمّعه:

```ts
const stream = client.messages.stream({ model: "claude-opus-5-5", max_tokens: 64000, messages });
stream.on("text", (delta) => process.stdout.write(delta)); // للـ UI
const final = await stream.finalMessage();                  // الرسالة كاملة ومجمّعة
```

لكن الامتحان بيسأل عن الـ **mechanics**: إيه الـ events، الـ `partial_json` بيتعمله parse إمتى،
الـ `stop_reason` بيجي فين (في `message_delta`).

## Recovery لما الـ stream يقف في النص

أسباب: network انقطع، `overloaded_error` جه كـ `error` event في النص، timeout، المستخدم قفل.

1. **اعرف إنه اتقطع:** مفيش `message_stop`، أو جالك `error` event، أو الـ connection فشل.
   لو `message_stop` مجاش، **الرد ناقص** حتى لو النص شكله كامل.
2. **متنفذش tool من stream ناقص:** لو الـ `tool_use` block ماوصلش لـ `content_block_stop`، الـ JSON
   ناقص. **متعملوش parse بالعافية ومتنفذوش.**
3. **Retry:** الأخطاء الـ retryable (`429`, `529 overloaded`, `5xx`, network) اعمل retry
   بـ **exponential backoff** (الـ SDK بيعمل retries تلقائي قبل ما الـ stream يبدأ؛ بعد ما يبدأ
   ويتقطع ده شغلك أنت).
4. **إزاي تكمّل؟** خيارين:
   - **أبسط وأأمن:** اعمل الـ request تاني من الأول (وارمي الـ partial، أو خليه ظاهر للمستخدم
     كـ "interrupted").
   - **Continue من النص الجزئي:** تبعت النص اللي وصل كـ context وتطلب يكمل. على الموديلات الحديثة
     الـ **prefill** (assistant message أخيرة) بيرجع 400، فالأسلوب ده محتاج تحط الجزء اللي وصل
     في user message ("continue from here"). أقل موثوقية، استخدمه بس للـ text الطويل.
5. **متكررش side effects:** لو الـ tool اتنفذ قبل الانقطاع، الـ retry ممكن يطلبه تاني. اعمل
   الـ tools **idempotent** (idempotency key) عشان التنفيذ مرتين ميضرش.
6. **`max_tokens` كـ stop_reason** مش انقطاع، ده الرد خلص عند السقف. الحل: ارفع `max_tokens`
   أو كمّل في turn جديد. لو فيه `tool_use` ناقص بسببه، **متنفذوش**.

## الغلطة الشائعة في الامتحان

- ❌ `JSON.parse` على كل `input_json_delta`. ✅ جمّع لحد `content_block_stop`.
- ❌ تعتبر الرد كامل لمجرد إن النص وقف. ✅ اتأكد من `message_stop` / `stop_reason`.
- ❌ retry لـ `400` (invalid request). ده مش هيتصلح بالـ retry؛ صلّح الـ request.
- ✅ retry لـ `429` / `529` / `5xx` بـ backoff.
