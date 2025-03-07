import React, { useEffect, useState, useRef } from 'react';

const BackgroundMusic = ({ src }) => {
  const [audio] = useState(new Audio(src));
  const [playing, setPlaying] = useState(false);
  const hasAttemptedAutoplay = useRef(false);

  useEffect(() => {
    audio.loop = true;
    audio.volume = 0.5;
    
    const attemptAutoplay = async () => {
      if (!hasAttemptedAutoplay.current) {
        hasAttemptedAutoplay.current = true;
        try {
          await audio.play();
          setPlaying(true);
          console.log("Autoplay successful");
        } catch (error) {
          console.log("Autoplay prevented by browser, waiting for interaction");
          
          const startAudioOnInteraction = () => {
            audio.play()
              .then(() => {
                setPlaying(true);
                ['click', 'touchstart', 'keydown', 'scroll'].forEach(event => {
                  document.removeEventListener(event, startAudioOnInteraction);
                });
              });
          };
          
          ['click', 'touchstart', 'keydown', 'scroll'].forEach(event => {
            document.addEventListener(event, startAudioOnInteraction);
          });
        }
      }
    };
    
    attemptAutoplay();

    return () => {
      audio.pause();
      audio.currentTime = 0;
      ['click', 'touchstart', 'keydown', 'scroll'].forEach(event => {
        document.removeEventListener(event, () => {});
      });
    };
  }, [audio]);

  return (
    <div className="music-controls">
      <button 
        onClick={() => {
          if (playing) {
            audio.pause();
          } else {
            audio.play();
          }
          setPlaying(!playing);
        }}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.7)',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer'
        }}
      >
        {playing ? '🔇' : '🔊'}
      </button>
    </div>
  );
};

export default BackgroundMusic; 