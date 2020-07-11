import {MessagePublisher} from './message-publisher.model'
import {fromFetch} from 'rxjs/fetch';

export class DiscordMessagePublisher implements MessagePublisher {
    private readonly config: any = null;

    constructor() {
        try {
            this.config = require('./config')
        } catch(e) {
            console.warn('No discord config. Missing ./src/messages/.config.ts')
        }
    }

    async publishPrivately(message: string): Promise<any> {
        if (!this.config)
            return;
        this.postRequest(this.config.privateDiscordWebHook, message);
    }

    async publishPublicly(message: string): Promise<any> {
        if (!this.config)
            return;
        this.postRequest(this.config.privateDiscordWebHook, message);
        // this.postRequest(this.config.publicDiscordWebHook, message);
    }

    private postRequest(url: string, content: string) {
        fromFetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                    avatar_url: this.config.discordBotAvatar,
                    username: this.config.discordBotName,
                    content
                }
            )
        });
    }
}
