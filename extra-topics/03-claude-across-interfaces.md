# 3. Claude عبر الـ Interfaces المختلفة

الـ blueprint (Claude Application Design، 8.6%) بيقول: **"how Claude interprets instructions across interfaces
(Claude Code, Desktop, claude.ai, API, SDKs), content boundaries, schema design, session hygiene, and plugin
management."**

## الفكرة الأساسية

نفس الموديل، بس **الـ context اللي بيوصله مختلف** في كل interface. اللي بيحدد السلوك مش الموديل بس، لكن
**مين كاتب الـ system prompt** و **إيه اللي بيتضاف** للـ context.

| Interface | مين بيتحكم في الـ instructions | بيتضاف إيه |
|---|---|---|
| **Messages API** | **أنت بالكامل**: الـ `system` والـ `messages` والـ tools | ولا حاجة غير اللي بعته |
| **SDKs** (Anthropic SDK) | أنت (نفس الـ API) | ولا حاجة؛ الـ SDK wrapper بس |
| **Claude Agent SDK** | الـ Claude Code harness + اللي أنت بتديه | system prompt بتاع الـ harness، tools جاهزة، وممكن CLAUDE.md / skills حسب الـ settings |
| **Claude Code** | Anthropic (الـ harness) + **أنت عن طريق config** | CLAUDE.md، rules، skills، hooks، settings، MCP، output styles |
| **claude.ai / Desktop** | Anthropic (system prompt المنتج) + المستخدم | preferences، project instructions و files، memory، connectors |

### إيه معنى ده عمليًا؟

- **Prompt اشتغل في claude.ai مش لازم يشتغل زي ما هو في الـ API.** في claude.ai فيه system prompt وتعليمات
  وسياق مش موجودين في الـ API. لازم تختبره على الـ API بالـ system prompt بتاعك.
- **في Claude Code، تعليماتك بتيجي بعد تعليمات الـ harness.** CLAUDE.md بيوجّه، بس hooks و permissions هما الـ enforcement.
- **في الـ API أنت مسؤول عن كل حاجة**: الـ role، القواعد، الـ format، الـ safety.
- **التعليمات بتتقري حرفيًا أكتر في الموديلات الحديثة**، فالتناقض بين مصادر الـ instructions (system prompt
  و CLAUDE.md و skill) بيعمل سلوك غريب. راجع المصادر كلها مع بعض.

## Content boundaries

حدود واضحة بين **الأنواع المختلفة من الـ content** في الـ context:
- **Instructions** (منك: system prompt، CLAUDE.md) vs **data** (documents، tool results، web pages، user input).
- افصلهم بـ XML tags، وعامل الـ data كـ **untrusted** (ممكن يكون فيها prompt injection).
- **Operator vs user:** تعليمات الـ operator في الـ system prompt؛ كلام المستخدم في الـ user turn. متحطش
  input المستخدم في الـ system prompt.

## Schema design

- Tool schemas و structured output schemas: **أسماء واضحة**، descriptions لكل field، `required`، enums للقيم
  المحدودة، `additionalProperties: false`.
- **Flat وبسيط** أحسن من nested معقد.
- **Version** الـ schema؛ تغييرها breaking change للي بيستهلك الـ output.

## Session hygiene

الـ session (محادثة أو Claude Code session) بتتراكم فيها حاجات. Session "وسخة" = جودة أقل وcost أعلى.
- **Session لكل مهمة.** متكملش مهمة جديدة في session مليانة سياق مهمة تانية (`/clear` في Claude Code).
- **Compact** لما تحتاج تكمل نفس المهمة بس الـ context كبر (`/compact` أو compaction في الـ API).
- **Subagents** للـ exploration الكبير عشان الـ session الأساسية تفضل نضيفة.
- **Resume** (`--continue` / `--resume`) لما ترجع لنفس المهمة، بدل ما تشرح من الأول.
- متسيبش secrets أو data حساسة في الـ session (بتتسجل في الـ transcript).

## Plugin management

- Plugins بتجيب skills و hooks و MCP servers و agents. **Hooks و MCP = كود بيشتغل على جهازك**، فـ:
  - ثبّت من **marketplaces موثوقة** بس.
  - **Pin / راجع** الـ versions والتحديثات.
  - في الشركات: managed settings تحدد المسموح.
- **Project scope** عشان الفريق كله ياخد نفس الـ setup (في `.claude/settings.json`).
- تعارض أسماء: skills الـ plugins بـ namespace (`/plugin:skill`).

## الغلطة الشائعة في الامتحان

- ❌ "It works in claude.ai, so the same prompt will behave identically through the API."
- ❌ User input جوه الـ system prompt.
- ❌ Session واحدة طويلة لكل المهام.
- ❌ Plugin من مصدر مش معروف "عشان فيه skills مفيدة".
