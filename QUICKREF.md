# Quick Reference - Sankey Solver

## Essential Commands

### Running the Solver
```bash
# Run on YAML file
node sankey-solver.js example.yaml

# Run on custom file
node sankey-solver.js path/to/config.yaml
```

### Testing
```bash
# Watch mode (recommended for development)
npm test

# Run all tests once
npm run test:run

# Interactive UI in browser
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Project Structure

```
nightmodel/
├── sankey-solver.js       # CLI entry point
├── src/
│   ├── solver.js          # Main solving logic
│   ├── expressions.js     # Expression evaluation
│   ├── balance.js         # Node balance solving
│   ├── verification.js    # Solution verification
│   ├── formatter.js       # Output formatting
│   └── *.test.js          # Test files (140 tests)
└── vite.config.js         # Vite/Vitest config
```

## Module Imports

### Using the Solver Programmatically
```javascript
import { solve } from './sankey-solver.js';

const result = solve({
  parameters: { total: 100 },
  nodes: [{ id: 'A' }, { id: 'B' }],
  flows: [{ id: 'ab', from: 'A', to: 'B' }],
  constraints: ['flows.ab == parameters.total']
});

if (result.success) {
  console.log(result.flows); // { ab: 100 }
}
```

### Using Individual Modules
```javascript
import { evaluateExpression } from './src/expressions.js';
import { solveNodeBalance } from './src/balance.js';
import { verifyBalance } from './src/verification.js';
import { formatResult } from './src/formatter.js';
```

## Writing Tests

### Basic Test Pattern
```javascript
import { describe, it, expect } from 'vitest';
import { myFunction } from './module.js';

describe('myFunction', () => {
  it('should do something', () => {
    const result = myFunction(input);
    expect(result).toBe(expected);
  });
});
```

### Running Specific Tests
```javascript
// Run only this test
it.only('focused test', () => { /* ... */ });

// Skip this test
it.skip('pending test', () => { /* ... */ });
```

## Common Assertions

```javascript
// Equality
expect(value).toBe(42);
expect(object).toEqual({ key: 'value' });

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();

// Numbers
expect(num).toBeGreaterThan(10);
expect(decimal).toBeCloseTo(0.3);

// Arrays
expect(array).toHaveLength(3);
expect(array).toContain(item);

// Errors
expect(() => fn()).toThrow();
expect(() => fn()).toThrow('error message');
```

## YAML Configuration

### Minimal Example
```yaml
parameters:
  total: 100

nodes:
  - id: source
  - id: sink

flows:
  - id: flow1
    from: source
    to: sink

constraints:
  - "flows.flow1 == parameters.total"
```

### Complete Example
```yaml
parameters:
  total_energy: 1000
  loss_rate: 0.15

nodes:
  - id: source
    label: "Power Plant"
  - id: transmission
    label: "Transmission"
  - id: destination
    label: "Destination"

flows:
  - id: src_trans
    from: source
    to: transmission
    label: "Generated"
  - id: trans_dest
    from: transmission
    to: destination
    label: "Delivered"

constraints:
  - "flows.src_trans == parameters.total_energy"
  - "flows.trans_dest == flows.src_trans * (1 - parameters.loss_rate)"
```

## Output Examples

### ✓ Success
```
✓ System is solvable

Flow values:
  flow1: 100
  flow2: 200
```

### ✗ Underdetermined
```
✗ Underdetermined system

Defined flows:
  flow1: 100

Undetermined flows:
  flow2
  flow3

Need 2 more constraint(s).
```

### ✗ Contradictory
```
✗ Contradictory constraints

Balance violations:
  Node 'B':
    Inputs: 100
    Outputs: 90
    Difference: 10
```

## Documentation

- **README.md** - Project overview and quick start
- **TESTING.md** - Comprehensive testing guide (470 lines)
- **REFACTORING.md** - Architecture and design (280 lines)
- **src/README.md** - Module documentation (220 lines)
- **SUMMARY.md** - Complete project summary (360 lines)
- **QUICKREF.md** - This file

## Statistics

- **Modules**: 5 (expressions, balance, verification, formatter, solver)
- **Tests**: 140 across 5 test files
- **Test Execution**: ~150ms for full suite
- **Main File**: 26 lines (down from 370)
- **Test Coverage**: All modules fully tested

## Tips

### Development Workflow
1. Run `npm test` to start watch mode
2. Edit code in `src/`
3. Tests auto-run on save
4. Fix any failures
5. Run `npm run test:run` for final check

### Adding New Features
1. Write test first (TDD)
2. Implement feature
3. Run tests to verify
4. Update documentation
5. Check coverage

### Debugging
- Use `console.log()` in tests
- Use `it.only()` to focus on one test
- Use `it.skip()` to temporarily disable
- Run with `--reporter=verbose` for details

## Common Issues

**Tests not running?**
- Check file ends in `.test.js`
- Verify `vite.config.js` exists
- Run `npm install`

**Import errors?**
- Use `.js` extension in imports
- Check `"type": "module"` in package.json

**CLI not working?**
- Check Node.js version (v14+)
- Run `npm install`
- Verify YAML syntax

## Quick Links

- [Vitest Docs](https://vitest.dev/)
- [Vite Docs](https://vitejs.dev/)
- [Node.js](https://nodejs.org/)

---

**Last Updated**: After Vite/Vitest setup  
**Version**: 1.0.0 with comprehensive tests  
**Status**: ✅ Production Ready