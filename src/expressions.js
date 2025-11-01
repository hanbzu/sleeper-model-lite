// ============================================================================
// Expression Evaluation
// ============================================================================

/**
 * Evaluates a mathematical expression with parameter and flow substitutions.
 * @param {string} expr - The expression to evaluate (e.g., "parameters.x + flows.y")
 * @param {Object} parameters - Parameter values
 * @param {Object} definedFlows - Already defined flow values
 * @returns {number} The evaluated result
 * @throws {Error} If parameter/flow is undefined or expression is invalid
 */
export const evaluateExpression = (expr, parameters, definedFlows) => {
    let evaluated = expr;

    // Replace parameters.xxx with actual values
    evaluated = evaluated.replace(/parameters\.(\w+)/g, (match, paramName) => {
        if (parameters[paramName] === undefined)
            throw new Error(`Unknown parameter: ${paramName}`);

        return parameters[paramName];
    });

    // Replace flows.xxx with actual values
    evaluated = evaluated.replace(/flows\.(\w+)/g, (match, flowId) => {
        if (definedFlows[flowId] === undefined)
            throw new Error(`Flow ${flowId} not yet defined`);

        return definedFlows[flowId];
    });

    // Evaluate the mathematical expression
    // WARNING: Using eval() - in production, use a proper expression parser
    try {
        return eval(evaluated);
    } catch (error) {
        throw new Error(`Cannot evaluate expression: ${expr}`);
    }
};

// ============================================================================
// Constraint Evaluation
// ============================================================================

/**
 * Parses a constraint string into left and right expressions.
 * @param {string} constraint - Constraint in format "flows.x == expression"
 * @returns {Array<string>} [leftExpr, rightExpr]
 * @throws {Error} If constraint format is invalid
 */
export const parseConstraint = (constraint) => {
    const parts = constraint.split("==").map((s) => s.trim());
    if (parts.length !== 2) {
        throw new Error("Constraint must contain exactly one ==");
    }
    return parts;
};

/**
 * Evaluates a single constraint and returns updated flow definitions.
 * @param {string} constraint - The constraint to evaluate
 * @param {Object} parameters - Parameter values
 * @param {Object} definedFlows - Currently defined flows
 * @returns {Object} Updated flow definitions
 * @throws {Error} If constraint is invalid or cannot be evaluated
 */
export const evaluateConstraint = (constraint, parameters, definedFlows) => {
    const [leftExpr, rightExpr] = parseConstraint(constraint);

    // Left side must be a simple flow reference
    const flowMatch = leftExpr.match(/^flows\.(\w+)$/);

    if (!flowMatch) {
        throw new Error(
            "Left side of constraint must be a flow reference (flows.id)",
        );
    }

    const flowId = flowMatch[1];
    const value = evaluateExpression(rightExpr, parameters, definedFlows);

    return { ...definedFlows, [flowId]: value };
};

/**
 * Evaluates all constraints sequentially.
 * @param {Array<string>} constraints - List of constraints
 * @param {Object} parameters - Parameter values
 * @returns {Object} All flow definitions from constraints
 * @throws {Error} If any constraint fails to evaluate
 */
export const evaluateAllConstraints = (constraints, parameters) => {
    return constraints.reduce((definedFlows, constraint) => {
        try {
            return evaluateConstraint(constraint, parameters, definedFlows);
        } catch (error) {
            throw new Error(
                `Error evaluating constraint "${constraint}": ${error.message}`,
            );
        }
    }, {});
};
