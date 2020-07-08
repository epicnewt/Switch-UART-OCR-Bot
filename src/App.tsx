import React, {useCallback, useEffect, useState} from 'react';
import './App.css';
import Tesseract from 'tesseract.js';
import ISerialPort from 'serialport';
import {ButtonEventData, Controller} from './controller/controller';
import {tap} from 'rxjs/operators';
import {Switch} from './Switch';

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

const HACK = -1;
const PICK_SERIAL_DEVICE = 0;
const PICK_APPLICATION = 1;

function App() {
    const [selectedPort, selectPort] = useState<ISerialPort.PortInfo>();
    const [selectedSource, selectSource] = useState<Electron.DesktopCapturerSource>();

    const [ports, setPorts] = useState<ISerialPort.PortInfo[]>([]);
    const [sources, setSources] = useState<Electron.DesktopCapturerSource[]>([]);
    const [controller, setController] = useState<Controller>();
    const [buttonData, setButtonData] = useState<ButtonEventData>();
    const [compState, setCompState] = useState(0);
    const [intervalID, setIntervalID] = useState<NodeJS.Timeout>();

    const [videoEl, setVideoEl] = useState<HTMLVideoElement>();
    const video = useCallback((node) => {
        if (node !== videoEl) {
            setVideoEl(node)
        }
    }, []);

    async function doOcrCheck() {
        console.log('doOcrCheck():', videoEl);

        if (!videoEl)
            return;

        Tesseract.recognize(videoEl, 'eng')
            .catch((err: any) => console.error('Tesseract.recognize(videoEl.current)', err))
            .then((result) => console.log('Tesseract.recognize(videoEl.current)', result));
    }

    useEffect(() => {
        if (controller) {
            controller.events$.subscribe(setButtonData)
        }
    }, [controller]);

    useEffect(() => {
        findVideoSources().then(setSources)
    }, []);

    useEffect(() => {
        const SerialPort = Electron.remote.require('serialport');

        setIntervalID(setInterval(() => {
            SerialPort.list().then(setPorts)
        }, 500));
    }, []);

    useEffect(() => {
        async function startStream() {
            if (videoEl && selectedSource) {
                videoEl.onloadedmetadata = () => {
                    videoEl.play()
                };

                videoEl.srcObject = await navigator.mediaDevices.getUserMedia({
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
            } else {
                console.error('Failed to start video')
            }
        }

        startStream().catch((err) => {
            console.error(err)
        })
    }, [selectedSource, videoEl]);

    useEffect(() => {
        console.log('selectedPort:', selectedPort);
        if (selectedPort) {
            const c = new Controller(selectedPort.path);
            setController(c);
            // @ts-ignore
            window.controller = c;
            if (intervalID) {
                clearInterval(intervalID)
            }
        }
    }, [selectedPort]);

    useEffect(() => {
        if (compState === HACK)
            return;
        setCompState([selectedPort, selectedSource].filter(s => !!s).length)
    }, [selectedPort, selectedSource]);

    switch (compState) {
        case PICK_SERIAL_DEVICE:
            return (
                <div className='App'>
                    <header className='App-header'>{
                        ports.length
                            ? ports.map(port =>
                                <p key={port.path} style={{cursor: 'pointer'}}
                                   onClick={() => selectPort(port)}>{port.path}</p>
                            )
                            : <span>No ports</span>
                    }</header>
                </div>
            );
        case PICK_APPLICATION:
            return (
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <header className='App-header'>
                        <button onClick={() => {
                            // @ts-ignore
                            window.controller.close()
                        }}>CLOSE
                        </button>
                        {
                            sources.filter(s => !!s.appIcon).map(source => (
                                <img key={source.id} style={{width: 64, height: 'auto', marginRight: '5px'}}
                                     src={source.appIcon.toDataURL()} onClick={() => selectSource(source)}/>
                            ))
                        }
                        <video id='video-stream'
                               style={{display: 'none'}}
                               ref={video}/>
                    </header>
                </div>
            );
        case HACK:
            return (
                <div style={{height: '100%', maxWidth: '100%'}}>
                    <Switch/>
                </div>
            )
    }

    return (
        <div className='App' style={{height: '100%'}}>
            <header className='App-header' style={{height: '100%'}}>
                <button onClick={() => {
                    // @ts-ignore
                    window.controller.close()
                }}>CLOSE
                </button>
                <button onClick={doOcrCheck}>Run OCR</button>
                <Switch buttonEvents$={controller?.events$}>
                    <video id='video-stream'
                           style={{width: '100%', height: 'auto', position: 'relative', top: '50%', transform: 'translateY(-50%)'}}
                           ref={video}/>
                </Switch>
            </header>
        </div>
    );
}

export default App;
