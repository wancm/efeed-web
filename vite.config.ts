import { defineConfig } from 'vitest/config';


export default defineConfig({
    define: {
        "import.meta.vitest": undefined, // to make the builder to ignore the if (import.meta.vitest) statement in all *.ts file, because you don't want to include the unittest code in the build package
    },
    test: {
        includeSource: ['src/**/*.{js,ts}'], // if you are writing the unit test in the same *.ts file
        coverage: {
            reporter: ['text', 'html']
        }
    }
});