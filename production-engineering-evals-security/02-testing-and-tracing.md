# 2. Testing Layers و Tracing

## الـ eval مش كفاية لوحده

الـ eval بيقيس **جودة الموديل**. لكن الـ app فيه كود كتير حوالين الموديل: parsing، tools، retries،
DB، UI. الـ bugs ممكن تبقى في أي حتة، فمحتاج **layers** من الـ tests.

## الـ 4 layers

| Layer | بيختبر إيه | بيكلّم الموديل الحقيقي؟ | سرعة | مثال |
|---|---|---|---|---|
| **Unit** | function واحدة لوحدها | **لأ** (mock / recorded response) | سريع جدًا | الـ parser بيتعامل صح مع JSON ناقص؟ الـ tool handler بيرجّع `is_error` صح؟ prompt template بيتبني صح؟ |
| **Functional** | feature واحدة من منظور المستخدم | غالبًا لأ أو fixtures | سريع | "لما الـ tool يفشل، الـ loop بيكمل ويرد على المستخدم" |
| **Integration** | الأجزاء مع بعض: الـ API الحقيقي، DB، MCP server، tools | **آه** (أو staging) | أبطأ وبيكلّف | tool-use loop كامل مع tool حقيقي؛ الـ streaming مع الـ SDK |
| **End-to-end** | الـ flow كله زي المستخدم بالظبط | آه | الأبطأ | المستخدم يبعت ticket → الـ agent يصنف ويرد ويحفظ في الـ DB |

**الهرم:** unit كتير (رخيصة وسريعة)، integration أقل، e2e قليلة (للـ critical paths).

### إزاي تختبر كود بيستخدم موديل non-deterministic؟

- **Unit:** **mock** الـ API أو استخدم **recorded responses** (fixtures). الـ test بيبقى deterministic
  وبيختبر **الكود بتاعك**، مش الموديل.
- اختبر الحالات الصعبة **بالـ fixtures**: `stop_reason: "max_tokens"`، `refusal`، tool_use بـ input
  غلط، stream اتقطع، 429، 529. صعب تخلي الموديل الحقيقي يعملها عند الطلب.
- **Integration / e2e** مع الموديل الحقيقي: اختبر **properties** مش نص بعينه
  ("الـ output JSON صالح"، "الـ category من القايمة"، "نادى الـ tool الصح")، مش
  `expect(text).toBe("...")`.
- الجودة نفسها مكانها الـ **eval**، مش الـ unit tests.

## Regressions

**Regression** = حاجة كانت شغالة وبطّلت. أسبابها في LLM apps:
- تغيير في الـ prompt (حتى كلمة)،
- **model upgrade** أو تغيير الـ model version،
- تغيير في tool description أو schema،
- تغيير في الـ context (CLAUDE.md، retrieval، data).

الحماية:
- **Pin the model version** في production، وغيّره بقصد بعد eval.
- **Version the prompts** (في git، مع الكود).
- كل bug اتصلح → **test case جديد** (unit أو eval case).
- الـ suite يتشغل في **CI** قبل أي merge أو deploy.

## Tracing (observability)

**Trace** = سجل كامل لـ request واحد من أوله لآخره: كل LLM call، كل tool call، الـ inputs، الـ outputs،
التوقيتات، والـ tokens. في agent بيعمل 15 خطوة، من غير trace مش هتعرف إيه اللي بوّظ.

كل **span** (خطوة) يتسجل فيه:

| الحقل | ليه |
|---|---|
| Request ID / trace ID | تربط الخطوات ببعض وبالـ logs |
| Model + version | تعرف أنهي موديل رد |
| Prompt version | تعرف أنهي prompt |
| Input / output (بعد redaction للـ PII) | تشوف حصل إيه |
| `usage` (input، output، cache read/write tokens) | الـ cost |
| Latency (والـ time-to-first-token للـ streaming) | الأداء |
| `stop_reason` | `max_tokens`؟ `refusal`؟ |
| Tool calls + results + errors | فين الـ agent اتلخبط |
| Retries | الـ reliability |

الأدوات: Langfuse، LangSmith، OpenTelemetry، أو logging بتاعك. (Langfuse هو اللي في module 9 عندك.)

### Trace analysis: integration layer ولا model output؟

الـ exam guide بيقول: **"problem origin isolation between the integration layer and model output"**.

لما حاجة تبوظ، افتح الـ trace واسأل:

| السؤال | لو آه، المشكلة في |
|---|---|
| الـ request وصل للموديل صح؟ (الـ prompt متبني صح، الـ context كامل، الـ tools موجودة) | لو لأ: **integration** |
| الموديل رد بحاجة معقولة بالنسبة للـ input اللي وصله؟ | لو لأ: **model / prompt** |
| الرد اتعمله parse واتنفذ صح؟ | لو لأ: **integration** (parsing، tool handler) |
| الـ tool رجّع data صح؟ | لو لأ: **tool / data** |

مثال: الـ agent بيقول "مفيش orders" والـ customer عنده orders. الـ trace بيوري إن الـ tool اتنادى
بـ `customer_id` صح، والـ tool رجّع `[]` بسبب timezone bug في الـ query. المشكلة في الـ tool، مش
الموديل، وتغيير الـ prompt مش هيصلحها.

## الغلطة الشائعة في الامتحان

- ❌ Unit tests بتنادي الـ API الحقيقي. ✅ mocks / fixtures.
- ❌ `expect(output).toBe("exact text")` على output موديل. ✅ اختبر properties.
- ❌ تغيّر الـ prompt على طول لما الـ agent يغلط. ✅ افتح الـ trace الأول واعرف المشكلة فين.
- ❌ موديل من غير version مثبّت في production.
- ❌ logs فيها PII خام.
