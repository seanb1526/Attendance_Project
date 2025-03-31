import React, { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { Html5Qrcode } from 'html5-qrcode';

const QrScannerEngine = ({ onScanSuccess, onScanError, onScannerReady, stopScanning }) => {
  const html5QrCodeRef = useRef(null);
  const containerRef = useRef(null);
  const cleanupCameraRef = useRef(false);

  // Force camera cleanup when the component unmounts or stopScanning changes
  useEffect(() => {
    return () => {
      cleanupCameraRef.current = true;
      cleanupCamera();
    };
  }, []);

  // Effect for handling stop scanner prop change
  useEffect(() => {
    if (stopScanning) {
      cleanupCamera();
    }
  }, [stopScanning]);

  // Function to clean up camera resources
  const cleanupCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        console.log("Stopping QR scanner and releasing camera...");
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
        
        // Extra steps to ensure camera is released
        const videoTracks = navigator.mediaDevices
          .getUserMedia({ video: true })
          .then(stream => {
            stream.getTracks().forEach(track => track.stop());
          })
          .catch(err => console.log("Could not get video tracks", err));
          
        console.log("Camera resources released");
      } catch (err) {
        console.error("Error stopping scanner:", err);
      } finally {
        html5QrCodeRef.current = null;
      }
    }
  };

  useEffect(() => {
    let scanner = null;
    cleanupCameraRef.current = false;
    
    const startScanner = async () => {
      try {
        // Clean up any existing scanner
        await cleanupCamera();
        
        if (cleanupCameraRef.current) return;
        
        const containerId = "qr-reader-" + Math.floor(Math.random() * 1000);
        
        // Create a fresh container element
        const container = document.createElement('div');
        container.id = containerId;
        container.style.width = '100%';
        container.style.height = '100%';
        
        // Clear and append
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          containerRef.current.appendChild(container);
        }
        
        // Initialize scanner
        scanner = new Html5Qrcode(containerId);
        html5QrCodeRef.current = scanner;
        
        if (onScannerReady) {
          onScannerReady(true);
        }
        
        const config = { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1
        };
        
        await scanner.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            if (onScanSuccess) {
              onScanSuccess(decodedText);
            }
          },
          (error) => {
            // Just log scanning errors, don't report each frame error
            console.log("QR scan frame error:", error);
          }
        );
      } catch (err) {
        console.error("Scanner initialization error:", err);
        if (onScanError) {
          onScanError(`Failed to start camera: ${err.message}`);
        }
        if (onScannerReady) {
          onScannerReady(false);
        }
      }
    };
    
    startScanner();
    
    // Cleanup function
    return () => {
      cleanupCameraRef.current = true;
      cleanupCamera();
    };
  }, [onScanSuccess, onScanError, onScannerReady]);
  
  return (
    <Box 
      ref={containerRef}
      sx={{ 
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 2
      }}
    >
      <Typography 
        sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          color: 'text.secondary',
          zIndex: 0
        }}
      >
        Loading camera...
      </Typography>
    </Box>
  );
};

export default QrScannerEngine; 