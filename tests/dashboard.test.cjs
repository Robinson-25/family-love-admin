const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const { test } = require("node:test");
const ts = require("typescript");

// Compile the pure dashboard helpers using the project's existing TypeScript dependency.
const sourcePath = path.resolve(__dirname, "../src/lib/dashboard.ts");
const compiled = ts.transpileModule(readFileSync(sourcePath, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
});
const helpers = new Module(sourcePath, module);
helpers._compile(compiled.outputText, sourcePath);
const { getMonthlyActivity, monthKey, normalizeSearch, sortRecent, shortDate } =
  helpers.exports;

const publication = (tipo, createdAt) => ({
  tipo,
  createdAt,
  id: 1,
  titulo: "Historia",
  fecha: "",
  imagen: "",
});

test("uses Lima's calendar month at UTC month boundaries", () => {
  assert.equal(monthKey("2026-10-01T04:59:59Z"), "2026-09");
  assert.equal(monthKey("2026-10-01T05:00:00Z"), "2026-10");
  assert.equal(monthKey("invalid"), null);
});

test("six-month activity crosses years and counts each content type separately", () => {
  const result = getMonthlyActivity(
    [
      publication("proyectos", "2025-12-10T12:00:00Z"),
      publication("proyectos", "2026-01-10T12:00:00Z"),
      publication("noticias", "2026-01-10T12:00:00Z"),
      publication("noticias", "2026-01-12T12:00:00Z"),
      publication("noticias", "2025-07-01T12:00:00Z"),
    ],
    "2026-02-10T12:00:00Z",
    6,
  );
  assert.deepEqual(
    result.map((item) => item.key),
    ["2025-09", "2025-10", "2025-11", "2025-12", "2026-01", "2026-02"],
  );
  assert.equal(result[3].proyectos, 1);
  assert.equal(result[4].proyectos, 1);
  assert.equal(result[4].noticias, 2);
  assert.equal(
    result.reduce((sum, item) => sum + item.proyectos + item.noticias, 0),
    4,
  );
});

test("twelve-month view includes empty months without inventing activity", () => {
  const result = getMonthlyActivity([], "2026-10-01T15:00:00Z", 12);
  assert.equal(result.length, 12);
  assert.equal(result[0].key, "2025-11");
  assert.equal(result[11].key, "2026-10");
  assert.ok(
    result.every((item) => item.proyectos === 0 && item.noticias === 0),
  );
});

test("missing and invalid publication dates are excluded from the chart", () => {
  const result = getMonthlyActivity(
    [publication("proyectos", undefined), publication("noticias", "invalid")],
    "2026-10-01T15:00:00Z",
    6,
  );
  assert.ok(
    result.every((item) => item.proyectos === 0 && item.noticias === 0),
  );
  assert.equal(shortDate("invalid"), "Sin fecha");
});

test("recent ordering preserves the source array and handles missing dates", () => {
  const source = [
    { id: 1 },
    { id: 2, createdAt: "2026-01-01T12:00:00Z" },
    { id: 3, createdAt: "2026-05-01T12:00:00Z" },
  ];
  assert.deepEqual(
    sortRecent(source).map((item) => item.id),
    [3, 2, 1],
  );
  assert.deepEqual(
    source.map((item) => item.id),
    [1, 2, 3],
  );
});

test("search matches Spanish accents, case and surrounding whitespace", () => {
  assert.equal(normalizeSearch("  Educación y ACCIÓN "), "educacion y accion");
  assert.ok(normalizeSearch("María Pérez").includes(normalizeSearch("maria")));
});
