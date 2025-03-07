import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence, useAnimation, useDragControls } from 'framer-motion';

const AlbumOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 10px;
    justify-content: flex-start;
    padding-top: 50px;
  }
`;

const PhotoFrame = styled(motion.div)`
  background: white;
  padding: 20px;
  border-radius: 5px;
  transform: rotate(${props => props.rotation}deg);
  margin: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  
  img {
    max-width: 300px;
    height: auto;
    display: block;
  }
  
  @media (max-width: 768px) {
    margin: 0;
    padding: 10px;
    width: 90%;
    
    img {
      width: 100%;
      max-height: 40vh;
      object-fit: contain;
    }
  }
`;

const PhotoGroup = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin: 20px 0;
  width: 100%;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
    height: 70vh;
    overflow-y: auto;
    padding: 10px;
  }
`;

const NavigationButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: white;
  font-size: 24px;
  z-index: 1001;
  
  @media (max-width: 768px) {
    width: 35px;
    height: 35px;
    font-size: 20px;
    
    &.prev {
      left: 10px;
    }
    
    &.next {
      right: 10px;
    }
  }
`;

const CloseButton = styled(motion.button)`
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: white;
  font-size: 24px;
  z-index: 1001;
  
  @media (max-width: 768px) {
    top: 10px;
    right: 10px;
    width: 35px;
    height: 35px;
    font-size: 20px;
  }
`;

const VideoContainer = styled(motion.div)`
  background: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  max-width: 800px;
  width: 90%;
  
  video {
    width: 100%;
    height: auto;
    outline: none;
  }
  
  @media (max-width: 768px) {
    padding: 10px;
    background: transparent;
    box-shadow: none;
  }
`;

const FinalMessage = styled(motion.div)`
  color: white;
  font-size: 6rem;
  text-align: center;
  font-family: 'Pacifico', cursive;
  margin-top: 20px;
  
  @media (max-width: 768px) {
    font-size: 4rem;
  }
  
  @media (max-width: 480px) {
    font-size: 3rem;
  }
`;

const PhotoIndicator = styled(motion.div)`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 0.9rem;
  opacity: 0.8;
  display: none;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const PhotoAlbum = ({ isVisible, onClose, media }) => {
  const [currentView, setCurrentView] = useState('video');
  const [currentGroup, setCurrentGroup] = useState(0);
  const [loadedMedia, setLoadedMedia] = useState(new Set());
  
  const resetAlbum = useCallback(() => {
    setCurrentView('video');
    setCurrentGroup(0);
  }, []);
  
  // Tách video và ảnh, sử dụng useMemo để cache kết quả
  const { video, photos } = useMemo(() => ({
    video: media.find(item => item.type === 'video'),
    photos: media.filter(item => item.type === 'image')
  }), [media]);
  
  // Cache grouped photos
  const groupedPhotos = useMemo(() => {
    const groups = [];
    for (let i = 0; i < photos.length; i += 3) {
      groups.push(photos.slice(i, i + 3));
    }
    return groups;
  }, [photos]);
  
  const nextGroup = useCallback(() => {
    if (currentView === 'video') {
      setCurrentView('photos');
      return;
    }
    
    if (currentView === 'photos') {
      if (currentGroup < groupedPhotos.length - 1) {
        setCurrentGroup(prev => prev + 1);
      } else {
        setCurrentView('final');
      }
    }
  }, [currentView, currentGroup, groupedPhotos.length]);
  
  const prevGroup = useCallback(() => {
    if (currentView === 'final') {
      setCurrentView('photos');
      setCurrentGroup(groupedPhotos.length - 1);
      return;
    }
    
    if (currentView === 'photos') {
      if (currentGroup > 0) {
        setCurrentGroup(prev => prev - 1);
      } else {
        setCurrentView('video');
      }
    }
  }, [currentView, currentGroup, groupedPhotos.length]);
  
  // Preload images
  useEffect(() => {
    if (isVisible) {
      const mediaToLoad = currentView === 'photos' 
        ? groupedPhotos[currentGroup]
        : currentView === 'video' 
          ? [video] 
          : [];

      mediaToLoad.forEach(item => {
        if (!loadedMedia.has(item.url)) {
          if (item.type === 'image') {
            const img = new Image();
            img.src = item.url;
            img.onload = () => {
              setLoadedMedia(prev => new Set([...prev, item.url]));
            };
          } else if (item.type === 'video' && item.thumbnail) {
            const img = new Image();
            img.src = item.thumbnail;
            img.onload = () => {
              setLoadedMedia(prev => new Set([...prev, item.thumbnail]));
            };
          }
        }
      });
    }
  }, [isVisible, currentView, currentGroup, groupedPhotos, video, loadedMedia]);
  
  // Cleanup function
  useEffect(() => {
    return () => {
      setLoadedMedia(new Set());
    };
  }, []);

  const controls = useAnimation();
  const dragControls = useDragControls();

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 100) {
      prevGroup();
    } else if (info.offset.x < -100) {
      nextGroup();
    }
  };

  const VideoRef = useRef(null);

  useEffect(() => {
    if (currentView === 'video' && VideoRef.current) {
      // Cố gắng tự động phát video
      const playVideo = async () => {
        try {
          await VideoRef.current.play();
        } catch (error) {
          console.log("Autoplay prevented");
        }
      };
      playVideo();
    }
  }, [currentView]);

  return (
    <AnimatePresence>
      {isVisible && (
        <AlbumOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onExitComplete={resetAlbum}
        >
          <CloseButton 
            onClick={() => {
              resetAlbum();
              onClose();
            }}
          >
            ×
          </CloseButton>
          
          {currentView !== 'final' && (
            <>
              <NavigationButton className="prev" onClick={prevGroup}>
                ←
              </NavigationButton>
              <NavigationButton className="next" onClick={nextGroup}>
                →
              </NavigationButton>
            </>
          )}

          <AnimatePresence mode="wait">
            {currentView === 'video' && (
              <VideoContainer
                key="video"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <video
                  ref={VideoRef}
                  src={video.url}
                  poster={video.thumbnail}
                  controls
                  playsInline
                  muted
                  autoPlay
                  onTouchStart={() => {
                    if (VideoRef.current) {
                      VideoRef.current.play().catch(() => {});
                    }
                  }}
                />
              </VideoContainer>
            )}

            {currentView === 'photos' && (
              <>
                <PhotoGroup
                  key={`photos-${currentGroup}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {groupedPhotos[currentGroup].map((item, index) => (
                    <PhotoFrame
                      key={index}
                      rotation={Math.random() * 6 - 3}
                      whileHover={{ scale: 1.05, rotation: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <img src={item.url} alt={`${index + 1}`} />
                    </PhotoFrame>
                  ))}
                </PhotoGroup>
                
                <PhotoIndicator>
                  Cuộn xuống để xem thêm ảnh
                </PhotoIndicator>
              </>
            )}

            {currentView === 'final' && (
              <FinalMessage
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  animate={{
                    textShadow: [
                      "0 0 20px #ff69b4, 0 0 30px #ff69b4",
                      "0 0 40px #ff69b4, 0 0 60px #ff69b4",
                      "0 0 20px #ff69b4, 0 0 30px #ff69b4"
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  Aaaaa anh iu bé nhất❤️
                </motion.div>
              </FinalMessage>
            )}
          </AnimatePresence>
        </AlbumOverlay>
      )}
    </AnimatePresence>
  );
};

export default PhotoAlbum; 