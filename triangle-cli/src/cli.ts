#!/usr/bin/env node

import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { formatError, formatSolvedTriangle } from "./format.js";
import { solveTriangle, type TriangleInput } from "./solver.js";

type ParsedArgs = TriangleInput & {
  help?: boolean;
  interactive?: boolean;
};

const HELP_TEXT = `triangle-solver

Solve common triangle problems from the command line.

Usage:
  npm start -- --a 3 --b 4 --c 5
  npm start -- --a 7 --b 10 --angleC 30
  npm start -- --c 8 --angleA 50 --angleB 60
  npm start -- --right --a 3 --b 4
  npm start -- --interactive

Supported flags:
  --a, --b, --c           Side lengths
  --angleA, --angleB, --angleC
                          Angles in degrees
  --right                 Solve using right-triangle mode (side c is the hypotenuse)
  --interactive           Prompt for values instead of requiring flags
  --help                  Show this help text

Supported solve cases:
  SSS
  SAS (two sides and the included angle)
  ASA/AAS (one side and two angles)
  Right triangles (two sides or one acute angle plus one side)
`;

function parseNumberFlag(flag: string, rawValue: string | undefined): number {
  if (rawValue === undefined) {
    throw new Error(`Missing value for ${flag}.`);
  }

  const value = Number(rawValue);
  if (!Number.isFinite(value)) {
    throw new Error(`${flag} must be a valid number.`);
  }

  return value;
}

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    switch (token) {
      case "--help":
      case "-h":
        parsed.help = true;
        break;
      case "--interactive":
      case "-i":
        parsed.interactive = true;
        break;
      case "--right":
        parsed.right = true;
        break;
      case "--a":
      case "--b":
      case "--c": {
        const value = parseNumberFlag(token, argv[index + 1]);
        parsed[token.slice(2) as "a" | "b" | "c"] = value;
        index += 1;
        break;
      }
      case "--angleA":
      case "--angleB":
      case "--angleC": {
        const value = parseNumberFlag(token, argv[index + 1]);
        const key = token.slice(2) as "angleA" | "angleB" | "angleC";
        parsed[key] = value;
        index += 1;
        break;
      }
      default:
        throw new Error(`Unknown argument: ${token}`);
    }
  }

  return parsed;
}

async function promptForOptionalNumber(question: string, rl: ReturnType<typeof createInterface>): Promise<number | undefined> {
  const answer = (await rl.question(question)).trim();
  if (answer === "") {
    return undefined;
  }

  const value = Number(answer);
  if (!Number.isFinite(value)) {
    throw new Error(`Expected a number for "${question.trim()}".`);
  }

  return value;
}

async function promptForInteractiveInput(): Promise<TriangleInput> {
  const rl = createInterface({ input, output });

  try {
    const rightAnswer = (await rl.question("Right triangle mode? (y/N): ")).trim().toLowerCase();
    const right = rightAnswer === "y" || rightAnswer === "yes";

    output.write("Leave fields blank if they are unknown.\n");

    const triangleInput: TriangleInput = {
      right,
      a: await promptForOptionalNumber("Side a: ", rl),
      b: await promptForOptionalNumber("Side b: ", rl),
      c: await promptForOptionalNumber("Side c: ", rl),
      angleA: await promptForOptionalNumber("Angle A (degrees): ", rl),
      angleB: await promptForOptionalNumber("Angle B (degrees): ", rl),
      angleC: right ? 90 : await promptForOptionalNumber("Angle C (degrees): ", rl)
    };

    return triangleInput;
  } finally {
    rl.close();
  }
}

async function main(): Promise<void> {
  try {
    const parsed = parseArgs(process.argv.slice(2));

    if (parsed.help) {
      output.write(`${HELP_TEXT}\n`);
      return;
    }

    const triangleInput = parsed.interactive ? await promptForInteractiveInput() : parsed;
    const solvedTriangle = solveTriangle(triangleInput);
    output.write(`${formatSolvedTriangle(solvedTriangle)}\n`);
  } catch (error) {
    output.write(`${formatError(error)}\n`);
    process.exitCode = 1;
  }
}

void main();