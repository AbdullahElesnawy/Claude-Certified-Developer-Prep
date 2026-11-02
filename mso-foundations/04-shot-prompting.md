# 4. Zero-shot vs One-shot vs Multi-shot

## التعريفات

| | يعني إيه | مثال |
|---|---|---|
| **Zero-shot** | تعليمات بس، من غير أمثلة | "Classify this review as positive, negative, or neutral." |
| **One-shot** | مثال واحد | التعليمات + review واحد ومعاه الـ label |
| **Multi-shot (few-shot)** | كذا مثال | التعليمات + 3 لـ 5 أمثلة متنوعة |

## إمتى تستخدم إيه؟

| الموقف | الاختيار |
|---|---|
| المهمة بسيطة وواضحة من التعليمات | **Zero-shot** (أرخص) |
| محتاج تثبّت **شكل** output معين أو format غريب | **One / multi-shot** |
| الموديل بيغلط في edge cases معينة | **Multi-shot** فيه الحالات دي |
| الـ tone أو الـ style لازم يبقى ثابت | **Multi-shot** |
| الأمثلة مش بتحسّن الـ eval | ارجع لـ zero-shot ووفّر الـ tokens |

**الترتيب العملي:** ابدأ zero-shot، شغّل الـ eval، ولو فيه فشل في الشكل أو الحالات، ضيف أمثلة.

## الأمثلة الكويسة

- **متنوعة:** لو كل الأمثلة نفس الطول أو نفس الموضوع، الموديل هيقلّد الحاجة دي (over-fitting على تفاصيل مش مقصودة).
- **بتغطي الحالات الصعبة:** فاضي، غامض، حدّي.
- **جوه tags:** `<examples><example>...</example></examples>` عشان الموديل ميخلطش بينها وبين الـ input الحقيقي.
- **متطابقة مع التعليمات:** لو المثال بيخالف قاعدة، الموديل هيصدق المثال.

## التكلفة (الـ tradeoff)

- كل مثال **input tokens بتتبعت في كل request** (الـ API stateless).
- 20 مثال طويل ممكن يضاعف تكلفة كل call.
- **الحل:** حطهم في الجزء الثابت من الـ prompt (system) واستخدم **prompt caching**؛ الـ cache read أرخص بكتير.
- وزن: تحسّن الجودة اللي بتقيسه بالـ eval **قصاد** الـ tokens الزيادة.

## الغلطة الشائعة في الامتحان

- ❌ "Examples are free because they're in the system prompt."
- ❌ "Examples always help." ✅ قيس.
- ❌ أمثلة شبه بعض.
- ✅ Format بيتلخبط بين الردود → أمثلة متنوعة بالشكل المطلوب (أو structured outputs لو JSON).
