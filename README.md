# LeetCode Companion

An independent learning app for approaching an algorithm problem for the first time. It does not depend on Thinkbook. Work from the input/output contract to a hand-solved example, brute force, a better approach, the invariant and proof, a visual dry run, Python and C solutions, and edge cases.

## Coverage: curriculum versus completed lessons

The question library lists **all 150 official NeetCode 150 entries plus 50 independently selected extras**. NeetCode membership, titles, categories and difficulties are pinned to the official `neetcode-gh/leetcode` metadata. See `curriculum-data.json` and `THIRD_PARTY_NOTICES.md` for provenance and license. The extras are not presented as the official NeetCode 250 list.

**Only Two Sum currently has a complete built-in lesson.** The other 199 entries start as **Lesson not created**. A catalog entry is not a finished Python/C explanation. A generated lesson becomes **AI lesson available - unreviewed**, and only a successfully persisted lesson is labelled **Saved AI lesson**. Marking a problem **Studied** is a personal progress mark; it does not claim that its code was compiled or independently reviewed.

Click **Choose a question** to search by number/name, filter by topic, switch between the core 150 and extras, and see the actual lesson counts. Choose **Prepare lesson**, follow the official problem link, paste the full statement/examples/constraints, and generate it with the GPT backend. The model receives the selected catalog identity and is instructed to reject a conflicting or underspecified statement. Saved lessons can be reopened without another model request.

Generated curriculum lessons are stored in IndexedDB to accommodate a larger lesson library. Export **saved lessons & progress** regularly; browser data can be cleared and the file/server editions have separate origins. Import validates all lesson structures before adding them. Storage failures are reported, and session-only lessons are not labelled as persistently saved.

Full ready-to-study coverage of the 150 remains unfinished until those individual lessons have actually been created and reviewed. The UI deliberately reports this gap rather than counting titles as completed coverage. Generating each new lesson requires a configured API key and may incur API costs; the app does not silently generate a paid batch of 200 lessons.

## Start immediately: no installation

1. Download and extract this project ZIP.
2. Double-click **LeetCode_Companion.html**. Open it with Edge or Chrome.
3. The complete **Two Sum** lesson opens immediately, without an API key, terminal, or account.

Use the chapter buttons on the left to move through the eight-part explanation. At each checkpoint, write your answer before revealing the worked answer. In the visual dry run, use **Next state** to see the array, complement, and dictionary change one operation at a time. Change the array and target to try duplicates, negative numbers, zeroes, and custom no-solution cases. Choose **Python** or **C**, then select a code line for its explanation.

The no-install edition includes the authored Two Sum lesson. It cannot generate new problems or answer AI follow-ups by itself.

## Use any pasted problem with GPT

You need Node.js 18.17 or later and your own OpenAI API key with access to a Responses-compatible model. Install Node.js LTS from https://nodejs.org if `node --version` is not recognised. Close and reopen your terminal after installation.

Open a terminal in this project folder, then run:

```powershell
Copy-Item .env.example .env
notepad .env
```

In that local `.env` file, fill in:

```text
OPENAI_API_KEY=your_own_key_here
OPENAI_MODEL=gpt-4.1-mini
PORT=8766
```

Save the file. Start the app:

```powershell
node server.cjs
```

Keep that terminal open and visit **http://127.0.0.1:8766** in your browser. No npm package installation is needed.

1. Click **Choose a question**.
2. Paste the full problem statement, examples, and constraints. A title or link alone is not enough to reliably identify every variant.
3. Select a model available to your API account.
4. Read and check the OpenAI data/billing consent box.
5. Click **Build my visual lesson**. Allow up to a minute for the detailed lesson.
6. Study the chapters, code, and visual frames. Use **Still stuck on a specific step?** to ask a follow-up about the current lesson.

This is on-demand generation for pasted questions, not a preloaded or verified archive of every LeetCode question. Generated solutions and visual traces need review. Code is displayed, not automatically executed or submitted to LeetCode. The model may request missing details rather than guess the contract.

## What a lesson covers

1. Inputs, outputs, constraints, and common misreadings.
2. Solving a small example on paper.
3. A brute-force method and its cost.
4. Deriving an improvement from the repeated work.
5. The algorithm, invariant, and correctness argument.
6. A concrete step-by-step visual trace.
7. Complete Python and C code with language explanations.
8. Time/space costs, edge cases, pitfalls, and transfer to related problems.

For C, the authored lesson explains allocation, ownership, integer overflow, hash collisions, and why returning a local array is wrong. Other lessons should explain the C data structures relevant to their algorithms.

## Notes, privacy, and billing

Checkpoint answers and the latest lesson can be kept in this browser's local storage. Use **Export lesson** if you need a durable copy. Clearing browser data or switching between the standalone file and server address does not preserve the same storage origin.

ChatGPT subscriptions and OpenAI API usage are billed separately. This app does not use your ChatGPT login or subscription. When you explicitly generate a lesson or ask a follow-up, the relevant question and lesson context go to OpenAI. Requests set `store: false`; consult your API account's data policies for applicable retention rules.

Your API key stays in the local server environment or `.env` file. Never put it in the HTML, lesson text, chat, or GitHub. `.env` and private data are ignored by Git. The server listens only on `127.0.0.1`, validates request host/origin, limits requests, and never serves `.env` or backend source. This is a single-user local app, not a public multi-user deployment.

## Development

```powershell
npm test
npm run build
npm start
```

`npm run build` regenerates the single-file edition from the source files. The Node test suite mocks OpenAI responses, so running tests does not incur API charges. The authored Python solution was run against 505 fixed/randomized examples during development. The C solution has not been compiled in this environment; compile and test it with a C compiler before relying on it.

## Troubleshooting

- **node is not recognised:** install Node.js LTS, then reopen the terminal.
- **Connection refused:** run `node server.cjs` and keep the terminal open. Check the printed port.
- **Address already in use:** stop the old process or change `PORT` in `.env`, then use the new printed address.
- **API key missing:** save the real key in `.env` and restart the server.
- **Quota/model error:** check your API billing and whether your API account can use the selected model.
- **Incomplete generated lesson:** retry or choose a more capable model; invalid partial lessons are rejected.
- **Standalone file cannot generate:** use the server URL for GPT. The standalone edition still runs the built-in lesson.

Independent educational companion; not affiliated with LeetCode.

