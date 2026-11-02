# 1. Software Engineering اللي الامتحان بيفترضه

حوالي **13.6%** من الامتحان مش عن Claude أصلًا، عن الـ software engineering العادي في سياق LLM apps:
- Software Engineering Foundations 7.4%
- Understanding Requirements 3.4%
- Systems Life Cycle 2.8%

الأسئلة scenario-based، فالمهم الـ **judgment** مش التعريفات.

## Understanding Requirements

تحويل **business requirement** لـ **functional** و **infrastructure** requirements قبل ما تختار أي tool أو موديل.

| Business بيقول | Functional | Infrastructure / non-functional |
|---|---|---|
| "عايزين نرد على tickets أسرع" | تصنيف + draft رد + موافقة موظف قبل الإرسال | latency p95، volume في الـ peak، integration مع نظام الـ tickets |
| "التقرير الأسبوعي بياخد يومين" | استخراج من 50K document وتلخيص | batch (مش real-time)، cost cap، deadline |
| "بيانات العملاء متخرجش من أوروبا" | — | data residency، region، الـ platform |

**أسئلة لازم تسألها:** مين المستخدم؟ إيه "done" (قابل للقياس)؟ الـ volume والـ latency؟ الـ data حساسة؟ تكلفة
الغلطة؟ مين بيوافق (security، compliance، procurement)؟

**Hard constraints** (residency، compliance، feature لازم) بتشيل اختيارات. **Preferences** (cost، familiarity)
بتفاضل بين اللي فاضل.

## Systems Life Cycle

LLM app ماشي في نفس مراحل أي system، بس كل مرحلة فيها حاجة زيادة:

| المرحلة | العادي | الزيادة في LLM apps |
|---|---|---|
| **Plan / requirements** | scope، success criteria | define done كـ **eval** |
| **Design** | architecture | workflow ولا agent؟ أنهي موديل؟ أنهي platform؟ guardrails فين؟ |
| **Build** | كود + tests | prompts و tools **versioned**، eval suite |
| **Test** | unit / integration / e2e | evals، adversarial cases، non-determinism |
| **Deploy** | CI/CD، rollout | **pinned model version**، canary، cost limits |
| **Operate** | monitoring، on-call | tracing لكل call، cost، refusals، drift في الجودة |
| **Maintain** | bug fixes، upgrades | **model deprecations** و migrations، prompt updates، re-run evals |
| **Retire** | decommission | حذف الـ data (files، memory، logs) حسب الـ retention |

## Software Engineering Foundations

### REST APIs و JSON
- HTTP methods و status codes (4xx = غلطة الـ client، 5xx = الـ server)، idempotency (`GET`/`PUT`/`DELETE` لازم يبقوا idempotent؛ `POST` لأ إلا بـ idempotency key).
- JSON: schema validation، **defensive parsing** (متثقش في شكل أي input، ومنهم output الموديل).

### Asynchronous programming
- `async`/`await`، promises، concurrency vs parallelism.
- **Bounded concurrency** (semaphore) بدل آلاف الـ requests مرة واحدة.
- Timeouts و cancellation (`AbortController`)، و backpressure.

### Version control
- Branches، PRs، commits صغيرة ومنطقية.
- **Prompts و tool definitions و configs في git** مع الكود، مش في console.
- Secrets **مش** في git (secret scanning، `.gitignore`، `.env.example`).

### SDLC integration و code review
- CI: lint، tests، type-check، **eval gate** على تغييرات الـ prompt / الموديل.
- Code review للكود اللي AI كتبه: **calibrated trust** (الأدلة، مش الشكل). شوف
  [claude-code-mcp-integration/02-reviewing-ai-code.md](../claude-code-mcp-integration/02-reviewing-ai-code.md).

### Refactoring
- **Small-scale:** function أو module، في PR واحد، tests قبل وبعد.
- **Large-scale (modernization):** **characterization tests** الأول (تثبت السلوك الحالي)، مراحل صغيرة قابلة
  للـ review والـ revert، **strangler pattern** (النظام الجديد بياخد جزء ورا جزء من القديم بدل big-bang rewrite).
- Claude Code بيساعد في الاتنين، بس الـ plan والـ review gates عندك أنت.

## الغلطة الشائعة في الامتحان

- ❌ تختار موديل أو platform قبل ما تفهم الـ requirements.
- ❌ Retry لـ `POST` بيعمل side effect من غير idempotency key.
- ❌ Big-bang rewrite.
- ❌ Prompts بتتعدل خارج version control.
- ❌ Unbounded parallel requests.
