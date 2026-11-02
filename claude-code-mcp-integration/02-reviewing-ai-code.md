# 2. Reviewing AI-Generated Code

## Calibrated trust

**Calibrated trust** = إن ثقتك في الكود تكون **على قد** الدليل اللي عندك، مش على قد ما الكود
شكله نضيف أو Claude شكله واثق.

الكود اللي Claude بيكتبه:
- **شكله صح** (consistent style، أسماء كويسة، comments)، وده بيخلي الـ reviewer يرتاح زيادة.
- ممكن يكون فيه أخطاء من نوع معين:
  - API أو function **مش موجودة** (hallucinated) أو version غلط.
  - **Edge cases** ناقصة (null، فاضي، concurrency، timezone).
  - Tests **بتختبر الـ implementation نفسه** بدل الـ behavior، أو tests اتعدّلت عشان تعدّي.
  - تغييرات **بره الـ scope** المطلوب.
  - Security: input مش validated، SQL بيتبني بـ string، secret اتكتب في الكود.
  - "شغال" بس بيتجاهل الـ conventions بتاعة الـ repo.

## الدليل أهم من الشكل

رتّب الأدلة من الأضعف للأقوى:

1. ❌ Claude قال "Done, all tests pass." (ده كلام، مش دليل)
2. الكود شكله منطقي.
3. ✅ الـ tests اشتغلت فعلًا قدامك / في CI.
4. ✅ test **كان بيفشل قبل التغيير وبينجح بعده** (يثبت إن الـ test بيختبر الحاجة الصح).
5. ✅ تشغيل حقيقي (الـ app، screenshot، request حقيقي).

**Skepticism toward confident output** مذكورة بالاسم في الـ exam guide.

## فين تحط الـ human review gates؟

مش كل تغيير محتاج نفس المراجعة. الـ gate بيتحط **على قد تكلفة الغلطة**:

| تكلفة الغلطة | مثال | الـ gate |
|---|---|---|
| قليلة وسهل ترجع | docs، rename، test جديد | review سريع / CI يكفي |
| متوسطة | business logic، refactor | PR review كامل + tests |
| عالية | auth، payments، permissions، crypto | review من حد خبير + security review |
| مش ممكن ترجع | DB migration على prod، حذف data، deploy، إرسال لعملاء | **موافقة صريحة قبل التنفيذ** + plan + rollback plan |

أماكن الـ gate في الـ workflow:
- **بعد الـ plan** (قبل ما يكتب كود): أرخص gate.
- **قبل الـ commit / PR:** review للـ diff.
- **قبل الـ irreversible action:** `ask` rule أو `PreToolUse` hook (`git push`، `terraform apply`،
  `kubectl`، migration).
- **CI gates:** tests، lint، type-check، security scan. Deterministic ومش بتتعب.

## Code review بمساعدة Claude

Claude يقدر يعمل review كمان، لكن:
- استخدم **session / context تاني** للـ review. نفس الـ session اللي كتبت الكود بتميل تبرّر قراراتها.
- اديله **معايير محددة** (security، الـ conventions، edge cases)، مش "review this".
- AI review **بيساعد**، مش بيلغي الـ human review للحاجات عالية الخطورة.

## Small vs large-scale refactoring

- **Small:** ملف أو function، تتراجع في PR واحد.
- **Large (modernization):** قسّمها لـ **مراحل صغيرة** كل واحدة قابلة للـ review والـ revert،
  وكل مرحلة بـ tests. متقبلش PR فيه 200 ملف اتغيروا مرة واحدة: محدش هيراجعه بجد.

## الغلطة الشائعة في الامتحان

- ❌ "The model reported all tests passed, so merge." ✅ اتأكد من الـ CI نفسه.
- ❌ نفس مستوى المراجعة لكل التغييرات. ✅ على قد تكلفة الغلطة.
- ❌ PR ضخم واحد للـ modernization. ✅ مراحل صغيرة قابلة للـ review.
- ❌ Claude يعدّل الـ test عشان ينجح. ✅ اتأكد إن الـ test بيختبر الـ behavior المطلوب.
