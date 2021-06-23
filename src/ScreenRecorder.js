import React, { useEffect, useRef, useState } from 'react';
import useMediaRecorder from '@wmik/use-media-recorder';

function Player({ srcBlob, audio }) {
  if (!srcBlob) {
    return null;
  }

  if (audio) {
    return <audio src={URL.createObjectURL(srcBlob)} controls />;
  }

  return (
    <video
      controls
      src={URL.createObjectURL(srcBlob)}
      width={250}
      height={250}
      controlsList="download"
    />
  );
}

const ScreenRecorderApp=()=> {
  
  let {
    error,
    status,
    mediaBlob,
    stopRecording,
    getMediaStream,
    startRecording
  } = useMediaRecorder({
    recordScreen: true,
    blobOptions: { type: 'video/webm' },
    mediaStreamConstraints: { audio: true, video: true }
  });
  const downloadVideo=()=>{
    var link=document.createElement('a')
    link.download="my-video.webm"
    link.href=mediaBlob
    link.click()
  }
  return (
    <article>
      <h6>{error ? `${status} ${error.message}` : status}</h6>
      <section>
        <button
          type="button"
          onClick={getMediaStream}
          disabled={status === 'ready'}
        >
          Share screen
        </button>
        <button
          type="button"
          onClick={startRecording}
          disabled={status === 'recording'}
        >
          Start recording
        </button>
        <button
          type="button"
          onClick={stopRecording}
          disabled={status !== 'recording'}
        >
          Stop recording
        </button>
      </section>
      <button onClick="downloadVideo"><Player srcBlob={mediaBlob} /></button>
    </article>
  );
}
export default ScreenRecorderApp