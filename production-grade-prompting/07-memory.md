# 7. Memory

## الفكرة

الـ API **stateless**: كل session جديدة تبدأ من الصفر. **Memory** = إن الـ agent يحفظ
حاجات **بره** الـ context window ويرجع يقراها في session جديدة.

والتحدي اللي الكورس بيركّز عليه: **"while controlling context cost"**. لو حمّلت كل الـ memory
في كل request، رجعت لمشكلة الـ context bloat.

## أنواع الـ state

| النوع | مثال | يتخزن فين |
|---|---|---|
| **Short-term** (جوه الـ session) | الـ conversation history | الـ messages array |
| **Long-term / persistent** | تفضيلات المستخدم، قرارات اتاخدت، progress في مهمة طويلة | ملفات / DB / memory store |
| **Task state** | "خلصت خطوة 3 من 7، الـ PR رقم كذا" | ملف progress أو DB |

## الطريقة: memory tool (Claude بيدير الـ memory بنفسه)

الـ **memory tool** (`memory_20250818`) بيدّي Claude directory (`/memories`) يقدر يعمل فيه:
`view`, `create`, `str_replace`, `insert`, `delete`, `rename`.

```ts
const res = await client.messages.create({
  model: "claude-opus-5-5",
  max_tokens: 16000,
  tools: [{ type: "memory_20250818", name: "memory" }],
  messages,
});
// لما Claude يطلب memory operation، **أنت** بتنفذها على الـ storage بتاعك
// (filesystem، S3، DB...)، زي أي client-side tool.
```

- **Client-side:** الـ storage عندك أنت. ده معناه إنك مسؤول عن الأمان (path traversal: متخليش
  `../` يطلع بره `/memories`)، والـ isolation بين المستخدمين (كل user ليه directory).
- Claude بيقرر **يقرا إيه وإمتى**، فمش كل الـ memory بتدخل الـ context: بيعمل `view` على الـ
  directory، ويفتح بس الملف اللي محتاجه. **ده** اللي بيتحكم في الـ context cost.

## مبادئ التحكم في الـ cost

1. **Index صغير + تفاصيل on-demand:** ملف index قصير بيتحمّل دايمًا (زي `MEMORY.md`)، وفيه
   pointers لملفات تفاصيل بتتقري بس لما تلزم.
2. **اكتب ملخص، مش transcript:** احفظ القرار والسبب، مش المحادثة كلها.
3. **Structured state:** progress كـ JSON/checklist أسهل يتقري ويتحدّث من نص حر.
4. **Prune:** امسح أو حدّث الـ memories اللي بقت غلط أو قديمة. memory غلط أسوأ من مفيش memory.
5. **Memory + context editing:** قبل ما الـ context يتمسح/يتلخّص، الـ agent يحفظ المهم في
   الـ memory. بعدين يقدر يرجعله.

## Memory vs الحلول التانية

| | Memory | Compaction | RAG |
|---|---|---|---|
| بيحل إيه | الاستمرارية **بين sessions** | الـ context الطويل **جوه session** | معرفة كبيرة (docs) |
| مين بيكتبه | الـ agent | الـ API / أنت | أنت (ingestion) |
| بيتقري إمتى | الـ agent يقرر | تلقائي | retrieval لكل query |

## Security في الـ memory

- الـ memory **untrusted input** لما ترجع تتقري: لو حد قدر يكتب فيها (prompt injection في
  session قديمة)، التعليمات دي هتدخل الـ context. متخليش memory تمنح صلاحيات.
- **PII:** متخزنش بيانات حساسة من غير داعي، وطبّق retention / deletion.
- **Tenant isolation:** memory كل مستخدم منفصلة تمامًا.

## الغلطة الشائعة في الامتحان

- ❌ "Load the entire memory into the system prompt every request." ✅ on-demand retrieval / index.
- ❌ الاعتماد على إن Claude "فاكر" من session قبل كده. الـ API stateless.
- ❌ memory directory مشترك بين كل المستخدمين.
