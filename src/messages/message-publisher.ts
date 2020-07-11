import * as Model from './message-publisher.model';
import {DiscordMessagePublisher} from './discord-message-publisher';
import {ConsoleMessagePublisher} from './console-message-publisher';

class MessagePublisher implements Model.MessagePublisher {
    private publishers: Model.MessagePublisher[] = [];

    constructor() {
        this.publishers.push(new DiscordMessagePublisher());
        this.publishers.push(new ConsoleMessagePublisher());
    }

    async publishPrivately(message: string): Promise<any> {
        return Promise.all(this.publishers.map(p => p.publishPrivately(message)));
    }

    async publishPublicly(message: string): Promise<any> {
        return Promise.all(this.publishers.map(p => p.publishPublicly(message)));
    }

}

export const messagePublisher = new MessagePublisher();
