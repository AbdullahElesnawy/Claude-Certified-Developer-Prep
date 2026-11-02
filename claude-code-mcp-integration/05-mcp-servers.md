# 5. Building an MCP Server

## MCP في سطر

**Model Context Protocol** = protocol موحّد يخلّي أي **client** (Claude Code، Claude Desktop، app
بالـ SDK) يتوصل بأي **server** بيقدّم capabilities. تكتب الـ server مرة، ويشتغل مع كل الـ clients.

```
Host (Claude Code / Desktop / your app)
  └── MCP Client  ──(transport)──►  MCP Server  ──►  Jira / DB / internal API
```

## التلات primitives (لازم تحفظ مين بيتحكم في إيه)

| Primitive | إيه هو | **مين بيتحكم** | مثال |
|---|---|---|---|
| **Tools** | functions الموديل ينفذها (ممكن يكون ليها side effects) | **Model-controlled**: الموديل بيقرر يناديها | `create_ticket`، `query_db` |
| **Resources** | data للقراءة، ليها URI | **Application-controlled**: الـ app / المستخدم بيختار يضيفها للـ context | `file:///...`، `jira://ticket/123`، schema الـ DB |
| **Prompts** | templates جاهزة لـ workflows | **User-controlled**: المستخدم بيختارها (زي slash command) | `/summarize-incident` |

سؤال الامتحان المتوقع: "الـ data دي read-only والمستخدم هو اللي يختار يضيفها" → **resource**.
"الموديل محتاج ينفذ action" → **tool**. "workflow المستخدم بيبدأه بنفسه" → **prompt**.

(فيه كمان **client** primitives زي **elicitation**: الـ server يطلب input من المستخدم عن طريق الـ client.)

## مثال server (TypeScript SDK)

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "inventory", version: "1.0.0" });

// Tool: model-controlled
server.tool(
  "get_stock",
  "Get current stock for a SKU. Use when the user asks about availability.",
  { sku: z.string().describe("Product SKU, e.g. SKU-1042") },
  async ({ sku }) => ({ content: [{ type: "text", text: JSON.stringify(await lookup(sku)) }] }),
);

// Resource: application-controlled
server.resource("warehouses", "inventory://warehouses", async (uri) => ({
  contents: [{ uri: uri.href, text: JSON.stringify(await listWarehouses()) }],
}));

// Prompt: user-controlled
server.prompt("restock-report", { region: z.string() }, ({ region }) => ({
  messages: [{ role: "user", content: { type: "text", text: `Write a restock report for ${region}.` } }],
}));

await server.connect(new StdioServerTransport());
```

نفس قواعد الـ tool design من الكورس اللي فات: description واضح، input schema محدد، errors مفيدة
(`isError: true`)، و output صغير.

## Transports

| Transport | إزاي | إمتى |
|---|---|---|
| **stdio** | الـ client بيشغّل الـ server كـ **process محلي**، والكلام على stdin/stdout | tool محلي، بيوصل لملفات أو CLI على نفس الجهاز، server لمستخدم واحد |
| **Streamable HTTP** | الـ server شغال **remote** على URL | server مشترك لكذا مستخدم، SaaS، enterprise، محتاج **OAuth** |
| SSE | الطريقة القديمة للـ remote | **deprecated**، اتبدلت بـ Streamable HTTP |

- ⚠️ في stdio: **متكتبش logs على stdout** (ده قناة الـ protocol، هتبوّظ الرسايل). اكتب على **stderr**.
- Remote = لازم تفكر في auth، TLS، rate limiting، multi-tenant isolation.

## Configuration scope في Claude Code

```bash
# remote HTTP server
claude mcp add --transport http jira https://mcp.example.com/jira --scope project

# local stdio server مع env var
claude mcp add --transport stdio --env DB_URL=postgres://... inventory -- node ./server.js
```

| Scope | متخزن فين | لمين |
|---|---|---|
| **local** (default) | `~/.claude.json` (للمشروع ده) | أنت بس، في المشروع ده |
| **project** | **`.mcp.json`** في root المشروع (في git) | الفريق كله |
| **user** | `~/.claude.json` | أنت، في كل المشاريع |

- الأولوية لو نفس الاسم: local > project > user > plugin.
- **Project-scoped servers بتطلب موافقة** أول مرة (عشان repo تعمله clone ميشغّلش servers لوحده).
- **Secrets في `.mcp.json`:** متكتبهاش. استخدم **env var expansion**:

```json
{
  "mcpServers": {
    "inventory": {
      "type": "http",
      "url": "${INVENTORY_URL:-https://mcp.internal.example.com}",
      "headers": { "Authorization": "Bearer ${INVENTORY_TOKEN}" }
    }
  }
}
```

  الملف في git، والـ token في الـ environment بتاع كل واحد.
- OAuth للـ remote servers: `/mcp` جوه الـ session، أو `claude mcp login <name>`.
- في permissions: `mcp__inventory__get_stock` (tool واحد) أو `mcp__inventory` (كل الـ server).

## MCP في الـ Messages API

الـ **MCP connector**: تقدر تدّي الـ API remote MCP server مباشرة (`mcp_servers` + `mcp_toolset` في
`tools`)، والـ API هو اللي يتكلم مع الـ server. بيشتغل مع servers **remote** (HTTP) بس.

## الغلطة الشائعة في الامتحان

- ❌ Resource لحاجة الموديل محتاج "يعمل" بيها action. ✅ Tool.
- ❌ stdio لـ server مشترك بين 200 موظف. ✅ Streamable HTTP + OAuth.
- ❌ API token مكتوب في `.mcp.json` اللي في git. ✅ `${ENV_VAR}`.
- ❌ `console.log` في stdio server.
- ❌ project scope لـ server شخصي تجريبي. ✅ local scope.
- ✅ capability لازم تتشارك بين كذا app وتتعمل maintain لوحدها → MCP server (Sample Q3 في الـ exam guide).
