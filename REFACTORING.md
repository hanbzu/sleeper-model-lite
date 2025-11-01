# Refactoring Documentation

## Overview

The `sankey-solver.js` file has been refactored from a single monolithic file (~370 lines) into a modular structure with separate concerns. This improves testability, maintainability, and code organization.

## Changes Made

### New Directory Structure

```
nightmodel/
├── sankey-solver.js          # Simplified CLI entry point (26 lines)
└── src/
    ├── README.md             # Module documentation
    ├── expressions.js        # Expression & constraint evaluation (102 lines)
    ├── balance.js            # Node balance solving logic (138 lines)
    ├── verification.js       # Solution verification (83 lines)
    ├── formatter.js          # Output formatting (99 lines)
    ├── solver.js             # Main solver orchestration (99 lines)
    ├── expressions.test.js   # Vitest tests for expressions (28 tests)
    ├── balance.test.js       # Vitest tests for balance logic (35 tests)
    ├── verification.test.js  # Vitest tests for verification (30 tests)
    ├── formatter.test.js     # Vitest tests for formatter (26 tests)
    └── solver.test.js        # Integration tests (21 tests)
```

### Module Breakdown

#### 1. `src/expressions.js`
**Responsibility:** Parsing and evaluating mathematical expressions and constraints

**Exports:**
- `evaluateExpression()` - Evaluates expressions with parameter/flow substitutions
- `parseConstraint()` - Parses constraint strings
- `evaluateConstraint()` - Evaluates a single constraint
- `evaluateAllConstraints()` - Evaluates all constraints sequentially

**Why separate:** Expression evaluation is a distinct concern that can be tested and potentially replaced (e.g., with a safer parser than `eval()`)

#### 2. `src/balance.js`
**Responsibility:** Core solving logic using node balance constraints

**Exports:**
- `getNodeFlows()` - Gets inputs/outputs for a node
- `isSourceOrSink()` - Identifies source/sink nodes
- `getUndefinedFlows()` - Filters undefined flows
- `sumDefinedFlows()` - Sums flow values
- `solveNodeBalance()` - Solves one node
- `solveIteration()` - One solving iteration
- `solveIteratively()` - Iterative solver

**Why separate:** The balance constraint solving is the core algorithm and benefits most from isolated testing with various graph topologies

#### 3. `src/verification.js`
**Responsibility:** Validating that solutions satisfy all constraints

**Exports:**
- `verifyNodeBalance()` - Verifies one node's balance
- `verifyBalance()` - Verifies all nodes
- `isFullySolved()` - Checks completeness
- `getUndeterminedFlowIds()` - Lists undefined flows

**Why separate:** Verification logic is distinct from solving and can be tested independently with known valid/invalid solutions

#### 4. `src/formatter.js`
**Responsibility:** Formatting solver results for display

**Exports:**
- `formatFlowList()` - Formats flow values
- `formatBalanceErrors()` - Formats error details
- `formatSuccess()` - Formats success messages
- `formatUnderdetermined()` - Formats underdetermined errors
- `formatContradictory()` - Formats contradiction errors
- `formatResult()` - Main formatting dispatcher

**Why separate:** Presentation logic should be separate from business logic. This allows format changes without touching solver code.

#### 5. `src/solver.js`
**Responsibility:** Main orchestration of the solving process

**Exports:**
- `solve()` - Main entry point that coordinates all modules

**Why separate:** Provides a clean public API and orchestrates the other modules in the correct order

#### 6. `sankey-solver.js` (main file)
**Responsibility:** CLI interface only

**Simplified to:**
- Command-line argument parsing
- YAML file reading
- Calling `solve()` and `formatResult()`
- Exit code handling

## Benefits of Refactoring

### 1. **Testability**
- Each module can be unit tested independently
- Mock dependencies easily for focused tests
- Example test files demonstrate testing approach
- Smaller functions are easier to test comprehensively

### 2. **Maintainability**
- Clear separation of concerns
- Each module has a single responsibility
- Easier to locate and fix bugs
- Changes to one module don't affect others

### 3. **Readability**
- Smaller, focused files are easier to understand
- JSDoc comments on all exported functions
- Clear module dependencies documented in `src/README.md`
- Logical grouping of related functionality

### 4. **Extensibility**
- Easy to add new constraint types (modify `expressions.js`)
- Easy to add new solving strategies (modify `balance.js`)
- Easy to add new output formats (modify `formatter.js`)
- Modules can be reused in different contexts

