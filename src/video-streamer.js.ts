import {desktopCapturer} from 'electron';

/**
 * Create a screenshot of the entire screen using the desktopCapturer module of Electron.
 *
 * @param callback {Function} callback receives as first parameter the base64 string of the image
 * @param imageFormat {String} Format of the image to generate ('image/jpeg' or 'image/png')
 **/
export function fullscreenScreenshot(this: any, callback: any, imageFormat: string) {
    const _this: any = this;
    this.callback = callback;
    imageFormat = imageFormat || 'image/jpeg';

    this.handleStream = (stream: MediaStream | MediaSource | Blob | null) => {
        // Create hidden video tag
        const video: HTMLVideoElement = document.querySelector('video') as HTMLVideoElement;
        // video.style.cssText = 'position:absolute;top:-10000px;left:-10000px;';

/*
        // Event connected to stream
        video.onloadedmetadata = function () {
            // Set video ORIGINAL height (screenshot)
            // @ts-ignore
            video.style.height = this.videoHeight + 'px'; // videoHeight
            // @ts-ignore
            video.style.width = this.videoWidth + 'px'; // videoWidth

            video.play();

            // Create canvas
            const canvas = document.createElement('canvas');
            // @ts-ignore
            canvas.width = this.videoWidth;
            // @ts-ignore
            canvas.height = this.videoHeight;
            const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');

            if (!ctx) {
                return
            }

            // Draw video on canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            if (_this.callback) {
                // Save screenshot to base64
                _this.callback(canvas.toDataURL(imageFormat));
            } else {
                console.log('Need callback!');
            }
        };
*/

        video.srcObject = stream;
        // document.body.appendChild(video);
    };


    this.handleError = function (e: Error) {
        console.log(e);
    };

    desktopCapturer.getSources({types: ['window', 'screen']}).then(async (sources: any) => {
        console.log(sources);

        for (const source of sources) {
            // Filter: main screen
            // if ((source.name === "Entire screen") || (source.name === "Screen 1") || (source.name === "Screen 2")) {
            //     try {
            //         const stream = await navigator.mediaDevices.getUserMedia({
            //             audio: false,
            //             video: {}
            //         });
            //
            //         _this.handleStream(stream);
            //     } catch (e) {
            //         _this.handleError(e);
            //     }
            // }
        }
    });
}
