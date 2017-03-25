/**
 * The handled events
 */
interface IModuleHandler {
  event: string;
  handler: Function;
}

/**
 * An event contains information about something that has occurred.
 */
interface IEvent {
  (...args: any[]): void;
}

/**
 * A list of events
 *
 * @interface IEventList
 */
interface IEventList {
  [name: string]: IEvent[];
}

/**
 * An event dispatcher.
 *
 * @interface IEventDispatcher
 */
interface IEventDispatcher {
  publish(name: string, ...args: any[]): void;
}
