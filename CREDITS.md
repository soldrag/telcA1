# Credits

This simulator stands on the work of many people. Thank you to every author below.
Each source is listed with its author, license and link; new sources are added in the same commit that introduces them.

## Language data

| Source | Author | License | Used for |
|---|---|---|---|
| [german-nouns](https://github.com/gambolputty/german-nouns) (commit `da71a2b`) | Gregor Weichbrodt | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Genders, plurals and case forms of German nouns |
| [Wiktionary (de)](https://de.wiktionary.org) — the data german-nouns is compiled from | Wiktionary contributors | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | |
| [Snowball German stemmer](https://snowballstem.org/algorithms/german/stemmer.html), via [@orama/stemmers](https://github.com/oramasearch/orama) | Martin Porter, Richard Boulton; Orama (Michele Riva) | BSD-3-Clause (algorithm); Apache-2.0 (package) | Word stems for keyword matching |

`src/services/schreiben/linguistic/data/germanNouns.tsv` is generated from german-nouns by
`scripts/lexicon/buildGermanNouns.mjs` (selected columns, compact form notation). As an adaptation of CC BY-SA
data, this file is itself licensed under **CC BY-SA 4.0**. The rest of the project is MIT-licensed (see `LICENSE`).

## Models

| Model | Author | License | Used for |
|---|---|---|---|
| [EmbeddingGemma 300M (ONNX)](https://huggingface.co/onnx-community/embeddinggemma-300m-ONNX) | Google; ONNX conversion by the onnx-community | [Gemma Terms of Use](https://ai.google.dev/gemma/terms) | Sentence embeddings for the in-browser ranker (downloaded at run time, not part of the repository) |

## Libraries (in the app)

| Library | Author | License |
|---|---|---|
| [React](https://react.dev), React DOM | Meta and contributors | MIT |
| [Transformers.js](https://github.com/huggingface/transformers.js) | Hugging Face | Apache-2.0 |
| [ONNX Runtime Web](https://github.com/microsoft/onnxruntime) | Microsoft | MIT |
| [Lucide](https://lucide.dev) | Eric Fennis and contributors | ISC |
| [node-qrcode](https://github.com/soldair/node-qrcode) | Ryan Day | MIT |
| [@orama/stemmers](https://github.com/oramasearch/orama) | Orama | Apache-2.0 |

## Fonts

| Font | Author | License |
|---|---|---|
| [Inter](https://rsms.me/inter/) | Rasmus Andersson | SIL Open Font License 1.1 |
| [JetBrains Mono](https://www.jetbrains.com/lp/mono/) | JetBrains | SIL Open Font License 1.1 |

## Optional server and tooling

| Tool | Author | License |
|---|---|---|
| [Express](https://expressjs.com), [compression](https://github.com/expressjs/compression), [cors](https://github.com/expressjs/cors) | TJ Holowaychuk, Troy Goode and the Express contributors | MIT |
| [Vite](https://vite.dev), [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) | Evan You and contributors | MIT |
| [Tailwind CSS](https://tailwindcss.com) | Tailwind Labs | MIT |
| [PostCSS](https://postcss.org), [Autoprefixer](https://github.com/postcss/autoprefixer) | Andrey Sitnik | MIT |
| [Terser](https://terser.org) | Mihai Bazon and contributors | BSD-2-Clause |
| [vite-plugin-compression2](https://github.com/nonzzz/vite-plugin-compression) | Kanno | MIT |
| [concurrently](https://github.com/open-cli-tools/concurrently) | Kimmo Brunfeldt | MIT |
