export default class EventDispatcher implements IEventDispatcher {
  public handlers: IModuleHandler[];

  constructor() {
    this.handlers = [];
  }

  public subscribe(event: string, handler: Function, context: Object) {
    if (typeof context === "undefined") { context = handler; }
    this.handlers.push({ event: event, handler: handler.bind(context) });
  }

  public publish(event: string, ...args: any[]) {
    this.handlers.forEach(topic => {
      if (topic.event === event) {
        topic.handler(args);
      }
    });
  }
}

// Example usage:
//
// PubSub.subscribe('foo', function (...args: any) {
//   args.forEach(x => {
//     console.log('argument', x);
//   });
// });
//
// PubSub.publish('foo', 1, 2, 3, 4, 5);
