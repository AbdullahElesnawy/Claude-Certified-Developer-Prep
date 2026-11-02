# Claude Certified Developer – Foundations: Study Notes

Study notes and practice quizzes I used to prepare for Anthropic's **Claude Certified Developer – Foundations**
exam (code **CCDV-F**). I passed on 1 November 2026 with a scaled score of 808 (the pass mark is 720).

The notes follow the five courses in Anthropic's official prep path. They are written in Egyptian Arabic, with
the technical terms kept in English so they match the exam and the docs. The quizzes are in English.

## Start here

1. Read the official **exam guide** first. It is the only authoritative description of what the exam covers:
   [Exam Guide (PDF)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf).
2. Take the official prep courses on the [Anthropic Partner Academy](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations).
   They are free.
3. After each course, read the matching notes folder below, then open its `quiz.html` in a browser.
4. Book the exam from the [certification page](https://anthropic-partners.skilljar.com/claude-certified-developer-foundations-certification).

## Contents

| # | Course | Notes | Quiz |
|---|---|---|---|
| 1 | MSO Foundations | [mso-foundations/](mso-foundations/) | [quiz.html](mso-foundations/quiz.html) (20 questions) |
| 2 | Production-Grade Prompting, Agents & Tool Use | [production-grade-prompting/](production-grade-prompting/) | [quiz.html](production-grade-prompting/quiz.html) (24) |
| 3 | Claude Code, MCP & Integration | [claude-code-mcp-integration/](claude-code-mcp-integration/) | [quiz.html](claude-code-mcp-integration/quiz.html) (27) |
| 4 | Production Engineering, Evals & Security | [production-engineering-evals-security/](production-engineering-evals-security/) | [quiz.html](production-engineering-evals-security/quiz.html) (26) |
| 5 | Accelerators & IP Contribution | [accelerators-ip-contribution/](accelerators-ip-contribution/) | [quiz.html](accelerators-ip-contribution/quiz.html) (25) |

| — | **Extra topics** the courses don't cover well: software engineering, agent frameworks, Claude across interfaces | [extra-topics/](extra-topics/) | — |
| — | **Mock exam**: 53 questions, 120-minute timer, weighted by the exam domains | — | [mock-exam/](mock-exam/index.html) |

The **[blueprint checklist](BLUEPRINT.md)** lists all 25 skills from the exam guide, their weights, and which notes
cover each one. Use it to see what you still need to study.

Each notes folder has a `README.md`, one file per course objective, and an `exam-traps` file with a cheat sheet.
Each quiz opens in a browser: answer, press **Submit**, and see your score per section and the reasoning for every
answer. Answer order is shuffled on each attempt, and your progress is saved in your browser. Nothing leaves your
machine.

When you've finished the courses, take the **mock exam**. It runs like the real one (53 questions, 120 minutes,
per-domain question counts from the official weights) and shows your score per domain at the end, which tells you
what to review before booking.

## Exam at a glance

From the official exam guide (version 1.0, July 2026):

| | |
|---|---|
| Questions | 53, multiple choice and multiple response |
| Time | 120 minutes |
| Pass mark | 720 on a 100–1,000 scaled score |
| Fee | $125 |
| Delivery | Pearson VUE, online proctored or test center |
| Validity | 12 months; on-time renewal is a free, unproctored assessment |

| Domain | Weight |
|---|---|
| Applications and Integration | 33.1% |
| Model Selection and Optimization | 16.8% |
| Agents and Workflows | 14.7% |
| Prompt and Context Engineering | 11.0% |
| Tools and MCPs | 10.6% |
| Security and Safety | 8.1% |
| Claude Code | 3.1% |
| Eval, Testing, and Debugging | 2.6% |

## After you pass

- The result can show as **In Progress** in the Pearson VUE exam history for a while after the exam.
- The badge and certificate come from **Credly** by email, not from Pearson VUE. Accept the badge there,
  download the PDF certificate, and share it to LinkedIn from Credly.
- If the badge doesn't arrive, check spam, then contact Pearson VUE support (for results) or Credly support
  (for badges).

## Read this before using the notes

- **These are not exam questions.** Every quiz question here was written for practice in the style of the
  official sample questions. Candidates accept a non-disclosure agreement before the exam; please don't add
  real exam content to this repository.
- **The notes were built from each course's learning objectives and the official Anthropic docs**, not copied
  from the lessons. If a lesson says something different, trust the lesson.
- **API details change.** Model names, feature availability per platform, and beta features were checked in
  October 2026. Verify against the current docs before relying on them in real work.
- **The prep courses don't cover everything.** The exam guide says no single resource guarantees a pass. Areas
  that need extra reading include general software engineering, agentic frameworks named in the guide
  (LangGraph, Strands, PydanticAI), and running Claude through Bedrock, Vertex AI, and Foundry.