### 5. **Documentation**
- Each function has clear JSDoc comments
- Module-level documentation in `src/README.md`
- Example usage in test files
- Clear interface definitions

## Testing with Vitest

### Test Framework Setup
The project uses **Vite** and **Vitest** for modern, fast testing:

- **Vite** - Build tool providing fast test execution
- **Vitest** - Native ESM test runner with Jest-compatible API
- **140 total tests** across 5 test files

### Running Tests

```bash
# Run tests in watch mode (recommended for development)
npm test

# Run tests once
npm run test:run

# Run tests with interactive UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

All modules have comprehensive test coverage:

- `expressions.test.js` - 28 tests for expression evaluation
- `balance.test.js` - 35 tests for node balance solving
- `verification.test.js` - 30 tests for solution verification
- `formatter.test.js` - 26 tests for output formatting
- `solver.test.js` - 21 integration tests

### Test Structure

Tests use Vitest's describe/it/expect API:

```javascript
import { describe, it, expect } from 'vitest';
import { evaluateExpression } from './src/expressions.js';

describe('evaluateExpression', () => {
    it('should evaluate simple parameter substitution', () => {
        const result = evaluateExpression('parameters.x + 10', { x: 5 }, {});
        expect(result).toBe(15);
    });
});
```

### Integration Testing
Complete system tests verify end-to-end functionality:

```javascript
import { solve } from './src/solver.js';

it('should solve branching network', () => {
    const result = solve(config);
    expect(result.success).toBe(true);
    expect(result.flows.src_split).toBe(1000);
});
```

## Backward Compatibility

✅ **Fully backward compatible**

The public API remains unchanged:
- `node sankey-solver.js example.yaml` works exactly as before
- `import { solve } from './sankey-solver.js'` still exports `solve()`
- All existing YAML configurations work without modification
- Output format is identical

## Migration Guide

### For CLI Users
No changes needed. Continue using:
```bash
node sankey-solver.js example.yaml
```

### For Programmatic Users
No changes needed. The import still works:
```javascript
import { solve } from './sankey-solver.js';
```

### For Developers/Testers
You can now import and test individual modules:
```javascript
import { evaluateExpression } from './src/expressions.js';
import { solveNodeBalance } from './src/balance.js';
import { verifyBalance } from './src/verification.js';
```

## Development Tools

### Vite Configuration

The project includes a `vite.config.js` with:
- Node environment for testing
- Global test utilities
- Coverage reporting (v8 provider)
- Automatic test file detection

### Package Scripts

```json
{
  "test": "vitest",              // Watch mode
  "test:ui": "vitest --ui",      // Interactive UI
  "test:run": "vitest run",      // Single run
  "test:coverage": "vitest run --coverage"  // With coverage
}
```

## Future Improvements

With this modular structure, the following improvements are now easier:

1. **Replace `eval()`** - Replace expression evaluation with a proper parser library
2. **Add Logging** - Add debug logging to individual modules without cluttering code
3. **Performance Optimization** - Profile and optimize individual modules
4. **Alternative Solvers** - Implement different solving strategies (e.g., linear programming)
5. **Type Safety** - Add TypeScript definitions for better type checking
6. ~~**Test Coverage**~~ - ✅ **COMPLETE** - Comprehensive test suite with Vitest (140 tests)
7. **Web Interface** - Reuse solver modules in a web UI without CLI dependencies

## Verification

All original functionality has been verified:
- ✅ CLI works with example.yaml
- ✅ Produces identical output
- ✅ All 140 Vitest tests pass
- ✅ Public API unchanged
- ✅ No breaking changes
- ✅ Comprehensive test coverage

## Metrics

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Main file lines | 370 | 26 | -93% |
| Number of modules | 1 | 6 | +500% |
| Largest module | 370 lines | 138 lines | -63% |
| Documentation | Inline comments | JSDoc + README | Improved |
| Testability | Difficult | Easy | Much better |
| Test files | 0 | 5 files (140 tests) | Added |
| Test framework | None | Vitest + Vite | Added |

## Summary

This refactoring transforms a single-file script into a well-organized, modular codebase with comprehensive test coverage. The project now uses modern development tools (Vite/Vitest) and has 140 tests ensuring reliability. All changes are non-breaking and provide a solid foundation for future development.