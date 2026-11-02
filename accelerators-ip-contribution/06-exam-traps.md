# 6. Exam Traps + Cheat Sheet

> أسئلة التدريب بالإنجليزي في [quiz.html](quiz.html).

## Cheat sheet

| السيناريو | الإجابة |
|---|---|
| Build اتعمل لعميل وعايز تعيد استخدامه | Template بـ config validated، الخاص بالعميل parameters، مفيش customer data |
| Defaults في accelerator | آمنة: approval gates شغالة، limits موجودة |
| Eval suite لكذا مشروع | Interface ثابت + cases في data files + graders و thresholds في config |
| MCP server لكذا عميل | Connection و auth و tools من config، read-only by default، semver |
| إمتى تبني accelerator | لما الـ pattern يتكرر (مرة تانية / تالتة)، مش من أول مرة |
| تساهم بـ fix | اقرا CONTRIBUTING، PR صغير، test بيفشل من غيره، CI أخضر |
| تغيير كبير في shared repo | Issue / RFC الأول |
| ثغرة أمنية | SECURITY.md / private disclosure، مش public issue |
| Contribution لـ prompt أو tool | Eval results قبل وبعد + model version |
| أحدث features (batches، files، managed agents، fast mode) | 1P API (أو Claude Platform on AWS) |
| AWS-native IAM و billing بـ API parity كاملة | Claude Platform on AWS |
| AWS، والـ features الأساسية كفاية | Bedrock |
| العميل على GCP / Azure | Vertex / Foundry |
| الـ prompt أو الموديل اتغير وكسر production | Pin model version + prompt versioning + eval + canary |
| Model upgrade | Eval → cost/latency check → canary → rollout تدريجي → rollback جاهز |
| مقارنة platforms لـ procurement | Requirements أولًا → قياس حقيقي → مصادر رسمية بتاريخ → decision record |
| Data حساسة في خطوة وfeature 1P في خطوة تانية | Routing policy + redaction بين الخطوات + credential لكل deployment |
| Fallback بين deployments | بس لو بيحترم نفس الـ data / residency boundaries |

## أرقام وأسماء تتحفظ

- **Claude Platform on AWS** = Anthropic بيشغّله، same-day parity، model IDs من غير prefix.
- **Bedrock** = AWS بيشغّله، model IDs بـ `anthropic.` prefix.
- **Vertex** = GCP ADC (مفيش Anthropic API key)، region (أو `global`).
- **Batch API / Files API / Managed Agents / fast mode**: مش على Bedrock ولا Vertex.
- **Semver**: MAJOR (breaking) . MINOR (feature compatible) . PATCH (fix).

## الفخاخ المتكررة في الكورس ده

1. **"All platforms have the same features."** الـ core آه، الـ server tools والـ endpoints لأ.
2. **"Bedrock = Claude Platform on AWS."**
3. **"Use the latest model alias in production."**
4. **"Copy the customer's repo as the template."**
5. **"Open a public issue for the vulnerability."**
6. **"Compare platforms by price per token."**
7. **"One API key for everything."**
