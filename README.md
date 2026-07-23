# agent-device-tvos

A Claude Code plugin packaging the `agent-device-tvos` skill: driving and debugging tvOS apps on Apple TV devices and simulators with agent-device (launch, focus-engine navigation via tv-remote, screenshot, evidence capture). tvOS has no coordinate tap; all interaction goes through the focus engine.

## Structure

```text
agent-device-tvos/
├── .claude-plugin/
│   └── marketplace.json     # distribution catalog pointing at plugin/agent-device-tvos
├── plugin/
│   └── agent-device-tvos/
│       ├── .claude-plugin/
│       │   └── plugin.json  # Claude Code manifest
│       └── skills/
│           └── agent-device-tvos/
│               ├── SKILL.md     # skill body; name and trigger come from the frontmatter
│               └── references/  # topic-specific reference documents loaded on demand
├── items.md                 # verification item inventory (capability / binding / tier)
├── tests/                   # auto tier: bun test against the tvOS simulator
├── scripts/                 # manual tier checklist printer
└── package.json             # Bun task runner: test / verify-device / check / fix
```

Skills under the plugin's `skills/` are auto-discovered by Claude Code, so `plugin.json` carries only the plugin's identity and metadata. The verification harness at the repository root maintains the skill's claims; it is not part of the distributed plugin.

## Requirements

- agent-device >= 0.19.1 (`agent-device --version`)

## Install

```bash
claude plugin marketplace add git@github.com:akitorahayashi/agent-device-tvos.git
claude plugin install agent-device-tvos@agent-device-tvos
```

A public repository can use the HTTPS URL instead of the SSH one.

## Validate

```bash
claude plugin validate .
```
