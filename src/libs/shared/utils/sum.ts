
const sum = (...numbers: number[]) => {
    return numbers.reduce((total, number) => total + number, 0)
}

if (import.meta.vitest) {
    const { describe, expect, test, beforeEach } = import.meta.vitest;

    interface MyFixtures {
        todos: number[]
        archive: number[]
        foo: string
    }

    const myTest = test.extend<MyFixtures>({
        todos: [],
        archive: [],
        foo: 'I am foo'
    })


    beforeEach(async (context) => {
        // extend context
        context.param1 = 'bar'
        context.param2 = 'param2'
    })


    describe("#sum", () => {
        test('should work', (context) => {
            expect(context.param1).toBe('bar');
        });

        test('should work1', ({ param2 }) => {
            expect(param2).toBe('param2');
        });


        test('should work2', (context: any) => {
            expect(context.param1).toBe('bar');
        });

        test('should work3', (context: any) => {
            expect(context.param1).toBe('bar');
        });

        test.concurrent('returns 0 with no numbers', () => {
            expect(sum()).toBe(0)
        })

        test.concurrent('returns same number with 1 number', () => {
            expect(sum(1)).toBe(1)
        })

        test.concurrent('returns sum number with multiple numbers', () => {
            expect(sum(1, 2, 3)).toBe(6)
        })
    })

    test('should work', (ctx) => {
        // prints name of the test
        console.log(ctx.task.name)
    })
}

export default sum;

