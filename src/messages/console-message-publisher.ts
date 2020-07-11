import {MessagePublisher} from './message-publisher.model'

export class ConsoleMessagePublisher implements MessagePublisher {
    async publishPrivately(message: string): Promise<any> {
        ConsoleMessagePublisher.postRequest(`private: ${message}`);
    }

    async publishPublicly(message: string): Promise<any> {
        ConsoleMessagePublisher.postRequest(`public: ${message}`);
    }

    private static postRequest(content: string) {
        console.log(content);
    }
}
