# Contributing

Corrections and new questions are welcome. Please keep changes small: one fix or one set of related questions per
merge request.

## Ground rules

- **No real exam content.** Everyone who sits the exam accepts a non-disclosure agreement. Don't add questions,
  answer options, or scenarios you remember from the exam, even reworded. Write original questions instead.
- **No customer data or secrets.** No client names, real transcripts, internal URLs, or keys, anywhere: notes,
  questions, or examples.
- **Check facts against the official docs** and say where they came from. API details change, so date anything
  that might go stale ("checked October 2026").

## Report a mistake

Open an issue with the file, what's wrong, and a link to the source that shows the correct version. If you're
sure of the fix, a merge request is even better.

## Add or edit quiz questions

Questions live in each course folder's `questions.js`. Each question is an object:

```js
{
  "s": "Tool use",                      // section: groups questions in the quiz and drives the mock exam
  "q": "Question text. Use `backticks` for code.",
  "o": ["Option A", "Option B", "Option C", "Option D"],
  "a": [1],                             // indexes of the correct options (0-based); more than one = multiple response
  "w": "Why the answer is right, and why the tempting wrong options (A) and (C) are wrong."
}
```

- **Refer to options only as `(A)`, `(B)`, or `(A, D)` in parentheses.** Answer order is shuffled for every
  attempt, and the quiz rewrites letters in that form so they still point at the right option. A bare
  "A is wrong" won't be rewritten and will point at the wrong option.
- Write the explanation so it teaches the rule behind the answer, not just the letter.
- **If you add a new section name**, add it to `SECTION_DOMAIN` in `mock-exam/index.html` so the mock exam can
  place it in an exam domain.

## Edit the notes

- Notes are Markdown in Egyptian Arabic, with technical terms kept in English so they match the exam and docs.
- Link between notes with relative `.md` links; the site build turns them into `.html` links.
- Keep the structure of each file: the idea, why it matters, an example, and the common traps.

## Preview the site locally

```bash
npm ci
npm run build
open public/index.html
```

The same build runs in GitLab CI on every push to `main` and publishes to GitLab Pages.
