import { readFile } from "node:fs/promises";
import path from "node:path";

export async function loadProjectSkill(name: string): Promise<string> {
  const filePath = path.join(process.cwd(), ".gsd", "skills", name, "SKILL.md");
  return readFile(filePath, "utf8");
}
