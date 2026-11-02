# 1. Packaging a Reusable Accelerator

## يعني إيه accelerator؟

**Accelerator** = حاجة اتبنت لعميل أو مشروع، واتحوّلت لـ asset يتعاد استخدامه. المشروع الجاي
**يعمله configure** بدل ما **يبنيه من الأول**.

أمثلة الكورس:
- **Parameterized agent template** (agent جاهز، تغيّر الـ config بس).
- **Configurable MCP server** (server لـ Jira / Salesforce / DB، الـ connection والـ scopes config).
- **Portable eval suite** (harness + graders يشتغل على أي agent يطابق interface معين).

## المبدأ: افصل الـ "ثابت" عن الـ "خاص بالعميل"

قبل ما تحوّل الـ build لـ accelerator، اسأل عن كل حاجة فيه: **ده جزء من الـ pattern ولا خاص بالعميل ده؟**

| خاص بالعميل (يبقى **parameter**) | ثابت (يبقى **code**) |
|---|---|
| أسماء الـ products، الـ policies، الـ tone | الـ agent loop، retries، error handling |
| الـ model ID و الـ effort | الـ tool-use plumbing |
| الـ system prompt المخصص / الـ domain knowledge | الـ prompt structure (الـ template) |
| Endpoints، credentials، tenant IDs | Tracing و logging |
| الـ tools المفعّلة | Guardrails الأساسية (approval gates، validation) |
| Thresholds (budget، max turns) | Eval harness |

## Parameterized agent template

```ts
// config schema: كل حاجة خاصة بالعميل هنا، validated
const AgentConfig = z.object({
  model: z.string().default("claude-sonnet-5-5"),        // pinned per deployment
  effort: z.enum(["low", "medium", "high"]).default("medium"),
  promptVersion: z.string(),                              // e.g. "support@v3"
  domain: z.object({ companyName: z.string(), policyDocs: z.array(z.string()) }),
  tools: z.array(z.enum(["lookup_order", "issue_refund", "create_ticket"])),
  approvalRequiredFor: z.array(z.string()).default(["issue_refund"]),
  limits: z.object({ maxTurns: z.number().default(20), maxTokensPerTask: z.number() }),
  platform: z.enum(["anthropic", "bedrock", "vertex", "foundry"]),
});
```

- **Config validated** عند الـ startup (fail fast لو config ناقص أو غلط).
- **Defaults آمنة:** approval gates شغالة by default، limits موجودة. اللي ينسى parameter يبقى آمن مش خطر.
- **مفيش customer data في الـ template** (أسماء، أمثلة حقيقية، PII، keys). ده أول حاجة في أي IP review.
- **Platform-agnostic:** client factory بيختار Anthropic / Bedrock / Vertex / Foundry من الـ config
  (شوف [03](03-platforms-and-versioning.md))، والـ features اللي مش موجودة في platform معين تتقفل بوضوح.

## Configurable MCP server

- الـ connection (URL، auth method، tenant) من **env / config**، مش hard-coded.
- **Tools قابلة للتفعيل** (read-only mode by default، write tools opt-in).
- **Auth pluggable:** OAuth للـ remote، أو service credentials من secret manager.
- Transport: stdio للـ local، Streamable HTTP للـ shared (configurable).
- **Versioned** (semver) عشان العملاء يعملوا pin.

## Portable eval suite

- **Interface ثابت** بين الـ suite والـ system اللي بيتقيّم: `run(input) → output (+ trace)`.
- **الـ cases في data files** (JSON / YAML)، مش في الكود. كل عميل يضيف cases بتاعته.
- **Graders pluggable:** code-based و LLM-as-judge (بـ rubric في config).
- **Thresholds في config** (pass rate لكل category).
- **Scrubbed:** مفيش PII أو customer data في الـ cases المشتركة؛ synthetic أو anonymized.
- يشتغل في CI ويطلع تقرير موحد.

## الـ accelerator محتاج يبقى "قابل للتسليم"

| الحاجة | ليه |
|---|---|
| **README** (بيعمل إيه، إمتى تستخدمه، إمتى لأ) | اللي جاي بعدك يفهم في 5 دقايق |
| **Quickstart** بمثال config شغال | أول run ينجح |
| **Config reference** (كل parameter، default، أمثلة) | ميحتاجش يقرا الكود |
| **Eval suite + tests** | يثبت إنه شغال، ويكشف regressions |
| **Versioning** (semver) + CHANGELOG | العملاء يعملوا pin ويعرفوا إيه اتغير |
| **Security notes** (الصلاحيات المطلوبة، الـ data بتروح فين) | يعدّي review أسرع |
| **Known limitations** | محدش يتفاجئ |
| **Owner / maintainer** | حد مسؤول |

## إمتى **متعملش** accelerator؟

- لو اتعمل **مرة واحدة** ومفيش طلب متكرر. الـ abstraction بتكلّف (وقت، maintenance، تعقيد).
- قاعدة شائعة: لما تبني نفس الحاجة للمرة **التانية أو التالتة**، ساعتها الـ pattern بقى واضح.
- Abstraction بدري جدًا = parameters كتير للحالات الغلط.

## الغلطة الشائعة في الامتحان

- ❌ Copy-paste للـ repo بتاع العميل الأول وتغيير الأسماء. ✅ template بـ config.
- ❌ Customer data أو أمثلة حقيقية أو keys جوه الـ accelerator.
- ❌ Accelerator من غير evals أو versioning.
- ❌ Defaults غير آمنة (approval مقفول by default).
- ❌ Hard-coded لـ platform واحد لو العملاء بيستخدموا platforms مختلفة.
