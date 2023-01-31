import fs from 'fs';
import reference from '../../src/style-spec/reference/latest';
import packageJson from '../../package.json' assert {type: 'json'};

const minBundle = fs.readFileSync('dist/maplibre-gl.js', 'utf8');

describe('test min build', () => {
    test('production build removes asserts', () => {
        expect(minBundle.includes('canary debug run')).toBeFalsy();
    });

    test('trims package.json assets', () => {
    // confirm that the entire package.json isn't present by asserting
    // the absence of each of our script strings
        for (const name in packageJson.scripts) {
            expect(minBundle.includes(packageJson.scripts[name])).toBeFalsy();
        }
    });

    test('trims reference.json fields', () => {
        expect(reference.$root.version.doc).toBeTruthy();
        expect(minBundle.includes(reference.$root.version.doc)).toBeFalsy();
    });

    test('evaluates without errors', async () => {

        global.URL.createObjectURL = () => 'placeholder';

        try {
            eval(minBundle);
        } catch (e) {
            expect(e).toBeFalsy();
        }
    });

    test('bundle size stays the same', async () => {
        const bytes = (await fs.promises.stat('dist/maplibre-gl.js')).size;

        // Base is 754k.
        // Need to be very frugal when it comes to minified script.
        // Most changes should result in 0.5k variation.
        const delta = 500;

        // feel free to update this value after you've checked that it has changed on purpose :-)
        const expectedBytes = 754929;

        expect(Math.abs(bytes - expectedBytes)).toBeLessThan(delta);
    });
});
