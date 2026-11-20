import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const SCAFFOLD = "ac_01a1fa1e-014d-7897-9e82-6b7deac7c92f";

const root = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")) as {
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};

describe("project scaffold", () => {
  it(`defines the dev, lint, typecheck, test, build, e2e and seed scripts [${SCAFFOLD}]`, () => {
    expect(pkg.scripts).toMatchObject({
      dev: "next dev",
      build: "next build",
      lint: "eslint",
      test: "vitest run",
      seed: "tsx scripts/seed.ts",
    });
    expect(pkg.scripts.typecheck).toContain("tsc --noEmit");
    expect(pkg.scripts.e2e).toContain("playwright test");
  });

  it(`is a Next.js 16 App Router app with TypeScript and Tailwind CSS [${SCAFFOLD}]`, () => {
    expect(pkg.dependencies.next).toMatch(/^\^?16\./);
    expect(pkg.devDependencies.typescript).toBeDefined();
    expect(pkg.devDependencies.tailwindcss).toMatch(/^\^?4/);
    expect(fs.existsSync(path.join(root, "src/app/layout.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(root, "src/app/page.tsx"))).toBe(true);
    expect(fs.readFileSync(path.join(root, "src/app/globals.css"), "utf8")).toContain('@import "tailwindcss"');
  });
});
