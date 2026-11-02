# Production Engineering, Evals & Security — شرح بالعربي

الكورس الرابع في الـ **Claude Certified Developer – Foundations Prep Course** (211 دقيقة).
المصطلحات بالإنجليزي زي ما هتلاقيها في الامتحان والـ docs.

> **ملحوظة:** صفحات الدروس محتاجة login، فالشرح مبني على الـ **learning objectives** بتاعة
> الكورس + الـ Claude API docs. لو الدرس قال حاجة مختلفة، الدرس هو المرجع.

## فكرة الكورس في سطر

agent شغال في الـ development ≠ agent شغال في production. الفرق بيظهر لما:
- يجيله **input محدش اختبره**،
- يخبط في **rate limit** وقت الـ peak،
- يقرا **صفحة فيها تعليمات موجهة للـ agent** (prompt injection).

الكورس بيعلّمك تـ **تثبت** إنه شغال (evals، tests، tracing)، وتخليه **يستحمل** (failure handling،
cost control)، وتخليه **آمن** (security) لحد ما يعدّي review.

## الملفات

| # | الملف | الموضوع | الـ objective |
|---|---|---|---|
| 1 | [01-evals.md](01-evals.md) | Eval suite بيعرّف "done"، grading methods، LLM-as-judge calibration | 1 |
| 2 | [02-testing-and-tracing.md](02-testing-and-tracing.md) | Unit / functional / integration / e2e، tracing، regressions | 2 |
| 3 | [03-resilience.md](03-resilience.md) | Retriable vs terminal errors، retries، fallbacks | 3 |
| 4 | [04-cost-latency-reliability.md](04-cost-latency-reliability.md) | Budgets، instrumentation، multi-agent cost | 4 |
| 5 | [05-security.md](05-security.md) | Prompt injection، jailbreaks، untrusted input، identity، secrets، data boundaries | 5 |
| — | [06-exam-traps.md](06-exam-traps.md) | Cheat sheet + الفخاخ | — |
| — | [quiz.html](quiz.html) | Practice quiz بالإنجليزي، تفاعلي مع score | — |

## الوزن في الامتحان

| Domain / skill | الوزن |
|---|---|
| AI Application Security | 3.2% |
| Guardrails and Safe Deployment | 2.3% |
| Debugging and Error Handling | 2.6% |
| Cost and Token Management | 2.8% |
| Identity, Secrets, and Key Management | 1.6% |
| Output Handling (validation، defensive parsing) | 2.6% |
| + أجزاء من Claude API Mechanics و Software Engineering Foundations | — |

الـ Security and Safety domain كله 8.1%، والكورس ده هو المصدر الأساسي ليه.

## ربطه بالـ course بتاعك

ده تقريبًا نفس **module 9 (Evaluation)** و **module 10 (Security)** في `ai-engineer-course/`.
الـ notes دي بتديك الـ vocabulary بتاع الامتحان؛ الـ modules بتديك الـ hands-on.
