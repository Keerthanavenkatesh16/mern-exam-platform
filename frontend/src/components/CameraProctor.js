import React, { useEffect, useRef, useState } from 'react';

const CameraProctor = ({ onCameraStatusChange }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('initializing'); // 'initializing' | 'active' | 'denied' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  const startCamera = async () => {
    setStatus('initializing');
    setErrorMessage('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera is not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStatus('active');
      if (onCameraStatusChange) onCameraStatusChange('active');

      // Listen for when tracks end (e.g. user unplugs camera or OS disables it)
      const track = stream.getVideoTracks()[0];
      if (track) {
        track.onended = () => {
          setStatus('error');
          setErrorMessage('Camera stream disconnected.');
          if (onCameraStatusChange) onCameraStatusChange('disconnected');
        };
      }
    } catch (err) {
      console.warn('Camera access issue:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setStatus('denied');
        setErrorMessage('Camera access was denied. Please allow camera permissions.');
        if (onCameraStatusChange) onCameraStatusChange('denied');
      } else {
        setStatus('error');
        setErrorMessage(err.message || 'Unable to access camera.');
        if (onCameraStatusChange) onCameraStatusChange('error');
      }
    }
  };

  useEffect(() => {
    startCamera();

    return () => {
      // Clean up camera stream when leaving exam
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`camera-proctor-card ${isMinimized ? 'minimized' : ''}`}>
      <div className="camera-proctor-header">
        <div className="camera-status-badge">
          <span className={`camera-status-dot ${status === 'active' ? 'active' : 'alert'}`} />
          <span>{status === 'active' ? 'Proctoring Active' : 'Camera Check'}</span>
        </div>
        <button
          type="button"
          className="camera-minimize-btn"
          onClick={() => setIsMinimized((prev) => !prev)}
          title={isMinimized ? 'Expand Camera' : 'Minimize Camera'}
        >
          {isMinimized ? '▢' : '—'}
        </button>
      </div>

      {!isMinimized && (
        <div className="camera-proctor-content">
          {status === 'active' && (
            <div className="camera-video-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-video-stream"
              />
              <div className="camera-live-tag">
                <span className="live-rec-dot" /> REC
              </div>
            </div>
          )}

          {status === 'initializing' && (
            <div className="camera-placeholder">
              <span className="camera-spinner" />
              <p>Connecting camera…</p>
            </div>
          )}

          {(status === 'denied' || status === 'error') && (
            <div className="camera-placeholder camera-warning">
              <span className="camera-warning-icon">⚠️</span>
              <p className="camera-warning-text">{errorMessage}</p>
              <button
                type="button"
                className="btn btn-outline btn-sm camera-retry-btn"
                onClick={startCamera}
              >
                Enable Camera
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CameraProctor;
