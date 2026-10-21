'use strict';

var obsidian = require('obsidian');

const SIMPLE_TEXT_COMMANDS = [
    { id: "insert-exclamation-mark", name: "Insert !", insert: "!" },
    { id: "insert-at-sign", name: "Insert @", insert: "@" },
    { id: "insert-hash-sign", name: "Insert #", insert: "#" },
    { id: "insert-dollar-sign", name: "Insert $", insert: "$" },
    { id: "insert-percent-sign", name: "Insert %", insert: "%" },
    { id: "insert-caret-sign", name: "Insert ^", insert: "^" },
    { id: "insert-ampersand", name: "Insert &", insert: "&" },
    { id: "insert-right-angle-bracket", name: "Insert >", insert: ">" },
    { id: "insert-right-square-bracket", name: "Insert ]", insert: "]" },
    { id: "insert-right-curly-bracket", name: "Insert }", insert: "}" },
    { id: "insert-vertical-line", name: "Insert |", insert: "|" },
    { id: "insert-left-angle-bracket", name: "Insert <", insert: "<" },
    { id: "insert-en-dash", name: "Insert –", insert: "–" },
    { id: "insert-em-dash", name: "Insert —", insert: "—" },
    {
        id: "wrap-selection-with-angle-brackets",
        name: "Wrap selection with <>",
        insert: "<",
        wrapWith: { opening: "<", closing: ">" },
    },
    {
        id: "insert-or-wrap-double-brackets",
        name: "Insert [ or wrap selection with [[ ]]",
        insert: "[",
        wrapWith: { opening: "[[", closing: "]]" },
    },
    {
        id: "insert-or-wrap-curly-braces",
        name: "Insert { or wrap selection with {}",
        insert: "{",
        wrapWith: { opening: "{", closing: "}" },
    },
];
// Hotkeys, которые были назначены по умолчанию в версии 2.x.
//
// В 3.0.0 default hotkeys больше не назначаются автоматически, а id команд
// поменялись. Кнопка в настройках плагина назначает эти сочетания по запросу
// пользователя. Ключ — id команды плагина (без префикса), либо полный id
// команды ядра, если 3.0.0 убрал свою команду в пользу встроенной
// (например, заголовки 1-6 и удаление заголовка).
const LEGACY_DEFAULT_HOTKEYS = [
    { commandId: "insert-exclamation-mark", hotkeys: [{ modifiers: ["Alt"], key: "1" }] },
    { commandId: "insert-at-sign", hotkeys: [{ modifiers: ["Alt"], key: "2" }] },
    { commandId: "insert-hash-sign", hotkeys: [{ modifiers: ["Alt"], key: "3" }] },
    { commandId: "insert-dollar-sign", hotkeys: [{ modifiers: ["Alt"], key: "4" }] },
    { commandId: "insert-percent-sign", hotkeys: [{ modifiers: ["Alt"], key: "5" }] },
    { commandId: "insert-caret-sign", hotkeys: [{ modifiers: ["Alt"], key: "6" }] },
    { commandId: "insert-ampersand", hotkeys: [{ modifiers: ["Alt"], key: "7" }] },
    {
        commandId: "wrap-selection-with-angle-brackets",
        hotkeys: [
            { modifiers: ["Alt"], key: "б" },
            { modifiers: ["Alt"], key: "," },
        ],
    },
    {
        commandId: "insert-right-angle-bracket",
        hotkeys: [
            { modifiers: ["Alt"], key: "ю" },
            { modifiers: ["Alt"], key: "." },
        ],
    },
    {
        commandId: "insert-or-wrap-double-brackets",
        hotkeys: [
            { modifiers: ["Alt"], key: "х" },
            { modifiers: ["Alt"], key: "[" },
        ],
    },
    {
        commandId: "insert-right-square-bracket",
        hotkeys: [
            { modifiers: ["Alt"], key: "ъ" },
            { modifiers: ["Alt"], key: "]" },
        ],
    },
    {
        commandId: "insert-python-code-block",
        hotkeys: [
            { modifiers: ["Alt", "Shift"], key: "ё" },
            { modifiers: ["Alt", "Shift"], key: "~" },
        ],
    },
    {
        commandId: "insert-inline-code-or-wrap-selection",
        hotkeys: [
            { modifiers: ["Alt"], key: "ё" },
            { modifiers: ["Alt"], key: "`" },
        ],
    },
    { commandId: "toggle-code-block", hotkeys: [{ modifiers: ["Ctrl"], key: "`" }] },
    {
        commandId: "insert-or-wrap-curly-braces",
        hotkeys: [
            { modifiers: ["Alt", "Shift"], key: "х" },
            { modifiers: ["Alt", "Shift"], key: "{" },
        ],
    },
    {
        commandId: "insert-right-curly-bracket",
        hotkeys: [
            { modifiers: ["Alt", "Shift"], key: "ъ" },
            { modifiers: ["Alt", "Shift"], key: "}" },
        ],
    },
    {
        commandId: "insert-vertical-line",
        hotkeys: [
            { modifiers: ["Alt", "Shift"], key: "|" },
            { modifiers: ["Alt", "Shift"], key: "/" },
        ],
    },
    { commandId: "toggle-bullet-list-for-lines", hotkeys: [{ modifiers: ["Alt"], key: "-" }] },
    { commandId: "editor:set-heading-1", isCoreCommand: true, hotkeys: [{ modifiers: ["Ctrl"], key: "1" }] },
    { commandId: "editor:set-heading-2", isCoreCommand: true, hotkeys: [{ modifiers: ["Ctrl"], key: "2" }] },
    { commandId: "editor:set-heading-3", isCoreCommand: true, hotkeys: [{ modifiers: ["Ctrl"], key: "3" }] },
    { commandId: "editor:set-heading-4", isCoreCommand: true, hotkeys: [{ modifiers: ["Ctrl"], key: "4" }] },
    { commandId: "editor:set-heading-5", isCoreCommand: true, hotkeys: [{ modifiers: ["Ctrl"], key: "5" }] },
    { commandId: "editor:set-heading-6", isCoreCommand: true, hotkeys: [{ modifiers: ["Ctrl"], key: "6" }] },
    { commandId: "editor:set-heading-0", isCoreCommand: true, hotkeys: [{ modifiers: ["Ctrl"], key: "0" }] },
];
class ShortcutsExtenderPlugin extends obsidian.Plugin {
    onload() {
        this.registerSimpleTextCommands();
        this.registerAdvancedCommands();
        this.addSettingTab(new ShortcutsExtenderSettingTab(this.app, this));
    }
    // Назначает default hotkeys версии 2.x, ничего не перезаписывая:
    // - команда, у которой уже есть hotkey (свой или по умолчанию), пропускается;
    // - сочетание, которое уже занято другой командой, пропускается.
    // В конце показывает Notice со списком назначенного и пропущенного.
    async assignLegacyDefaultHotkeys() {
        var _a, _b;
        const { hotkeyManager, commands } = this.app;
        const getEffectiveHotkeys = (commandId) => { var _a, _b; return (_b = (_a = hotkeyManager.customKeys[commandId]) !== null && _a !== void 0 ? _a : hotkeyManager.defaultKeys[commandId]) !== null && _b !== void 0 ? _b : []; };
        // Какая команда сейчас занимает каждое сочетание клавиш.
        const commandIdByHotkey = new Map();
        const boundCommandIds = new Set([
            ...Object.keys(hotkeyManager.defaultKeys),
            ...Object.keys(hotkeyManager.customKeys),
        ]);
        for (const commandId of boundCommandIds) {
            for (const hotkey of getEffectiveHotkeys(commandId)) {
                commandIdByHotkey.set(this.getHotkeyKey(hotkey), commandId);
            }
        }
        const assigned = [];
        const skipped = [];
        for (const definition of LEGACY_DEFAULT_HOTKEYS) {
            const commandId = definition.isCoreCommand
                ? definition.commandId
                : `${this.manifest.id}:${definition.commandId}`;
            const command = commands.commands[commandId];
            if (!command) {
                skipped.push(`${commandId}: command not found`);
                continue;
            }
            if (getEffectiveHotkeys(commandId).length > 0) {
                skipped.push(`${command.name}: already has a hotkey`);
                continue;
            }
            const hotkeysToAssign = [];
            for (const hotkey of definition.hotkeys) {
                const conflictingCommandId = commandIdByHotkey.get(this.getHotkeyKey(hotkey));
                if (conflictingCommandId) {
                    const conflictingName = (_b = (_a = commands.commands[conflictingCommandId]) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : conflictingCommandId;
                    skipped.push(`${command.name}: ${this.formatHotkey(hotkey)} is used by "${conflictingName}"`);
                    continue;
                }
                hotkeysToAssign.push(hotkey);
                commandIdByHotkey.set(this.getHotkeyKey(hotkey), commandId);
            }
            if (hotkeysToAssign.length > 0) {
                hotkeyManager.setHotkeys(commandId, hotkeysToAssign);
                assigned.push(`${command.name}: ${hotkeysToAssign.map((hotkey) => this.formatHotkey(hotkey)).join(", ")}`);
            }
        }
        if (assigned.length > 0) {
            await hotkeyManager.save();
        }
        new obsidian.Notice(createFragment((fragment) => {
            fragment.createDiv({ text: `Assigned ${assigned.length} hotkey(s), skipped ${skipped.length}.` });
            for (const line of assigned) {
                fragment.createDiv({ text: `+ ${line}` });
            }
            for (const line of skipped) {
                fragment.createDiv({ text: `- ${line}` });
            }
        }), 0);
    }
    // Нормализованная строка сочетания для сравнения: "Mod" означает Cmd на macOS
    // и Ctrl на остальных платформах, порядок модификаторов и регистр клавиши не важны.
    getHotkeyKey(hotkey) {
        const modifiers = hotkey.modifiers
            .map((modifier) => (modifier === "Mod" ? (obsidian.Platform.isMacOS ? "Meta" : "Ctrl") : modifier))
            .sort();
        return [...modifiers, hotkey.key.toLowerCase()].join("+");
    }
    formatHotkey(hotkey) {
        return [...hotkey.modifiers, hotkey.key].join("+");
    }
    registerSimpleTextCommands() {
        for (const command of SIMPLE_TEXT_COMMANDS) {
            this.addCommand({
                id: command.id,
                name: command.name,
                hotkeys: command.hotkeys,
                editorCallback: (editor) => {
                    if (command.wrapWith && editor.somethingSelected()) {
                        this.wrapSelection(editor, command.wrapWith.opening, command.wrapWith.closing);
                        return;
                    }
                    editor.replaceSelection(command.insert);
                },
            });
        }
    }
    registerAdvancedCommands() {
        this.addCommand({
            id: "insert-inline-code-or-wrap-selection",
            name: "Insert ` or wrap selection with inline code",
            editorCallback: (editor) => {
                if (editor.somethingSelected()) {
                    this.wrapSelection(editor, "`", "`");
                }
                else {
                    editor.replaceSelection("`");
                }
            },
        });
        this.addCommand({
            id: "insert-python-code-block",
            name: "Insert Python code block",
            editorCallback: (editor) => {
                const selectedText = editor.getSelection();
                if (selectedText) {
                    editor.replaceSelection(["```py", selectedText, "```"].join("\n"));
                }
                else {
                    editor.replaceSelection("```py\n\n```");
                    const cursor = editor.getCursor();
                    editor.setCursor({ line: cursor.line - 1, ch: 0 });
                }
            },
        });
        this.addCommand({
            id: "toggle-code-block",
            name: "Toggle code block",
            editorCallback: (editor) => this.toggleCodeBlock(editor),
        });
        this.addCommand({
            id: "toggle-blockquote-for-lines",
            name: "Toggle blockquote for selected lines or insert > on empty line",
            editorCallback: (editor) => this.toggleBlockquoteOrInsert(editor),
        });
        this.addCommand({
            id: "toggle-bullet-list-for-lines",
            name: "Toggle bullet list for selected lines",
            editorCallback: (editor) => this.togglePrefixForLines(editor, /^-\s+/, "- "),
        });
        this.addCommand({
            id: "toggle-selection-case",
            name: "Toggle selection case",
            editorCallback: (editor) => this.toggleSelectionCase(editor),
        });
        this.addCommand({
            id: "increase-heading-level",
            name: "Increase heading level",
            editorCallback: (editor) => this.changeHeadingLevel(editor, 1),
        });
        this.addCommand({
            id: "decrease-heading-level",
            name: "Decrease heading level",
            editorCallback: (editor) => this.changeHeadingLevel(editor, -1),
        });
        this.addCommand({
            id: "insert-or-wrap-french-quotes",
            name: "Insert «» or wrap selection with «»",
            editorCallback: (editor) => this.insertOrWrapFrenchQuotes(editor),
        });
    }
    wrapSelection(editor, opening, closing) {
        const selectedText = editor.getSelection();
        editor.replaceSelection(`${opening}${selectedText}${closing}`);
    }
    getLineRange(editor) {
        if (editor.somethingSelected()) {
            const from = editor.getCursor("from");
            const to = editor.getCursor("to");
            return {
                start: { line: from.line, ch: 0 },
                end: { line: to.line, ch: editor.getLine(to.line).length },
                content: editor.getRange({ line: from.line, ch: 0 }, { line: to.line, ch: editor.getLine(to.line).length }),
            };
        }
        const line = editor.getCursor().line;
        const content = editor.getLine(line);
        return {
            start: { line, ch: 0 },
            end: { line, ch: content.length },
            content,
        };
    }
    toggleBlockquoteOrInsert(editor) {
        if (!editor.somethingSelected()) {
            const cursor = editor.getCursor();
            const currentLine = editor.getLine(cursor.line);
            if (currentLine.trim().length === 0) {
                editor.replaceSelection("> ");
                return;
            }
        }
        this.togglePrefixForLines(editor, /^>\s?/, "> ");
    }
    togglePrefixForLines(editor, prefixPattern, prefixToAdd) {
        const range = this.getLineRange(editor);
        const lines = range.content.split("\n");
        const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
        const shouldRemove = nonEmptyLines.length > 0 && nonEmptyLines.every((line) => prefixPattern.test(line));
        const nextLines = lines.map((line) => {
            if (line.trim().length === 0) {
                return line;
            }
            if (shouldRemove) {
                return line.replace(prefixPattern, "");
            }
            return `${prefixToAdd}${line}`;
        });
        editor.replaceRange(nextLines.join("\n"), range.start, range.end);
    }
    toggleCodeBlock(editor) {
        const selectedText = editor.getSelection();
        if (!selectedText) {
            const cursor = editor.getCursor();
            editor.replaceSelection("```\n\n```");
            editor.setCursor({ line: cursor.line + 1, ch: 0 });
            return;
        }
        const trimmed = selectedText.trim();
        const isWrapped = trimmed.startsWith("```") && trimmed.endsWith("```");
        if (isWrapped) {
            const withoutStartFence = trimmed.replace(/^```[a-zA-Z0-9_-]*\n?/, "");
            const unwrapped = withoutStartFence.replace(/\n?```$/, "");
            editor.replaceSelection(unwrapped);
            return;
        }
        editor.replaceSelection(["```", selectedText, "```"].join("\n"));
    }
    toggleSelectionCase(editor) {
        const selectedText = editor.getSelection();
        if (!selectedText) {
            return;
        }
        const hasLowercase = selectedText !== selectedText.toUpperCase();
        const nextText = hasLowercase ? selectedText.toUpperCase() : selectedText.toLowerCase();
        editor.replaceSelection(nextText);
    }
    // Меняет уровень markdown-heading в текущей строке или во всём выделенном блоке.
    //
    // Актуальная логика такая:
    // - если строка начинается со спецсимвола, markdown-маркера списка/чекбокса
    //   или с номера списка (например `1. ` / `1) `), она не меняется;
    // - если строка пустая или начинается с обычного текста,
    //   Increase heading level делает heading 6 уровня,
    //   а Decrease heading level делает heading 1 уровня;
    // - если строка уже является heading, то Increase heading level
    //   уменьшает количество # (###### -> ##### -> ... -> # -> обычный текст);
    // - Decrease heading level работает наоборот и увеличивает количество #
    //   (# -> ## -> ... -> ###### -> обычный текст).
    changeHeadingLevel(editor, delta) {
        const range = this.getLineRange(editor);
        const lines = range.content.split("\n");
        const nextLines = lines.map((line) => this.changeHeadingLevelForLine(line, delta));
        editor.replaceRange(nextLines.join("\n"), range.start, range.end);
    }
    changeHeadingLevelForLine(line, delta) {
        const headingMatch = line.match(/^(\s*)(#{1,6})\s+(.*)$/);
        if (headingMatch) {
            const [, indent, hashes, content] = headingMatch;
            const currentLevel = hashes.length;
            // Increase heading level = визуально сделать заголовок более "крупным",
            // то есть уменьшить глубину и УМЕНЬШИТЬ количество #.
            if (delta === 1) {
                if (currentLevel === 1) {
                    return `${indent}${content}`;
                }
                return `${indent}${"#".repeat(currentLevel - 1)} ${content}`;
            }
            // Decrease heading level = сделать заголовок более "глубоким",
            // то есть увеличить глубину и ДОБАВИТЬ #.
            // Особый случай: H6 по следующему нажатию превращается в обычный текст.
            if (currentLevel === 6) {
                return `${indent}${content}`;
            }
            return `${indent}${"#".repeat(currentLevel + 1)} ${content}`;
        }
        const blankOrPlainTextMatch = line.match(/^(\s*)(.*)$/);
        if (!blankOrPlainTextMatch) {
            return line;
        }
        const [, indent, content] = blankOrPlainTextMatch;
        const trimmed = content.trim();
        if (trimmed.length === 0) {
            return delta === 1 ? `${indent}###### ` : `${indent}# `;
        }
        // Не создаём heading поверх markdown-списков и checkbox-строк.
        // Сюда же относим строки, начинающиеся с других спецсимволов.
        if (this.isProtectedNonHeadingLine(trimmed)) {
            return line;
        }
        return delta === 1 ? `${indent}###### ${trimmed}` : `${indent}# ${trimmed}`;
    }
    // Возвращает true для строк, которые нельзя автоматически превращать в heading.
    //
    // Защищаем:
    // - bullet list: `- item`, `* item`, `+ item`;
    // - checkbox: `- [ ] task`, `- [x] task`;
    // - ordered list: `1. item`, `2) item`;
    // - строки, начинающиеся с других спецсимволов.
    //
    // Но обычные строки, начинающиеся с цифр ВНУТРИ текста, не блокируем.
    // Например `2025 report` можно превратить в heading, а `1. report` — нет.
    isProtectedNonHeadingLine(trimmedLine) {
        if (/^[-*+]\s+\[[ xX]\]\s+/.test(trimmedLine)) {
            return true;
        }
        if (/^[-*+]\s+/.test(trimmedLine)) {
            return true;
        }
        if (/^\d+[.)]\s+/.test(trimmedLine)) {
            return true;
        }
        return /^[^\p{L}\p{N}]/u.test(trimmedLine);
    }
    insertOrWrapFrenchQuotes(editor) {
        if (editor.somethingSelected()) {
            this.wrapSelection(editor, "«", "»");
            return;
        }
        const cursor = editor.getCursor();
        editor.replaceSelection("«»");
        editor.setCursor({ line: cursor.line, ch: cursor.ch + 1 });
    }
}
class ShortcutsExtenderSettingTab extends obsidian.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        const { containerEl } = this;
        containerEl.empty();
        new obsidian.Setting(containerEl)
            .setName("Assign default hotkeys")
            .setDesc("Assigns the hotkeys that version 2.x set by default, such as Alt+1..7 for symbols and Ctrl+0..6 for headings. " +
            "Commands that already have a hotkey and key combinations already used by another command are skipped.")
            .addButton((button) => button
            .setButtonText("Assign default hotkeys")
            .setCta()
            .onClick(() => this.plugin.assignLegacyDefaultHotkeys()));
    }
}

