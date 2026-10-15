import { defineConfig } from 'vitest/config';

// sic-ng (the UI library) imports 'dayjs/locale/th' without an extension: Node ESM cannot resolve it, so let Vite bundle the library for the tests.
export default defineConfig({
  test: { server: { deps: { inline: [/sic-ng/] } } },
});
