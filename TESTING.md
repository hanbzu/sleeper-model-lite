# Testing Documentation

## Overview

The Sankey Solver project uses **Vitest** as its testing framework, providing fast, modern testing with excellent ESM support and a Jest-compatible API.

## Quick Start

```bash
# Install dependencies
npm install

# Run tests in watch mode (recommended for development)
npm test

# Run all tests once
npm run test:run

# Open interactive test UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Test Statistics

- **Total Tests**: 140
- **Test Files**: 5
- **Coverage**: All modules fully tested
- **Test Framework**: Vitest 4.0.6
- **Build Tool**: Vite 7.1.12

## Test Files

### Unit Tests

#### `src/expressions.test.js` (28 tests)
Tests for expression and constraint evaluation:
- Parameter substitution
- Flow reference substitution
- Mathematical expression evaluation
- Constraint parsing and validation
- Error handling for invalid expressions

#### `src/balance.test.js` (35 tests)
Tests for node balance solving logic:
- Getting input/output flows for nodes
- Source and sink node identification
- Flow summation and filtering
- Single-node balance solving
- Iterative solving across multiple nodes
- Complex graph topologies

#### `src/verification.test.js` (30 tests)
Tests for solution verification:
- Node balance verification
- Floating point error tolerance
- Fully solved system detection
- Undetermined flow identification
- Balance error reporting

#### `src/formatter.test.js` (26 tests)
Tests for output formatting:
- Flow list formatting
- Balance error formatting
- Success message formatting
- Underdetermined system formatting
- Contradictory constraint formatting
- Result type dispatching

### Integration Tests

#### `src/solver.test.js` (21 tests)
End-to-end tests for the complete solver:
- Linear chain networks
- Branching networks
- Merging networks
- Multi-iteration solving
- Underdetermined system detection
- Contradictory constraint detection
- Error handling
- Edge cases (empty configs, zero values, decimals)
- Real-world power distribution example

## Test Structure

### Basic Test Pattern

```javascript
import { describe, it, expect } from 'vitest';
import { functionToTest } from './module.js';

describe('functionToTest', () => {
    it('should handle basic case', () => {
        const result = functionToTest(input);
        expect(result).toBe(expectedOutput);
    });

    it('should handle edge case', () => {
        expect(() => functionToTest(invalidInput)).toThrow('Error message');
    });
});
```

### Common Assertions

```javascript
// Equality
expect(value).toBe(42);
expect(value).toEqual({ key: 'value' });

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();

// Numbers
expect(value).toBeGreaterThan(10);
expect(value).toBeLessThan(100);
expect(decimal).toBeCloseTo(0.3, 5); // 5 decimal places

// Arrays
expect(array).toHaveLength(3);
expect(array).toContain(item);

// Exceptions
expect(() => dangerousFunction()).toThrow();
expect(() => dangerousFunction()).toThrow('Specific error');
```

## Running Tests

### Watch Mode (Recommended for Development)

```bash
npm test
```

- Automatically re-runs tests when files change
- Shows only changed/affected tests
- Fast feedback loop for TDD

### Single Run (CI/CD)

```bash
npm run test:run
```

- Runs all tests once
- Exits with appropriate status code
- Perfect for continuous integration

### Interactive UI

```bash
npm run test:ui
```

- Opens browser-based test UI
- Visual test results
- Interactive filtering and search
- Test file explorer

### Coverage Report

```bash
npm run test:coverage
```

- Generates coverage report
- Shows untested lines
- Outputs to `coverage/` directory
- Multiple formats: text, JSON, HTML

## Configuration

### `vite.config.js`

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,              // Use global test APIs
    environment: 'node',        // Node.js environment
    coverage: {
      provider: 'v8',           // Fast coverage tool
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'src/**/*.test.js',     // Exclude test files
        '*.config.js',
        'test-api.js',
      ],
    },
  },
});
```

## Writing Tests

### 1. Unit Tests

Test individual functions in isolation:

```javascript
describe('evaluateExpression', () => {
    it('should evaluate parameter substitution', () => {
        const result = evaluateExpression(
            'parameters.x + 10',
            { x: 5 },
            {}
        );
        expect(result).toBe(15);
    });
});
```

### 2. Integration Tests

Test multiple modules working together:

```javascript
describe('solve - integration', () => {
    it('should solve complete system', () => {
        const config = {
            parameters: { total: 100 },
            nodes: [{ id: 'A' }, { id: 'B' }],
            flows: [{ id: 'ab', from: 'A', to: 'B' }],
            constraints: ['flows.ab == parameters.total']
        };
        
        const result = solve(config);
        expect(result.success).toBe(true);
        expect(result.flows.ab).toBe(100);
    });
});
```

