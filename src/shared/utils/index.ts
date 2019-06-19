
/**
 * Wraps an event in an event emitter in a Promise.
 *
 * @param event - The name of the event to attach a listener to.
 * @param emitter - The event emitter to attach in.
 * @returns a promise that resolves to the value of the event, once it occurs.
 */
export const onEvent = async (event: string, emitter: NodeJS.EventEmitter) => (
    new Promise((resolve) => emitter.once(event, resolve))
);
