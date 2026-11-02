// Practice questions for this course. Original questions, not from the real exam.
// Fields: s = section, q = question, o = options, a = indexes of correct options, w = explanation.
(window.QUIZ_BANK = window.QUIZ_BANK || {})["mso"] = [
  {
    "s": "Tokens and context window",
    "q": "A request has a 180K-token prompt and sets `max_tokens` to 64K on a model with a 200K-token context window. What is the problem?",
    "o": [
      "Nothing; `max_tokens` is unrelated to the context window.",
      "Input and output share the context window, so 180K input plus up to 64K output exceeds the 200K budget.",
      "`max_tokens` must always equal the context window size.",
      "Only output tokens count toward the context window."
    ],
    "a": [
      1
    ],
    "w": "The context window is a fixed budget shared by the input and the generated output. Plan input size and `max_tokens` together."
  },
  {
    "s": "Tokens and context window",
    "q": "Which statement about tokens is correct?",
    "o": [
      "One token is always exactly one word.",
      "Tokens are sub-word units; the same text can produce different token counts on different models or languages, so measure with the token-counting endpoint.",
      "Images and PDFs do not consume tokens.",
      "Token counts only matter for billing, not for limits."
    ],
    "a": [
      1
    ],
    "w": "Tokenization varies by model and language, and images and documents consume tokens too. Tokens drive cost, rate limits, and context usage, so count them rather than estimate from words."
  },
  {
    "s": "Tokens and context window",
    "q": "A team's average request cost doubled after they added 20 detailed examples to the system prompt. Why?",
    "o": [
      "Examples are billed as output tokens.",
      "Every example is sent as input tokens on every request, so the per-request input grew.",
      "The model thinks longer when it sees examples.",
      "System prompts are billed at double rate."
    ],
    "a": [
      1
    ],
    "w": "Everything in the prompt is resent and billed on each request because the API is stateless. Prompt caching can cut the cost of a stable prefix like this."
  },
  {
    "s": "Tokens and context window",
    "q": "A chatbot's quality drops late in long conversations, even though the context window is not full. What is the most likely cause?",
    "o": [
      "The model runs out of output tokens.",
      "Accumulated, mostly irrelevant history dilutes the context, so important instructions and facts get less attention.",
      "The API silently truncates conversations after 10 turns.",
      "Temperature increases with conversation length."
    ],
    "a": [
      1
    ],
    "w": "Filling the context with stale content reduces quality before the hard limit is reached. Treat the context as a budget and manage it (summarize, prune, isolate)."
  },
  {
    "s": "Sampling and non-determinism",
    "q": "Why can the same prompt produce different outputs on repeated calls?",
    "o": [
      "The model retrains between calls.",
      "Generation samples each next token from a probability distribution, so outputs can vary run to run.",
      "The API randomly changes the system prompt.",
      "Network latency changes the answer."
    ],
    "a": [
      1
    ],
    "w": "LLMs generate token by token by sampling from a distribution. That sampling is the source of variation between runs."
  },
  {
    "s": "Sampling and non-determinism",
    "q": "What does non-determinism mean for testing an LLM feature?",
    "o": [
      "Tests are impossible, so skip them.",
      "Run each eval case multiple times and measure pass rates; assert properties (valid schema, allowed category) rather than exact text.",
      "Set temperature to 0 and assert exact string equality; this guarantees identical outputs.",
      "Test only once per release."
    ],
    "a": [
      1
    ],
    "w": "Even low-temperature settings do not guarantee identical outputs. Measure rates over repeated runs and check properties instead of exact strings."
  },
  {
    "s": "Sampling and non-determinism",
    "q": "A developer compares two prompts by running each once on 5 cases. Prompt B scores 5/5 and Prompt A 4/5. What is the right conclusion?",
    "o": [
      "Prompt B is clearly better; ship it.",
      "The difference may be noise; run a larger eval set, with repeated runs, before concluding.",
      "Prompt A is better because it failed less confidently.",
      "Evals can't compare prompts."
    ],
    "a": [
      1
    ],
    "w": "With so few cases and single runs, one flip is within normal variation. A meaningful comparison needs more cases and repeated runs."
  },
  {
    "s": "Model family and reasoning",
    "q": "A high-volume, latency-sensitive support classifier sorts tickets into five categories. Which model tier is the natural starting point?",
    "o": [
      "The most capable model at maximum effort.",
      "A fast, low-cost tier (Haiku class), validated with an eval.",
      "Whichever model has the longest context window.",
      "A different model for every request."
    ],
    "a": [
      1
    ],
    "w": "Simple, high-volume, latency-sensitive tasks fit the small fast tier. Confirm the quality with an eval rather than assuming."
  },
  {
    "s": "Model family and reasoning",
    "q": "Which statement correctly distinguishes model choice from reasoning mode?",
    "o": [
      "They are the same setting.",
      "Model choice picks the capability tier (Opus, Sonnet, Haiku); reasoning mode (extended or adaptive thinking, effort) controls how much the chosen model reasons before answering.",
      "Extended thinking switches the request to a larger model.",
      "Reasoning mode only changes the output format."
    ],
    "a": [
      1
    ],
    "w": "They are independent levers. You can run a smaller model with more reasoning, or a larger model with less, and each changes cost and quality differently."
  },
  {
    "s": "Model family and reasoning",
    "q": "A team wants better results on a hard multi-step planning task without changing models. What should they try first?",
    "o": [
      "Raise temperature.",
      "Enable or increase reasoning (extended or adaptive thinking, higher effort) and measure the quality and cost change.",
      "Shorten the prompt to one sentence.",
      "Remove all instructions."
    ],
    "a": [
      1
    ],
    "w": "More reasoning helps multi-step tasks, at the cost of more output tokens and latency. Measure the change instead of assuming it helps."
  },
  {
    "s": "Model family and reasoning",
    "q": "Which tradeoffs typically come with moving to a larger model tier or higher reasoning effort?",
    "o": [
      "Higher cost per task.",
      "Higher latency.",
      "Guaranteed deterministic output.",
      "Potentially better quality on complex tasks."
    ],
    "a": [
      0,
      1,
      3
    ],
    "w": "Bigger models and more reasoning usually cost more and take longer, in exchange for better results on hard tasks. Neither makes output deterministic."
  },
  {
    "s": "Model family and reasoning",
    "q": "Production code references a model alias that can point to newer model versions over time. Output quality suddenly changes. What practice prevents this?",
    "o": [
      "Always use the newest model automatically.",
      "Pin a specific model version in production and upgrade deliberately after running evals.",
      "Avoid using model IDs.",
      "Lower `max_tokens`."
    ],
    "a": [
      1
    ],
    "w": "New model versions can change behavior. Pinning a version and upgrading only after evals keeps changes intentional."
  },
  {
    "s": "Zero, one, and multi-shot",
    "q": "When is zero-shot prompting usually the best choice?",
    "o": [
      "When the output format is unusual and must be followed exactly.",
      "When the task is simple and well described by instructions alone, and you want to minimize tokens.",
      "When the model keeps misclassifying edge cases.",
      "Never; examples always help."
    ],
    "a": [
      1
    ],
    "w": "Zero-shot is cheapest. Add examples when instructions alone don't produce the right format or behavior."
  },
  {
    "s": "Zero, one, and multi-shot",
    "q": "A model follows the instructions but output style and format drift between responses. What is the most effective addition?",
    "o": [
      "A few diverse examples (multi-shot) showing the exact expected format, wrapped in example tags.",
      "A higher temperature.",
      "Repeating the instruction three times in capitals.",
      "A larger context window."
    ],
    "a": [
      0
    ],
    "w": "Examples are the strongest way to pin down format and tone. Make them varied so the model does not copy incidental details."
  },
  {
    "s": "Zero, one, and multi-shot",
    "q": "What is the main risk of using several near-identical examples in a multi-shot prompt?",
    "o": [
      "The API rejects duplicate examples.",
      "The model over-fits to incidental details of the examples (same length, same topic) instead of the intended pattern.",
      "Examples are ignored if there are more than two.",
      "It disables streaming."
    ],
    "a": [
      1
    ],
    "w": "Examples teach by pattern. If they all share an incidental trait, the model copies that trait. Diverse examples teach the real rule."
  },
  {
    "s": "Zero, one, and multi-shot",
    "q": "What is the cost tradeoff of adding examples to a prompt?",
    "o": [
      "Examples are free because they are in the system prompt.",
      "Examples add input tokens to every request; they often improve quality, and prompt caching can reduce their recurring cost.",
      "Examples increase only output tokens.",
      "Examples reduce cost because responses become shorter."
    ],
    "a": [
      1
    ],
    "w": "Each example is resent as input on every call. Weigh the quality gain against that cost, and cache a stable prefix."
  },
  {
    "s": "Access patterns",
    "q": "Why do most teams use the official SDK rather than raw REST calls to the Messages API?",
    "o": [
      "Raw REST is not supported.",
      "The SDK wraps the same REST API and adds typed requests and responses, built-in retries for retriable errors, streaming helpers, and typed error classes.",
      "The SDK uses a different, faster model.",
      "The SDK does not need an API key."
    ],
    "a": [
      1
    ],
    "w": "The SDK and REST hit the same API. The SDK adds conveniences such as typing, retries, streaming helpers, and error classes; raw REST suits languages without an SDK or shell scripts."
  },
  {
    "s": "Access patterns",
    "q": "A chat UI shows a blank screen for 20 seconds while a long answer is generated. What is the best change?",
    "o": [
      "Switch to the Batches API.",
      "Use streaming so text appears as it is generated.",
      "Lower the context window.",
      "Retry the request."
    ],
    "a": [
      1
    ],
    "w": "Streaming improves time to first token and perceived latency. It also avoids HTTP timeouts on long responses."
  },
  {
    "s": "Access patterns",
    "q": "A backend must process 5,000 independent requests within an hour, as cheaply as practical. Results are needed within the hour, not instantly. Which approach fits?",
    "o": [
      "Send them one at a time, synchronously.",
      "Use an async client with a concurrency limit that respects rate limits, retrying 429s with backoff.",
      "Open 5,000 parallel requests at once.",
      "Use streaming for each request."
    ],
    "a": [
      1
    ],
    "w": "Async requests with bounded concurrency finish within the window without hammering rate limits. If a 24-hour window were acceptable, the Batches API would be cheaper."
  },
  {
    "s": "Access patterns",
    "q": "Which workloads fit the Message Batches API?",
    "o": [
      "Nightly classification of 100,000 product reviews.",
      "A live customer chat.",
      "Running an eval suite of 10,000 cases overnight.",
      "An agent that needs each tool result before choosing the next step."
    ],
    "a": [
      0,
      2
    ],
    "w": "Batches suit large, independent, latency-tolerant jobs at about half the cost. Interactive chat and step-by-step agent loops need real-time responses."
  }
];
