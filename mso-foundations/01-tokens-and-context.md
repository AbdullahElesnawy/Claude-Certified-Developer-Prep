# 1. Tokens والـ Context Window

## Token يعني إيه؟

الموديل مش بيشوف كلمات؛ بيشوف **tokens**: قطع من النص (كلمة كاملة، جزء من كلمة، علامة ترقيم، مسافة).
- كلمة إنجليزي شائعة ≈ token واحد، وكلمة نادرة أو طويلة ممكن تبقى كذا token.
- **العربي** وأي لغة غير إنجليزي غالبًا بتاخد tokens **أكتر** لنفس المعنى.
- الكود والـ JSON بياخدوا tokens كتير (أقواس، مسافات، أسماء).
- **الصور والـ PDFs** بتتحول لـ tokens برضه (الصورة حسب أبعادها، والـ PDF نص + صورة لكل صفحة).
- الـ **tokenizer بيختلف بين الموديلات**: نفس النص ممكن يطلع عدد tokens مختلف على موديل أحدث.

**الخلاصة:** متقدّرش بعدد الكلمات. استخدم **`count_tokens`** endpoint، وبص على `usage` في كل response.

## ليه الـ tokens مهمة؟ 3 حاجات

| | إزاي |
|---|---|
| **Cost** | بتدفع لكل input token ولكل output token (والـ output أغلى، غالبًا 5 أضعاف) |
| **Limits** | الـ context window، و `max_tokens`، و الـ rate limits (tokens per minute) كلها بالـ tokens |
| **Latency** | Output أطول = وقت أطول (التوليد token ورا token) |

## الـ context window = fixed budget

الـ **context window** هو أقصى عدد tokens الموديل يقدر يتعامل معاه في request واحد، و **الـ input والـ output
بيتقسموا عليه**:

```
context window  ≥  system + tools + messages (كل الـ history + tool results)  +  output (لحد max_tokens)
```

- لو الـ input 180K والـ window 200K، يبقى فاضل 20K بس للرد.
- الـ API **stateless**: كل request بيبعت الـ history كلها من الأول، فالـ context بيكبر مع كل turn
  وبتدفع على نفس الـ tokens تاني كل مرة.
- `max_tokens` هو **سقف** للـ output، مش هدف. لو الرد وصل له، `stop_reason` بيبقى `"max_tokens"` والرد مقطوع.

## "Under load": الجودة بتقل قبل ما الـ window يتملي

حتى لو لسه فيه مكان، **context مليان حاجات مش مهمة بيقلل الجودة**:
- التعليمات المهمة بتتدفن وسط tool outputs قديمة.
- الموديل ممكن يمسك في معلومة قديمة غلط.
- بتدفع أكتر وبتستنى أكتر.

فالـ context **budget** بتديره بوعي: إيه يدخل، وإيه يطلع، وإمتى تلخّص. (التفاصيل في الكورس التاني،
[05-context-engineering](../production-grade-prompting/05-context-engineering.md).)

## Prompt caching (رافعة مهمة هنا)

الجزء الثابت في أول الـ prompt (system، tools، documents) ممكن يتعمله **cache**:
- Cache read أرخص بكتير من الـ input العادي (حوالي 10% من السعر).
- لازم يكون **prefix ثابت** بالظبط؛ أي تغيير في الأول بيبوّظ الـ cache لكل اللي بعده.
- اتأكد بـ `usage.cache_read_input_tokens`.

## الغلطة الشائعة في الامتحان

- ❌ "One token = one word." ❌ "Images don't use tokens."
- ❌ `max_tokens` كبير لدرجة إن input + output يعدّوا الـ window.
- ❌ "Bigger context window" كحل لجودة بتقل في محادثة طويلة. ✅ context management.
- ❌ تقدير الـ cost بعدد الكلمات. ✅ `count_tokens` و `usage`.
