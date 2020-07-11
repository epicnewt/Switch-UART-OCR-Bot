import {defer, Observable} from 'rxjs';
import Tesseract, {ImageLike, Page} from 'tesseract.js';

const canvas = document.createElement('canvas');

export type ScreenRect = [number, number, number, number];

function getImage(rect: ScreenRect, preview: boolean): HTMLCanvasElement {
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

    if (preview) {
        const imageTag = document.querySelector('img#debug') as HTMLImageElement;
        (imageTag).src = canvas.toDataURL();
        setTimeout(() => imageTag.src = '', 1500);
    }

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

    canvas.width = (width >= 1) ? width : video.videoWidth * width;
    canvas.height = (height >= 1) ? height : videoHeight * height;

    const context = canvas.getContext('2d') as CanvasRenderingContext2D;

    context.drawImage(video, -video.videoWidth * left, -videoHeight * top - topOffset, video.videoWidth, video.videoHeight);
    return context.getImageData(0, 0, canvas.width, canvas.height);
}

export function recogniseText(rect?: ScreenRect, preview = false): Promise<Page> {
    return new Promise(resolve => {
        const image: ImageLike = rect ? getImage(rect, preview) : document.querySelector('video#video-stream') as HTMLVideoElement;
        return Tesseract.recognize(image).then((result) => {
            resolve(result)
        });
    })
}

export function recognise$(rect?: ScreenRect): Observable<Page | null> {
    return defer(() => recogniseText(rect))
}

// @ts-ignore
window.recogniseText = recogniseText;
// @ts-ignore
window.ocr = recogniseText;