### 3. Error Cases

Always test error handling:

```javascript
it('should throw error for missing parameter', () => {
    expect(() => {
        evaluateExpression('parameters.missing', {}, {});
    }).toThrow('Unknown parameter');
});
```

### 4. Edge Cases

Test boundary conditions:

```javascript
it('should handle empty input', () => {
    const result = solve({ nodes: [], flows: [], constraints: [] });
    expect(result.success).toBe(true);
    expect(result.flows).toEqual({});
});

it('should handle zero values', () => {
    const result = evaluateConstraint('flows.x == 0', {}, {});
    expect(result.x).toBe(0);
});
```

## Best Practices

### 1. Descriptive Test Names

✅ Good:
```javascript
it('should return null for source nodes with no inputs', () => {
```

❌ Bad:
```javascript
it('test1', () => {
```

### 2. Arrange-Act-Assert Pattern

```javascript
it('should solve node balance', () => {
    // Arrange: Set up test data
    const node = { id: 'B' };
    const flows = [...];
    const definedFlows = { in1: 100, out1: 80 };
    
    // Act: Execute the function
    const result = solveNodeBalance(node, flows, definedFlows);
    
    // Assert: Verify the result
    expect(result.flowId).toBe('out2');
    expect(result.value).toBe(20);
});
```

### 3. One Assertion Per Test (when practical)

```javascript
it('should calculate correct flow value', () => {
    expect(result.value).toBe(100);
});

it('should identify correct flow ID', () => {
    expect(result.flowId).toBe('ab');
});
```

### 4. Use Describe Blocks for Organization

```javascript
describe('solveNodeBalance', () => {
    describe('when solving for outputs', () => {
        it('should calculate output from inputs', () => {
            // ...
        });
    });
    
    describe('when solving for inputs', () => {
        it('should calculate input from outputs', () => {
            // ...
        });
    });
    
    describe('edge cases', () => {
        it('should skip source nodes', () => {
            // ...
        });
    });
});
```

### 5. Test Both Success and Failure

```javascript
describe('parseConstraint', () => {
    it('should parse valid constraint', () => {
        const [left, right] = parseConstraint('flows.x == 100');
        expect(left).toBe('flows.x');
    });
    
    it('should throw error for invalid constraint', () => {
        expect(() => parseConstraint('invalid')).toThrow();
    });
});
```

## Continuous Integration

### Example GitHub Actions Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:run
      - run: npm run test:coverage
```

## Debugging Tests

### Using Console Logs

```javascript
it('should debug complex issue', () => {
    const result = complexFunction(input);
    console.log('Result:', result); // Shows in test output
    expect(result).toBeDefined();
});
```

### Using `only` to Focus

```javascript
// Run only this test
it.only('should focus on this test', () => {
    // ...
});

// Run only tests in this block
describe.only('focused suite', () => {
    // ...
});
```

### Using `skip` to Temporarily Disable

```javascript
// Skip this test
it.skip('not ready yet', () => {
    // ...
});

// Skip this suite
describe.skip('pending implementation', () => {
    // ...
});
```

## Performance

Vitest is designed for speed:
- **Fast startup**: Native ESM support, no transpilation needed
- **Parallel execution**: Tests run in parallel by default
- **Smart watch mode**: Only re-runs affected tests
- **Fast coverage**: V8 native coverage is very fast

Current performance:
- 140 tests complete in ~150ms
- Watch mode feedback in <100ms
- Coverage generation in ~200ms

## Troubleshooting

### Tests Not Running

1. Check that files end in `.test.js`
2. Verify `vite.config.js` exists
3. Run `npm install` to ensure dependencies are installed

### Import Errors

If you see ESM import errors:
- Ensure `package.json` has `"type": "module"`
- Use `.js` extensions in imports
- Check that Vite is properly configured

### Coverage Not Generated

Install coverage provider:
```bash
npm install -D @vitest/coverage-v8
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Contributing

When adding new features:

1. ✅ Write tests first (TDD approach recommended)
2. ✅ Ensure all tests pass: `npm run test:run`
3. ✅ Maintain or improve coverage: `npm run test:coverage`
4. ✅ Update this document if adding new test patterns

---

**Last Updated**: After Vite/Vitest setup  
**Test Count**: 140 tests across 5 files  
**Status**: ✅ All tests passing