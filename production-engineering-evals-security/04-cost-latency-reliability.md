# 4. Cost, Latency & Reliability Budgets

## الفكرة

في production عندك 3 budgets لازم تفضل جواهم مع بعض:
- **Cost:** $ لكل request / لكل task / شهريًا.
- **Latency:** مثلًا p95 < 3 ثواني، أو time-to-first-token < 1 ثانية.
- **Reliability:** مثلًا 99.5% من الـ requests تنجح.

ومينفعش تديرهم من غير ما **تقيسهم**.

## Instrument every call

كل LLM call يتسجل فيه (من `response.usage` وحوالين الـ call):

```ts
const start = Date.now();
const res = await client.messages.create({ ... });
log({
  trace_id, step: "classify", model: res.model, prompt_version: "classify@v7",
  input_tokens: res.usage.input_tokens,
  output_tokens: res.usage.output_tokens,
  cache_read_tokens: res.usage.cache_read_input_tokens,
  cache_write_tokens: res.usage.cache_creation_input_tokens,
  latency_ms: Date.now() - start,
  stop_reason: res.stop_reason,
});
```

- **Cost = tokens × السعر** لكل نوع (input، output، cache read أرخص بكتير، cache write أغلى شوية).
- **Output tokens أغلى** من الـ input (عادة 5x)، والـ thinking tokens بتتحسب output.
- اجمع على مستوى **الـ task** مش الـ request. agent عمل 12 call = cost الـ task هو الـ 12 مع بعض.
- **Cost per completed task** هو المقياس الصح: request أرخص بيحتاج retries أكتر مش أرخص.
- `count_tokens` endpoint عشان تقدّر قبل ما تبعت.

## روافع الـ cost (بالترتيب: المجاني الأول)

| الرافعة | بتوفّر إيه | Tradeoff |
|---|---|---|
| **Prompt caching** | لحد ~90% على الـ prefix المتكرر | مفيش تقريبًا؛ رتّب الـ prompt صح |
| **Context hygiene** | tokens الـ input (tool outputs أصغر، history أقصر) | لازم تتأكد إن المعلومة المهمة لسه موجودة |
| **Batches API** | ~50% | latency لحد 24 ساعة |
| **`max_tokens` و output أقصر** | output tokens | لو قليل زيادة الرد يتقطع |
| **Effort أقل** | thinking / output tokens | ممكن الجودة تقل؛ قيس |
| **Model أرخص** (Haiku / Sonnet) لمهام بسيطة | كتير | الجودة؛ قيس بالـ eval |
| **Routing** | المهام السهلة لموديل رخيص والصعبة لموديل قوي | تعقيد؛ الـ cache مش مشترك بين الموديلات |

## Latency

- **Streaming** بيحسّن الـ perceived latency (TTFT)، مش الوقت الكلي.
- موديل أصغر / effort أقل = أسرع.
- **Prompt caching** بيقلل الـ latency كمان (الـ prefix مش بيتعالج تاني).
- **Parallel calls** للخطوات المستقلة.
- Output أقصر = أسرع (الـ output هو الأبطأ في التوليد).

## Multi-agent systems: استخدم parallel agents بس لما يلزم

Multi-agent (orchestrator + subagents شغالين parallel) ممكن يكون **أسرع** و **أحسن** في مهام معينة،
لكنه **أغلى بكتير**: كل subagent بيحمّل context لوحده، والتنسيق نفسه بيكلّف tokens.

**يستاهل لما:**
- المهمة **قابلة للتقسيم** لأجزاء **مستقلة** (بحث في 10 مصادر، تحليل 50 ملف).
- كل جزء **read-heavy** والنتيجة ملخص صغير (context isolation).
- الـ latency مهم والأجزاء ممكن تشتغل في نفس الوقت.
- قيمة النتيجة تستاهل الـ cost.

**مش بيستاهل لما:**
- الخطوات **معتمدة على بعض** (sequential).
- المهمة صغيرة وagent واحد يعملها.
- الـ subagents محتاجين نفس الـ context الكبير (هتدفعه كذا مرة).

**الضوابط في multi-agent:**
- Budget لكل subagent ولكل الـ task (tokens، turns، وقت).
- حد أقصى لعدد الـ subagents الـ parallel.
- Subagents بموديل أرخص / effort أقل للمهام البسيطة.
- Instrument كل subagent لوحده عشان تعرف مين بيصرف.

## Reliability budget

- **SLO** (مثلًا 99.5% success، p95 latency < 5s) + **error budget**.
- راقب: error rate بالنوع (429 vs 5xx vs refusal vs parse failures)، retries، fallback rate.
- **Alerts** لما cost أو error rate يعدّي threshold (مثلًا agent دخل في loop وبيحرق tokens).
- **Hard limits:** max iterations، max tokens per task، spend cap على الـ API key / workspace.

## الغلطة الشائعة في الامتحان

- ❌ تقيس cost per request بس. ✅ cost per completed task.
- ❌ Multi-agent لكل حاجة "عشان أحسن". ✅ بس للمهام القابلة للتقسيم والـ parallel.
- ❌ موديل أرخص كأول حل للـ cost. ✅ caching و context hygiene و batch الأول (من غير tradeoff).
- ❌ مفيش instrumentation، وتكتشف الـ cost من الـ invoice.
- ❌ Agent من غير spend cap أو max iterations.
