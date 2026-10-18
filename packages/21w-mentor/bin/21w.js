#!/usr/bin/env node
/**
 * 21w-mentor: installer for the author-first Bitcoin FOSS mentor.
 *
 * Usage:
 *   npx 21w-mentor init              installs into ~/.claude (global, all your projects)
 *   npx 21w-mentor init --project    installs into ./.claude (this project only, travels with the repo)
 *   npx 21w-mentor uninstall         removes the skill and commands
 *
 * No dependencies: copies the skill and the slash commands into the Claude
 * Code layout. Other agents (Kimi Code, OpenCode) read the same SKILL.md;
 * just point them at the installed folder.
 */
const fs = require("fs");
const path = require("path");
const os = require("os");

const ASSETS = path.join(__dirname, "..", "assets");
const COMMANDS = ["start", "issues", "plan", "week", "review"];

function copyDir(src, dest) {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    entry.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

function install(base) {
  const skillDest = path.join(base, "skills", "21w-mentor");
  const cmdDest = path.join(base, "commands", "21w");
  copyDir(path.join(ASSETS, "skill"), skillDest);
  copyDir(path.join(ASSETS, "commands"), cmdDest);
  console.log(`✓ Skill installed in    ${skillDest}`);
  console.log(`✓ Commands installed in ${cmdDest}`);
  console.log();
  console.log("Open a NEW Claude Code session and type:");
  console.log("  /21w:start:     profile and project choice");
  console.log("  /21w:issues:    vetted good-first-issues");
  console.log("  /21w:plan:      your 21-week plan");
  console.log("  /21w:week <n>:  weekly mentoring");
  console.log(
    "  /21w:review:    review of your draft with maintainer-level severity"
  );
}

function uninstall(base) {
  fs.rmSync(path.join(base, "skills", "21w-mentor"), {
    recursive: true,
    force: true,
  });
  fs.rmSync(path.join(base, "commands", "21w"), {
    recursive: true,
    force: true,
  });
  console.log("✓ 21w-mentor uninstalled from " + base);
}

const [, , cmd, ...flags] = process.argv;
const project = flags.includes("--project");
const base = project
  ? path.join(process.cwd(), ".claude")
  : path.join(os.homedir(), ".claude");

switch (cmd) {
  case "init":
  case "install":
    install(base);
    if (project)
      console.log(
        "\n(Installed at project level: it travels with the repo and is shared via git.)"
      );
    break;
  case "uninstall":
    uninstall(base);
    break;
  default:
    console.log(`21w-mentor: author-first mentor for contributing to Bitcoin FOSS

  npx 21w-mentor init              installs into ~/.claude (global)
  npx 21w-mentor init --project    installs into ./.claude (this project)
  npx 21w-mentor uninstall         uninstalls

Commands it installs: ${COMMANDS.map(c => `/21w:${c}`).join("  ")}
More info: https://github.com/ifuensan/21weeks`);
    process.exit(cmd ? 1 : 0);
}
