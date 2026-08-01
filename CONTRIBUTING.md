# Contributing

Thanks for your interest in improving Shortcuts extender.

## Before you start

Please open an issue first for large changes, behavior changes, or new commands. This helps avoid duplicate work and makes it easier to agree on expected behavior before implementation.

## Development setup

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run a type check:
   ```bash
   npm run check
   ```
4. Build the plugin:
   ```bash
   npm run build
   ```

## Project goals

This plugin should stay small and focused. Priority should be given to:
- editor commands that are still useful in current Obsidian versions;
- behavior that works well with user-assigned hotkeys in Obsidian settings;
- predictable text editing behavior for single-line and multi-line selections;
- compatibility with markdown writing in non-Latin keyboard layouts.

## Code style

- Prefer simple TypeScript over abstract patterns.
- Keep command behavior explicit and easy to read.
- Add comments when behavior is not obvious.
- Avoid deprecated Obsidian APIs when there is a modern replacement.
- Do not add default hotkeys unless there is a strong reason.

## Pull requests

When submitting a pull request:
- explain what user-facing behavior changed;
- mention any edge cases you tested;
- keep unrelated refactors out of the same PR;
- update README.md if commands or behavior changed.

## Release notes

Community Plugin release assets should only include files supported by Obsidian releases, such as `main.js` and `manifest.json` (and `styles.css` if used).
