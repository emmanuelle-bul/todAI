const EPSILON = 1e-6;
function isDefined(value) {
    return value !== undefined;
}
function assertPositive(name, value) {
    if (!isDefined(value)) {
        return;
    }
    if (!Number.isFinite(value) || value <= 0) {
        throw new Error(`${name} must be a positive number.`);
    }
}
function assertAngle(name, value) {
    if (!isDefined(value)) {
        return;
    }
    if (!Number.isFinite(value) || value <= 0 || value >= 180) {
        throw new Error(`${name} must be greater than 0 and less than 180 degrees.`);
    }
}
function approxEqual(left, right, tolerance = EPSILON) {
    return Math.abs(left - right) <= tolerance;
}
function toRadians(angle) {
    return (angle * Math.PI) / 180;
}
function toDegrees(angle) {
    return (angle * 180) / Math.PI;
}
function countDefined(values) {
    return values.filter(isDefined).length;
}
function clampCosine(value) {
    return Math.min(1, Math.max(-1, value));
}
function computeArea(a, b, c) {
    const semiPerimeter = (a + b + c) / 2;
    return Math.sqrt(semiPerimeter * (semiPerimeter - a) * (semiPerimeter - b) * (semiPerimeter - c));
}
function validateTriangleInequality(a, b, c) {
    if (a + b <= c + EPSILON || a + c <= b + EPSILON || b + c <= a + EPSILON) {
        throw new Error("The provided side lengths do not satisfy the triangle inequality.");
    }
}
function buildSolvedTriangle(caseType, a, b, c, A, B, C, notes = []) {
    validateTriangleInequality(a, b, c);
    return {
        caseType,
        sides: { a, b, c },
        angles: { A, B, C },
        area: computeArea(a, b, c),
        perimeter: a + b + c,
        notes
    };
}
function solveSSS(a, b, c) {
    validateTriangleInequality(a, b, c);
    const A = toDegrees(Math.acos(clampCosine((b * b + c * c - a * a) / (2 * b * c))));
    const B = toDegrees(Math.acos(clampCosine((a * a + c * c - b * b) / (2 * a * c))));
    const C = 180 - A - B;
    return buildSolvedTriangle("SSS", a, b, c, A, B, C);
}
function solveSAS(input) {
    const { a, b, c, angleA, angleB, angleC } = input;
    if (isDefined(a) && isDefined(b) && isDefined(angleC)) {
        const derivedC = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(toRadians(angleC)));
        return solveSSS(a, b, derivedC);
    }
    if (isDefined(b) && isDefined(c) && isDefined(angleA)) {
        const derivedA = Math.sqrt(b * b + c * c - 2 * b * c * Math.cos(toRadians(angleA)));
        return solveSSS(derivedA, b, c);
    }
    if (isDefined(a) && isDefined(c) && isDefined(angleB)) {
        const derivedB = Math.sqrt(a * a + c * c - 2 * a * c * Math.cos(toRadians(angleB)));
        return solveSSS(a, derivedB, c);
    }
    throw new Error("SAS input must include two sides and the angle between them.");
}
function solveASAorAAS(input) {
    const { a, b, c, angleA, angleB, angleC } = input;
    const A = angleA;
    const B = angleB;
    const C = angleC;
    const knownAngles = [A, B, C].filter(isDefined);
    if (knownAngles.length !== 2) {
        throw new Error("ASA/AAS input must include exactly two angles.");
    }
    const totalKnownAngles = knownAngles[0] + knownAngles[1];
    if (totalKnownAngles >= 180 - EPSILON) {
        throw new Error("The provided angles do not form a valid triangle.");
    }
    const solvedA = A ?? 180 - totalKnownAngles;
    const solvedB = B ?? 180 - totalKnownAngles;
    const solvedC = C ?? 180 - totalKnownAngles;
    const sideCount = countDefined([a, b, c]);
    if (sideCount !== 1) {
        throw new Error("ASA/AAS input must include exactly one side length.");
    }
    if (isDefined(a)) {
        const solvedBLength = (a * Math.sin(toRadians(solvedB))) / Math.sin(toRadians(solvedA));
        const solvedCLength = (a * Math.sin(toRadians(solvedC))) / Math.sin(toRadians(solvedA));
        const caseType = isDefined(angleA) ? "ASA" : "AAS";
        return buildSolvedTriangle(caseType, a, solvedBLength, solvedCLength, solvedA, solvedB, solvedC);
    }
    if (isDefined(b)) {
        const solvedALength = (b * Math.sin(toRadians(solvedA))) / Math.sin(toRadians(solvedB));
        const solvedCLength = (b * Math.sin(toRadians(solvedC))) / Math.sin(toRadians(solvedB));
        const caseType = isDefined(angleB) ? "ASA" : "AAS";
        return buildSolvedTriangle(caseType, solvedALength, b, solvedCLength, solvedA, solvedB, solvedC);
    }
    if (!isDefined(c)) {
        throw new Error("ASA/AAS input requires one side length.");
    }
    const solvedALength = (c * Math.sin(toRadians(solvedA))) / Math.sin(toRadians(solvedC));
    const solvedBLength = (c * Math.sin(toRadians(solvedB))) / Math.sin(toRadians(solvedC));
    const caseType = isDefined(angleC) ? "ASA" : "AAS";
    return buildSolvedTriangle(caseType, solvedALength, solvedBLength, c, solvedA, solvedB, solvedC);
}
function solveRightTriangle(input) {
    let { a, b, c, angleA, angleB, angleC } = input;
    if (isDefined(angleC) && !approxEqual(angleC, 90)) {
        throw new Error("Right triangle mode requires angle C to be 90 degrees.");
    }
    angleC = 90;
    if (isDefined(angleA) && isDefined(angleB) && !approxEqual(angleA + angleB, 90)) {
        throw new Error("In a right triangle, angles A and B must add up to 90 degrees.");
    }
    if (isDefined(angleA) && !isDefined(angleB)) {
        angleB = 90 - angleA;
    }
    if (isDefined(angleB) && !isDefined(angleA)) {
        angleA = 90 - angleB;
    }
    const sideCount = countDefined([a, b, c]);
    if (sideCount >= 2) {
        if (isDefined(a) && isDefined(b)) {
            c = Math.hypot(a, b);
        }
        else if (isDefined(a) && isDefined(c)) {
            if (a >= c) {
                throw new Error("In a right triangle, the hypotenuse must be longer than either leg.");
            }
            b = Math.sqrt(c * c - a * a);
        }
        else if (isDefined(b) && isDefined(c)) {
            if (b >= c) {
                throw new Error("In a right triangle, the hypotenuse must be longer than either leg.");
            }
            a = Math.sqrt(c * c - b * b);
        }
        if (!isDefined(a) || !isDefined(b) || !isDefined(c)) {
            throw new Error("Right triangle mode requires at least two usable side lengths.");
        }
        const derivedA = toDegrees(Math.asin(a / c));
        const derivedB = 90 - derivedA;
        if (isDefined(angleA) && !approxEqual(angleA, derivedA, 1e-4)) {
            throw new Error("The provided angle A does not match the side lengths.");
        }
        if (isDefined(angleB) && !approxEqual(angleB, derivedB, 1e-4)) {
            throw new Error("The provided angle B does not match the side lengths.");
        }
        return buildSolvedTriangle("RIGHT", a, b, c, derivedA, derivedB, 90, ["Right triangle mode uses side c as the hypotenuse."]);
    }
    if (!isDefined(angleA) || countDefined([a, b, c]) !== 1) {
        throw new Error("Right triangle mode requires either two side lengths or one acute angle plus one side.");
    }
    if (isDefined(c)) {
        a = c * Math.sin(toRadians(angleA));
        b = c * Math.cos(toRadians(angleA));
    }
    else if (isDefined(a)) {
        b = a / Math.tan(toRadians(angleA));
        c = a / Math.sin(toRadians(angleA));
    }
    else if (isDefined(b)) {
        a = b * Math.tan(toRadians(angleA));
        c = b / Math.cos(toRadians(angleA));
    }
    if (!isDefined(a) || !isDefined(b) || !isDefined(c) || !isDefined(angleB)) {
        throw new Error("Could not solve the right triangle from the provided values.");
    }
    return buildSolvedTriangle("RIGHT", a, b, c, angleA, angleB, 90, ["Right triangle mode uses side c as the hypotenuse."]);
}
function assertSupportedInputShape(input) {
    const sideCount = countDefined([input.a, input.b, input.c]);
    const angleCount = countDefined([input.angleA, input.angleB, input.angleC]);
    if (input.right) {
        return;
    }
    if (sideCount === 3 && angleCount === 0) {
        return;
    }
    if (sideCount === 2 && angleCount === 1) {
        return;
    }
    if (sideCount === 1 && angleCount === 2) {
        return;
    }
    throw new Error("Supported inputs are SSS, SAS, ASA/AAS, or right-triangle mode. Provide exactly one supported combination of sides and angles.");
}
export function solveTriangle(input) {
    assertPositive("Side a", input.a);
    assertPositive("Side b", input.b);
    assertPositive("Side c", input.c);
    assertAngle("Angle A", input.angleA);
    assertAngle("Angle B", input.angleB);
    assertAngle("Angle C", input.angleC);
    if (input.right) {
        return solveRightTriangle(input);
    }
    assertSupportedInputShape(input);
    const sideCount = countDefined([input.a, input.b, input.c]);
    const angleCount = countDefined([input.angleA, input.angleB, input.angleC]);
    if (sideCount === 3) {
        return solveSSS(input.a, input.b, input.c);
    }
    if (sideCount === 2 && angleCount === 1) {
        const isIncludedAngle = (isDefined(input.a) && isDefined(input.b) && isDefined(input.angleC)) ||
            (isDefined(input.b) && isDefined(input.c) && isDefined(input.angleA)) ||
            (isDefined(input.a) && isDefined(input.c) && isDefined(input.angleB));
        if (!isIncludedAngle) {
            throw new Error("SSA input is ambiguous and is not supported in version 1.");
        }
        return solveSAS(input);
    }
    if (sideCount === 1 && angleCount === 2) {
        return solveASAorAAS(input);
    }
    throw new Error("Unable to determine a supported triangle-solving case from the provided values.");
}
