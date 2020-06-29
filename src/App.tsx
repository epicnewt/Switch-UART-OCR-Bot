import React, {useEffect, useRef, useState} from 'react';
import logo from './logo.svg';
import './App.css';

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

//
//
// desktopCapturer.getSources({
//   types: ['window', 'screen'],
//   thumbnailSize: {width: 0, height: 0},
//   fetchWindowIcons: true
// }).then(async (sources: Electron.DesktopCapturerSource[]) => {
//   console.log(sources);
//
//   for (const source of sources) {
//     // Filter: main screen
//     // if ((source.name === "Entire screen") || (source.name === "Screen 1") || (source.name === "Screen 2")) {
//     //     try {
//     //         const stream = await navigator.mediaDevices.getUserMedia({
//     //             audio: false,
//     //             video: {}
//     //         });
//     //
//     //         _this.handleStream(stream);
//     //     } catch (e) {
//     //         _this.handleError(e);
//     //     }
//     // }
//   }
// });

function App() {
    let videoEl = useRef<HTMLVideoElement>(null);

    const [sources, setSources] = useState<Electron.DesktopCapturerSource[]>([]);
    const [selectedSource, selectSource] = useState<Electron.DesktopCapturerSource>();
    const [videoSource, setVideoSrc] = useState();

    useEffect(() => {
        findVideoSources().then(setSources)
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
                <img src={logo} className="App-logo" alt="logo"/>
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
                                    // <div>
                                    <img key={source.id} style={{width: 64, height: 'auto', marginRight: '5px'}}
                                         src={source.appIcon.toDataURL()} onClick={() => selectSource(source)}/>
                                    // <span>{source.name}</span>
                                    // </div>
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
