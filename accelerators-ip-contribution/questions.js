// Practice questions for this course. Original questions, not from the real exam.
// Fields: s = section, q = question, o = options, a = indexes of correct options, w = explanation.
(window.QUIZ_BANK = window.QUIZ_BANK || {})["accelerators"] = [
  {
    "s": "Accelerators",
    "q": "A partner built a support agent for one retailer and now has three more retailers asking for the same thing. What is the best way to turn the build into an accelerator?",
    "o": [
      "Copy the first customer's repository for each new customer and rename things.",
      "Extract a template where customer-specific values (prompts, tools enabled, model, limits, endpoints) are validated config parameters, and the loop, guardrails, tracing, and eval harness stay in shared code.",
      "Ship the first customer's build unchanged and tell new customers to adapt.",
      "Put every customer's settings in one large system prompt."
    ],
    "a": [
      1
    ],
    "w": "Separating what varies per customer (config) from the reusable pattern (code) lets future engagements configure rather than rebuild. Copying repos (A) duplicates bugs and leaks customer-specific details."
  },
  {
    "s": "Accelerators",
    "q": "An accelerator includes an `issue_refund` tool. What default is safest for the human-approval setting?",
    "o": [
      "Approval disabled by default, so the agent works out of the box.",
      "Approval required by default; teams must explicitly opt out per deployment.",
      "No setting; leave it to each customer's system prompt.",
      "Randomly enabled to test both paths."
    ],
    "a": [
      1
    ],
    "w": "Safe defaults mean that someone who forgets a parameter ends up protected, not exposed."
  },
  {
    "s": "Accelerators",
    "q": "Before publishing an accelerator to a shared repository, which items must be removed or replaced?",
    "o": [
      "Real customer names, data, and example transcripts.",
      "API keys and other credentials.",
      "The eval harness.",
      "Customer-specific business rules hard-coded in the code."
    ],
    "a": [
      0,
      1,
      3
    ],
    "w": "Customer data, secrets, and client-specific logic must not ship in shared IP. The eval harness should stay; it proves the accelerator works."
  },
  {
    "s": "Accelerators",
    "q": "Which design makes an eval suite portable across engagements?",
    "o": [
      "Test cases hard-coded inside the grader functions for one customer.",
      "A fixed interface to the system under test, test cases in data files, pluggable graders, and thresholds in config.",
      "A single LLM judge prompt with no rubric.",
      "Manual review only."
    ],
    "a": [
      1
    ],
    "w": "Separating cases, graders, and thresholds from the harness lets each new project plug in its own system and data."
  },
  {
    "s": "Accelerators",
    "q": "When is building a reusable accelerator usually NOT worth it?",
    "o": [
      "When the same pattern has been built for the third time.",
      "When a solution was needed once, with no sign of repeat demand.",
      "When several teams ask for the same capability.",
      "When customers need the same MCP server with different endpoints."
    ],
    "a": [
      1
    ],
    "w": "Abstraction costs time and maintenance. It pays off once the pattern repeats and its variable parts are clear."
  },
  {
    "s": "Contributing",
    "q": "You found a bug in a shared internal accelerator and have a fix. What gives the maintainer the best chance to accept it?",
    "o": [
      "A direct message with a zip of the changed files.",
      "A small, focused pull request through the repository's documented process, with a test that fails without the fix, passing CI, and an updated changelog.",
      "Pushing the fix directly to main.",
      "A large PR that also reformats unrelated files."
    ],
    "a": [
      1
    ],
    "w": "Follow CONTRIBUTING.md, keep the change focused, prove it with a test, and update the docs. That makes review easy."
  },
  {
    "s": "Contributing",
    "q": "While working on a shared MCP server, you find a vulnerability that exposes other tenants' data. How should you report it?",
    "o": [
      "Open a public GitHub issue with reproduction steps.",
      "Follow the private disclosure process described in SECURITY.md (or the equivalent channel).",
      "Post it in a public community forum.",
      "Fix it silently without telling anyone."
    ],
    "a": [
      1
    ],
    "w": "Public reports of unpatched vulnerabilities put users at risk. Use the documented private channel."
  },
  {
    "s": "Contributing",
    "q": "You want to add a major new capability to a widely used agent template. What should you do first?",
    "o": [
      "Write the full implementation, then open one large PR.",
      "Open an issue or RFC describing the proposal and agree on the approach with maintainers before writing most of the code.",
      "Fork the project and never upstream it.",
      "Ask users to vote in a chat channel."
    ],
    "a": [
      1
    ],
    "w": "Large changes without prior agreement are often rejected. A proposal first saves wasted effort on both sides."
  },
  {
    "s": "Contributing",
    "q": "You are contributing an improved system prompt and tool descriptions to a shared agent. What evidence should the PR include?",
    "o": [
      "\"Tested it a few times; works great.\"",
      "Eval results before and after on the shared suite, the model and version tested, and any cost or latency change.",
      "Screenshots of one good conversation.",
      "Nothing; prompt changes don't need evidence."
    ],
    "a": [
      1
    ],
    "w": "LLM behavior changes need measured evidence on the shared eval, tied to a specific model version."
  },
  {
    "s": "Platforms and versioning",
    "q": "What is the key difference between Claude Platform on AWS and Amazon Bedrock?",
    "o": [
      "They are the same service under two names.",
      "Claude Platform on AWS is operated by Anthropic with the first-party API surface (same-day feature parity) and AWS IAM and billing; Bedrock is operated by AWS with its own feature subset and release timing.",
      "Bedrock is operated by Anthropic; Claude Platform on AWS by AWS.",
      "Only Bedrock supports AWS IAM."
    ],
    "a": [
      1
    ],
    "w": "Both use AWS identity and billing, but only Claude Platform on AWS tracks the first-party API surface. Bedrock is partner-operated."
  },
  {
    "s": "Platforms and versioning",
    "q": "An accelerator relies on the Message Batches API and the Files API. A new customer requires Google Vertex AI. What is the most important check?",
    "o": [
      "None; all platforms support the same features.",
      "Verify feature availability on Vertex; these endpoints are not available there, so the design needs an alternative (for example the platform's own batch mechanism) or a different platform.",
      "Switch the model to a smaller one.",
      "Use the first-party client with a Vertex base URL."
    ],
    "a": [
      1
    ],
    "w": "Core messaging, tools, streaming, and caching are broadly available, but several endpoints and server tools differ by platform. Check before committing."
  },
  {
    "s": "Platforms and versioning",
    "q": "A team wants the newest API features as soon as they launch, such as Managed Agents and fast mode. Which option fits best?",
    "o": [
      "Amazon Bedrock",
      "Google Vertex AI",
      "The first-party Claude API",
      "Any platform; features launch everywhere at once"
    ],
    "a": [
      2
    ],
    "w": "New features land on the first-party API first; some, like fast mode, are first-party only."
  },
  {
    "s": "Platforms and versioning",
    "q": "Production quality dropped overnight, with no code deploy. The service references a model alias that moved to a newer model version. What practice prevents this?",
    "o": [
      "Always using the latest alias.",
      "Pinning a specific model version per environment and upgrading deliberately after evals and a canary rollout.",
      "Disabling logging.",
      "Raising `max_tokens`."
    ],
    "a": [
      1
    ],
    "w": "Model changes can alter behavior, token counts, and defaults. Pin versions and make upgrades an explicit, measured release."
  },
  {
    "s": "Platforms and versioning",
    "q": "Which steps belong in a safe release process for switching to a new model version?",
    "o": [
      "Run the eval suite against the current baseline.",
      "Check cost and latency, since tokenization and defaults may change.",
      "Roll out to a small share of traffic first, with rollback ready.",
      "Switch 100% of traffic immediately to save time."
    ],
    "a": [
      0,
      1,
      2
    ],
    "w": "Evals, a cost and latency check, and a canary with rollback catch regressions before they reach everyone."
  },
  {
    "s": "Platforms and versioning",
    "q": "A prompt is edited directly in a web console by different team members. Behavior changes are hard to trace. What fixes this?",
    "o": [
      "Lock the console so nobody can edit.",
      "Prompt versioning: prompts live in version control with version IDs, changes go through review and evals, and each trace records the prompt version.",
      "Add a comment at the top of the prompt saying who edited it.",
      "Use a higher temperature to hide differences."
    ],
    "a": [
      1
    ],
    "w": "Versioned prompts make every change reviewable, testable, and attributable in traces."
  },
  {
    "s": "Platforms and versioning",
    "q": "An accelerator's breaking change removes a config field. Under semantic versioning, which version change signals this?",
    "o": [
      "Patch (1.4.2 → 1.4.3)",
      "Minor (1.4.2 → 1.5.0)",
      "Major (1.4.2 → 2.0.0)",
      "No version change"
    ],
    "a": [
      2
    ],
    "w": "Breaking changes require a major version bump so consumers pinned to 1.x are not broken unexpectedly."
  },
  {
    "s": "Platform comparison",
    "q": "Procurement asks which platform to use for a new Claude workload. What should the comparison start from?",
    "o": [
      "The platform the developer personally prefers.",
      "The customer's requirements: hard constraints (residency, identity, required features, certifications) and preferences (cost, team familiarity).",
      "The lowest price per million tokens.",
      "Whichever platform has the most features."
    ],
    "a": [
      1
    ],
    "w": "Requirements decide which options are even eligible. Comparing platforms before knowing them produces a recommendation reviewers can't approve."
  },
  {
    "s": "Platform comparison",
    "q": "How should latency be compared across platforms in a recommendation that procurement will rely on?",
    "o": [
      "Quote numbers from a blog post.",
      "Measure p50, p95, and time to first token with the same workload, model, and region on each candidate, and document the method.",
      "Assume all platforms have identical latency.",
      "Ask the model which platform is faster."
    ],
    "a": [
      1
    ],
    "w": "Reproducible measurements on the real workload are defensible. Secondhand numbers and assumptions are not."
  },
  {
    "s": "Platform comparison",
    "q": "Which cost comparison is most defensible?",
    "o": [
      "List price per million input tokens only.",
      "Cost per completed task on a representative workload, including features that change cost (caching, batch availability) and commercial terms such as cloud commitments.",
      "The cheapest model on any platform.",
      "Monthly subscription price."
    ],
    "a": [
      1
    ],
    "w": "Feature availability and commercial terms can outweigh small per-token differences. Measure the real task."
  },
  {
    "s": "Platform comparison",
    "q": "A security reviewer asks how you know a platform meets the customer's certification requirements. What is the right evidence?",
    "o": [
      "Your memory of a past project.",
      "Current documents from the provider's official trust center or compliance documentation, cited with the date retrieved.",
      "A statement from the model.",
      "A competitor's comparison chart."
    ],
    "a": [
      1
    ],
    "w": "Compliance claims must be backed by official, dated sources that the reviewer can verify."
  },
  {
    "s": "Platform comparison",
    "q": "Which items belong in a platform decision record that procurement and security can approve?",
    "o": [
      "Hard and soft requirements.",
      "Options considered, with measured latency and cost and their method.",
      "Sources and dates for prices, features, and compliance claims.",
      "Risks and mitigations, plus the decision and its rationale."
    ],
    "a": [
      0,
      1,
      2,
      3
    ],
    "w": "A transparent record tied to requirements, measurements, and sources is what makes the decision reviewable."
  },
  {
    "s": "Multi-deployment",
    "q": "A workflow extracts facts from EU customer records on Bedrock in an EU region, then uses a first-party API feature for a later step. Which design keeps data boundaries intact?",
    "o": [
      "Send the full customer records to both deployments.",
      "Redact PII in the EU step and pass only minimized, non-sensitive results (or IDs) to the next step, under a routing policy enforced in code.",
      "Let the model decide which deployment to call for each record.",
      "Add a system prompt instruction not to store PII."
    ],
    "a": [
      1
    ],
    "w": "Data minimization at the boundary and a deterministic routing policy keep sensitive data where it is allowed to be."
  },
  {
    "s": "Multi-deployment",
    "q": "An application uses Bedrock and the first-party API in one workflow. How should credentials be managed?",
    "o": [
      "One API key shared across both deployments and all environments.",
      "A separate, least-privilege, preferably short-lived credential per deployment (for example an IAM role for Bedrock and a workspace-scoped credential for the first-party API), with every call audited.",
      "Hard-code the keys in the orchestrator.",
      "Pass credentials to the model so it can choose."
    ],
    "a": [
      1
    ],
    "w": "Separate scoped credentials contain the blast radius and make each call attributable."
  },
  {
    "s": "Multi-deployment",
    "q": "The primary EU deployment returns 529 overloaded errors. A fallback to a US deployment is proposed. When is that acceptable?",
    "o": [
      "Always; availability matters most.",
      "Only if the data in those requests is allowed to be processed in the US under the residency requirements; otherwise queue, retry, or fall back to another compliant deployment.",
      "Only for paying customers.",
      "Never retry 529 errors."
    ],
    "a": [
      1
    ],
    "w": "A fallback must respect the same data boundaries as the primary path. Availability does not override residency requirements."
  },
  {
    "s": "Multi-deployment",
    "q": "After failing over from one deployment to another, latency and cost rise noticeably at first. What is a likely reason?",
    "o": [
      "The fallback deployment is misconfigured.",
      "Prompt caches are not shared across deployments or models, so the fallback starts with a cold cache.",
      "Failover always doubles prices.",
      "Streaming is disabled on fallbacks."
    ],
    "a": [
      1
    ],
    "w": "Caches are scoped to the deployment and model. A fallback starts cold, which costs more until the cache warms."
  }
];
