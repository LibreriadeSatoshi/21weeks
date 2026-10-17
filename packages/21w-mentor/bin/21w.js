#!/usr/bin/env node
/**
 * 21w-mentor — instalador del mentor autor-primero para Bitcoin FOSS.
 *
 * Uso:
 *   npx 21w-mentor init              instala en ~/.claude (global, todos tus proyectos)
 *   npx 21w-mentor init --project    instala en ./.claude (solo este proyecto, viaja con el repo)
 *   npx 21w-mentor uninstall         elimina skill y comandos
 *
 * Sin dependencias: copia el skill y los comandos slash a la estructura de
 * Claude Code. Otros agentes (Kimi Code, OpenCode) leen el mismo SKILL.md —
 * basta apuntarles a la carpeta instalada.
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
  console.log(`✓ Skill instalado en     ${skillDest}`);
  console.log(`✓ Comandos instalados en ${cmdDest}`);
  console.log();
  console.log("Abre una sesión NUEVA de Claude Code y escribe:");
  console.log("  /21w:start:     perfil y elección de proyecto");
  console.log("  /21w:issues:    good-first-issues vetadas");
  console.log("  /21w:plan:      tu plan de 21 semanas");
  console.log("  /21w:week <n>:  mentoría de la semana");
  console.log("  /21w:review:    review de tu borrador con severidad de maintainer");
}

function uninstall(base) {
  fs.rmSync(path.join(base, "skills", "21w-mentor"), { recursive: true, force: true });
  fs.rmSync(path.join(base, "commands", "21w"), { recursive: true, force: true });
  console.log("✓ 21w-mentor desinstalado de " + base);
}

const [, , cmd, ...flags] = process.argv;
const project = flags.includes("--project");
const base = project ? path.join(process.cwd(), ".claude") : path.join(os.homedir(), ".claude");

switch (cmd) {
  case "init":
  case "install":
    install(base);
    if (project) console.log("\n(Instalado a nivel de proyecto: viaja con el repo y se comparte por git.)");
    break;
  case "uninstall":
    uninstall(base);
    break;
  default:
    console.log(`21w-mentor: mentor autor-primero para contribuir a Bitcoin FOSS

  npx 21w-mentor init              instala en ~/.claude (global)
  npx 21w-mentor init --project    instala en ./.claude (este proyecto)
  npx 21w-mentor uninstall         desinstala

Comandos que instala: ${COMMANDS.map((c) => `/21w:${c}`).join("  ")}
Más info: https://github.com/ifuensan/21weeks`);
    process.exit(cmd ? 1 : 0);
}
