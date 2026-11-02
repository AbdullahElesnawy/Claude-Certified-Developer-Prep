# 3. Resilience: Retriable vs Terminal Errors

## الفكرة

مش كل error يستاهل retry. لو عملت retry لـ error مش هيتصلح، بتضيّع وقت وفلوس وبتأخر المستخدم.
ولو موقفتش على error مؤقت، بتفشل في حاجة كانت هتنجح بعد ثانيتين.

## الجدول اللي لازم تحفظه

| Code | Type | Retriable؟ | السبب | تعمل إيه |
|---|---|---|---|---|
| 400 | `invalid_request_error` | ❌ **Terminal** | الـ request غلط (parameter، format، context طويل) | صلّح الـ request |
| 401 | `authentication_error` | ❌ | key غلط أو مش موجود | صلّح الـ credentials، alert |
| 402 | `billing_error` | ❌ | مشكلة دفع | alert |
| 403 | `permission_error` | ❌ | الـ key ملوش صلاحية | صلّح الصلاحيات |
| 404 | `not_found_error` | ❌ | model ID غلط أو endpoint | صلّح الـ ID |
| 413 | `request_too_large` | ❌ | الـ request أكبر من الحد | صغّر الـ input (chunking) |
| 429 | `rate_limit_error` | ✅ **Retriable** | requests كتير | استنى `retry-after` ثم retry |
| 500 | `api_error` | ✅ | مشكلة عند Anthropic | retry بـ backoff |
| 529 | `overloaded_error` | ✅ | الـ API مضغوط مؤقتًا | retry بـ backoff، أو fallback |
| — | Network / timeout | ✅ | الشبكة | retry (بس خلي بالك من الـ side effects) |

**قاعدة سهلة:** 4xx (ما عدا 429) = **غلطتك**، retry مش هيصلحها. 429 و 5xx = **مؤقت**، retry.

## Retries صح

```ts
const client = new Anthropic({ maxRetries: 3, timeout: 60_000 }); // الـ SDK بيعمل retry لـ 429 و 5xx لوحده

try {
  const res = await client.messages.create({ ... });
} catch (err) {
  if (err instanceof Anthropic.RateLimitError) {
    // اتعمله retry وفشل برضه: queue it / تأجيل / رسالة للمستخدم
  } else if (err instanceof Anthropic.BadRequestError) {
    // terminal: log + صلّح. متعملش retry
  } else if (err instanceof Anthropic.APIError && err.status >= 500) {
    // retriable اتعمله retry وفشل: fallback أو degrade
  } else {
    throw err;
  }
}
```

- **Exponential backoff + jitter:** 1s، 2s، 4s... + عشوائية صغيرة عشان كل الـ clients ميعملوش retry
  في نفس اللحظة (thundering herd).
- **احترم `retry-after`** header في الـ 429.
- **Max retries:** حد أقصى، وبعده تفشل بشكل واضح.
- **Catch chain** من الأخص للأعم (typed error classes)، مش `catch (e)` واحد عام ولا string matching
  على الرسالة.
- **Timeouts:** retry + timeout ممكن يوصلوا لـ `timeout × (retries + 1)`. خد ده في الحسبان مع الـ
  latency budget.

## حالات مش HTTP errors بس لازم تتعامل معاها

الـ request نجح (200) بس النتيجة مش اللي متوقعها:

| الحالة | تعمل إيه |
|---|---|
| `stop_reason: "max_tokens"` | الرد اتقطع. ارفع `max_tokens` أو كمّل. **متنفذش tool_use ناقص** |
| `stop_reason: "refusal"` | الموديل رفض. اعرض رسالة مناسبة، أو fallback model لو مناسب |
| Output مش مطابق للـ schema | validate؛ retry مرة (ممكن مع الـ error) أو structured outputs |
| Tool فشل | `tool_result` بـ `is_error: true` وخلّي الموديل يتصرف |
| Stream اتقطع | اعتبره ناقص، retry ([الكورس التاني، ملف 04](../production-grade-prompting/04-streaming.md)) |

## Idempotency

لو الـ request اتعمله retry، أي **side effect** ممكن يتكرر (دفع مرتين، email مرتين).
- اعمل الـ tools **idempotent**: **idempotency key** لكل عملية، والـ backend يرفض التكرار.
- Retry للـ LLM call نفسه آمن (مالوش side effects)؛ الخطر في الـ tools.

## Graceful degradation و fallbacks

لما الـ retries تخلص:
- **Fallback model** (مثلًا موديل تاني لو الأساسي overloaded). خلي بالك: الـ prompt cache مربوط بالموديل.
- **Queue** الطلب ويتعمل بعدين (لو مش مستعجل).
- **Degraded response:** "الخدمة مشغولة، هنرد عليك خلال..." بدل crash.
- **Circuit breaker:** لو الـ errors كتير، وقّف المحاولات شوية بدل ما تضغط أكتر.

## Rate limits بشكل استباقي

- اعرف الـ limits بتاعتك (requests per minute، input / output tokens per minute).
- **Client-side rate limiting / concurrency limit** (semaphore) بدل ما تستنى 429.
- حرّك الشغل اللي مش مستعجل لـ **Batches API** (limits منفصلة، وأرخص).
- **Prompt caching** بيقلل الـ tokens وبالتالي الضغط على الـ limits.

## الغلطة الشائعة في الامتحان

- ❌ Retry لـ 400 أو 401. ✅ terminal: صلّح.
- ❌ Retry فوري من غير backoff على 429.
- ❌ تتجاهل `retry-after`.
- ❌ Retry لـ tool بيدفع من غير idempotency key.
- ❌ تعتبر 200 = نجاح من غير ما تشوف `stop_reason`.
- ❌ catch واحد عام بيعامل كل الـ errors زي بعض.
