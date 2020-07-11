export interface MessagePublisher {
    publishPublicly(message: string): Promise<any>;
    publishPrivately(message: string): Promise<any>
}
