# Accelerators & IP Contribution — شرح بالعربي

الكورس الخامس والأخير في الـ **Claude Certified Developer – Foundations Prep Course** (155 دقيقة).
المصطلحات بالإنجليزي زي ما هتلاقيها في الامتحان والـ docs.

> **ملحوظة:** صفحات الدروس محتاجة login، فالشرح مبني على الـ **learning objectives** بتاعة
> الكورس + الـ Claude API docs. لو الدرس قال حاجة مختلفة، الدرس هو المرجع.
> **جدول الـ platforms** في ملف 03 snapshot من أكتوبر 2026؛ الـ availability بتتغير، فقبل أي قرار
> حقيقي راجع الـ docs.

## فكرة الكورس في سطر

حاجة **شغالة** ≠ حاجة **تتعاد**. الكورس بيعلّمك تحوّل build عملته لعميل واحد لـ asset:
- **يتعاد استخدامه** (accelerator)،
- **يعدّي review** (security، procurement، maintainers)،
- **يتنشر** في أي platform العميل محتاجها،
- **ميتكسرش بصمت** لما الموديل أو الـ prompt يتغيروا.

## الملفات

| # | الملف | الموضوع | الـ objective |
|---|---|---|---|
| 1 | [01-accelerators.md](01-accelerators.md) | Agent template بـ parameters، MCP server configurable، eval suite portable | 1 |
| 2 | [02-contributing.md](02-contributing.md) | تساهم بـ tool أو pattern أو fix بطريقة الـ maintainer يقبلها | 2 |
| 3 | [03-platforms-and-versioning.md](03-platforms-and-versioning.md) | 1P API vs Bedrock vs Vertex vs Foundry، و versioning للـ releases | 3 |
| 4 | [04-platform-comparison.md](04-platform-comparison.md) | مقارنة latency و compliance و cost بشكل procurement و security يوافقوا عليه | 4 |
| 5 | [05-multi-deployment.md](05-multi-deployment.md) | App بينسّق كذا Claude deployment، بـ data و identity boundaries | 5 |
| — | [06-exam-traps.md](06-exam-traps.md) | Cheat sheet + الفخاخ | — |
| — | [quiz.html](quiz.html) | Practice quiz بالإنجليزي، تفاعلي مع score | — |

## الوزن في الامتحان

مفيش domain اسمه "accelerators"، لكن الكورس بيغطي:

| Domain / skill | الوزن |
|---|---|
| Claude API Mechanics (invoking Claude through third-party vendors، batch vs realtime) | 6.8% |
| Configuration Management (model version pinning، prompt versioning، plugin dependencies) | 4.1% |
| Systems Life Cycle | 2.8% |
| Model Selection and Tradeoffs (breaking changes across releases) | 2.7% |
| Understanding Requirements (business → functional / infrastructure) | 3.4% |
| Identity, Secrets, and Key Management | 1.6% |
