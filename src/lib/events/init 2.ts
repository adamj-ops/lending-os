/**
 * Event Bus Initialization
 *
 * This file is imported server-side to register all event handlers.
 * Import this file at the top level of your app to ensure handlers are registered.
 */

import { registerEventHandlers } from './handlers';

// Only initialize on the server
if (typeof window === 'undefined') {
  registerEventHandlers();
  console.log('✅ Event bus initialized with all handlers registered');
}

export { registerEventHandlers };
