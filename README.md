# Shortcuts extender

Version 3.0.0 modernizes the plugin structure and keeps the plugin focused on editor commands that are still useful in current Obsidian versions. Hotkeys are no longer forced by default for most commands, because Obsidian already lets users assign them in Settings -> Hotkeys.

## What the plugin does

This plugin adds editor commands for:
- inserting special symbols without switching keyboard layout;
- wrapping selections with common markdown pairs;
- toggling blockquotes, bullet lists, and code blocks;
- changing heading depth for the current line or selected lines;
- toggling selection case;
- inserting French quotes `«»` or wrapping selected text with them.

## Heading commands

The heading commands use the current 3.0.0 logic:
- `Increase heading level` reduces the number of `#`, so `######` -> `#####` -> ... -> `#` -> plain text;
- `Decrease heading level` increases the number of `#`, so `#` -> `##` -> ... -> `######` -> plain text;
- plain text becomes `######` for Increase and `#` for Decrease;
- lines that start with markdown list markers, checkbox markers, ordered-list markers such as `1.` or `2)`, or other special symbols are left unchanged.

## Typographic commands

The plugin includes commands for:
- `–` and `—`;
- `«»` with pair insertion when nothing is selected;
- square, curly, and angle bracket helpers;
- inline code and fenced code block helpers.

## Hotkeys

This release intentionally avoids shipping most default hotkeys. Assign the commands you want in Obsidian under `Settings -> Hotkeys`.

## Manual installation

1. Open your vault folder.
2. Go to `.obsidian/plugins/shortcuts-extender/`.
3. Put `manifest.json` and `main.js` there.
4. Reload Obsidian and enable the plugin.

## Development

```bash
npm install
npm run check
npm run build
```

## Notes for release

For Community Plugins releases, the release asset should contain only `manifest.json`, `main.js`, and `styles.css` if the plugin uses styles. This plugin currently does not require `styles.css`.
