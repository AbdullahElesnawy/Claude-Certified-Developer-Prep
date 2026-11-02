# 2. Sampling و Non-determinism

## الموديل بيولّد إزاي؟

الموديل بيولّد **token ورا token**. في كل خطوة بيحسب **probability distribution** على كل الـ tokens
الممكنة، وبعدين **بيختار (sample)** واحد منها. الـ token اللي اتختار بيتضاف، ويحسب اللي بعده.

```
"The capital of France is"  →  " Paris" 97%,  " a" 1%,  " the" 0.5%, ...
```

لأن فيه **اختيار** في كل خطوة، نفس الـ prompt ممكن يطلّع ردود مختلفة.

## Sampling parameters

| Parameter | بيعمل إيه |
|---|---|
| `temperature` | قيمة أقل = اختيارات أكثر توقعًا؛ أعلى = تنوع أكتر |
| `top_p` / `top_k` | بيحددوا الاختيار من أعلى الاحتمالات بس |

**مهم:** على كتير من الموديلات الحديثة، الـ sampling parameters دي **اتشالت** أو بقت بترجع 400 لو غيرتها
عن الـ default. الـ concept هو اللي يهمك للامتحان، والتحكم الحديث في السلوك بيبقى بالـ prompt والـ effort.

## Non-determinism

حتى بـ temperature قليلة، **مفيش ضمان** إن الـ output يطلع متطابق كل مرة. يعني:
- **متكتبش tests بتعمل exact string match** على output الموديل.
- نفس الـ eval case ممكن ينجح مرة ويفشل مرة.

## ده معناه إيه للـ testing والـ evals؟

| بدل | اعمل |
|---|---|
| `expect(reply).toBe("...")` | اختبر **properties**: الـ JSON valid، الـ category من القايمة، الـ tool الصح اتنادى |
| تشغيل كل case مرة | شغّل الـ cases المهمة **كذا مرة** وقيس **pass rate** |
| مقارنة prompt A و B على 5 حالات | **عدد حالات كفاية** + repeated runs قبل ما تحكم (الفرق ممكن يبقى noise) |
| Unit tests بتنادي الموديل الحقيقي | **Mocks / recorded responses** للكود بتاعك؛ الجودة مكانها الـ eval |

**Structured outputs** (`output_config.format` أو tools بـ `strict: true`) بتقلل التنوع في **الشكل**
(الـ schema مضمون)، لكن المحتوى نفسه لسه ممكن يختلف.

## الغلطة الشائعة في الامتحان

- ❌ "Set temperature to 0 and assert exact equality." مفيش ضمان.
- ❌ "Prompt B won 5/5 vs 4/5, ship it." ممكن يكون noise.
- ❌ "LLM features can't be tested." ✅ properties + pass rates + evals.
- ❌ Temperature كحل لـ prompt injection أو لمشكلة جودة. ملهاش علاقة.
