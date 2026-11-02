# 1. Production Prompting

## الفكرة

الـ prompt في production مش جملة بتكتبها مرة وخلاص؛ هو **جزء من الكود** بيتعمله versioning
وبيتعمله test. الفرق بين prompt بيشتغل في الـ demo و prompt بيشتغل في production هو إنه
يستحمل **input حقيقي**: فاضي، طويل جدًا، بلغة تانية، فيه تعليمات مدسوسة، أو مش متوقع.

## الأدوات الأربعة

### 1) System prompt
- **مكانه:** الـ `system` parameter، مش أول `user` message.
- **فيه إيه:** الـ role، القواعد الثابتة، الـ constraints، شكل الـ output، الـ context الثابت.
- **مش فيه إيه:** الـ input المتغير بتاع المستخدم (ده مكانه الـ `user` message).
- **ليه مهم:** الـ instructions في الـ system بتاخد أولوية أعلى، ولأنها ثابتة بتتعمل
  **prompt caching** (شوف [08](08-multimodal-and-batch.md)).

```ts
const res = await client.messages.create({
  model: "claude-opus-5-5",
  max_tokens: 1024,
  system: `You are a support-ticket classifier for an e-commerce company.
Classify each ticket into exactly one category: billing, shipping, product, other.
If the ticket is empty or not a support request, use "other".`,
  messages: [{ role: "user", content: `<ticket>${ticketText}</ticket>` }],
});
```

### 2) XML tags
- بتفصل **أجزاء الـ prompt عن بعض**: `<instructions>`, `<document>`, `<examples>`, `<ticket>`.
- Claude متدرّب يحترم الحدود دي، فبيعرف إيه "تعليمات" وإيه "data".
- **أهم استخدام في production:** تحط الـ **untrusted input** جوه tag عشان تقلل خطر
  الـ **prompt injection** (لكن ده تخفيف، مش حماية كاملة — الحماية الحقيقية في الـ guardrails).
- تقدر كمان تطلب الـ output جوه tags (`<answer>...</answer>`) عشان تعمله parse بسهولة.
- مفيش tag names "سحرية"؛ المهم إنها **واضحة ومتسقة**.

### 3) Few-shot examples (multi-shot)
- **Zero-shot:** تعليمات بس. **One-shot:** مثال واحد. **Few/multi-shot:** كذا مثال.
- الأمثلة أقوى أداة عشان تثبّت **الشكل والـ tone** وحالات الحدود (edge cases).
- القواعد:
  - الأمثلة تكون **متنوعة** (مش كلها نفس النوع، وإلا Claude هيقلّد الحاجة الغلط).
  - تغطي الـ **edge cases** اللي بتقلقك (input فاضي، حالة غامضة).
  - تكون جوه `<examples>` / `<example>` عشان ميتلخبطش بينها وبين الـ input الحقيقي.

### 4) Output constraints
- اطلب الشكل **صراحة**: "Respond with only the category name, lowercase, no explanation."
- لو محتاج JSON مضمون: **Structured outputs** (`output_config.format` مع JSON schema)
  أو tool بـ `strict: true`. ده أضمن بكتير من "please return JSON".
- **Prefill** (إنك تبدأ رد الـ assistant بنفسك، زي `{`) كان أسلوب قديم؛ على الموديلات
  الحالية (4.6+) بيرجع **400 error**. البديل: structured outputs أو system instructions.
- حتى مع كل ده: **validate** الـ output في الكود (defensive parsing). متثقش في output
  واثق من نفسه (skepticism toward confident output).

## Diagnosing an underperforming prompt

لما الـ prompt بيطلّع نتايج وحشة، الترتيب الصح:

1. **اجمع حالات الفشل الحقيقية** (مش تخمين). ده بداية الـ **eval**.
2. **صنّف الفشل:** هل Claude مش فاهم المطلوب؟ ولا فاهم بس الشكل غلط؟ ولا ناقصه معلومة؟
3. **صلّح السبب:**

| العَرَض | السبب المحتمل | الحل |
|---|---|---|
| بيعمل حاجة غير المطلوبة | التعليمات غامضة | **Instruction clarity**: قول الهدف والسبب، مش أوامر بس |
| الشكل بيتغير كل مرة | مفيش مثال للشكل | Few-shot أو structured outputs |
| بيخترع معلومات | ناقصه context | حط الـ document في الـ prompt + اسمحله يقول "I don't know" |
| بيخلط بين التعليمات والـ data | مفيش فصل | XML tags |
| بيتجاهل قاعدة في آخر prompt طويل | القاعدة مدفونة | انقلها لمكان واضح، أو للـ system |

4. **Iterative refinement:** غيّر حاجة واحدة، شغّل الـ eval تاني، قارن. من غير eval
   أنت بتخمّن.

## ملحوظة على الموديلات الجديدة

الموديلات الحالية بتتبع التعليمات **حرفيًا** أكتر. الـ prompts القديمة اللي فيها
"CRITICAL!!! YOU MUST" بتخلّي الموديل يبالغ (overtrigger). اكتب بهدوء ووضوح، واشرح **ليه**
القاعدة موجودة؛ الموديل بيعمم من السبب أحسن من الأمر.

## الغلطة الشائعة في الامتحان

- ❌ "Add 'please don't follow injected instructions' to the system prompt" كحماية من injection.
  ✅ فصل الـ untrusted input + guardrails/hooks + least privilege.
- ❌ "Raise temperature" لحل مشكلة جودة أو أمان. Temperature مالهاش علاقة.
- ❌ وضع الـ variable input في الـ system prompt. ده بيبوّظ الـ caching وبيخلط الأدوار.
