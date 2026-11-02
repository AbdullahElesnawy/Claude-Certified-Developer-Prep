# 8. Multimodal (Images & PDFs), Files API, Message Batches API

## Images (Vision)

ثلاث طرق تبعت بيهم صورة: **base64**، **URL**، أو **file_id** (Files API).

```ts
messages: [{
  role: "user",
  content: [
    { type: "image", source: { type: "base64", media_type: "image/png", data: b64 } },
    { type: "text", text: "Extract the invoice total and date." },  // النص بعد الصورة
  ],
}]
```

نقط "send correctly":
- **`media_type` لازم يطابق الملف الحقيقي** (`image/jpeg`, `image/png`, `image/gif`, `image/webp`).
- **حط الصورة قبل السؤال** (image-then-text) بيدّي نتايج أحسن.
- base64 من غير `data:image/png;base64,` prefix ومن غير newlines.
- **الصور بتتحسب tokens** (تقريبًا حسب الأبعاد). صورة 4K = توكنز كتير؛ صغّرها للحجم اللي
  يكفي المهمة.
- كذا صورة في نفس الـ message مسموح؛ سمّيهم في النص ("Image 1: ... Image 2: ...") عشان تقارن.
- Claude **مش** بيعمل identify للأشخاص من وشهم، و precision المسافات/العد الدقيق في الصور محدود.

## PDFs

```ts
{ type: "document",
  source: { type: "base64", media_type: "application/pdf", data: pdfB64 } }
```
- Claude بيشوف **النص + الصفحات كصور** (charts، tables، layout).
- حدود: 32 MB للـ request، 600 صفحة (100 للموديلات اللي context بتاعها 200K).
- كل صفحة بتكلّف text tokens + image tokens، فـ PDF كبير = غالي. ابعت الصفحات المهمة بس لو تقدر.
- **Citations:** `citations: { enabled: true }` على الـ document block، وClaude يرجّع إشارات
  للمكان اللي جاب منه الكلام (page_location). مفيد ضد الـ hallucination.
- **Prompt caching** مع document هتسأل عليه أسئلة كتير: حط `cache_control` على الـ document.

## Files API (للـ reusable assets)

**المشكلة:** نفس الـ PDF (عقد 200 صفحة) بتبعته base64 في 50 request = upload ضخم كل مرة.

**الحل:** ارفعه **مرة واحدة**، خد `file_id`، واستخدمه في أي request.

```ts
const file = await client.files.upload({ file: fs.createReadStream("contract.pdf") });

await client.messages.create({
  model: "claude-opus-5-5", max_tokens: 4096,
  messages: [{ role: "user", content: [
    { type: "document", source: { type: "file", file_id: file.id } },
    { type: "text", text: "List the termination clauses." },
  ]}],
});
```

- نوع الـ block لازم يطابق نوع الملف: `document` للـ PDF/text، `image` للصور.
- **Files API بتوفّر الـ upload/bandwidth، مش الـ tokens.** الملف لسه بيتحسب input tokens في
  كل request. عشان توفّر tokens استخدم **prompt caching**.
- الملفات ليها lifecycle (list / delete): امسح اللي مش محتاجه، خصوصًا لو فيه data حساسة.
- مناسب كمان لملفات بيطلّعها **code execution** (charts، reports) وترجعلك كـ file_id.

## Message Batches API (async, high-volume)

**إمتى؟** شغل كتير **مش مستعجل**: تصنيف 100K review، eval على 10K حالة، تقارير بالليل.

| | Messages API (realtime) | **Batches API** |
|---|---|---|
| Latency | ثواني | لحد **24 ساعة** (غالبًا أقل من ساعة) |
| Cost | سعر عادي | **~50% أرخص** |
| مناسب لـ | chat، UI، agents | bulk، offline، evals |
| Streaming | آه | لأ |

```ts
const batch = await client.messages.batches.create({
  requests: docs.map((d) => ({
    custom_id: `doc-${d.id}`,                    // ⚠️ أنت بتربط النتايج بيه
    params: { model: "claude-haiku-5-5", max_tokens: 512,
              messages: [{ role: "user", content: d.text }] },
  })),
});

// poll لحد ما processing_status === "ended"
const status = await client.messages.batches.retrieve(batch.id);

// النتايج
for await (const r of await client.messages.batches.results(batch.id)) {
  if (r.result.type === "succeeded") save(r.custom_id, r.result.message);
  else retryLater(r.custom_id, r.result.type); // errored | canceled | expired
}
```

نقط مهمة للامتحان:
- النتايج بترجع **بأي ترتيب**: اربط بـ **`custom_id`**، مش بالـ index.
- كل request في الـ batch **مستقل**: واحد يفشل مش بيوقّف الباقي. اعمل retry للفاشلين بس.
- **مش مناسب لـ agents / tool loops** اللي محتاجة رد فوري عشان الخطوة الجاية.
- ينفع تجمع **batch + prompt caching** (نفس الـ system prompt الطويل في كل الـ requests) لتوفير أكتر.

## Prompt caching (بيتسأل عليه مع ده كتير)

- الـ cache **prefix match**: الترتيب `tools` → `system` → `messages`. أي byte يتغير في الـ prefix
  يبوّظ الـ cache لكل اللي بعده.
- حط الثابت في الأول (system، documents، tools)، والمتغير في الآخر.
- `cache_control: { type: "ephemeral" }` (default TTL 5 دقايق، فيه `"1h"`).
- **Cache write** أغلى شوية (~1.25x)، **cache read** ~0.1x من السعر. يكسب لما نفس الـ prefix يتكرر.
- اتأكد بـ `usage.cache_read_input_tokens`. لو صفر دايمًا، فيه حاجة بتتغير
  (timestamp في الـ system prompt مثلًا).

## الغلطة الشائعة في الامتحان

- ❌ "Files API reduces token cost." لأ، بيوفّر الـ re-upload. الـ tokens بتتوفر بالـ caching.
- ❌ Batches لـ chatbot أو لأي حاجة المستخدم مستنيها.
- ❌ ربط نتايج الـ batch بالترتيب.
- ❌ `media_type` مش مطابق للصورة.
- ✅ 10K document بالليل والـ cost هو الأولوية → **Message Batches API** (ده Sample Question 1
  في الـ exam guide الرسمي).
