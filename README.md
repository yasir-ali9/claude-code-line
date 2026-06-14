# Claude Code Line

Minimal, customizable statusline for [Claude Code](https://claude.ai/code) CLI.

<video src="https://github.com/user-attachments/assets/b6836813-5867-4c5e-ae98-86c91d2d37bb" controls width="100%"></video>

![Demo](https://raw.githubusercontent.com/yasir-ali9/claude-code-line/main/public/demo.png)

## Install

```bash
npm install -g claude-code-line
```

Then open the TUI to customize and save to Claude Code:

```bash
claude-code-line
```

Select **Save to Claude Code** and restart Claude Code to apply.

## Manual setup

To set it up without the TUI, add to `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "claude-code-line"
  }
}
```

## Update

```bash
npm install -g claude-code-line
```

## Themes

- **Default** — minimal neutral statusline: project name, git branch, model, context usage, effort, rate limits, and CLI version
- **Custom** — choose which widgets to show, reorder them, change colors, and customize display formats

## Widgets

| Widget | Shows |
|--------|-------|
| Name | Current project folder |
| Git | Branch and diff stats |
| Model | Claude model name |
| Tokens | Context usage and token count (customizable format) |
| Effort | Reasoning effort level |
| 5h Rate | 5-hour usage and reset time (customizable format) |
| 7d Rate | 7-day usage and reset time (customizable format) |
| Extra | Extra usage credits |
| Version | Claude CLI version |
| Session Cost | Session cost in USD |
| Session Clock | Elapsed session time |

## Local development

Clone the repo and run directly from source:

```bash
git clone https://github.com/yasir-ali9/claude-code-line.git
cd claude-code-line
npm install
npm run build
node dist/index.js
```

To use your local build as the Claude Code statusline, add the absolute path manually to `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "node /absolute/path/to/claude-code-line/dist/index.js"
  }
}
```

Restart Claude Code to apply.

## Requirements

- Node.js >= 18
- Claude Code CLI
