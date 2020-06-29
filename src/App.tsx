import React from 'react';
import logo from './logo.svg';
import './App.css';
import {desktopCapturer} from 'electron';
//
//
desktopCapturer.getSources({types: ['window', 'screen']}).then(async (sources: any) => {});
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
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
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
