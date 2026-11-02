# 5. Access Patterns: SDK vs REST، Sync vs Streaming، Async

## SDK vs REST

الـ SDK **بيلف نفس الـ REST API** (`POST /v1/messages`). مفيش موديل مختلف ولا endpoint سري.

| | Raw REST (`curl`، `fetch`، `requests`) | Official SDK (`@anthropic-ai/sdk`، `anthropic`...) |
|---|---|---|
| Types | أنت تكتبها | جاهزة (request و response) |
| Retries | أنت تكتبها | **تلقائي** لـ 429 و 5xx و network errors (بـ backoff) |
| Errors | تقرا الـ status code | **Typed error classes** (`RateLimitError`...) |
| Streaming | تعمل parse للـ SSE بنفسك | helpers (`.stream()`، `finalMessage()`) |
| Timeouts | أنت | defaults معقولة |
| مناسب لـ | لغة مفيهاش SDK، shell scripts، debugging | معظم الحالات |

**Auth:** API key في الـ header (`x-api-key`) ومعاه `anthropic-version`. في الـ SDK من الـ environment
(`ANTHROPIC_API_KEY`). متكتبهوش في الكود.

## Sync vs Streaming

| | Sync (request → response كامل) | Streaming |
|---|---|---|
| المستخدم بيشوف إيه | ولا حاجة لحد ما الرد يخلص | النص وهو بيتكتب |
| Time to first token | = الوقت كله | ثواني |
| ردود طويلة | ممكن تعمل **HTTP timeout** | آمن |
| الكود | أبسط | events لازم تتجمع (الـ SDK بيساعد) |
| مناسب لـ | backend jobs قصيرة، classification | chat UI، ردود طويلة، `max_tokens` كبير |

الـ streaming في Claude API شغال بـ **Server-Sent Events (SSE)** على HTTP (اتجاه واحد: server → client).
(تفاصيل الـ events في [الكورس التاني، ملف 04](../production-grade-prompting/04-streaming.md).)

### SSE vs WebSockets vs polling (الـ technical fundamentals)

| | الاتجاه | مناسب لـ |
|---|---|---|
| **Polling** | الـ client بيسأل كل شوية | status لشغل طويل (زي batch) |
| **SSE** | server → client، على HTTP عادي | streaming ردود الموديل |
| **WebSockets** | الاتجاهين، connection مفتوح | تفاعل real-time في الاتجاهين (voice، collaborative UI، بعض الـ MCP transports) |

## Async patterns للـ high volume

عندك آلاف الـ requests المستقلة:

| | إزاي | إمتى |
|---|---|---|
| **Sequential** | واحد ورا واحد | ❌ بطيء جدًا |
| **Unbounded parallel** | كله مرة واحدة | ❌ هتخبط في الـ rate limits فورًا (429) |
| **Async + concurrency limit** | async client + semaphore (مثلًا 10–50 في نفس الوقت)، retry لـ 429 بـ backoff | النتايج محتاجها خلال دقايق / ساعة |
| **Message Batches API** | تبعت الكل مرة واحدة، والنتايج خلال 24 ساعة | مش مستعجل، و **~50% أرخص** |

```ts
// async with bounded concurrency (sketch, using the p-limit package)
import pLimit from "p-limit";
const limit = pLimit(20);
const results = await Promise.all(items.map((item) => limit(() => client.messages.create({ ... }))));
```

- اربط النتايج بـ **ID** مش بالترتيب (خصوصًا في الـ Batches API: `custom_id`).
- Batch **مش مناسب** لـ chat ولا لـ agent loop محتاج نتيجة كل خطوة عشان يقرر اللي بعدها.

## الغلطة الشائعة في الامتحان

- ❌ "The SDK uses a different/faster model." نفس الـ API.
- ❌ 5,000 request parallel مرة واحدة.
- ❌ Batch لـ live chat.
- ✅ Chat UI بيبان فاضي 20 ثانية → streaming.
- ✅ Bulk ومش مستعجل وcost أولوية → Batches API.
