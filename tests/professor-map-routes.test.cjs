const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const resolveProfessorMapRoute = require("../professor-map-routes.js");

const map = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "homepage-map.json"), "utf8"));
const rosterSource = fs.readFileSync(path.join(__dirname, "..", "roster-data.js"), "utf8");
const rosterMatch = rosterSource.match(/^window\.LECTURE_ROSTER\s*=\s*(\[[\s\S]*\]);?\s*$/);
assert.ok(rosterMatch, "the public roster remains a JSON literal");
const roster = JSON.parse(rosterMatch[1]);
const routeKeys = ["class", "research", "classRecorded", "classOnsite"];

test("all 29 exact professor course codes resolve to their mapped route URLs", () => {
  assert.equal(map.count, 29);
  assert.equal(map.professors.length, 29);
  assert.equal(new Set(map.professors.map((professor) => professor.courseCode)).size, 29);
  for (const professor of map.professors) {
    for (const routeKey of routeKeys) {
      assert.equal(resolveProfessorMapRoute(map, professor.courseCode, routeKey), professor[routeKey], `${professor.courseCode} ${routeKey}`);
    }
  }
});

test("all 29 public roster course codes join to exactly their own map professor", () => {
  assert.equal(roster.length, 29);
  for (const professor of roster) {
    const matches = map.professors.filter((entry) => entry.courseCode === professor.courseCode);
    assert.equal(matches.length, 1, professor.courseCode);
    assert.equal(matches[0].slug, professor.slug, professor.courseCode);
    for (const routeKey of routeKeys) {
      assert.equal(resolveProfessorMapRoute(map, professor.courseCode, routeKey), matches[0][routeKey], `${professor.slug} ${routeKey}`);
    }
  }
});

test("the mapped Roland defaults omit p while other professors retain their exact p value", () => {
  const roland = map.professors.find((professor) => professor.slug === "gunther-roland");
  const other = map.professors.find((professor) => professor.slug !== "gunther-roland");
  assert.ok(roland); assert.ok(other);
  assert.equal(new URL(resolveProfessorMapRoute(map, roland.courseCode, "class")).search, "");
  assert.equal(new URL(resolveProfessorMapRoute(map, other.courseCode, "class")).searchParams.get("p"), other.slug);
});

test("unknown, ambiguous, unsupported, or cross-map matches do not produce a guessed URL", () => {
  assert.equal(resolveProfessorMapRoute(map, "NO-SUCH-COURSE", "class"), null);
  assert.equal(resolveProfessorMapRoute(map, map.professors[0].courseCode, "home"), null);
  const ambiguous = structuredClone(map);
  ambiguous.professors[1] = { ...ambiguous.professors[1], courseCode: ambiguous.professors[0].courseCode };
  assert.equal(resolveProfessorMapRoute(ambiguous, ambiguous.professors[0].courseCode, "class"), null);
  const foreign = structuredClone(map);
  foreign.professors[0] = { ...foreign.professors[0], class: "https://example.invalid/class.html" };
  assert.equal(resolveProfessorMapRoute(foreign, foreign.professors[0].courseCode, "class"), null);
});
