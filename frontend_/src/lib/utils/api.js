/**
 * Backward compatibility wrapper
 * 
 * This file re-exports the API from the new modular structure.
 * The actual implementation has been moved to src/lib/api/
 * 
 * For new code, prefer:
 *   import api from '$lib/api';
 * 
 * This file is maintained for backward compatibility with existing imports:
 *   import api from '$lib/utils/api';
 */

export { default, api } from '$lib/api/index.js';