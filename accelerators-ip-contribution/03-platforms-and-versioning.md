# 3. Where a Workload Runs + Versioning Releases

## الـ platforms

| Platform | مين بيشغّله | Auth | Model IDs |
|---|---|---|---|
| **Claude API (first-party / 1P)** | Anthropic | API key، OAuth، workload identity federation | `claude-opus-5-5` |
| **Claude Platform on AWS** | **Anthropic** (على AWS infrastructure) | AWS IAM / SigV4، billing عن طريق AWS Marketplace | نفس الـ 1P (من غير prefix) |
| **Amazon Bedrock** | **AWS** (partner-operated) | AWS IAM | بـ prefix: `anthropic.claude-opus-5-5` |
| **Google Vertex AI** | **Google** | GCP IAM / ADC (مفيش Anthropic key) | الـ ID العادي (القديمة بـ `@` للـ date) |
| **Microsoft Foundry** | Microsoft (billing عن طريق Azure Marketplace) | API key / Entra ID | |

- **Claude Platform on AWS ≠ Bedrock.** الأول Anthropic بتشغّله على AWS بـ **same-day API parity**
  (نفس features الـ 1P)؛ Bedrock AWS بتشغّله و features أقل وممكن تتأخر.
- كل platform ليه **SDK client خاص**: `AnthropicBedrockMantle`، `AnthropicVertex`، `AnthropicFoundry`،
  `AnthropicAWS`. متستخدمش الـ 1P client مع `base_url` override.
- بعد ما تعمل الـ client، الـ `messages.create` / `stream` **هو هو**. ده اللي بيخلّي الكود portable.

## Feature availability (snapshot أكتوبر 2026، **اتأكد من الـ docs قبل أي قرار**)

| Feature | 1P | Platform on AWS | Bedrock | Vertex | Foundry |
|---|---|---|---|---|---|
| Messages، streaming، tool use، vision، PDF | ✅ | ✅ | ✅ | ✅ | ✅ |
| Prompt caching، structured outputs، thinking / effort | ✅ | ✅ | ✅ | ✅ | ✅ |
| Message Batches API | ✅ | ✅ | ❌ | ❌ | ❌ |
| Files API | ✅ | ✅ | ❌ | ❌ | beta |
| Web search | ✅ | ✅ | ❌ | ✅ (basic) | ✅ |
| Web fetch | ✅ | ✅ | ❌ | ❌ | ✅ |
| Code execution | ✅ | ✅ | ❌ | ❌ | ✅* |
| Agent Skills (API) | ✅ | ✅ | ❌ | ❌ | beta* |
| MCP connector | beta | beta | ❌ | ❌ | beta |
| Managed Agents | beta | beta | ❌ | ❌ | ❌ |
| `inference_geo` (data residency param) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Fast mode | beta | ❌ | ❌ | ❌ | ❌ |

\* Foundry: على deployments "Hosted on Anthropic" بس.

**الدرس:** الـ core (messages، tools، streaming، caching، thinking) موجود في كل حتة. الـ **server
tools والـ endpoints الإضافية** (batches، files، skills، code execution، managed agents) هي اللي
بتختلف. لو الـ accelerator بتاعك بيعتمد عليها، **مش portable** لكل platform.

(على Bedrock / Vertex بيبقى عندهم بدايل بتاعتهم، زي batch inference في الـ cloud نفسه، بس دي APIs
تانية مش Message Batches API.)

## إزاي تختار؟ (من منظور الـ requirements)

| الـ requirement | الاتجاه |
|---|---|
| أحدث features أول ما تنزل (managed agents، fast mode، batches، files) | **1P API** (أو Platform on AWS) |
| العميل "AWS shop": IAM، billing على AWS، VPC، CloudTrail | **Bedrock** أو **Claude Platform on AWS** (لو محتاج features الـ 1P) |
| العميل على GCP | **Vertex AI** |
| العميل على Azure / Microsoft procurement | **Foundry** |
| Committed spend / credits عند cloud provider | الـ platform بتاعه (بيتحسب من الـ commitment) |
| Data residency صارمة في region معين | الـ platform اللي عنده الـ region ده / `inference_geo` في 1P |

**المبدأ:** الـ platform بيتحدد غالبًا من **الـ requirements بتاعة العميل** (procurement، compliance،
cloud الموجود)، مش من تفضيلك. وبعدين تتأكد إن الـ features اللي محتاجها موجودة هناك.

## Versioning releases عشان ميتكسرش بصمت

"Silently break production" بيحصل لما حاجة تتغير **من غير ما حد يقصد أو يقيس**. الحاجات اللي بتتغير:

| بيتغير | الحماية |
|---|---|
| **الموديل** (alias بيشاور على version أحدث، أو موديل اتعمله retire) | **Pin** الـ model version في config كل environment؛ upgrade بقصد بعد eval |
| **الـ prompt** | **Prompt versioning**: في git، بـ version ID (`support@v7`) بيتسجل في كل trace |
| Tool descriptions / schemas | Versioned مع الكود؛ eval بعد أي تغيير |
| الـ SDK | Lockfile؛ upgrade بقصد |
| الـ accelerator نفسه | **Semver**: patch (fix)، minor (feature compatible)، major (breaking) + CHANGELOG |
| Platform features | اختبر على الـ platform الفعلي (مش بس 1P) |

### Release process لتغيير موديل أو prompt

```
1. Branch / config جديد: model=X أو prompt=v8
2. شغّل الـ eval suite (نفس الـ cases) → قارن بالـ baseline
3. شيّك cost + latency (tokenizer الجديد ممكن يغير عدد الـ tokens)
4. Canary / shadow: نسبة صغيرة من الـ traffic، أو تشغيل موازي من غير ما المستخدم يشوفه
5. راقب metrics (errors، refusals، quality signals)
6. Rollout تدريجي، و rollback جاهز (الـ config القديم متاح)
```

- **Model deprecation:** الموديلات القديمة بتتعمل retire بجدول معلن. تابع الـ deprecations وخطط
  للـ migration قبل الميعاد، مش بعد ما الـ requests تبدأ تفشل.
- **Breaking changes بين الموديلات حقيقية:** مثلًا parameters اتشالت (`budget_tokens`، prefill،
  temperature على بعض الموديلات الجديدة بترجع 400)، defaults اتغيرت (effort)، tokenizer اتغير
  (نفس النص = عدد tokens مختلف = cost مختلف). عشان كده الـ eval قبل الـ upgrade مش اختياري.

## الغلطة الشائعة في الامتحان

- ❌ تفترض إن كل features الـ 1P موجودة في Bedrock / Vertex. ✅ شيّك الـ availability.
- ❌ Bedrock و Claude Platform on AWS نفس الحاجة.
- ❌ Alias بيتحدث لوحده في production.
- ❌ Prompt بيتعدّل في الـ console من غير version ولا eval.
- ❌ Model upgrade مباشرة لـ 100% من الـ traffic.
