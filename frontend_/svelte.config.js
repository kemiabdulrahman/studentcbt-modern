import adapter from '@sveltejs/adapter-auto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

const config = {
	kit: {
		alias: {
			"$components": path.resolve(__dirname, 'src/lib/components'),
			"$lib": path.resolve(__dirname, 'src/lib'),
			"$routes": path.resolve(__dirname, 'src/routes'),
			"$utils": path.resolve(__dirname, 'src/lib/utils'),
			"$stores": path.resolve(__dirname, 'src/lib/stores')
		},
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter()
	}
};

export default config;