module.exports = ShortcutsExtenderPlugin;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsibWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHAsIENvbW1hbmQsIEVkaXRvciwgSG90a2V5LCBOb3RpY2UsIFBsYXRmb3JtLCBQbHVnaW4sIFBsdWdpblNldHRpbmdUYWIsIFNldHRpbmcgfSBmcm9tIFwib2JzaWRpYW5cIjtcclxuXHJcbi8vINCf0L7Qu9C90YvQuSDQtNC40LDQv9Cw0LfQvtC9INGB0YLRgNC+0LosINGBINC60L7RgtC+0YDRi9C8INGA0LDQsdC+0YLQsNGO0YIg0LzQvdC+0LPQvtGB0YLRgNC+0YfQvdGL0LUg0LrQvtC80LDQvdC00YsuXHJcbi8vXHJcbi8vINCX0LDRh9C10Lwg0Y3RgtC+INC90YPQttC90L46XHJcbi8vIC0g0LzQvdC+0LPQuNC1IG1hcmtkb3duLdC60L7QvNCw0L3QtNGLINC70L7Qs9C40YfQvdC10LUg0L/RgNC40LzQtdC90Y/RgtGMINC90LUg0Log0L7RgtC00LXQu9GM0L3Ri9C8INGB0LjQvNCy0L7Qu9Cw0LwsXHJcbi8vICAg0LAg0Log0YHRgtGA0L7QutCw0Lwg0YbQtdC70LjQutC+0Lw7XHJcbi8vIC0g0LXRgdC70Lgg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GMINCy0YvQtNC10LvQuNC7INC90LXRgdC60L7Qu9GM0LrQviDRgdGC0YDQvtC6LCDQvdCw0Lwg0YPQtNC+0LHQvdC+INC+0LTQuNC9INGA0LDQtyDQv9C+0LvRg9GH0LjRgtGMXHJcbi8vICAg0LTQuNCw0L/QsNC30L7QvSBcItC+0YIg0L3QsNGH0LDQu9CwINC/0LXRgNCy0L7QuSDRgdGC0YDQvtC60Lgg0LTQviDQutC+0L3RhtCwINC/0L7RgdC70LXQtNC90LXQuVwiLCDQsCDQtNCw0LvRjNGI0LUg0YPQttC1XHJcbi8vICAg0YDQsNCx0L7RgtCw0YLRjCDRgSDRjdGC0LjQvCDQtNC40LDQv9Cw0LfQvtC90L7QvCDQutCw0Log0YEg0LXQtNC40L3Ri9C8INCx0LvQvtC60L7QvCDRgtC10LrRgdGC0LAuXHJcbnR5cGUgTGluZVJhbmdlID0ge1xyXG5cdHN0YXJ0OiB7IGxpbmU6IG51bWJlcjsgY2g6IG51bWJlciB9O1xyXG5cdGVuZDogeyBsaW5lOiBudW1iZXI7IGNoOiBudW1iZXIgfTtcclxuXHRjb250ZW50OiBzdHJpbmc7XHJcbn07XHJcblxyXG4vLyDQntC/0LjRgdCw0L3QuNC1INC/0YDQvtGB0YLQvtC5INGC0LXQutGB0YLQvtCy0L7QuSDQutC+0LzQsNC90LTRiy5cclxuLy9cclxuLy8gaW5zZXJ0OlxyXG4vLyAgINGC0LXQutGB0YIsINC60L7RgtC+0YDRi9C5INCy0YHRgtCw0LLQu9GP0LXRgtGB0Y8sINC10YHQu9C4INC90LjRh9C10LPQviDQvdC1INCy0YvQtNC10LvQtdC90L4uXHJcbi8vXHJcbi8vIHdyYXBXaXRoOlxyXG4vLyAgINC/0LDRgNCwIG9wZW5pbmcvY2xvc2luZywg0LrQvtGC0L7RgNCw0Y8g0LjRgdC/0L7Qu9GM0LfRg9C10YLRgdGPLCDQtdGB0LvQuCDRgtC10LrRgdGCINCy0YvQtNC10LvQtdC9LlxyXG4vL1xyXG4vLyBob3RrZXlzOlxyXG4vLyAgINC90LXQvtCx0Y/Qt9Cw0YLQtdC70YzQvdGL0LUgZGVmYXVsdCBob3RrZXlzINC00LvRjyDQutC+0LzQsNC90LTRiy5cclxudHlwZSBUZXh0Q29tbWFuZERlZmluaXRpb24gPSB7XHJcblx0aWQ6IHN0cmluZztcclxuXHRuYW1lOiBzdHJpbmc7XHJcblx0aW5zZXJ0OiBzdHJpbmc7XHJcblx0d3JhcFdpdGg/OiB7IG9wZW5pbmc6IHN0cmluZzsgY2xvc2luZzogc3RyaW5nIH07XHJcblx0aG90a2V5cz86IEhvdGtleVtdO1xyXG59O1xyXG5cclxuY29uc3QgU0lNUExFX1RFWFRfQ09NTUFORFM6IFRleHRDb21tYW5kRGVmaW5pdGlvbltdID0gW1xyXG5cdHsgaWQ6IFwiaW5zZXJ0LWV4Y2xhbWF0aW9uLW1hcmtcIiwgbmFtZTogXCJJbnNlcnQgIVwiLCBpbnNlcnQ6IFwiIVwiIH0sXHJcblx0eyBpZDogXCJpbnNlcnQtYXQtc2lnblwiLCBuYW1lOiBcIkluc2VydCBAXCIsIGluc2VydDogXCJAXCIgfSxcclxuXHR7IGlkOiBcImluc2VydC1oYXNoLXNpZ25cIiwgbmFtZTogXCJJbnNlcnQgI1wiLCBpbnNlcnQ6IFwiI1wiIH0sXHJcblx0eyBpZDogXCJpbnNlcnQtZG9sbGFyLXNpZ25cIiwgbmFtZTogXCJJbnNlcnQgJFwiLCBpbnNlcnQ6IFwiJFwiIH0sXHJcblx0eyBpZDogXCJpbnNlcnQtcGVyY2VudC1zaWduXCIsIG5hbWU6IFwiSW5zZXJ0ICVcIiwgaW5zZXJ0OiBcIiVcIiB9LFxyXG5cdHsgaWQ6IFwiaW5zZXJ0LWNhcmV0LXNpZ25cIiwgbmFtZTogXCJJbnNlcnQgXlwiLCBpbnNlcnQ6IFwiXlwiIH0sXHJcblx0eyBpZDogXCJpbnNlcnQtYW1wZXJzYW5kXCIsIG5hbWU6IFwiSW5zZXJ0ICZcIiwgaW5zZXJ0OiBcIiZcIiB9LFxyXG5cdHsgaWQ6IFwiaW5zZXJ0LXJpZ2h0LWFuZ2xlLWJyYWNrZXRcIiwgbmFtZTogXCJJbnNlcnQgPlwiLCBpbnNlcnQ6IFwiPlwiIH0sXHJcblx0eyBpZDogXCJpbnNlcnQtcmlnaHQtc3F1YXJlLWJyYWNrZXRcIiwgbmFtZTogXCJJbnNlcnQgXVwiLCBpbnNlcnQ6IFwiXVwiIH0sXHJcblx0eyBpZDogXCJpbnNlcnQtcmlnaHQtY3VybHktYnJhY2tldFwiLCBuYW1lOiBcIkluc2VydCB9XCIsIGluc2VydDogXCJ9XCIgfSxcclxuXHR7IGlkOiBcImluc2VydC12ZXJ0aWNhbC1saW5lXCIsIG5hbWU6IFwiSW5zZXJ0IHxcIiwgaW5zZXJ0OiBcInxcIiB9LFxyXG5cdHsgaWQ6IFwiaW5zZXJ0LWxlZnQtYW5nbGUtYnJhY2tldFwiLCBuYW1lOiBcIkluc2VydCA8XCIsIGluc2VydDogXCI8XCIgfSxcclxuXHR7IGlkOiBcImluc2VydC1lbi1kYXNoXCIsIG5hbWU6IFwiSW5zZXJ0IOKAk1wiLCBpbnNlcnQ6IFwi4oCTXCIgfSxcclxuXHR7IGlkOiBcImluc2VydC1lbS1kYXNoXCIsIG5hbWU6IFwiSW5zZXJ0IOKAlFwiLCBpbnNlcnQ6IFwi4oCUXCIgfSxcclxuXHR7XHJcblx0XHRpZDogXCJ3cmFwLXNlbGVjdGlvbi13aXRoLWFuZ2xlLWJyYWNrZXRzXCIsXHJcblx0XHRuYW1lOiBcIldyYXAgc2VsZWN0aW9uIHdpdGggPD5cIixcclxuXHRcdGluc2VydDogXCI8XCIsXHJcblx0XHR3cmFwV2l0aDogeyBvcGVuaW5nOiBcIjxcIiwgY2xvc2luZzogXCI+XCIgfSxcclxuXHR9LFxyXG5cdHtcclxuXHRcdGlkOiBcImluc2VydC1vci13cmFwLWRvdWJsZS1icmFja2V0c1wiLFxyXG5cdFx0bmFtZTogXCJJbnNlcnQgWyBvciB3cmFwIHNlbGVjdGlvbiB3aXRoIFtbIF1dXCIsXHJcblx0XHRpbnNlcnQ6IFwiW1wiLFxyXG5cdFx0d3JhcFdpdGg6IHsgb3BlbmluZzogXCJbW1wiLCBjbG9zaW5nOiBcIl1dXCIgfSxcclxuXHR9LFxyXG5cdHtcclxuXHRcdGlkOiBcImluc2VydC1vci13cmFwLWN1cmx5LWJyYWNlc1wiLFxyXG5cdFx0bmFtZTogXCJJbnNlcnQgeyBvciB3cmFwIHNlbGVjdGlvbiB3aXRoIHt9XCIsXHJcblx0XHRpbnNlcnQ6IFwie1wiLFxyXG5cdFx0d3JhcFdpdGg6IHsgb3BlbmluZzogXCJ7XCIsIGNsb3Npbmc6IFwifVwiIH0sXHJcblx0fSxcclxuXTtcclxuXHJcbi8vIEhvdGtleXMsINC60L7RgtC+0YDRi9C1INCx0YvQu9C4INC90LDQt9C90LDRh9C10L3RiyDQv9C+INGD0LzQvtC70YfQsNC90LjRjiDQsiDQstC10YDRgdC40LggMi54LlxyXG4vL1xyXG4vLyDQkiAzLjAuMCBkZWZhdWx0IGhvdGtleXMg0LHQvtC70YzRiNC1INC90LUg0L3QsNC30L3QsNGH0LDRjtGC0YHRjyDQsNCy0YLQvtC80LDRgtC40YfQtdGB0LrQuCwg0LAgaWQg0LrQvtC80LDQvdC0XHJcbi8vINC/0L7QvNC10L3Rj9C70LjRgdGMLiDQmtC90L7Qv9C60LAg0LIg0L3QsNGB0YLRgNC+0LnQutCw0YUg0L/Qu9Cw0LPQuNC90LAg0L3QsNC30L3QsNGH0LDQtdGCINGN0YLQuCDRgdC+0YfQtdGC0LDQvdC40Y8g0L/QviDQt9Cw0L/RgNC+0YHRg1xyXG4vLyDQv9C+0LvRjNC30L7QstCw0YLQtdC70Y8uINCa0LvRjtGHIOKAlCBpZCDQutC+0LzQsNC90LTRiyDQv9C70LDQs9C40L3QsCAo0LHQtdC3INC/0YDQtdGE0LjQutGB0LApLCDQu9C40LHQviDQv9C+0LvQvdGL0LkgaWRcclxuLy8g0LrQvtC80LDQvdC00Ysg0Y/QtNGA0LAsINC10YHQu9C4IDMuMC4wINGD0LHRgNCw0Lsg0YHQstC+0Y4g0LrQvtC80LDQvdC00YMg0LIg0L/QvtC70YzQt9GDINCy0YHRgtGA0L7QtdC90L3QvtC5XHJcbi8vICjQvdCw0L/RgNC40LzQtdGALCDQt9Cw0LPQvtC70L7QstC60LggMS02INC4INGD0LTQsNC70LXQvdC40LUg0LfQsNCz0L7Qu9C+0LLQutCwKS5cclxuY29uc3QgTEVHQUNZX0RFRkFVTFRfSE9US0VZUzogeyBjb21tYW5kSWQ6IHN0cmluZzsgaXNDb3JlQ29tbWFuZD86IGJvb2xlYW47IGhvdGtleXM6IEhvdGtleVtdIH1bXSA9IFtcclxuXHR7IGNvbW1hbmRJZDogXCJpbnNlcnQtZXhjbGFtYXRpb24tbWFya1wiLCBob3RrZXlzOiBbeyBtb2RpZmllcnM6IFtcIkFsdFwiXSwga2V5OiBcIjFcIiB9XSB9LFxyXG5cdHsgY29tbWFuZElkOiBcImluc2VydC1hdC1zaWduXCIsIGhvdGtleXM6IFt7IG1vZGlmaWVyczogW1wiQWx0XCJdLCBrZXk6IFwiMlwiIH1dIH0sXHJcblx0eyBjb21tYW5kSWQ6IFwiaW5zZXJ0LWhhc2gtc2lnblwiLCBob3RrZXlzOiBbeyBtb2RpZmllcnM6IFtcIkFsdFwiXSwga2V5OiBcIjNcIiB9XSB9LFxyXG5cdHsgY29tbWFuZElkOiBcImluc2VydC1kb2xsYXItc2lnblwiLCBob3RrZXlzOiBbeyBtb2RpZmllcnM6IFtcIkFsdFwiXSwga2V5OiBcIjRcIiB9XSB9LFxyXG5cdHsgY29tbWFuZElkOiBcImluc2VydC1wZXJjZW50LXNpZ25cIiwgaG90a2V5czogW3sgbW9kaWZpZXJzOiBbXCJBbHRcIl0sIGtleTogXCI1XCIgfV0gfSxcclxuXHR7IGNvbW1hbmRJZDogXCJpbnNlcnQtY2FyZXQtc2lnblwiLCBob3RrZXlzOiBbeyBtb2RpZmllcnM6IFtcIkFsdFwiXSwga2V5OiBcIjZcIiB9XSB9LFxyXG5cdHsgY29tbWFuZElkOiBcImluc2VydC1hbXBlcnNhbmRcIiwgaG90a2V5czogW3sgbW9kaWZpZXJzOiBbXCJBbHRcIl0sIGtleTogXCI3XCIgfV0gfSxcclxuXHR7XHJcblx0XHRjb21tYW5kSWQ6IFwid3JhcC1zZWxlY3Rpb24td2l0aC1hbmdsZS1icmFja2V0c1wiLFxyXG5cdFx0aG90a2V5czogW1xyXG5cdFx0XHR7IG1vZGlmaWVyczogW1wiQWx0XCJdLCBrZXk6IFwi0LFcIiB9LFxyXG5cdFx0XHR7IG1vZGlmaWVyczogW1wiQWx0XCJdLCBrZXk6IFwiLFwiIH0sXHJcblx0XHRdLFxyXG5cdH0sXHJcblx0e1xyXG5cdFx0Y29tbWFuZElkOiBcImluc2VydC1yaWdodC1hbmdsZS1icmFja2V0XCIsXHJcblx0XHRob3RrZXlzOiBbXHJcblx0XHRcdHsgbW9kaWZpZXJzOiBbXCJBbHRcIl0sIGtleTogXCLRjlwiIH0sXHJcblx0XHRcdHsgbW9kaWZpZXJzOiBbXCJBbHRcIl0sIGtleTogXCIuXCIgfSxcclxuXHRcdF0sXHJcblx0fSxcclxuXHR7XHJcblx0XHRjb21tYW5kSWQ6IFwiaW5zZXJ0LW9yLXdyYXAtZG91YmxlLWJyYWNrZXRzXCIsXHJcblx0XHRob3RrZXlzOiBbXHJcblx0XHRcdHsgbW9kaWZpZXJzOiBbXCJBbHRcIl0sIGtleTogXCLRhVwiIH0sXHJcblx0XHRcdHsgbW9kaWZpZXJzOiBbXCJBbHRcIl0sIGtleTogXCJbXCIgfSxcclxuXHRcdF0sXHJcblx0fSxcclxuXHR7XHJcblx0XHRjb21tYW5kSWQ6IFwiaW5zZXJ0LXJpZ2h0LXNxdWFyZS1icmFja2V0XCIsXHJcblx0XHRob3RrZXlzOiBbXHJcblx0XHRcdHsgbW9kaWZpZXJzOiBbXCJBbHRcIl0sIGtleTogXCLRilwiIH0sXHJcblx0XHRcdHsgbW9kaWZpZXJzOiBbXCJBbHRcIl0sIGtleTogXCJdXCIgfSxcclxuXHRcdF0sXHJcblx0fSxcclxuXHR7XHJcblx0XHRjb21tYW5kSWQ6IFwiaW5zZXJ0LXB5dGhvbi1jb2RlLWJsb2NrXCIsXHJcblx0XHRob3RrZXlzOiBbXHJcblx0XHRcdHsgbW9kaWZpZXJzOiBbXCJBbHRcIiwgXCJTaGlmdFwiXSwga2V5OiBcItGRXCIgfSxcclxuXHRcdFx0eyBtb2RpZmllcnM6IFtcIkFsdFwiLCBcIlNoaWZ0XCJdLCBrZXk6IFwiflwiIH0sXHJcblx0XHRdLFxyXG5cdH0sXHJcblx0e1xyXG5cdFx0Y29tbWFuZElkOiBcImluc2VydC1pbmxpbmUtY29kZS1vci13cmFwLXNlbGVjdGlvblwiLFxyXG5cdFx0aG90a2V5czogW1xyXG5cdFx0XHR7IG1vZGlmaWVyczogW1wiQWx0XCJdLCBrZXk6IFwi0ZFcIiB9LFxyXG5cdFx0XHR7IG1vZGlmaWVyczogW1wiQWx0XCJdLCBrZXk6IFwiYFwiIH0sXHJcblx0XHRdLFxyXG5cdH0sXHJcblx0eyBjb21tYW5kSWQ6IFwidG9nZ2xlLWNvZGUtYmxvY2tcIiwgaG90a2V5czogW3sgbW9kaWZpZXJzOiBbXCJDdHJsXCJdLCBrZXk6IFwiYFwiIH1dIH0sXHJcblx0e1xyXG5cdFx0Y29tbWFuZElkOiBcImluc2VydC1vci13cmFwLWN1cmx5LWJyYWNlc1wiLFxyXG5cdFx0aG90a2V5czogW1xyXG5cdFx0XHR7IG1vZGlmaWVyczogW1wiQWx0XCIsIFwiU2hpZnRcIl0sIGtleTogXCLRhVwiIH0sXHJcblx0XHRcdHsgbW9kaWZpZXJzOiBbXCJBbHRcIiwgXCJTaGlmdFwiXSwga2V5OiBcIntcIiB9LFxyXG5cdFx0XSxcclxuXHR9LFxyXG5cdHtcclxuXHRcdGNvbW1hbmRJZDogXCJpbnNlcnQtcmlnaHQtY3VybHktYnJhY2tldFwiLFxyXG5cdFx0aG90a2V5czogW1xyXG5cdFx0XHR7IG1vZGlmaWVyczogW1wiQWx0XCIsIFwiU2hpZnRcIl0sIGtleTogXCLRilwiIH0sXHJcblx0XHRcdHsgbW9kaWZpZXJzOiBbXCJBbHRcIiwgXCJTaGlmdFwiXSwga2V5OiBcIn1cIiB9LFxyXG5cdFx0XSxcclxuXHR9LFxyXG5cdHtcclxuXHRcdGNvbW1hbmRJZDogXCJpbnNlcnQtdmVydGljYWwtbGluZVwiLFxyXG5cdFx0aG90a2V5czogW1xyXG5cdFx0XHR7IG1vZGlmaWVyczogW1wiQWx0XCIsIFwiU2hpZnRcIl0sIGtleTogXCJ8XCIgfSxcclxuXHRcdFx0eyBtb2RpZmllcnM6IFtcIkFsdFwiLCBcIlNoaWZ0XCJdLCBrZXk6IFwiL1wiIH0sXHJcblx0XHRdLFxyXG5cdH0sXHJcblx0eyBjb21tYW5kSWQ6IFwidG9nZ2xlLWJ1bGxldC1saXN0LWZvci1saW5lc1wiLCBob3RrZXlzOiBbeyBtb2RpZmllcnM6IFtcIkFsdFwiXSwga2V5OiBcIi1cIiB9XSB9LFxyXG5cdHsgY29tbWFuZElkOiBcImVkaXRvcjpzZXQtaGVhZGluZy0xXCIsIGlzQ29yZUNvbW1hbmQ6IHRydWUsIGhvdGtleXM6IFt7IG1vZGlmaWVyczogW1wiQ3RybFwiXSwga2V5OiBcIjFcIiB9XSB9LFxyXG5cdHsgY29tbWFuZElkOiBcImVkaXRvcjpzZXQtaGVhZGluZy0yXCIsIGlzQ29yZUNvbW1hbmQ6IHRydWUsIGhvdGtleXM6IFt7IG1vZGlmaWVyczogW1wiQ3RybFwiXSwga2V5OiBcIjJcIiB9XSB9LFxyXG5cdHsgY29tbWFuZElkOiBcImVkaXRvcjpzZXQtaGVhZGluZy0zXCIsIGlzQ29yZUNvbW1hbmQ6IHRydWUsIGhvdGtleXM6IFt7IG1vZGlmaWVyczogW1wiQ3RybFwiXSwga2V5OiBcIjNcIiB9XSB9LFxyXG5cdHsgY29tbWFuZElkOiBcImVkaXRvcjpzZXQtaGVhZGluZy00XCIsIGlzQ29yZUNvbW1hbmQ6IHRydWUsIGhvdGtleXM6IFt7IG1vZGlmaWVyczogW1wiQ3RybFwiXSwga2V5OiBcIjRcIiB9XSB9LFxyXG5cdHsgY29tbWFuZElkOiBcImVkaXRvcjpzZXQtaGVhZGluZy01XCIsIGlzQ29yZUNvbW1hbmQ6IHRydWUsIGhvdGtleXM6IFt7IG1vZGlmaWVyczogW1wiQ3RybFwiXSwga2V5OiBcIjVcIiB9XSB9LFxyXG5cdHsgY29tbWFuZElkOiBcImVkaXRvcjpzZXQtaGVhZGluZy02XCIsIGlzQ29yZUNvbW1hbmQ6IHRydWUsIGhvdGtleXM6IFt7IG1vZGlmaWVyczogW1wiQ3RybFwiXSwga2V5OiBcIjZcIiB9XSB9LFxyXG5cdHsgY29tbWFuZElkOiBcImVkaXRvcjpzZXQtaGVhZGluZy0wXCIsIGlzQ29yZUNvbW1hbmQ6IHRydWUsIGhvdGtleXM6IFt7IG1vZGlmaWVyczogW1wiQ3RybFwiXSwga2V5OiBcIjBcIiB9XSB9LFxyXG5dO1xyXG5cclxuLy8g0JzQtdC90LXQtNC20LXRgCBob3RrZXlzINC4INGA0LXQtdGB0YLRgCDQutC+0LzQsNC90LQg0L3QtSDQstGF0L7QtNGP0YIg0LIg0L/Rg9Cx0LvQuNGH0L3Ri9C5IEFQSSBPYnNpZGlhbixcclxuLy8g0L/QvtGN0YLQvtC80YMg0L7Qv9C40YHRi9Cy0LDQtdC8INGC0L7Qu9GM0LrQviDRgtC+INC90LXQvNC90L7Qs9C+0LUsINGH0YLQviDQuNGB0L/QvtC70YzQt9GD0LXRgtGB0Y8g0L3QuNC20LUuXHJcbnR5cGUgSG90a2V5TWFuYWdlciA9IHtcclxuXHRjdXN0b21LZXlzOiBSZWNvcmQ8c3RyaW5nLCBIb3RrZXlbXT47XHJcblx0ZGVmYXVsdEtleXM6IFJlY29yZDxzdHJpbmcsIEhvdGtleVtdPjtcclxuXHRzZXRIb3RrZXlzKGNvbW1hbmRJZDogc3RyaW5nLCBob3RrZXlzOiBIb3RrZXlbXSk6IHZvaWQ7XHJcblx0c2F2ZSgpOiBQcm9taXNlPHZvaWQ+O1xyXG59O1xyXG5cclxudHlwZSBBcHBXaXRoSG90a2V5cyA9IEFwcCAmIHtcclxuXHRob3RrZXlNYW5hZ2VyOiBIb3RrZXlNYW5hZ2VyO1xyXG5cdGNvbW1hbmRzOiB7IGNvbW1hbmRzOiBSZWNvcmQ8c3RyaW5nLCBDb21tYW5kPiB9O1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2hvcnRjdXRzRXh0ZW5kZXJQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xyXG5cdG9ubG9hZCgpOiB2b2lkIHtcclxuXHRcdHRoaXMucmVnaXN0ZXJTaW1wbGVUZXh0Q29tbWFuZHMoKTtcclxuXHRcdHRoaXMucmVnaXN0ZXJBZHZhbmNlZENvbW1hbmRzKCk7XHJcblx0XHR0aGlzLmFkZFNldHRpbmdUYWIobmV3IFNob3J0Y3V0c0V4dGVuZGVyU2V0dGluZ1RhYih0aGlzLmFwcCwgdGhpcykpO1xyXG5cdH1cclxuXHJcblx0Ly8g0J3QsNC30L3QsNGH0LDQtdGCIGRlZmF1bHQgaG90a2V5cyDQstC10YDRgdC40LggMi54LCDQvdC40YfQtdCz0L4g0L3QtSDQv9C10YDQtdC30LDQv9C40YHRi9Cy0LDRjzpcclxuXHQvLyAtINC60L7QvNCw0L3QtNCwLCDRgyDQutC+0YLQvtGA0L7QuSDRg9C20LUg0LXRgdGC0YwgaG90a2V5ICjRgdCy0L7QuSDQuNC70Lgg0L/QviDRg9C80L7Qu9GH0LDQvdC40Y4pLCDQv9GA0L7Qv9GD0YHQutCw0LXRgtGB0Y87XHJcblx0Ly8gLSDRgdC+0YfQtdGC0LDQvdC40LUsINC60L7RgtC+0YDQvtC1INGD0LbQtSDQt9Cw0L3Rj9GC0L4g0LTRgNGD0LPQvtC5INC60L7QvNCw0L3QtNC+0LksINC/0YDQvtC/0YPRgdC60LDQtdGC0YHRjy5cclxuXHQvLyDQkiDQutC+0L3RhtC1INC/0L7QutCw0LfRi9Cy0LDQtdGCIE5vdGljZSDRgdC+INGB0L/QuNGB0LrQvtC8INC90LDQt9C90LDRh9C10L3QvdC+0LPQviDQuCDQv9GA0L7Qv9GD0YnQtdC90L3QvtCz0L4uXHJcblx0YXN5bmMgYXNzaWduTGVnYWN5RGVmYXVsdEhvdGtleXMoKTogUHJvbWlzZTx2b2lkPiB7XHJcblx0XHRjb25zdCB7IGhvdGtleU1hbmFnZXIsIGNvbW1hbmRzIH0gPSB0aGlzLmFwcCBhcyBBcHBXaXRoSG90a2V5cztcclxuXHRcdGNvbnN0IGdldEVmZmVjdGl2ZUhvdGtleXMgPSAoY29tbWFuZElkOiBzdHJpbmcpOiBIb3RrZXlbXSA9PlxyXG5cdFx0XHRob3RrZXlNYW5hZ2VyLmN1c3RvbUtleXNbY29tbWFuZElkXSA/PyBob3RrZXlNYW5hZ2VyLmRlZmF1bHRLZXlzW2NvbW1hbmRJZF0gPz8gW107XHJcblxyXG5cdFx0Ly8g0JrQsNC60LDRjyDQutC+0LzQsNC90LTQsCDRgdC10LnRh9Cw0YEg0LfQsNC90LjQvNCw0LXRgiDQutCw0LbQtNC+0LUg0YHQvtGH0LXRgtCw0L3QuNC1INC60LvQsNCy0LjRiC5cclxuXHRcdGNvbnN0IGNvbW1hbmRJZEJ5SG90a2V5ID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcclxuXHRcdGNvbnN0IGJvdW5kQ29tbWFuZElkcyA9IG5ldyBTZXQoW1xyXG5cdFx0XHQuLi5PYmplY3Qua2V5cyhob3RrZXlNYW5hZ2VyLmRlZmF1bHRLZXlzKSxcclxuXHRcdFx0Li4uT2JqZWN0LmtleXMoaG90a2V5TWFuYWdlci5jdXN0b21LZXlzKSxcclxuXHRcdF0pO1xyXG5cdFx0Zm9yIChjb25zdCBjb21tYW5kSWQgb2YgYm91bmRDb21tYW5kSWRzKSB7XHJcblx0XHRcdGZvciAoY29uc3QgaG90a2V5IG9mIGdldEVmZmVjdGl2ZUhvdGtleXMoY29tbWFuZElkKSkge1xyXG5cdFx0XHRcdGNvbW1hbmRJZEJ5SG90a2V5LnNldCh0aGlzLmdldEhvdGtleUtleShob3RrZXkpLCBjb21tYW5kSWQpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Y29uc3QgYXNzaWduZWQ6IHN0cmluZ1tdID0gW107XHJcblx0XHRjb25zdCBza2lwcGVkOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuXHRcdGZvciAoY29uc3QgZGVmaW5pdGlvbiBvZiBMRUdBQ1lfREVGQVVMVF9IT1RLRVlTKSB7XHJcblx0XHRcdGNvbnN0IGNvbW1hbmRJZCA9IGRlZmluaXRpb24uaXNDb3JlQ29tbWFuZFxyXG5cdFx0XHRcdD8gZGVmaW5pdGlvbi5jb21tYW5kSWRcclxuXHRcdFx0XHQ6IGAke3RoaXMubWFuaWZlc3QuaWR9OiR7ZGVmaW5pdGlvbi5jb21tYW5kSWR9YDtcclxuXHRcdFx0Y29uc3QgY29tbWFuZCA9IGNvbW1hbmRzLmNvbW1hbmRzW2NvbW1hbmRJZF07XHJcblxyXG5cdFx0XHRpZiAoIWNvbW1hbmQpIHtcclxuXHRcdFx0XHRza2lwcGVkLnB1c2goYCR7Y29tbWFuZElkfTogY29tbWFuZCBub3QgZm91bmRgKTtcclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKGdldEVmZmVjdGl2ZUhvdGtleXMoY29tbWFuZElkKS5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0c2tpcHBlZC5wdXNoKGAke2NvbW1hbmQubmFtZX06IGFscmVhZHkgaGFzIGEgaG90a2V5YCk7XHJcblx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGNvbnN0IGhvdGtleXNUb0Fzc2lnbjogSG90a2V5W10gPSBbXTtcclxuXHRcdFx0Zm9yIChjb25zdCBob3RrZXkgb2YgZGVmaW5pdGlvbi5ob3RrZXlzKSB7XHJcblx0XHRcdFx0Y29uc3QgY29uZmxpY3RpbmdDb21tYW5kSWQgPSBjb21tYW5kSWRCeUhvdGtleS5nZXQodGhpcy5nZXRIb3RrZXlLZXkoaG90a2V5KSk7XHJcblxyXG5cdFx0XHRcdGlmIChjb25mbGljdGluZ0NvbW1hbmRJZCkge1xyXG5cdFx0XHRcdFx0Y29uc3QgY29uZmxpY3RpbmdOYW1lID0gY29tbWFuZHMuY29tbWFuZHNbY29uZmxpY3RpbmdDb21tYW5kSWRdPy5uYW1lID8/IGNvbmZsaWN0aW5nQ29tbWFuZElkO1xyXG5cdFx0XHRcdFx0c2tpcHBlZC5wdXNoKGAke2NvbW1hbmQubmFtZX06ICR7dGhpcy5mb3JtYXRIb3RrZXkoaG90a2V5KX0gaXMgdXNlZCBieSBcIiR7Y29uZmxpY3RpbmdOYW1lfVwiYCk7XHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGhvdGtleXNUb0Fzc2lnbi5wdXNoKGhvdGtleSk7XHJcblx0XHRcdFx0Y29tbWFuZElkQnlIb3RrZXkuc2V0KHRoaXMuZ2V0SG90a2V5S2V5KGhvdGtleSksIGNvbW1hbmRJZCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmIChob3RrZXlzVG9Bc3NpZ24ubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdGhvdGtleU1hbmFnZXIuc2V0SG90a2V5cyhjb21tYW5kSWQsIGhvdGtleXNUb0Fzc2lnbik7XHJcblx0XHRcdFx0YXNzaWduZWQucHVzaChgJHtjb21tYW5kLm5hbWV9OiAke2hvdGtleXNUb0Fzc2lnbi5tYXAoKGhvdGtleSkgPT4gdGhpcy5mb3JtYXRIb3RrZXkoaG90a2V5KSkuam9pbihcIiwgXCIpfWApO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGFzc2lnbmVkLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0YXdhaXQgaG90a2V5TWFuYWdlci5zYXZlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0bmV3IE5vdGljZShcclxuXHRcdFx0Y3JlYXRlRnJhZ21lbnQoKGZyYWdtZW50KSA9PiB7XHJcblx0XHRcdFx0ZnJhZ21lbnQuY3JlYXRlRGl2KHsgdGV4dDogYEFzc2lnbmVkICR7YXNzaWduZWQubGVuZ3RofSBob3RrZXkocyksIHNraXBwZWQgJHtza2lwcGVkLmxlbmd0aH0uYCB9KTtcclxuXHRcdFx0XHRmb3IgKGNvbnN0IGxpbmUgb2YgYXNzaWduZWQpIHtcclxuXHRcdFx0XHRcdGZyYWdtZW50LmNyZWF0ZURpdih7IHRleHQ6IGArICR7bGluZX1gIH0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRmb3IgKGNvbnN0IGxpbmUgb2Ygc2tpcHBlZCkge1xyXG5cdFx0XHRcdFx0ZnJhZ21lbnQuY3JlYXRlRGl2KHsgdGV4dDogYC0gJHtsaW5lfWAgfSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KSxcclxuXHRcdFx0MCxcclxuXHRcdCk7XHJcblx0fVxyXG5cclxuXHQvLyDQndC+0YDQvNCw0LvQuNC30L7QstCw0L3QvdCw0Y8g0YHRgtGA0L7QutCwINGB0L7Rh9C10YLQsNC90LjRjyDQtNC70Y8g0YHRgNCw0LLQvdC10L3QuNGPOiBcIk1vZFwiINC+0LfQvdCw0YfQsNC10YIgQ21kINC90LAgbWFjT1NcclxuXHQvLyDQuCBDdHJsINC90LAg0L7RgdGC0LDQu9GM0L3Ri9GFINC/0LvQsNGC0YTQvtGA0LzQsNGFLCDQv9C+0YDRj9C00L7QuiDQvNC+0LTQuNGE0LjQutCw0YLQvtGA0L7QsiDQuCDRgNC10LPQuNGB0YLRgCDQutC70LDQstC40YjQuCDQvdC1INCy0LDQttC90YsuXHJcblx0cHJpdmF0ZSBnZXRIb3RrZXlLZXkoaG90a2V5OiBIb3RrZXkpOiBzdHJpbmcge1xyXG5cdFx0Y29uc3QgbW9kaWZpZXJzID0gaG90a2V5Lm1vZGlmaWVyc1xyXG5cdFx0XHQubWFwKChtb2RpZmllcikgPT4gKG1vZGlmaWVyID09PSBcIk1vZFwiID8gKFBsYXRmb3JtLmlzTWFjT1MgPyBcIk1ldGFcIiA6IFwiQ3RybFwiKSA6IG1vZGlmaWVyKSlcclxuXHRcdFx0LnNvcnQoKTtcclxuXHRcdHJldHVybiBbLi4ubW9kaWZpZXJzLCBob3RrZXkua2V5LnRvTG93ZXJDYXNlKCldLmpvaW4oXCIrXCIpO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBmb3JtYXRIb3RrZXkoaG90a2V5OiBIb3RrZXkpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIFsuLi5ob3RrZXkubW9kaWZpZXJzLCBob3RrZXkua2V5XS5qb2luKFwiK1wiKTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgcmVnaXN0ZXJTaW1wbGVUZXh0Q29tbWFuZHMoKTogdm9pZCB7XHJcblx0XHRmb3IgKGNvbnN0IGNvbW1hbmQgb2YgU0lNUExFX1RFWFRfQ09NTUFORFMpIHtcclxuXHRcdFx0dGhpcy5hZGRDb21tYW5kKHtcclxuXHRcdFx0XHRpZDogY29tbWFuZC5pZCxcclxuXHRcdFx0XHRuYW1lOiBjb21tYW5kLm5hbWUsXHJcblx0XHRcdFx0aG90a2V5czogY29tbWFuZC5ob3RrZXlzLFxyXG5cdFx0XHRcdGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PiB7XHJcblx0XHRcdFx0XHRpZiAoY29tbWFuZC53cmFwV2l0aCAmJiBlZGl0b3Iuc29tZXRoaW5nU2VsZWN0ZWQoKSkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLndyYXBTZWxlY3Rpb24oZWRpdG9yLCBjb21tYW5kLndyYXBXaXRoLm9wZW5pbmcsIGNvbW1hbmQud3JhcFdpdGguY2xvc2luZyk7XHJcblx0XHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRlZGl0b3IucmVwbGFjZVNlbGVjdGlvbihjb21tYW5kLmluc2VydCk7XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHJlZ2lzdGVyQWR2YW5jZWRDb21tYW5kcygpOiB2b2lkIHtcclxuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XHJcblx0XHRcdGlkOiBcImluc2VydC1pbmxpbmUtY29kZS1vci13cmFwLXNlbGVjdGlvblwiLFxyXG5cdFx0XHRuYW1lOiBcIkluc2VydCBgIG9yIHdyYXAgc2VsZWN0aW9uIHdpdGggaW5saW5lIGNvZGVcIixcclxuXHRcdFx0ZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3IpID0+IHtcclxuXHRcdFx0XHRpZiAoZWRpdG9yLnNvbWV0aGluZ1NlbGVjdGVkKCkpIHtcclxuXHRcdFx0XHRcdHRoaXMud3JhcFNlbGVjdGlvbihlZGl0b3IsIFwiYFwiLCBcImBcIik7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdGVkaXRvci5yZXBsYWNlU2VsZWN0aW9uKFwiYFwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sXHJcblx0XHR9KTtcclxuXHJcblx0XHR0aGlzLmFkZENvbW1hbmQoe1xyXG5cdFx0XHRpZDogXCJpbnNlcnQtcHl0aG9uLWNvZGUtYmxvY2tcIixcclxuXHRcdFx0bmFtZTogXCJJbnNlcnQgUHl0aG9uIGNvZGUgYmxvY2tcIixcclxuXHRcdFx0ZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3IpID0+IHtcclxuXHRcdFx0XHRjb25zdCBzZWxlY3RlZFRleHQgPSBlZGl0b3IuZ2V0U2VsZWN0aW9uKCk7XHJcblxyXG5cdFx0XHRcdGlmIChzZWxlY3RlZFRleHQpIHtcclxuXHRcdFx0XHRcdGVkaXRvci5yZXBsYWNlU2VsZWN0aW9uKFtcImBgYHB5XCIsIHNlbGVjdGVkVGV4dCwgXCJgYGBcIl0uam9pbihcIlxcblwiKSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdGVkaXRvci5yZXBsYWNlU2VsZWN0aW9uKFwiYGBgcHlcXG5cXG5gYGBcIik7XHJcblx0XHRcdFx0XHRjb25zdCBjdXJzb3IgPSBlZGl0b3IuZ2V0Q3Vyc29yKCk7XHJcblx0XHRcdFx0XHRlZGl0b3Iuc2V0Q3Vyc29yKHsgbGluZTogY3Vyc29yLmxpbmUgLSAxLCBjaDogMCB9KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sXHJcblx0XHR9KTtcclxuXHJcblx0XHR0aGlzLmFkZENvbW1hbmQoe1xyXG5cdFx0XHRpZDogXCJ0b2dnbGUtY29kZS1ibG9ja1wiLFxyXG5cdFx0XHRuYW1lOiBcIlRvZ2dsZSBjb2RlIGJsb2NrXCIsXHJcblx0XHRcdGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PiB0aGlzLnRvZ2dsZUNvZGVCbG9jayhlZGl0b3IpLFxyXG5cdFx0fSk7XHJcblxyXG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcclxuXHRcdFx0aWQ6IFwidG9nZ2xlLWJsb2NrcXVvdGUtZm9yLWxpbmVzXCIsXHJcblx0XHRcdG5hbWU6IFwiVG9nZ2xlIGJsb2NrcXVvdGUgZm9yIHNlbGVjdGVkIGxpbmVzIG9yIGluc2VydCA+IG9uIGVtcHR5IGxpbmVcIixcclxuXHRcdFx0ZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3IpID0+IHRoaXMudG9nZ2xlQmxvY2txdW90ZU9ySW5zZXJ0KGVkaXRvciksXHJcblx0XHR9KTtcclxuXHJcblx0XHR0aGlzLmFkZENvbW1hbmQoe1xyXG5cdFx0XHRpZDogXCJ0b2dnbGUtYnVsbGV0LWxpc3QtZm9yLWxpbmVzXCIsXHJcblx0XHRcdG5hbWU6IFwiVG9nZ2xlIGJ1bGxldCBsaXN0IGZvciBzZWxlY3RlZCBsaW5lc1wiLFxyXG5cdFx0XHRlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT4gdGhpcy50b2dnbGVQcmVmaXhGb3JMaW5lcyhlZGl0b3IsIC9eLVxccysvLCBcIi0gXCIpLFxyXG5cdFx0fSk7XHJcblxyXG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcclxuXHRcdFx0aWQ6IFwidG9nZ2xlLXNlbGVjdGlvbi1jYXNlXCIsXHJcblx0XHRcdG5hbWU6IFwiVG9nZ2xlIHNlbGVjdGlvbiBjYXNlXCIsXHJcblx0XHRcdGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PiB0aGlzLnRvZ2dsZVNlbGVjdGlvbkNhc2UoZWRpdG9yKSxcclxuXHRcdH0pO1xyXG5cclxuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XHJcblx0XHRcdGlkOiBcImluY3JlYXNlLWhlYWRpbmctbGV2ZWxcIixcclxuXHRcdFx0bmFtZTogXCJJbmNyZWFzZSBoZWFkaW5nIGxldmVsXCIsXHJcblx0XHRcdGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PiB0aGlzLmNoYW5nZUhlYWRpbmdMZXZlbChlZGl0b3IsIDEpLFxyXG5cdFx0fSk7XHJcblxyXG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcclxuXHRcdFx0aWQ6IFwiZGVjcmVhc2UtaGVhZGluZy1sZXZlbFwiLFxyXG5cdFx0XHRuYW1lOiBcIkRlY3JlYXNlIGhlYWRpbmcgbGV2ZWxcIixcclxuXHRcdFx0ZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3IpID0+IHRoaXMuY2hhbmdlSGVhZGluZ0xldmVsKGVkaXRvciwgLTEpLFxyXG5cdFx0fSk7XHJcblxyXG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcclxuXHRcdFx0aWQ6IFwiaW5zZXJ0LW9yLXdyYXAtZnJlbmNoLXF1b3Rlc1wiLFxyXG5cdFx0XHRuYW1lOiBcIkluc2VydCDCq8K7IG9yIHdyYXAgc2VsZWN0aW9uIHdpdGggwqvCu1wiLFxyXG5cdFx0XHRlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT4gdGhpcy5pbnNlcnRPcldyYXBGcmVuY2hRdW90ZXMoZWRpdG9yKSxcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSB3cmFwU2VsZWN0aW9uKGVkaXRvcjogRWRpdG9yLCBvcGVuaW5nOiBzdHJpbmcsIGNsb3Npbmc6IHN0cmluZyk6IHZvaWQge1xyXG5cdFx0Y29uc3Qgc2VsZWN0ZWRUZXh0ID0gZWRpdG9yLmdldFNlbGVjdGlvbigpO1xyXG5cdFx0ZWRpdG9yLnJlcGxhY2VTZWxlY3Rpb24oYCR7b3BlbmluZ30ke3NlbGVjdGVkVGV4dH0ke2Nsb3Npbmd9YCk7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIGdldExpbmVSYW5nZShlZGl0b3I6IEVkaXRvcik6IExpbmVSYW5nZSB7XHJcblx0XHRpZiAoZWRpdG9yLnNvbWV0aGluZ1NlbGVjdGVkKCkpIHtcclxuXHRcdFx0Y29uc3QgZnJvbSA9IGVkaXRvci5nZXRDdXJzb3IoXCJmcm9tXCIpO1xyXG5cdFx0XHRjb25zdCB0byA9IGVkaXRvci5nZXRDdXJzb3IoXCJ0b1wiKTtcclxuXHJcblx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0c3RhcnQ6IHsgbGluZTogZnJvbS5saW5lLCBjaDogMCB9LFxyXG5cdFx0XHRcdGVuZDogeyBsaW5lOiB0by5saW5lLCBjaDogZWRpdG9yLmdldExpbmUodG8ubGluZSkubGVuZ3RoIH0sXHJcblx0XHRcdFx0Y29udGVudDogZWRpdG9yLmdldFJhbmdlKFxyXG5cdFx0XHRcdFx0eyBsaW5lOiBmcm9tLmxpbmUsIGNoOiAwIH0sXHJcblx0XHRcdFx0XHR7IGxpbmU6IHRvLmxpbmUsIGNoOiBlZGl0b3IuZ2V0TGluZSh0by5saW5lKS5sZW5ndGggfSxcclxuXHRcdFx0XHQpLFxyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cclxuXHRcdGNvbnN0IGxpbmUgPSBlZGl0b3IuZ2V0Q3Vyc29yKCkubGluZTtcclxuXHRcdGNvbnN0IGNvbnRlbnQgPSBlZGl0b3IuZ2V0TGluZShsaW5lKTtcclxuXHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRzdGFydDogeyBsaW5lLCBjaDogMCB9LFxyXG5cdFx0XHRlbmQ6IHsgbGluZSwgY2g6IGNvbnRlbnQubGVuZ3RoIH0sXHJcblx0XHRcdGNvbnRlbnQsXHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSB0b2dnbGVCbG9ja3F1b3RlT3JJbnNlcnQoZWRpdG9yOiBFZGl0b3IpOiB2b2lkIHtcclxuXHRcdGlmICghZWRpdG9yLnNvbWV0aGluZ1NlbGVjdGVkKCkpIHtcclxuXHRcdFx0Y29uc3QgY3Vyc29yID0gZWRpdG9yLmdldEN1cnNvcigpO1xyXG5cdFx0XHRjb25zdCBjdXJyZW50TGluZSA9IGVkaXRvci5nZXRMaW5lKGN1cnNvci5saW5lKTtcclxuXHJcblx0XHRcdGlmIChjdXJyZW50TGluZS50cmltKCkubGVuZ3RoID09PSAwKSB7XHJcblx0XHRcdFx0ZWRpdG9yLnJlcGxhY2VTZWxlY3Rpb24oXCI+IFwiKTtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLnRvZ2dsZVByZWZpeEZvckxpbmVzKGVkaXRvciwgL14+XFxzPy8sIFwiPiBcIik7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHRvZ2dsZVByZWZpeEZvckxpbmVzKGVkaXRvcjogRWRpdG9yLCBwcmVmaXhQYXR0ZXJuOiBSZWdFeHAsIHByZWZpeFRvQWRkOiBzdHJpbmcpOiB2b2lkIHtcclxuXHRcdGNvbnN0IHJhbmdlID0gdGhpcy5nZXRMaW5lUmFuZ2UoZWRpdG9yKTtcclxuXHRcdGNvbnN0IGxpbmVzID0gcmFuZ2UuY29udGVudC5zcGxpdChcIlxcblwiKTtcclxuXHRcdGNvbnN0IG5vbkVtcHR5TGluZXMgPSBsaW5lcy5maWx0ZXIoKGxpbmUpID0+IGxpbmUudHJpbSgpLmxlbmd0aCA+IDApO1xyXG5cdFx0Y29uc3Qgc2hvdWxkUmVtb3ZlID0gbm9uRW1wdHlMaW5lcy5sZW5ndGggPiAwICYmIG5vbkVtcHR5TGluZXMuZXZlcnkoKGxpbmUpID0+IHByZWZpeFBhdHRlcm4udGVzdChsaW5lKSk7XHJcblxyXG5cdFx0Y29uc3QgbmV4dExpbmVzID0gbGluZXMubWFwKChsaW5lKSA9PiB7XHJcblx0XHRcdGlmIChsaW5lLnRyaW0oKS5sZW5ndGggPT09IDApIHtcclxuXHRcdFx0XHRyZXR1cm4gbGluZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKHNob3VsZFJlbW92ZSkge1xyXG5cdFx0XHRcdHJldHVybiBsaW5lLnJlcGxhY2UocHJlZml4UGF0dGVybiwgXCJcIik7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBgJHtwcmVmaXhUb0FkZH0ke2xpbmV9YDtcclxuXHRcdH0pO1xyXG5cclxuXHRcdGVkaXRvci5yZXBsYWNlUmFuZ2UobmV4dExpbmVzLmpvaW4oXCJcXG5cIiksIHJhbmdlLnN0YXJ0LCByYW5nZS5lbmQpO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSB0b2dnbGVDb2RlQmxvY2soZWRpdG9yOiBFZGl0b3IpOiB2b2lkIHtcclxuXHRcdGNvbnN0IHNlbGVjdGVkVGV4dCA9IGVkaXRvci5nZXRTZWxlY3Rpb24oKTtcclxuXHJcblx0XHRpZiAoIXNlbGVjdGVkVGV4dCkge1xyXG5cdFx0XHRjb25zdCBjdXJzb3IgPSBlZGl0b3IuZ2V0Q3Vyc29yKCk7XHJcblx0XHRcdGVkaXRvci5yZXBsYWNlU2VsZWN0aW9uKFwiYGBgXFxuXFxuYGBgXCIpO1xyXG5cdFx0XHRlZGl0b3Iuc2V0Q3Vyc29yKHsgbGluZTogY3Vyc29yLmxpbmUgKyAxLCBjaDogMCB9KTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGNvbnN0IHRyaW1tZWQgPSBzZWxlY3RlZFRleHQudHJpbSgpO1xyXG5cdFx0Y29uc3QgaXNXcmFwcGVkID0gdHJpbW1lZC5zdGFydHNXaXRoKFwiYGBgXCIpICYmIHRyaW1tZWQuZW5kc1dpdGgoXCJgYGBcIik7XHJcblxyXG5cdFx0aWYgKGlzV3JhcHBlZCkge1xyXG5cdFx0XHRjb25zdCB3aXRob3V0U3RhcnRGZW5jZSA9IHRyaW1tZWQucmVwbGFjZSgvXmBgYFthLXpBLVowLTlfLV0qXFxuPy8sIFwiXCIpO1xyXG5cdFx0XHRjb25zdCB1bndyYXBwZWQgPSB3aXRob3V0U3RhcnRGZW5jZS5yZXBsYWNlKC9cXG4/YGBgJC8sIFwiXCIpO1xyXG5cdFx0XHRlZGl0b3IucmVwbGFjZVNlbGVjdGlvbih1bndyYXBwZWQpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0ZWRpdG9yLnJlcGxhY2VTZWxlY3Rpb24oW1wiYGBgXCIsIHNlbGVjdGVkVGV4dCwgXCJgYGBcIl0uam9pbihcIlxcblwiKSk7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHRvZ2dsZVNlbGVjdGlvbkNhc2UoZWRpdG9yOiBFZGl0b3IpOiB2b2lkIHtcclxuXHRcdGNvbnN0IHNlbGVjdGVkVGV4dCA9IGVkaXRvci5nZXRTZWxlY3Rpb24oKTtcclxuXHJcblx0XHRpZiAoIXNlbGVjdGVkVGV4dCkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0Y29uc3QgaGFzTG93ZXJjYXNlID0gc2VsZWN0ZWRUZXh0ICE9PSBzZWxlY3RlZFRleHQudG9VcHBlckNhc2UoKTtcclxuXHRcdGNvbnN0IG5leHRUZXh0ID0gaGFzTG93ZXJjYXNlID8gc2VsZWN0ZWRUZXh0LnRvVXBwZXJDYXNlKCkgOiBzZWxlY3RlZFRleHQudG9Mb3dlckNhc2UoKTtcclxuXHRcdGVkaXRvci5yZXBsYWNlU2VsZWN0aW9uKG5leHRUZXh0KTtcclxuXHR9XHJcblxyXG5cdC8vINCc0LXQvdGP0LXRgiDRg9GA0L7QstC10L3RjCBtYXJrZG93bi1oZWFkaW5nINCyINGC0LXQutGD0YnQtdC5INGB0YLRgNC+0LrQtSDQuNC70Lgg0LLQviDQstGB0ZHQvCDQstGL0LTQtdC70LXQvdC90L7QvCDQsdC70L7QutC1LlxyXG5cdC8vXHJcblx0Ly8g0JDQutGC0YPQsNC70YzQvdCw0Y8g0LvQvtCz0LjQutCwINGC0LDQutCw0Y86XHJcblx0Ly8gLSDQtdGB0LvQuCDRgdGC0YDQvtC60LAg0L3QsNGH0LjQvdCw0LXRgtGB0Y8g0YHQviDRgdC/0LXRhtGB0LjQvNCy0L7Qu9CwLCBtYXJrZG93bi3QvNCw0YDQutC10YDQsCDRgdC/0LjRgdC60LAv0YfQtdC60LHQvtC60YHQsFxyXG5cdC8vICAg0LjQu9C4INGBINC90L7QvNC10YDQsCDRgdC/0LjRgdC60LAgKNC90LDQv9GA0LjQvNC10YAgYDEuIGAgLyBgMSkgYCksINC+0L3QsCDQvdC1INC80LXQvdGP0LXRgtGB0Y87XHJcblx0Ly8gLSDQtdGB0LvQuCDRgdGC0YDQvtC60LAg0L/Rg9GB0YLQsNGPINC40LvQuCDQvdCw0YfQuNC90LDQtdGC0YHRjyDRgSDQvtCx0YvRh9C90L7Qs9C+INGC0LXQutGB0YLQsCxcclxuXHQvLyAgIEluY3JlYXNlIGhlYWRpbmcgbGV2ZWwg0LTQtdC70LDQtdGCIGhlYWRpbmcgNiDRg9GA0L7QstC90Y8sXHJcblx0Ly8gICDQsCBEZWNyZWFzZSBoZWFkaW5nIGxldmVsINC00LXQu9Cw0LXRgiBoZWFkaW5nIDEg0YPRgNC+0LLQvdGPO1xyXG5cdC8vIC0g0LXRgdC70Lgg0YHRgtGA0L7QutCwINGD0LbQtSDRj9Cy0LvRj9C10YLRgdGPIGhlYWRpbmcsINGC0L4gSW5jcmVhc2UgaGVhZGluZyBsZXZlbFxyXG5cdC8vICAg0YPQvNC10L3RjNGI0LDQtdGCINC60L7Qu9C40YfQtdGB0YLQstC+ICMgKCMjIyMjIyAtPiAjIyMjIyAtPiAuLi4gLT4gIyAtPiDQvtCx0YvRh9C90YvQuSDRgtC10LrRgdGCKTtcclxuXHQvLyAtIERlY3JlYXNlIGhlYWRpbmcgbGV2ZWwg0YDQsNCx0L7RgtCw0LXRgiDQvdCw0L7QsdC+0YDQvtGCINC4INGD0LLQtdC70LjRh9C40LLQsNC10YIg0LrQvtC70LjRh9C10YHRgtCy0L4gI1xyXG5cdC8vICAgKCMgLT4gIyMgLT4gLi4uIC0+ICMjIyMjIyAtPiDQvtCx0YvRh9C90YvQuSDRgtC10LrRgdGCKS5cclxuXHRwcml2YXRlIGNoYW5nZUhlYWRpbmdMZXZlbChlZGl0b3I6IEVkaXRvciwgZGVsdGE6IDEgfCAtMSk6IHZvaWQge1xyXG5cdFx0Y29uc3QgcmFuZ2UgPSB0aGlzLmdldExpbmVSYW5nZShlZGl0b3IpO1xyXG5cdFx0Y29uc3QgbGluZXMgPSByYW5nZS5jb250ZW50LnNwbGl0KFwiXFxuXCIpO1xyXG5cdFx0Y29uc3QgbmV4dExpbmVzID0gbGluZXMubWFwKChsaW5lKSA9PiB0aGlzLmNoYW5nZUhlYWRpbmdMZXZlbEZvckxpbmUobGluZSwgZGVsdGEpKTtcclxuXHRcdGVkaXRvci5yZXBsYWNlUmFuZ2UobmV4dExpbmVzLmpvaW4oXCJcXG5cIiksIHJhbmdlLnN0YXJ0LCByYW5nZS5lbmQpO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBjaGFuZ2VIZWFkaW5nTGV2ZWxGb3JMaW5lKGxpbmU6IHN0cmluZywgZGVsdGE6IDEgfCAtMSk6IHN0cmluZyB7XHJcblx0XHRjb25zdCBoZWFkaW5nTWF0Y2ggPSBsaW5lLm1hdGNoKC9eKFxccyopKCN7MSw2fSlcXHMrKC4qKSQvKTtcclxuXHJcblx0XHRpZiAoaGVhZGluZ01hdGNoKSB7XHJcblx0XHRcdGNvbnN0IFssIGluZGVudCwgaGFzaGVzLCBjb250ZW50XSA9IGhlYWRpbmdNYXRjaDtcclxuXHRcdFx0Y29uc3QgY3VycmVudExldmVsID0gaGFzaGVzLmxlbmd0aDtcclxuXHJcblx0XHRcdC8vIEluY3JlYXNlIGhlYWRpbmcgbGV2ZWwgPSDQstC40LfRg9Cw0LvRjNC90L4g0YHQtNC10LvQsNGC0Ywg0LfQsNCz0L7Qu9C+0LLQvtC6INCx0L7Qu9C10LUgXCLQutGA0YPQv9C90YvQvFwiLFxyXG5cdFx0XHQvLyDRgtC+INC10YHRgtGMINGD0LzQtdC90YzRiNC40YLRjCDQs9C70YPQsdC40L3RgyDQuCDQo9Cc0JXQndCs0KjQmNCi0Kwg0LrQvtC70LjRh9C10YHRgtCy0L4gIy5cclxuXHRcdFx0aWYgKGRlbHRhID09PSAxKSB7XHJcblx0XHRcdFx0aWYgKGN1cnJlbnRMZXZlbCA9PT0gMSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGAke2luZGVudH0ke2NvbnRlbnR9YDtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHJldHVybiBgJHtpbmRlbnR9JHtcIiNcIi5yZXBlYXQoY3VycmVudExldmVsIC0gMSl9ICR7Y29udGVudH1gO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBEZWNyZWFzZSBoZWFkaW5nIGxldmVsID0g0YHQtNC10LvQsNGC0Ywg0LfQsNCz0L7Qu9C+0LLQvtC6INCx0L7Qu9C10LUgXCLQs9C70YPQsdC+0LrQuNC8XCIsXHJcblx0XHRcdC8vINGC0L4g0LXRgdGC0Ywg0YPQstC10LvQuNGH0LjRgtGMINCz0LvRg9Cx0LjQvdGDINC4INCU0J7QkdCQ0JLQmNCi0KwgIy5cclxuXHRcdFx0Ly8g0J7RgdC+0LHRi9C5INGB0LvRg9GH0LDQuTogSDYg0L/QviDRgdC70LXQtNGD0Y7RidC10LzRgyDQvdCw0LbQsNGC0LjRjiDQv9GA0LXQstGA0LDRidCw0LXRgtGB0Y8g0LIg0L7QsdGL0YfQvdGL0Lkg0YLQtdC60YHRgi5cclxuXHRcdFx0aWYgKGN1cnJlbnRMZXZlbCA9PT0gNikge1xyXG5cdFx0XHRcdHJldHVybiBgJHtpbmRlbnR9JHtjb250ZW50fWA7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBgJHtpbmRlbnR9JHtcIiNcIi5yZXBlYXQoY3VycmVudExldmVsICsgMSl9ICR7Y29udGVudH1gO1xyXG5cdFx0fVxyXG5cclxuXHRcdGNvbnN0IGJsYW5rT3JQbGFpblRleHRNYXRjaCA9IGxpbmUubWF0Y2goL14oXFxzKikoLiopJC8pO1xyXG5cdFx0aWYgKCFibGFua09yUGxhaW5UZXh0TWF0Y2gpIHtcclxuXHRcdFx0cmV0dXJuIGxpbmU7XHJcblx0XHR9XHJcblxyXG5cdFx0Y29uc3QgWywgaW5kZW50LCBjb250ZW50XSA9IGJsYW5rT3JQbGFpblRleHRNYXRjaDtcclxuXHRcdGNvbnN0IHRyaW1tZWQgPSBjb250ZW50LnRyaW0oKTtcclxuXHJcblx0XHRpZiAodHJpbW1lZC5sZW5ndGggPT09IDApIHtcclxuXHRcdFx0cmV0dXJuIGRlbHRhID09PSAxID8gYCR7aW5kZW50fSMjIyMjIyBgIDogYCR7aW5kZW50fSMgYDtcclxuXHRcdH1cclxuXHJcblx0XHQvLyDQndC1INGB0L7Qt9C00LDRkdC8IGhlYWRpbmcg0L/QvtCy0LXRgNGFIG1hcmtkb3duLdGB0L/QuNGB0LrQvtCyINC4IGNoZWNrYm94LdGB0YLRgNC+0LouXHJcblx0XHQvLyDQodGO0LTQsCDQttC1INC+0YLQvdC+0YHQuNC8INGB0YLRgNC+0LrQuCwg0L3QsNGH0LjQvdCw0Y7RidC40LXRgdGPINGBINC00YDRg9Cz0LjRhSDRgdC/0LXRhtGB0LjQvNCy0L7Qu9C+0LIuXHJcblx0XHRpZiAodGhpcy5pc1Byb3RlY3RlZE5vbkhlYWRpbmdMaW5lKHRyaW1tZWQpKSB7XHJcblx0XHRcdHJldHVybiBsaW5lO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBkZWx0YSA9PT0gMSA/IGAke2luZGVudH0jIyMjIyMgJHt0cmltbWVkfWAgOiBgJHtpbmRlbnR9IyAke3RyaW1tZWR9YDtcclxuXHR9XHJcblxyXG5cdC8vINCS0L7Qt9Cy0YDQsNGJ0LDQtdGCIHRydWUg0LTQu9GPINGB0YLRgNC+0LosINC60L7RgtC+0YDRi9C1INC90LXQu9GM0LfRjyDQsNCy0YLQvtC80LDRgtC40YfQtdGB0LrQuCDQv9GA0LXQstGA0LDRidCw0YLRjCDQsiBoZWFkaW5nLlxyXG5cdC8vXHJcblx0Ly8g0JfQsNGJ0LjRidCw0LXQvDpcclxuXHQvLyAtIGJ1bGxldCBsaXN0OiBgLSBpdGVtYCwgYCogaXRlbWAsIGArIGl0ZW1gO1xyXG5cdC8vIC0gY2hlY2tib3g6IGAtIFsgXSB0YXNrYCwgYC0gW3hdIHRhc2tgO1xyXG5cdC8vIC0gb3JkZXJlZCBsaXN0OiBgMS4gaXRlbWAsIGAyKSBpdGVtYDtcclxuXHQvLyAtINGB0YLRgNC+0LrQuCwg0L3QsNGH0LjQvdCw0Y7RidC40LXRgdGPINGBINC00YDRg9Cz0LjRhSDRgdC/0LXRhtGB0LjQvNCy0L7Qu9C+0LIuXHJcblx0Ly9cclxuXHQvLyDQndC+INC+0LHRi9GH0L3Ri9C1INGB0YLRgNC+0LrQuCwg0L3QsNGH0LjQvdCw0Y7RidC40LXRgdGPINGBINGG0LjRhNGAINCS0J3Qo9Ci0KDQmCDRgtC10LrRgdGC0LAsINC90LUg0LHQu9C+0LrQuNGA0YPQtdC8LlxyXG5cdC8vINCd0LDQv9GA0LjQvNC10YAgYDIwMjUgcmVwb3J0YCDQvNC+0LbQvdC+INC/0YDQtdCy0YDQsNGC0LjRgtGMINCyIGhlYWRpbmcsINCwIGAxLiByZXBvcnRgIOKAlCDQvdC10YIuXHJcblx0cHJpdmF0ZSBpc1Byb3RlY3RlZE5vbkhlYWRpbmdMaW5lKHRyaW1tZWRMaW5lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuXHRcdGlmICgvXlstKitdXFxzK1xcW1sgeFhdXFxdXFxzKy8udGVzdCh0cmltbWVkTGluZSkpIHtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKC9eWy0qK11cXHMrLy50ZXN0KHRyaW1tZWRMaW5lKSkge1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoL15cXGQrWy4pXVxccysvLnRlc3QodHJpbW1lZExpbmUpKSB7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiAvXlteXFxwe0x9XFxwe059XS91LnRlc3QodHJpbW1lZExpbmUpO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBpbnNlcnRPcldyYXBGcmVuY2hRdW90ZXMoZWRpdG9yOiBFZGl0b3IpOiB2b2lkIHtcclxuXHRcdGlmIChlZGl0b3Iuc29tZXRoaW5nU2VsZWN0ZWQoKSkge1xyXG5cdFx0XHR0aGlzLndyYXBTZWxlY3Rpb24oZWRpdG9yLCBcIsKrXCIsIFwiwrtcIik7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHRjb25zdCBjdXJzb3IgPSBlZGl0b3IuZ2V0Q3Vyc29yKCk7XHJcblx0XHRlZGl0b3IucmVwbGFjZVNlbGVjdGlvbihcIsKrwrtcIik7XHJcblx0XHRlZGl0b3Iuc2V0Q3Vyc29yKHsgbGluZTogY3Vyc29yLmxpbmUsIGNoOiBjdXJzb3IuY2ggKyAxIH0pO1xyXG5cdH1cclxufVxyXG5cclxuY2xhc3MgU2hvcnRjdXRzRXh0ZW5kZXJTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XHJcblx0Y29uc3RydWN0b3IoYXBwOiBBcHAsIHByaXZhdGUgcmVhZG9ubHkgcGx1Z2luOiBTaG9ydGN1dHNFeHRlbmRlclBsdWdpbikge1xyXG5cdFx0c3VwZXIoYXBwLCBwbHVnaW4pO1xyXG5cdH1cclxuXHJcblx0ZGlzcGxheSgpOiB2b2lkIHtcclxuXHRcdGNvbnN0IHsgY29udGFpbmVyRWwgfSA9IHRoaXM7XHJcblx0XHRjb250YWluZXJFbC5lbXB0eSgpO1xyXG5cclxuXHRcdG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG5cdFx0XHQuc2V0TmFtZShcIkFzc2lnbiBkZWZhdWx0IGhvdGtleXNcIilcclxuXHRcdFx0LnNldERlc2MoXHJcblx0XHRcdFx0XCJBc3NpZ25zIHRoZSBob3RrZXlzIHRoYXQgdmVyc2lvbiAyLnggc2V0IGJ5IGRlZmF1bHQsIHN1Y2ggYXMgQWx0KzEuLjcgZm9yIHN5bWJvbHMgYW5kIEN0cmwrMC4uNiBmb3IgaGVhZGluZ3MuIFwiICtcclxuXHRcdFx0XHRcdFwiQ29tbWFuZHMgdGhhdCBhbHJlYWR5IGhhdmUgYSBob3RrZXkgYW5kIGtleSBjb21iaW5hdGlvbnMgYWxyZWFkeSB1c2VkIGJ5IGFub3RoZXIgY29tbWFuZCBhcmUgc2tpcHBlZC5cIixcclxuXHRcdFx0KVxyXG5cdFx0XHQuYWRkQnV0dG9uKChidXR0b24pID0+XHJcblx0XHRcdFx0YnV0dG9uXHJcblx0XHRcdFx0XHQuc2V0QnV0dG9uVGV4dChcIkFzc2lnbiBkZWZhdWx0IGhvdGtleXNcIilcclxuXHRcdFx0XHRcdC5zZXRDdGEoKVxyXG5cdFx0XHRcdFx0Lm9uQ2xpY2soKCkgPT4gdGhpcy5wbHVnaW4uYXNzaWduTGVnYWN5RGVmYXVsdEhvdGtleXMoKSksXHJcblx0XHRcdCk7XHJcblx0fVxyXG59XHJcbiJdLCJuYW1lcyI6WyJQbHVnaW4iLCJOb3RpY2UiLCJQbGF0Zm9ybSIsIlBsdWdpblNldHRpbmdUYWIiLCJTZXR0aW5nIl0sIm1hcHBpbmdzIjoiOzs7O0FBa0NBLE1BQU0sb0JBQW9CLEdBQTRCO0lBQ3JELEVBQUUsRUFBRSxFQUFFLHlCQUF5QixFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRTtJQUNoRSxFQUFFLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUU7SUFDdkQsRUFBRSxFQUFFLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFO0lBQ3pELEVBQUUsRUFBRSxFQUFFLG9CQUFvQixFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRTtJQUMzRCxFQUFFLEVBQUUsRUFBRSxxQkFBcUIsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUU7SUFDNUQsRUFBRSxFQUFFLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFO0lBQzFELEVBQUUsRUFBRSxFQUFFLGtCQUFrQixFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRTtJQUN6RCxFQUFFLEVBQUUsRUFBRSw0QkFBNEIsRUFBRSxJQUFJ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
