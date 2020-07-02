import React, {useEffect, useRef, useState} from 'react';
import logo from './logo.svg';
import './App.css';
import Tesseract from "tesseract.js";

// console.log('TESSDATA_PREFIX', process.env['TESSDATA_PREFIX']);

const {desktopCapturer} = Electron;

async function findVideoSources(): Promise<Electron.DesktopCapturerSource[]> {
    return new Promise(resolve => {
        desktopCapturer.getSources({
            types: ['window', 'screen'],
            thumbnailSize: {width: 1000, height: 1000},
            fetchWindowIcons: true
        }).then(async (sources: Electron.DesktopCapturerSource[]) => {
            console.log(sources);
            resolve(sources);
        });
    })
}

function App() {
    const videoEl: React.RefObject<HTMLVideoElement> = useRef<HTMLVideoElement>(null);

    const [sources, setSources] = useState<Electron.DesktopCapturerSource[]>([]);
    const [selectedSource, selectSource] = useState<Electron.DesktopCapturerSource>();

    async function doOcrCheck() {
        console.log('doOcrCheck():', videoEl.current);

        if (!videoEl.current)
            return;

        Tesseract.recognize(videoEl.current, 'eng')
            .catch((err: any) => console.error('Tesseract.recognize(videoEl.current)', err))
            .then((result) => console.log('Tesseract.recognize(videoEl.current)', result));
    }

    useEffect(() => {
        findVideoSources().then(setSources)
    }, []);

    useEffect(() => {
        // const {createWorker} = require('tesseract.js');

        // const worker = createWorker({
        //     logger: (m: any) => console.log(m),
        // });

        async function loadWorker() {
            // console.log('await worker.load();', await worker.load());
            // console.log('await worker.loadLanguage(\'eng\');', await worker.loadLanguage('eng'));
            // console.log('await worker.initialize(\'eng\');', await worker.initialize('eng'));

            // setOcrWorker(worker);
        }

        loadWorker().catch(err => {
            console.error(err)
        });

        // return () => {
        //     worker.terminate()
        // }
    }, []);

    useEffect(() => {
        async function startStream() {
            const video = videoEl.current;

            if (video && selectedSource) {
                video.onloadedmetadata = function () {
                    video.play()
                };

                video.srcObject = await navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: {
                        mandatory: {
                            chromeMediaSource: 'desktop',
                            chromeMediaSourceId: selectedSource.id,
                            minWidth: 1280,
                            maxWidth: 4000,
                            minHeight: 720,
                            maxHeight: 4000
                        }
                    } as MediaTrackConstraints
                })
            }
        }

        if (selectedSource) {
            startStream().catch((err) => {
                console.error(err)
            })
        }
    }, [selectedSource]);

    return (
        <div className="App">
            <header className="App-header">
                <button onClick={doOcrCheck}>Run OCR</button>
                <p>
                    Edit <code>src/App.tsx</code> and save to reload.
                </p>
                <video id="video-stream"
                       style={{width: '100%', height: 'auto', display: selectedSource ? undefined : 'none'}}
                       ref={videoEl}/>
                {
                    (selectedSource)
                        ? null
                        : (
                            <div style={{display: 'flex', flexDirection: 'column'}}>{
                                sources.filter(s => !!s.appIcon).map(source => (
                                    <img key={source.id} style={{width: 64, height: 'auto', marginRight: '5px'}}
                                         src={source.appIcon.toDataURL()} onClick={() => selectSource(source)}/>
                                ))
                            }</div>
                        )
                }
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
            </header>
        </div>
    );
}

export default App;
