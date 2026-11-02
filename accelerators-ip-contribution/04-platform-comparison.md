# 4. Comparing Platforms on Latency, Compliance, and Cost

## الهدف

مش إنك تقول "Bedrock أحسن". الهدف **مقارنة procurement و security يقدروا يوافقوا عليها**:
مبنية على **requirements العميل** و **أرقام متقاسة** و **مصادر موثقة**، مش رأي.

## الخطوة 1: ابدأ من الـ requirements (مش من الـ platforms)

| النوع | أسئلة |
|---|---|
| Functional | أنهي features لازمة؟ (batch، files، web search، skills، managed agents، models معينة) |
| Latency | p50 / p95 مطلوب كام؟ time-to-first-token؟ users فين جغرافيًا؟ |
| Throughput | requests / tokens per minute في الـ peak؟ |
| Compliance | Data residency (region / country)؟ certifications (SOC 2، ISO 27001، HIPAA، FedRAMP...)؟ retention / ZDR؟ |
| Security | Identity (IAM / SSO)، network (private connectivity)، audit logs، encryption keys (CMEK)؟ |
| Commercial | Cloud commitments / credits؟ procurement channel (marketplace)؟ billing مين؟ |
| Operational | الفريق عارف أنهي cloud؟ monitoring موجود فين؟ |

بعض الـ requirements **hard constraints** (لازم)، وبعضها **preferences** (يفضّل). الـ hard constraints
بتشيل platforms من الاختيار قبل أي مقارنة.

## الخطوة 2: المقارنة على 3 محاور

### Latency
- **قيسها**، متفترضهاش: نفس الـ workload (نفس الـ prompts، نفس الموديل، نفس الـ region) على كل
  platform، و p50 / p95 / TTFT.
- Region قريب من المستخدمين و من الـ data.
- Throughput / rate limits / quotas مختلفة لكل platform (وبتتفاوض). Provisioned throughput
  (حسب الـ platform) لو محتاج ضمان.
- Features بتأثر على الـ latency: prompt caching (متاح في كله)، fast mode (1P بس).

### Compliance
- **Data residency:** الـ data بتتعالج فين؟ (`inference_geo` في 1P، الـ region في الـ cloud platforms).
- **Certifications** والـ attestations: من **الـ trust center الرسمي** لكل provider، بمستندات (مش ذاكرة).
- **Data retention / training:** الـ data بتتحفظ قد إيه؟ بتستخدم في training؟ (العقد والـ terms).
- **Identity و audit:** الـ cloud platforms بتدمج مع IAM و audit logs اللي العميل عنده أصلًا، وده بيسهّل
  الـ security review جدًا.
- **Network:** private endpoints (VPC / PrivateLink...) لو الـ traffic مينفعش يعدّي على الـ internet.

### Cost
- **Per-token prices** مختلفة شوية حسب الـ platform والـ region. خدها من صفحات الأسعار الرسمية.
- قارن **cost per task** على workload حقيقي، مش السعر لكل مليون token بس.
- **Features بتغيّر الـ cost:**
  - Batch API (~50%) موجود في 1P / Platform on AWS بس (الـ clouds عندها batch بتاعها بشروط مختلفة).
  - Prompt caching في كله، بس اتأكد من التسعير.
- **Commercial:** committed spend أو credits عند الـ cloud provider ممكن تقلب المعادلة كلها.
- Hidden costs: egress، logging، الـ engineering effort للـ integration.

## الخطوة 3: Decision record

اكتب المقارنة كـ document قابل للمراجعة:

```
Decision: Claude workload platform for <project>

Requirements (hard):  EU data residency; SSO via existing IAM; batch processing nightly
Requirements (soft):  lowest cost per task; team familiar with AWS

Options considered:   1P API, Claude Platform on AWS, Bedrock, Vertex

| Criterion            | 1P        | Platform on AWS | Bedrock     | Vertex    |
| EU residency         | ...       | ...             | ...         | ...       |
| Batch processing     | Yes       | Yes             | own batch   | own batch |
| p95 latency (measured)| ...      | ...             | ...         | ...       |
| Cost / 1K tasks      | ...       | ...             | ...         | ...       |
| Uses existing IAM    | No        | Yes             | Yes         | No        |

Decision + rationale, risks, sources (pricing pages, trust center docs, measurement method, date)
```

- **مصادر + تاريخ** لكل رقم (الأسعار والـ features بتتغير).
- **منهجية القياس** واضحة (reproducible).
- **Risks و mitigations.**
- ده اللي procurement و security بيوافقوا عليه: شفاف، موثّق، مربوط بالـ requirements.

## الغلطة الشائعة في الامتحان

- ❌ تختار الـ platform قبل ما تعرف الـ requirements.
- ❌ تقارن السعر per token بس. ✅ cost per task + commercial terms.
- ❌ Latency من blog أو ذاكرة. ✅ قياس على workload حقيقي.
- ❌ Compliance claims من غير مستندات رسمية.
- ❌ تتجاهل إن الـ feature اللي محتاجها مش موجودة في الـ platform اللي العميل عايزه.
