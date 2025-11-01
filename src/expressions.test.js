import { describe, it, expect } from 'vitest';
import {
    evaluateExpression,
    parseConstraint,
    evaluateConstraint,
    evaluateAllConstraints,
} from './expressions.js';

describe('evaluateExpression', () => {
    it('should evaluate simple parameter substitution', () => {
        const result = evaluateExpression('parameters.x + 10', { x: 5 }, {});
        expect(result).toBe(15);
    });

    it('should evaluate flow substitution', () => {
        const result = evaluateExpression('flows.a * 2', {}, { a: 10 });
        expect(result).toBe(20);
    });

    it('should evaluate combined parameters and flows', () => {
        const result = evaluateExpression(
            'parameters.base + flows.f1 * parameters.multiplier',
            { base: 100, multiplier: 3 },
            { f1: 50 }
        );
        expect(result).toBe(250);
    });

    it('should handle complex mathematical expressions', () => {
        const result = evaluateExpression(
            '(parameters.x + flows.y) / 2',
            { x: 10 },
            { y: 20 }
        );
        expect(result).toBe(15);
    });

    it('should throw error for missing parameter', () => {
        expect(() => {
            evaluateExpression('parameters.missing', {}, {});
        }).toThrow('Unknown parameter');
    });

    it('should throw error for missing flow', () => {
        expect(() => {
            evaluateExpression('flows.missing', {}, {});
        }).toThrow('not yet defined');
    });

    it('should throw error for invalid expression', () => {
        expect(() => {
            evaluateExpression('this is not valid', {}, {});
        }).toThrow('Cannot evaluate expression');
    });
});

describe('parseConstraint', () => {
    it('should parse valid constraint', () => {
        const [left, right] = parseConstraint('flows.x == 100');
        expect(left).toBe('flows.x');
        expect(right).toBe('100');
    });

    it('should parse constraint with whitespace', () => {
        const [left, right] = parseConstraint('  flows.y  ==  parameters.z + 5  ');
        expect(left).toBe('flows.y');
        expect(right).toBe('parameters.z + 5');
    });

    it('should parse constraint with complex expression', () => {
        const [left, right] = parseConstraint('flows.a == flows.b * parameters.c + 10');
        expect(left).toBe('flows.a');
        expect(right).toBe('flows.b * parameters.c + 10');
    });

    it('should throw error for constraint without ==', () => {
        expect(() => {
            parseConstraint('flows.x = 100');
        }).toThrow('exactly one ==');
    });

    it('should throw error for constraint with multiple ==', () => {
        expect(() => {
            parseConstraint('flows.x == 100 == 200');
        }).toThrow('exactly one ==');
    });

    it('should throw error for empty constraint', () => {
        expect(() => {
            parseConstraint('flows.x');
        }).toThrow('exactly one ==');
    });
});

describe('evaluateConstraint', () => {
    it('should evaluate simple constraint', () => {
        const flows = evaluateConstraint('flows.a == 42', {}, {});
        expect(flows.a).toBe(42);
    });

    it('should evaluate constraint with parameter', () => {
        const flows = evaluateConstraint(
            'flows.b == parameters.value * 2',
            { value: 25 },
            {}
        );
        expect(flows.b).toBe(50);
    });

    it('should evaluate constraint with existing flow', () => {
        const flows = evaluateConstraint(
            'flows.c == flows.a + 10',
            {},
            { a: 100 }
        );
        expect(flows.a).toBe(100);
        expect(flows.c).toBe(110);
    });

    it('should preserve existing flows', () => {
        const flows = evaluateConstraint(
            'flows.b == 50',
            {},
            { a: 100 }
        );
        expect(flows.a).toBe(100);
        expect(flows.b).toBe(50);
    });

    it('should throw error for non-flow left side', () => {
        expect(() => {
            evaluateConstraint('parameters.x == 100', {}, {});
        }).toThrow('must be a flow reference');
    });

    it('should throw error for complex left side', () => {
        expect(() => {
            evaluateConstraint('flows.x + 1 == 100', {}, {});
        }).toThrow('must be a flow reference');
    });

    it('should handle decimal values', () => {
        const flows = evaluateConstraint(
            'flows.x == parameters.rate * 100',
            { rate: 0.15 },
            {}
        );
        expect(flows.x).toBe(15);
    });
});

describe('evaluateAllConstraints', () => {
    it('should evaluate multiple independent constraints', () => {
        const flows = evaluateAllConstraints(
            [
                'flows.x == 10',
                'flows.y == 20',
                'flows.z == 30',
            ],
            {}
        );
        expect(flows.x).toBe(10);
        expect(flows.y).toBe(20);
        expect(flows.z).toBe(30);
    });

    it('should evaluate dependent constraints in order', () => {
        const flows = evaluateAllConstraints(
            [
                'flows.a == parameters.base',
                'flows.b == flows.a * 2',
                'flows.c == flows.a + flows.b',
            ],
            { base: 100 }
        );
        expect(flows.a).toBe(100);
        expect(flows.b).toBe(200);
        expect(flows.c).toBe(300);
    });

    it('should handle empty constraints', () => {
        const flows = evaluateAllConstraints([], {});
        expect(Object.keys(flows)).toHaveLength(0);
    });

    it('should handle single constraint', () => {
        const flows = evaluateAllConstraints(
            ['flows.single == 42'],
            {}
        );
        expect(flows.single).toBe(42);
    });

    it('should throw error for undefined flow reference', () => {
        expect(() => {
            evaluateAllConstraints(
                [
                    'flows.x == 10',
                    'flows.y == flows.undefined',
                    'flows.z == 30',
                ],
                {}
            );
        }).toThrow('flows.y == flows.undefined');
    });

    it('should throw error for undefined parameter', () => {
        expect(() => {
            evaluateAllConstraints(
                ['flows.x == parameters.missing'],
                {}
            );
        }).toThrow('flows.x == parameters.missing');
    });

    it('should handle complex mathematical expressions', () => {
        const flows = evaluateAllConstraints(
            [
                'flows.total == parameters.a + parameters.b',
                'flows.average == flows.total / 2',
                'flows.doubled == flows.average * 2',
            ],
            { a: 50, b: 150 }
        );
        expect(flows.total).toBe(200);
        expect(flows.average).toBe(100);
        expect(flows.doubled).toBe(200);
    });

    it('should handle loss calculation example', () => {
        const flows = evaluateAllConstraints(
            [
                'flows.input == parameters.total',
                'flows.loss == flows.input * parameters.loss_rate',
            ],
            { total: 1000, loss_rate: 0.15 }
        );
        expect(flows.input).toBe(1000);
        expect(flows.loss).toBe(150);
    });
});
