# MSO Foundations — شرح بالعربي

الكورس الأول في الـ **Claude Certified Developer – Foundations Prep Course** (57 دقيقة).
المصطلحات بالإنجليزي زي ما هتلاقيها في الامتحان والـ docs.

> **ملحوظة:** الشرح مبني على الـ **learning objectives** بتاعة الكورس + الـ Claude API docs، مش منقول
> من الدروس. لو الدرس قال حاجة مختلفة، الدرس هو المرجع.

## فكرة الكورس في سطر

الـ vocabulary والـ fundamentals اللي لازم تفهمها **قبل** ما تكلّم Claude في production: الـ context window
تحت الضغط، ليه الـ non-determinism بيأثر على الـ testing، إزاي اختيار الموديل والـ reasoning mode بيأثروا على
الـ cost والجودة، وفي الآخر طبقة الـ access: SDKs و REST و streaming و async.

## الملفات

| # | الملف | الموضوع |
|---|---|---|
| 1 | [01-tokens-and-context.md](01-tokens-and-context.md) | Tokens، الـ context window كـ fixed budget |
| 2 | [02-sampling-and-non-determinism.md](02-sampling-and-non-determinism.md) | Sampling، ليه الـ output بيتغير، وده معناه إيه للـ testing |
| 3 | [03-models-and-reasoning.md](03-models-and-reasoning.md) | الـ model family والـ tiers، والفرق بين اختيار الموديل وتفعيل الـ reasoning |
| 4 | [04-shot-prompting.md](04-shot-prompting.md) | Zero-shot vs one-shot vs multi-shot وتكلفة الأمثلة |
| 5 | [05-access-patterns.md](05-access-patterns.md) | SDK vs REST، sync vs streaming، async للـ high volume |
| — | [quiz.html](quiz.html) | Practice quiz بالإنجليزي (20 سؤال) |

## الوزن في الامتحان

ده أساس الـ **Model Selection and Optimization** domain (16.8%)، تاني أكبر domain:

| Skill | الوزن |
|---|---|
| Technical Fundamentals (SDKs بتلف REST، websockets) | 6.1% |
| LLM Fundamentals (tokens، context، sampling، thinking، effort، shot prompting) | 5.2% |
| Cost and Token Management | 2.8% |
| Model Selection and Tradeoffs | 2.7% |
