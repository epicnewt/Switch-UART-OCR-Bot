import {defer, Observable} from 'rxjs';
import Tesseract, {ImageLike, Page} from 'tesseract.js';

const canvas = document.createElement('canvas');

function getImage(rect?: [number, number, number, number]): ImageLike | null {
    const video: HTMLVideoElement | null = document.querySelector('video#video-stream');

    if (!video) {
        return null
    }

    if (!rect) {
        return video;
    }

    const [left, top, width, height] = rect;

    const videoHeight = video.videoWidth * 9 / 16;
    const topOffset = (video.videoHeight - videoHeight) / 2;

    canvas.width = video.videoWidth * width;
    canvas.height = videoHeight * height;

    canvas.getContext('2d')
        ?.drawImage(video, -video.videoWidth * left, -videoHeight * top - topOffset, video.videoWidth, video.videoHeight);

    const imageTag = document.querySelector('img#debug') as HTMLImageElement;
    (imageTag).src = canvas.toDataURL();
    setTimeout(() => imageTag.src = '', 1500);

    return canvas;
}

export function recognise(rect?: [number, number, number, number]): Promise<Page | null> {
    return new Promise(resolve => {
        const image = getImage(rect);
        if (image)
            return Tesseract.recognize(image).then((result) => {
                resolve(result)
            });
        else
            resolve(null)
    })
}

export function recognise$(rect?: [number, number, number, number]): Observable<Page | null> {
    return defer(() => recognise(rect))
}
