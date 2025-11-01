```markdown
# Sankey Diagram Solver

A CLI tool that ingests YAML-defined Sankey diagrams with constraints and determines if the system is solvable. If solvable, outputs all flow values.

## Quick Start

```bash
# Install dependencies
npm install

# Run solver on example
node sankey-solver.js example.yaml

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Overview

The solver uses an iterative constraint satisfaction algorithm to determine flow values in Sankey diagrams.

## How It Works

1. User defines topology (nodes and flows) and constraints (equations)
2. System automatically enforces flow balance at each node
3. Solver iteratively determines flow values until all flows are defined or no progress can be made

## Testing

This project has comprehensive test coverage using **Vitest**.

- **140 tests** across 5 test files
- Unit tests for all modules
- Integration tests for end-to-end scenarios
- Fast execution with Vite

See [TESTING.md](TESTING.md) for detailed testing documentation.

### Running Tests

```bash
npm test              # Watch mode
npm run test:run      # Single run
npm run test:ui       # Interactive UI
npm run test:coverage # Coverage report
```

## YAML Schema

```yaml
# Named parameters referenced in constraints
parameters:
  total_energy: 1000
  residential_demand: 400
  loss_rate: 0.15

# Graph nodes
nodes:
  - id: source
    label: "Power Plant"
  - id: transmission
    label: "Transmission Lines"
  - id: residential
    label: "Residential"
  - id: industrial
    label: "Industrial"
  - id: losses
    label: "Losses"

# Directed flows between nodes
flows:
  - id: src_trans
    from: source
    to: transmission
    label: "Generated Power"
  - id: trans_res
    from: transmission
    to: residential
    label: "To Homes"
  - id: trans_ind
    from: transmission
    to: industrial
    label: "To Industry"
  - id: trans_loss
    from: transmission
    to: losses
    label: "Line Losses"

# Equations defining flow values
# Operators: +, -, *, /, ==
# References: flows.<id>, parameters.<name>
constraints:
  - "flows.src_trans == parameters.total_energy"
  - "flows.trans_res == parameters.residential_demand"
  - "flows.trans_loss == flows.src_trans * parameters.loss_rate"
  # flows.trans_ind will be solved via balance constraint
```

## Solving Algorithm

```python
# Step 1: Initialize
defined_flows = {}
for constraint in constraints:
    evaluate_constraint(constraint, defined_flows)

# Step 2: Iteratively solve for undefined flows
max_iterations = len(flows) * 2
iteration = 0

while iteration < max_iterations:
    changed = False

    for node in nodes:
        # Skip source nodes (no inputs) and sink nodes (no outputs)
        if len(node.inputs) == 0 or len(node.outputs) == 0:
            continue

        # Count undefined flows at this node
        undefined_inputs = [f for f in node.inputs if f not in defined_flows]
        undefined_outputs = [f for f in node.outputs if f not in defined_flows]
        total_undefined = len(undefined_inputs) + len(undefined_outputs)

        # Can only solve if exactly 1 flow is undefined
        if total_undefined == 1:
            # Apply balance: sum(inputs) == sum(outputs)
            sum_inputs = sum(defined_flows[f] for f in node.inputs if f in defined_flows)
            sum_outputs = sum(defined_flows[f] for f in node.outputs if f in defined_flows)

            if len(undefined_inputs) == 1:
                # Solve for undefined input
                undefined_flow = undefined_inputs[0]
                defined_flows[undefined_flow] = sum_outputs - (sum_inputs - 0)
            else:
                # Solve for undefined output
                undefined_flow = undefined_outputs[0]
                defined_flows[undefined_flow] = sum_inputs - sum_outputs

            changed = True

    if not changed:
        break  # No more progress possible

    iteration += 1

# Step 3: Check result
if len(defined_flows) == len(flows):
    return SUCCESS, defined_flows
else:
    return UNDERDETERMINED, defined_flows
```

## CLI Output Examples

### Solvable System
```
✓ System is solvable (4 flows, 3 explicit constraints + balance)

Flow values:
  src_trans: 1000.0
  trans_res: 400.0
  trans_loss: 150.0
  trans_ind: 450.0
```

### Underdetermined System
```
✗ System is underdetermined

Defined flows:
  trans_res: 400.0
  trans_loss: 150.0

Undetermined flows:
  src_trans
  trans_ind

Need 1 more constraint.
```

### Overdetermined/Contradictory System
```
✗ System has conflicting constraints

Node 'transmission' balance violation:
  Inputs: 1000.0
  Outputs: 1050.0
  Difference: -50.0
```

## Example: Multi-Stage Flow

```yaml
parameters:
  input: 1000
  stage1_loss: 0.1
  stage2_split: 0.6

nodes:
  - id: source
  - id: stage1
  - id: stage2
  - id: output_a
  - id: output_b
  - id: waste

flows:
  - id: src_s1
    from: source
    to: stage1
  - id: s1_s2
    from: stage1
    to: stage2
  - id: s1_waste
    from: stage1
    to: waste
  - id: s2_a
    from: stage2
    to: output_a
  - id: s2_b
    from: stage2
    to: output_b

constraints:
  - "flows.src_s1 == parameters.input"
  - "flows.s1_waste == flows.src_s1 * parameters.stage1_loss"
  - "flows.s2_a == flows.s1_s2 * parameters.stage2_split"
  # flows.s1_s2 and flows.s2_b solved via balance
```

**Solution:**
- `src_s1 = 1000` (constraint)
- `s1_waste = 100` (constraint)
- `s1_s2 = 900` (balance at stage1)
- `s2_a = 540` (constraint)
- `s2_b = 360` (balance at stage2)

## Project Structure

The codebase is modularized for testability and maintainability:

```
nightmodel/
├── sankey-solver.js       # CLI entry point
├── src/
│   ├── solver.js          # Main solving logic
│   ├── expressions.js     # Expression evaluation
│   ├── balance.js         # Node balance solving
│   ├── verification.js    # Solution verification
│   ├── formatter.js       # Output formatting
│   └── *.test.js          # Vitest test files
├── vite.config.js         # Vite/Vitest configuration
└── example.yaml           # Example Sankey diagram
```

See [REFACTORING.md](REFACTORING.md) for details on the modular architecture.

## Documentation

- [TESTING.md](TESTING.md) - Comprehensive testing guide
- [REFACTORING.md](REFACTORING.md) - Architecture and refactoring details
- [src/README.md](src/README.md) - Module-level documentation

## Notes

- Acyclic graphs only (no flow cycles)
- Source nodes (no inputs) and sink nodes (no outputs) skip balance checks
- Maximum iterations prevents infinite loops (though algorithm should always terminate)
```
