import type { SolvedTriangle } from "./solver.js";

function formatNumber(value: number): string {
  if (Math.abs(value) < 1e-12) {
    return "0";
  }

  return value.toFixed(4).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

export function formatSolvedTriangle(result: SolvedTriangle): string {
  const lines = [
    "Triangle solved.",
    `Case: ${result.caseType}`,
    `Sides: a=${formatNumber(result.sides.a)}, b=${formatNumber(result.sides.b)}, c=${formatNumber(result.sides.c)}`,
    `Angles: A=${formatNumber(result.angles.A)} deg, B=${formatNumber(result.angles.B)} deg, C=${formatNumber(result.angles.C)} deg`,
    `Perimeter: ${formatNumber(result.perimeter)}`,
    `Area: ${formatNumber(result.area)}`
  ];

  if (result.notes.length > 0) {
    lines.push(`Notes: ${result.notes.join(" ")}`);
  }

  return lines.join("\n");
}

export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }

  return "Error: Unknown failure while solving the triangle.";
}