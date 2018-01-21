declare const EventEmitter: any;
declare const Swarm: any;
declare const SocketPool: any;
declare const os: any;
declare class Synapsis extends EventEmitter {
    constructor(opts: any);
    /**
     * When exposing a route via .router('route_name', function() {})
     */
    router(event_name: any, cb: any): void;
    bindRouter(router: any): void;
    stop(): void;
    start(): void;
    broadcast(route: any, data: any, cb: any): any;
    getPeers(): any;
    send(): any;
}
