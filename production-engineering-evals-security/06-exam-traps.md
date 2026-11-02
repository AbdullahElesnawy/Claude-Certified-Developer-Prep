# 6. Exam Traps + Cheat Sheet

> أسئلة التدريب بالإنجليزي في [quiz.html](quiz.html).

## Cheat sheet

| السيناريو | الإجابة |
|---|---|
| تعرف إن الـ prompt الجديد أحسن | Eval suite ثابت، baseline، تغيير واحد، نفس الحالات |
| Output ممكن يتشيّك بالكود (category، JSON، tests) | Code-based grader |
| جودة / tone / faithfulness | LLM-as-judge بـ rubric محدد |
| تثق في الـ judge | Calibrate ضد human labels (agreement، false passes) |
| Output بيتغير كل run | شغّل كل case كذا مرة وقيس pass rate |
| Unit test لكود بيكلّم Claude | Mock / recorded fixtures |
| Integration test مع الموديل الحقيقي | اختبر properties (schema، tool اتنادى) مش نص بعينه |
| Agent غلط ومش عارف ليه | Trace analysis: integration ولا model؟ |
| Model upgrade | شغّل الـ eval الأول؛ الـ version pinned |
| 400 / 401 / 403 / 404 / 413 | Terminal: صلّح، متعملش retry |
| 429 | Retry بعد `retry-after` + backoff |
| 500 / 529 / network | Retry بـ exponential backoff + jitter، بعدين fallback |
| 200 بس `max_tokens` / `refusal` | اتعامل مع `stop_reason`؛ متنفذش tool ناقص |
| Retry لـ tool بيدفع | Idempotency key |
| Cost عالي | Caching → context hygiene → batch → effort → model أرخص |
| تقيس الـ cost صح | Cost per completed task + instrument كل call |
| Multi-agent؟ | بس لو المهمة قابلة للتقسيم لأجزاء مستقلة read-heavy |
| Indirect prompt injection | Least privilege + فصل الـ untrusted + guardrails + human approval |
| Agent بيعمل actions | Per-user scoped identity، مش admin service account |
| Secrets | Vault، الـ tool يستخدمها في الكود، مش في الـ prompt ولا الـ logs |
| Multi-tenant | Isolation في الـ data layer (query / RLS)، مش في الـ prompt |
| Markdown image بـ URL غريب في الرد | Exfiltration: فلتر الـ URLs |

## الفخاخ المتكررة في الكورس ده

1. **"Retry everything."** الـ 4xx (ما عدا 429) مش هتتصلح بالـ retry.
2. **"Trust the judge."** LLM-as-judge من غير calibration رقم مش معروف دقته.
3. **"Fix the prompt."** قبل ما تعرف من الـ trace إن المشكلة في الموديل أصلًا.
4. **"Use a bigger model"** للأمان أو للـ cost.
5. **"Tell the model not to"** كـ security control.
6. **"More agents = better."** Multi-agent بيكلّف أكتر بكتير؛ استخدمه بس لما يلزم.
7. **"200 = success."** شوف الـ `stop_reason` والـ schema.
