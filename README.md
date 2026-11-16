# Digital Rain for Claude Code

By [The Cyborg Way](https://github.com/cyborg-way).

A Claude Code mod that puts a digital-rain backdrop behind your sessions: gold and teal katakana falling in columns, with each column's characters changing as they drop. It also sets a matching dark teal theme for the app's surfaces and code colors, with frosted panels so the conversation stays readable over the rain.

The backdrop draws in the Claude desktop app (Code tab) and the mobile app. The terminal and IDE extensions don't draw backdrops or themes, so there the mod only shows a short status note saying why.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install digital-rain --marketplace cyborg-way/digital-rain-claude-plugin
```

Answer `y` to add the marketplace, then press Enter to install it for your user. It's active straight away, and in every session you start after that, including desktop app sessions.

From a shell:

```bash
claude plugin install digital-rain --marketplace cyborg-way/digital-rain-claude-plugin
```

In the desktop app, where `/plugin` doesn't run: click **+** next to the prompt box, then **Plugins**, **Add marketplace** with `cyborg-way/digital-rain-claude-plugin`, then **Add plugin**.

## What you get

- **Rain backdrop**: dense columns in three sizes, mixed gold and teal, each with a bright head and a fading trail. Characters trickle down the trail one place per step, the way the canvas version does.
- **Dark teal theme**: background `#0E2228`, text `#EAF1F0`, teal accent, gold for warnings.
- **Light on the GPU**: the backdrop is a single SVG animated with CSS transforms only (no script, masks or filters).

## Notes

- With macOS **Reduce motion** turned on, the rain holds still.
- The theme is dark only: it overrides the app's light mode while the mod is on.
- To remove it: `/plugin uninstall digital-rain`.

## Developing

`hooks/register.tsx` builds the backdrop SVG and sets the theme at session start. `hooks/make-colors.js` turns a handful of anchor colors into the app's full palette. To run a local copy without installing it:

```bash
claude --plugin-dir .
```

Check it with `claude plugin validate .`.

## License

MIT. See [LICENSE](LICENSE).
