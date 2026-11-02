# 3. الـ Model Family و الـ Reasoning Modes

## الـ tiers

Claude بيجي في **tiers** بتوازن بين القدرة والسرعة والسعر:

| Tier | مناسب لـ | التكلفة / السرعة |
|---|---|---|
| **Opus** | أصعب المهام: reasoning معقد، coding كبير، agents طويلة | الأغلى والأبطأ نسبيًا |
| **Sonnet** | معظم الشغل اليومي: coding، agents، enterprise workloads | توازن |
| **Haiku** | مهام بسيطة وكتيرة: classification، extraction، routing، subagents، real-time | الأرخص والأسرع |

(وفيه أحيانًا tier أعلى من Opus للمهام الأصعب. الأسماء والأسعار بتتغير، فارجع لـ models overview في الـ docs.)

**القاعدة:** ابدأ بأصغر موديل **ممكن يعدّي الـ eval** بتاعك. متختارش بالحدس؛ قيس.

## اختيار الموديل ≠ تفعيل الـ reasoning

ده objective صريح في الكورس، وفخ شائع:

| | **Model choice** | **Reasoning mode** |
|---|---|---|
| بيحدد إيه | **أنهي** موديل (القدرة الأساسية) | الموديل ده **يفكر قد إيه** قبل ما يرد |
| أمثلة | Opus / Sonnet / Haiku | Extended / adaptive thinking، **effort** (low → max) |
| بيأثر على | الجودة، السعر لكل token، السرعة | عدد الـ output tokens (التفكير بيتحسب output)، الـ latency، الجودة في المهام الصعبة |

- Extended thinking **مش بيغيّر الموديل**؛ نفس الموديل بيفكر أكتر.
- الاتنين **روافع مستقلة**: ممكن Haiku بـ reasoning أكتر، أو Opus بـ effort قليل.
- على الموديلات الحديثة: **adaptive thinking** (الموديل يقرر يفكر قد إيه) + **effort** للتحكم. الطريقة الأقدم
  كانت `budget_tokens` ثابت.
- **Fast mode** (على موديلات معينة): نفس الموديل بسرعة output أعلى وسعر أعلى. برضه مش موديل تاني.

## الـ tradeoffs

| لما تكبّر الموديل أو الـ effort | |
|---|---|
| ✅ جودة أحسن في المهام الصعبة | ❌ Cost أعلى |
| | ❌ Latency أعلى |
| | ❌ مش بيخلّي الـ output deterministic |

وفي المهام البسيطة الزيادة دي ممكن متحسّنش حاجة خالص، فـ **قيس**.

## Breaking changes بين الـ releases

الموديلات الجديدة مش دايمًا drop-in replacement:
- Parameters ممكن تتشال (مثلًا prefill، `budget_tokens`، sampling params على بعض الموديلات بترجع 400).
- Defaults بتتغير (مثلًا الـ effort الافتراضي).
- الـ **tokenizer** ممكن يتغير، فنفس النص يطلع tokens أكتر وبالتالي cost مختلف.
- السلوك نفسه بيتغير (الموديلات الأحدث بتتبع التعليمات حرفيًا أكتر).

فـ **pin الـ model version** في production، واعمل upgrade بقصد بعد eval.

## الغلطة الشائعة في الامتحان

- ❌ "Extended thinking switches to a bigger model."
- ❌ أكبر موديل بأعلى effort لكل حاجة.
- ❌ Alias بيتحدث لوحده في production.
- ✅ Classification كتير و real-time → tier صغير + eval يثبت الجودة.
- ✅ مهمة multi-step صعبة → زوّد الـ reasoning وقيس الفرق.
