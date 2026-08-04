import test from "node:test";
import assert from "node:assert/strict";
import { solveTriangle } from "../src/solver.js";

function assertApprox(actual: number, expected: number, tolerance = 1e-4): void {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected}.`
  );
}

test("solves an SSS triangle", () => {
  const result = solveTriangle({ a: 3, b: 4, c: 5 });

  assert.equal(result.caseType, "SSS");
  assertApprox(result.angles.C, 90);
  assertApprox(result.area, 6);
  assertApprox(result.perimeter, 12);
});

test("solves an SAS triangle", () => {
  const result = solveTriangle({ a: 7, b: 10, angleC: 30 });

  assert.equal(result.caseType, "SSS");
  assertApprox(result.sides.c, 5.2684, 1e-3);
  assertApprox(result.area, 17.5);
});

test("solves an ASA triangle", () => {
  const result = solveTriangle({ c: 8, angleA: 50, angleB: 60 });

  assert.equal(result.caseType, "AAS");
  assertApprox(result.angles.C, 70);
  assertApprox(result.sides.a, 6.5217, 1e-3);
  assertApprox(result.sides.b, 7.3728, 1e-3);
});

test("solves a right triangle from two legs", () => {
  const result = solveTriangle({ right: true, a: 3, b: 4 });

  assert.equal(result.caseType, "RIGHT");
  assertApprox(result.sides.c, 5);
  assertApprox(result.angles.C, 90);
});

test("solves a right triangle from one acute angle and the hypotenuse", () => {
  const result = solveTriangle({ right: true, c: 10, angleA: 30 });

  assertApprox(result.sides.a, 5, 1e-3);
  assertApprox(result.sides.b, 8.6603, 1e-3);
  assertApprox(result.angles.B, 60);
});

test("rejects invalid side lengths", () => {
  assert.throws(() => solveTriangle({ a: 1, b: 2, c: 10 }), /triangle inequality/);
});

test("rejects ambiguous SSA input", () => {
  assert.throws(() => solveTriangle({ a: 5, b: 6, angleA: 30 }), /SSA input is ambiguous/);
});