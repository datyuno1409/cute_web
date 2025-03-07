import React, { useEffect, useState, useRef } from 'react';

const BackgroundMusic = ({ src }) => {
  const [audio] = useState(new Audio(src));
  const [playing, setPlaying] = useState(false);
  const hasAttemptedAutoplay = useRef(false);

  useEffect(() => {
    audio.loop = true;
    audio.volume = 0.5;
    
    // Định nghĩa playOnTouch trước khi sử dụng
    const playOnTouch = async () => {
      try {
        await audio.play();
        setPlaying(true);
        document.removeEventListener('touchstart', playOnTouch);
      } catch (error) {
        console.log("Playback prevented");
      }
    };

    const attemptPlay = async () => {
      try {
        // Thử phát nhạc ngay lập tức
        await audio.play();
        setPlaying(true);
      } catch (error) {
        // Nếu không thể phát tự động, đăng ký sự kiện touch
        document.addEventListener('touchstart', playOnTouch);
      }
    };
    
    attemptPlay();

    return () => {
      audio.pause();
      audio.currentTime = 0;
      document.removeEventListener('touchstart', playOnTouch);
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
          cursor: 'pointer',
          padding: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}
      >
        {playing ? '🔇' : '🔊'}
      </button>
    </div>
  );
};

export default BackgroundMusic; 