# 6. Enterprise Integration: Auth للعملاء الـ Regulated، و Scoping لمشروع Modernization

## العميل الـ regulated عايز إيه؟

بنوك، health، حكومة، شركات تأمين. الـ security review بتاعهم بيسأل نفس الأسئلة دايمًا:

1. **مين** بيوصل؟ (identity)
2. بـ **صلاحيات** إيه؟ (authorization، least privilege)
3. الـ credentials **متخزنة فين** وبتعيش قد إيه؟
4. الـ **data** بتروح فين؟ (data residency، retention، PII)
5. فيه **audit trail**؟ نقدر نعرف مين عمل إيه وإمتى؟
6. نقدر **نوقفه** بسرعة؟ (revocation)

## Authentication patterns اللي بتتقبل

### للـ model access (Claude Code / API)

| Pattern | إزاي | ليه بيتقبل |
|---|---|---|
| **Cloud provider** (Bedrock / Vertex / Foundry) | `CLAUDE_CODE_USE_BEDROCK=1` + AWS IAM / SSO | الـ data جوه الـ cloud account بتاع العميل، IAM و CloudTrail موجودين، billing ومراجعة في مكان واحد |
| **LLM gateway** | `ANTHROPIC_BASE_URL` يشاور على gateway الشركة | مكان واحد لـ auth، logging، rate limits، budgets، و PII filtering |
| **`apiKeyHelper`** | script بيرجّع key **قصير العمر** من vault | مفيش long-lived key على الـ laptops |
| **Managed settings** | `managed-settings.json` / MDM | IT تفرض provider، تمنع bypass، deny rules، والمستخدم ميقدرش يغيّر |
| **SSO / forced login** | `forceLoginMethod`، `forceLoginOrgUUID` | الموظفين يدخلوا بحساب الشركة بس |
| **Workload identity federation** | الـ workload يبدّل token بتاعه (OIDC) بـ credential | للـ CI و الـ services، من غير static keys |

❌ اللي **مش** بيتقبل: API key ثابت، مشترك، في `.env` أو في الكود أو في Slack، من غير rotation.

### للـ MCP servers (الوصول للأنظمة)

- **OAuth 2.1** للـ remote servers: المستخدم يعمل login، والـ server بياخد token **بصلاحيات المستخدم ده**
  (مش service account بصلاحيات admin على كل حاجة).
- **Per-user identity:** الـ audit log يقول "أحمد عمل كذا" مش "mcp-bot عمل كذا".
- **Scopes ضيقة:** token بـ `read:tickets` لو مش محتاج write.
- **Short-lived tokens** + refresh، و revocation مركزي.
- **Managed MCP:** `managed-mcp.json` (IT تحدد الـ servers المسموحة بس) أو
  `allowedMcpServers` / `deniedMcpServers`. الـ denylist بتكسب دايمًا.
- **Secrets في vault**، والـ config بيشاور عليها (env var expansion)، مش مكتوبة فيه.

### Network و data

- **Private connectivity** (VPC endpoints / PrivateLink) لو العميل مش عايز traffic على الـ internet.
- **Data residency** (`inference_geo`، region الـ cloud provider).
- **Retention / ZDR** حسب الـ contract.
- PII: redact قبل ما يوصل للموديل لو مش لازم.

## Scoping لمشروع code modernization يعدّي الـ security review

السيناريو: عميل عايز يستخدم Claude Code عشان يحدّث legacy system (مثلًا Java 8 → 21، أو COBOL → Java).

### Scope المشروع (قبل أي كود)

1. **حدد الـ boundary:** أنهي repos، أنهي modules. مش "الـ codebase كله".
2. **صنّف الـ data:** الكود نفسه فيه secrets؟ فيه test data حقيقية (PII)؟ نضّفها الأول.
3. **مرحلة pilot صغيرة:** module واحد، مخاطره قليلة، يثبت القيمة ويختبر الـ controls.
4. **Success criteria قابلة للقياس:** tests بتعدّي، coverage، performance مش أسوأ.

### الـ controls (اللي الـ security reviewer عايز يشوفها)

| Control | التطبيق |
|---|---|
| Least privilege | Claude Code يشتغل على **copy / branch**، مفيش prod credentials، مفيش push لـ main |
| Isolation | Dev container / VM من غير وصول للـ prod network |
| Permissions | managed settings: `deny` لـ secrets و commands خطرة، `bypassPermissions` ممنوع |
| Guardrails | `PreToolUse` hooks تمنع (`git push --force`, `terraform apply`, وصول لـ prod hosts) |
| Human review | كل تغيير بيعدّي PR review + CI؛ الحاجات الحساسة (auth، crypto) review من خبير |
| Auditability | logs لكل session، git history، مين وافق على إيه |
| Model access | عن طريق الـ cloud account بتاع العميل (Bedrock / Vertex) أو الـ gateway |
| Rollback | كل مرحلة صغيرة وتترجع |

### تقسيم الشغل

- **Explore أولًا:** Claude يرسم الـ architecture والـ dependencies (read-only، plan mode).
- **Characterization tests** قبل أي refactor: tests بتثبت الـ behavior الحالي عشان تعرف لو حاجة اتكسرت.
- **مراحل صغيرة:** كل مرحلة PR يتراجع، مش big-bang rewrite.
- **CLAUDE.md + rules** للـ conventions الجديدة، و **skills** للـ migration steps المتكررة.

## الغلطة الشائعة في الامتحان

- ❌ API key واحد مشترك للفريق كله. ✅ SSO / cloud IAM / gateway / short-lived credentials.
- ❌ MCP server بـ service account عنده admin على كل حاجة. ✅ OAuth بصلاحيات المستخدم + scopes ضيقة.
- ❌ "Rely on the system prompt to keep Claude away from production." ✅ مفيش prod credentials أصلًا + isolation.
- ❌ Modernization لكل الـ codebase مرة واحدة. ✅ pilot + مراحل + characterization tests.
- ❌ project settings عشان تفرض policy على الشركة. ✅ managed settings.
