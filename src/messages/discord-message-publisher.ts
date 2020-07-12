import {MessagePublisher} from './message-publisher.model'
import {fromFetch} from 'rxjs/fetch';
import {catchError, retry} from 'rxjs/operators';
import {EMPTY} from 'rxjs';

export class DiscordMessagePublisher implements MessagePublisher {
    private readonly config: any = null;

    constructor() {
        try {
            this.config = require('./.config').default;
        } catch (e) {
            console.warn('No discord config. Missing ./src/messages/.config.ts')
        }
    }

    async publishPrivately(message: string): Promise<any> {
        if (!this.config)
            return;
        return this.postRequest(this.config.privateDiscordWebHook, message)
    }

    async publishPublicly(message: string): Promise<any> {
        if (!this.config)
            return;
        return this.postRequest(this.config.privateDiscordWebHook, message);
        // this.postRequest(this.config.publicDiscordWebHook, message);
    }

    private postRequest(url: string, content: string) {
        return new Promise((resolve, reject) => {
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
            }).pipe(
                retry(3),
                catchError(err => {
                    reject(err);
                    return EMPTY;
                })
            ).subscribe(next => {
                resolve()
            });
        });
    }
}
