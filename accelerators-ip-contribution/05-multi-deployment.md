# 5. Coordinating Several Claude Deployments in One Workflow

## السيناريو

App واحد بيستخدم **أكتر من Claude deployment**. أمثلة:
- خطوة على **Bedrock** (data حساسة لازم تفضل في الـ AWS account بتاع العميل) وخطوة على **1P API**
  (محتاج feature مش موجودة في Bedrock، زي batches أو code execution).
- Deployment لكل **region** (data residency: data الـ EU تتعالج في الـ EU).
- Deployment لكل **tenant / business unit** بحسابات و keys منفصلة.
- **Models مختلفة** لخطوات مختلفة (Haiku للـ classification، Opus للـ reasoning).
- **Fallback** لـ deployment تاني لو الأساسي overloaded.

## الـ architecture

```
              ┌──────────────────────────────┐
  request ──► │  Orchestrator (your code)    │
              │  - routing policy            │
              │  - data classification       │
              │  - identity per call         │
              └──────┬─────────────┬─────────┘
                     │             │
        sensitive data│             │ non-sensitive / needs batch
                     ▼             ▼
             Bedrock (customer   1P API (your org,
             AWS acct, eu-west)  workspace X)
```

- **Client لكل deployment** (factory من config)، بـ credentials منفصلة.
- **Routing policy صريحة** في الكود: أنهي data / خطوة تروح فين. مش الموديل اللي يقرر.
- **نفس الـ interface** (الـ Messages API) لكل الـ deployments، فالـ steps portable.

## Data boundaries

السؤال اللي الـ compliance review هيسأله: **"الـ data دي ممكن توصل لفين؟"**

- **Data classification قبل الـ routing:** كل input بيتصنف (PII، confidential، public) والـ policy
  بتقول أنهي deployment مسموحله.
- **Minimize data بين الخطوات:** الخطوة اللي على الـ 1P ميوصلهاش الـ PII؛ ابعت **IDs أو ملخصات
  redacted** بس. (مثال: خطوة Bedrock تستخرج facts وتشيل الـ PII، والخطوة التانية تشتغل على الناتج.)
- **Model output = data برضه:** لو الـ output بتاع خطوة حساسة فيه PII، ميعدّيش لـ deployment تاني
  من غير ما يتنضف.
- **Region pinning:** الـ client بيتعمل بـ region ثابت؛ مفيش fallback تلقائي لـ region تاني لو ده
  بيخالف الـ residency. (Fallback لازم يحترم نفس الـ boundaries.)
- **Caches و logs و traces** محترمة نفس الحدود (log الـ EU مكانه الـ EU، redaction).
- **Memory / state** منفصل لكل tenant.

## Identity boundaries

- **Credential لكل deployment** (مش key واحد بيتنقل في كل حتة): IAM role لـ Bedrock، workload
  identity / API key منفصل لـ 1P workspace.
- **Least privilege:** الـ role بتاع Bedrock يقدر يعمل `InvokeModel` على الموديلات المطلوبة بس.
- **Workspaces / projects منفصلة** لكل environment و tenant (spend limits، keys، audit منفصلين).
- **End-user identity بتتنقل:** الـ orchestrator عارف مين المستخدم، والـ tools / data access بتتعمل
  بصلاحياته (مش بصلاحيات service account عام).
- **Short-lived credentials** (IAM roles، workload identity federation) بدل static keys.
- **Audit:** كل call مسجّل فيه: أنهي deployment، أنهي credential، أنهي user، أنهي data class.

## Reliability في multi-deployment

- **Fallback** (مثلًا 529 على deployment → deployment تاني) **بس** لو التاني مسموح بنفس الـ data
  boundaries ونفس الـ model behavior مقبول.
- **Caches مش مشتركة** بين الـ deployments / الموديلات؛ الـ fallback هيكون أبطأ وأغلى أول مرة.
- **Feature parity:** الخطوة اللي محتاجة feature معينة متتنقلش لـ platform مفيهوش الـ feature.
- **Pinned versions لكل deployment**، وeval لكل واحد (نفس الموديل على platforms مختلفة ممكن يبقى
  ليه versions أو rollout مختلف).
- **Tracing موحّد:** trace ID واحد عبر كل الـ deployments عشان تتبع الـ request كله.

## اللي الـ security / compliance reviewer عايز يشوفه

- [ ] Data flow diagram: كل data class بتروح فين
- [ ] Routing policy مكتوبة ومطبقة في الكود (مش في الـ prompt)
- [ ] Credential منفصل لكل deployment، least privilege، short-lived
- [ ] Redaction / minimization قبل أي عبور لـ boundary
- [ ] Region pinning + fallback بيحترم الـ residency
- [ ] Logs و traces جوه نفس الحدود ومع redaction
- [ ] Audit لكل call (deployment، identity، data class)
- [ ] Evals لكل deployment / model version

## الغلطة الشائعة في الامتحان

- ❌ API key واحد مشترك لكل الـ deployments.
- ❌ PII بتعدّي من deployment الـ EU لـ deployment تاني "عشان الخطوة الجاية محتاجاها".
- ❌ Fallback تلقائي لـ region / platform تاني من غير ما يراجع الـ data boundaries.
- ❌ الموديل بيقرر أنهي deployment يستخدم. ✅ routing policy deterministic في الكود.
- ❌ تفترض إن الـ cache أو الـ features مشتركة بين الـ deployments.
