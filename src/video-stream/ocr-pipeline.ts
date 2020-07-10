import {defer, Observable} from 'rxjs';
import Tesseract, {ImageLike, Page} from 'tesseract.js';

const canvas = document.createElement('canvas');

export type ScreenRect = [number, number, number, number];

function getImage(rect: ScreenRect): HTMLCanvasElement {
    const video: HTMLVideoElement | null = document.querySelector('video#video-stream');

    if (!video) {
        throw new Error('video stream not available')
    }

    const [left, top, width, height] = rect;

    const videoHeight = video.videoWidth * 9 / 16;
    const topOffset = (video.videoHeight - videoHeight) / 2;

    canvas.width = video.videoWidth * width;
    canvas.height = videoHeight * height;

    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    context.drawImage(video, -video.videoWidth * left, -videoHeight * top - topOffset, video.videoWidth, video.videoHeight);

    const imageTag = document.querySelector('img#debug') as HTMLImageElement;
    (imageTag).src = canvas.toDataURL();
    setTimeout(() => imageTag.src = '', 1500);

    return canvas;
}

export function imageData(rect: ScreenRect = [0, 0, 1, 1]): ImageData {
    const video: HTMLVideoElement | null = document.querySelector('video#video-stream');

    if (!video) {
        throw new Error('video stream not available')
    }

    const [left, top, width, height] = rect;

    const videoHeight = video.videoWidth * 9 / 16;
    const topOffset = (video.videoHeight - videoHeight) / 2;

    canvas.width = (width >= 1) ? width :  video.videoWidth * width;
    canvas.height = (height >= 1) ? height : videoHeight * height;

    const context = canvas.getContext('2d') as CanvasRenderingContext2D;

    context.drawImage(video, -video.videoWidth * left, -videoHeight * top - topOffset, video.videoWidth, video.videoHeight);
    return context.getImageData(0, 0, canvas.width, canvas.height);
}

export function recognise(rect?: ScreenRect): Promise<Page | null> {
    return new Promise(resolve => {
        const image: ImageLike | null = rect ? getImage(rect) : document.querySelector('video#video-stream') as HTMLVideoElement;
        if (image)
            return Tesseract.recognize(image).then((result) => {
                resolve(result)
            });
        else
            resolve(null)
    })
}

export function recognise$(rect?: ScreenRect): Observable<Page | null> {
    return defer(() => recognise(rect))
}
