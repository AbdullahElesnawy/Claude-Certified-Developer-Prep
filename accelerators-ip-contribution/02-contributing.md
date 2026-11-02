# 2. Contributing a Tool, Pattern, or Fix

## الفكرة

عملت tool أو pattern أو صلّحت bug في حاجة مشتركة (shared repo، internal library، accelerator،
open-source). الهدف مش إنك "تبعته"، الهدف إن **الـ maintainer يقدر يقبله** بسهولة.

## Documented channels

الطريقة الصح بتبقى مكتوبة في الـ repo نفسه. اقراها **قبل** ما تبدأ:

| الملف / المكان | فيه إيه |
|---|---|
| `CONTRIBUTING.md` | إزاي تفتح issue / PR، الـ branch naming، الـ tests المطلوبة، الـ style |
| `CODEOWNERS` | مين لازم يراجع أنهي حتة |
| Issue templates / RFC process | التغييرات الكبيرة تبدأ بـ proposal |
| `LICENSE` و CLA / DCO | هل مسموح تساهم، وبأي شروط |
| `SECURITY.md` | **ثغرات أمنية متتفتحش كـ public issue**؛ تتبلغ بالطريقة المكتوبة |

❌ مش documented channel: DM للـ maintainer، zip في Slack، push مباشر على main.

## قبل ما تكتب كود

- **ابحث** في الـ issues / PRs: يمكن حد شغال عليها أو اترفضت قبل كده.
- **للتغييرات الكبيرة** (feature جديدة، API change): افتح **issue أو RFC الأول** واتفق على الاتجاه.
  PR كبير من غير اتفاق مسبق غالبًا بيترفض.
- **Fix صغير وواضح:** PR على طول عادي.

## PR يتقبل

1. **صغير ومركّز:** تغيير منطقي واحد. مش fix + refactor + formatting لملفات تانية.
2. **وصف واضح:** المشكلة إيه، الحل إيه، ليه الطريقة دي، اتختبر إزاي. لينك للـ issue.
3. **Tests:** fix لـ bug = test بيفشل من غيره. Feature = tests + (لو LLM behavior) eval cases.
4. **CI أخضر.**
5. **Docs اتحدثت:** README، config reference، CHANGELOG.
6. **Backward compatible** أو breaking change واضح ومتعلّم (semver major، migration notes).
7. **مطابق للـ conventions بتاعة الـ repo** (مش الـ style بتاعك).
8. **من غير customer data / secrets / IP مش بتاعك.** مراجعة الـ diff كويس.
9. **AI-generated code:** راجعه بنفسك قبل ما تطلب من حد يراجعه. الـ maintainer مش مسؤول ينضّف
   output موديل ما اتراجعش.

## Contribution بتاع LLM asset بالذات

لو بتساهم بـ prompt، tool definition، skill، أو agent pattern:
- **Eval results** قبل وبعد على الـ suite المشترك (مش "جربته وشغال").
- **Model / version** اللي اتختبر عليها.
- **Cost / latency impact** لو اتغير.
- **Tool descriptions** واضحة (Claude هيختار بيها).
- **Security review notes:** صلاحيات جديدة؟ input مش trusted؟

## IP و الـ engagement

- الكود اللي اتكتب لعميل ممكن يكون **ملك العميل** حسب العقد. اتأكد إن مسموح تعيد استخدامه أو
  تساهم بيه قبل ما تحطه في asset مشترك.
- **Generalize** قبل الـ contribution: شيل أي حاجة خاصة بالعميل (أسماء، business rules، data).
- **Licenses:** dependencies جديدة لازم licenses متوافقة.

## بعد ما تفتح الـ PR

- رد على الـ review comments بسرعة واحترام؛ الـ maintainer عارف الـ codebase أكتر منك.
- لو الـ PR اترفض، اسأل عن السبب. ممكن يتقبل بشكل تاني.
- بعد الـ merge: لو أنت owner لجزء، خليك متاح للـ bugs.

## الغلطة الشائعة في الامتحان

- ❌ ثغرة أمنية كـ public issue. ✅ `SECURITY.md` / private disclosure.
- ❌ PR كبير بيعمل 5 حاجات. ✅ PRs صغيرة منفصلة.
- ❌ Feature كبيرة من غير issue / RFC.
- ❌ "Works on my machine" من غير tests أو evals.
- ❌ Contribution فيه أسماء أو data العميل.
- ❌ تبعت الكود بره الـ documented channel.
