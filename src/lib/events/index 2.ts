/**
 * Event Bus Exports
 *
 * Central export point for event bus functionality.
 */

export { eventBus } from './EventBus';
export * from './types';
export { registerEventHandlers } from './handlers';

// Auto-initialize event bus (runs only on server)
import './init';
