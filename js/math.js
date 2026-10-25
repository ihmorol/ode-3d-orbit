/**
 * Expression environment and the indexed (ring) expansion rules.
 * Visitor-entered expressions are compiled with `new Function` against a
 * fixed math environment — a deliberate, client-side-only surface: the
 * code executed is always the visitor's own input in their own browser.
 */

export const MATH_ENV = {
    sin: Math.sin, cos: Math.cos, tan: Math.tan,
    asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2,
    sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
    exp: Math.exp, log: Math.log, sqrt: Math.sqrt, cbrt: Math.cbrt,
    abs: Math.abs, min: Math.min, max: Math.max, pow: Math.pow,
    sign: Math.sign, floor: Math.floor, ceil: Math.ceil,
    pi: Math.PI, PI: Math.PI, e: Math.E, E: Math.E
};

const IDENTIFIER = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/** `^` reads as exponentiation in the grammar; JS wants `**`. */
export function preprocessMathExpression(expr) {
    return String(expr).replace(/\^/g, '**');
}

/**
 * Expand one row of an indexed rule for state index `i` (1-based):
 * `x[i+k]` tokens become concrete state names wrapped modulo N, and the
 * bare indices `i` and `N` are substituted last.
 */
export function expandIndexedExpression(expr, i, N) {
    const wrap = (k) => ((((k - 1) % N) + N) % N) + 1;
    let out = String(expr).replace(/x\[\s*i\s*([+-]\s*\d+)?\s*\]/g, (match, offsetStr) => {
        const offset = offsetStr ? parseInt(offsetStr.replace(/\s+/g, ''), 10) : 0;
        return `x${wrap(i + offset)}`;
    });
    out = out.replace(/\bx_next\b/g, `x${wrap(i + 1)}`)
             .replace(/\bx_prev2\b/g, `x${wrap(i - 2)}`)
             .replace(/\bx_prev\b/g, `x${wrap(i - 1)}`)
             .replace(/\bx_curr\b/g, `x${wrap(i)}`);
    out = out.replace(/\bN\b/g, String(N));
    out = out.replace(/\bi\b/g, String(i));
    return out;
}

/**
 * Build an N-state system from an indexed derivative rule and an initial
 * seed rule. Constants in `paramsObj` are passed to the seed evaluator as
 * named bindings (identifiers only; invalid names are skipped).
 */
export function buildCyclicStates(N, formulaExpr, initExpr, paramsObj) {
    const params = paramsObj || {};
    const paramNames = Object.keys(params).filter((k) => IDENTIFIER.test(k));

    const states = [];
    for (let idx = 1; idx <= N; idx++) {
        const expandedEq = expandIndexedExpression(formulaExpr, idx, N);
        let initVal = 0.1 * Math.sin(idx);
        try {
            const initFn = new Function(
                'i', 'N', 'math', ...paramNames,
                `const { sin, cos, tan, exp, sqrt, abs, sign, pi, PI } = math;
                 return (${preprocessMathExpression(initExpr)});`
            );
            const computed = initFn(idx, N, MATH_ENV, ...paramNames.map((n) => params[n]));
            if (Number.isFinite(computed)) initVal = Number(computed.toFixed(4));
        } catch {
            initVal = idx === 1 ? 1.08 : 1.0;
        }
        states.push({
            name: `x${idx}`,
            eq: expandedEq,
            init: initVal
        });
    }
    return states;
}
