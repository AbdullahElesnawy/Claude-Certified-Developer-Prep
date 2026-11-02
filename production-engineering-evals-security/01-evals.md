# 1. Evals: عرّف "done" قبل الـ deploy

## ليه evals؟

من غير eval، كل تغيير في الـ prompt أو الموديل هو **تخمين**. الـ eval بيحوّل "حاسس إنه أحسن"
لـ "عدّى 92% بدل 85% على نفس الـ 200 حالة".

و "**define done before deployment**" معناها: تكتب معايير النجاح **قبل** ما تبني، مش بعد ما تشوف
النتايج وتظبط المعايير عليها.

## مكونات الـ eval suite

1. **Test cases (dataset):** inputs + (لو ينفع) الـ expected output أو معايير.
2. **Grader:** حاجة بتحكم على كل output.
3. **Metric + threshold:** "pass rate ≥ 90% على الـ suite، وصفر failures على الـ critical cases".
4. **Runner:** يشغّل الكل ويطلع تقرير، ويتشغل في CI.

### الـ test cases تيجي منين؟

| المصدر | الميزة | العيب |
|---|---|---|
| **Production data حقيقية** (بعد scrubbing للـ PII) | الأقرب للواقع | محتاج تنضيف، ممكن مفيهاش edge cases |
| **Hand-written** | تغطي حالات بتقلقك (edge، adversarial) | بطيء، bias بتاع اللي كاتبها |
| **Synthetic** (Claude يولّدها) | كتير وبسرعة | ممكن تبقى شبه بعض أو مش واقعية؛ راجعها |

لازم الـ suite يغطي: **happy path**، **edge cases** (فاضي، طويل، لغة تانية، غامض)، **adversarial**
(injection، jailbreak)، و **regressions** (كل bug اتصلح يبقى test case).

## Grading methods (اختار الأنسب)

| Method | إزاي | مناسب لـ | العيب |
|---|---|---|---|
| **Code-based** (deterministic) | exact match، regex، JSON schema validation، "الـ category ∈ allowed list"، tests بتعدّي | classification، extraction، structured output، code | مينفعش للـ open-ended text |
| **LLM-as-judge** | موديل بيقيّم بـ **rubric** | جودة، tone، faithfulness، helpfulness | ممكن يكون biased أو inconsistent؛ لازم **calibration**؛ بيكلّف |
| **Human grading** | ناس بتقيّم | الـ ground truth، الحاجات الحساسة، calibration للـ judge | بطيء وغالي، مش بيكبر |

**القاعدة:** **استخدم أرخص grader موثوق.** لو الإجابة ممكن تتشيّك بالكود، شيّكها بالكود.
LLM-as-judge لما الكود ميقدرش. Humans للـ ground truth وللـ calibration.

ممكن تجمع: code checks للـ format + judge للجودة.

## LLM-as-judge: إزاي تعمله صح

```
You are grading a support reply.

<rubric>
1. Accuracy: every factual claim is supported by <policy>. (pass/fail)
2. Resolves the request: the customer's question is answered or the next step is clear. (pass/fail)
3. Tone: polite and concise; no blame. (pass/fail)
</rubric>

<policy>...</policy>
<customer_message>...</customer_message>
<reply>...</reply>

Reason briefly about each criterion, then output JSON:
{"accuracy": "pass"|"fail", "resolves": "pass"|"fail", "tone": "pass"|"fail"}
```

- **Rubric محدد** ومعايير **منفصلة**، مش "rate 1-10 overall". Binary (pass/fail) أو scale صغير
  واضح التعريف أثبت من 1-10.
- **اطلب reasoning قبل الحكم** (أو thinking) عشان الحكم يكون أدق.
- **Structured output** للحكم عشان تعمله parse.
- **اديله الـ reference** (الـ policy، الإجابة الصح) لو موجودة.
- ممكن تستخدم موديل **مختلف** أو أقوى كـ judge.

### Calibration ضد human labels (objective صريح)

الـ judge نفسه محتاج eval:

1. خد عينة (مثلًا 100 case)، وخلي **ناس** يحكموا عليها (human-labeled).
2. شغّل الـ judge على نفس العينة.
3. قيس **agreement**: نسبة الاتفاق، وبالذات **false passes** (الـ judge قال pass والإنسان قال fail)
   و **false fails**.
4. لو الاتفاق قليل: صلّح الـ rubric (غموض؟)، زوّد أمثلة، غيّر الموديل، وأعد القياس.
5. **متثقش في score الـ judge** غير لما الاتفاق مع البشر يبقى عالي كفاية.
6. أعد الـ calibration لما تغيّر الـ judge prompt أو الـ judge model.

Biases معروفة في LLM judges: **position bias** (بيفضّل أول إجابة في المقارنة)، **verbosity bias**
(بيفضّل الأطول)، **self-preference** (بيفضّل output نفس الموديل). الحل: بدّل الترتيب، rubric
بيعاقب الحشو، و calibration.

## Non-determinism

نفس الـ input ممكن يدّي outputs مختلفة. فـ:
- شغّل كل case **أكتر من مرة** للحاجات الحساسة، وقيس **pass rate** مش pass/fail مرة واحدة.
- قارن الـ versions على **نفس** الـ suite، ويفضل بأعداد كفاية عشان الفرق ميبقاش noise.

## Eval-driven development

```
اكتب الـ eval (define done)  →  baseline  →  غيّر حاجة واحدة  →  شغّل  →  قارن  →  keep / revert
```

- **Train / test split:** متظبطش الـ prompt على نفس الحالات اللي بتقيس بيها النتيجة النهائية
  (overfitting على الـ eval).
- الـ eval يتشغل في **CI** على كل تغيير في الـ prompt أو الموديل أو الـ tools (**CI gate**).
- **Model upgrade = شغّل الـ eval الأول.** الموديلات الجديدة فيها behavior changes.

## الغلطة الشائعة في الامتحان

- ❌ تكتب معايير النجاح بعد ما تشوف النتايج. ✅ define done before deployment.
- ❌ LLM-as-judge لحاجة ممكن تتشيّك بـ regex أو schema. ✅ code-based grader.
- ❌ تثق في الـ judge من غير ما تقارنه بـ human labels.
- ❌ تشغّل كل case مرة واحدة وتعلن إن التغيير أحسن.
- ❌ "rate this 1-10" من غير rubric.
