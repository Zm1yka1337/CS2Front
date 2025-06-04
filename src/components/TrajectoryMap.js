import React, { useState, useEffect, useRef } from 'react';
import '../styles/TrajectoryMap.css'; // Стилі для цього компонента

const TrajectoryMap = ({ mapImageUrl, trajectoryPoints }) => {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageRect, setImageRect] = useState(null);

  useEffect(() => {
    const updateImageRect = () => {
      if (!imageRef.current || !imageLoaded) return;
      
      const img = imageRef.current;
      const rect = img.getBoundingClientRect();
      const imgNaturalSize = Math.min(img.naturalWidth, img.naturalHeight);
      
      // Отримуємо актуальні розміри квадратного зображення на екрані
      const displaySize = Math.min(rect.width, rect.height);
      
      // Розраховуємо відступи для центрування
      const offsetX = (rect.width - displaySize) / 2;
      const offsetY = (rect.height - displaySize) / 2;

      setImageRect({
        size: displaySize,
        naturalSize: imgNaturalSize,
        offsetX: rect.left + offsetX,
        offsetY: rect.top + offsetY,
        scale: displaySize / imgNaturalSize
      });
    };

    const observer = new ResizeObserver(updateImageRect);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    window.addEventListener('resize', updateImageRect);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateImageRect);
    };
  }, [imageLoaded]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Конвертуємо координати з оригінального розміру в поточний розмір
  const convertCoordinates = (point) => {
    if (!imageRect) return { x: 0, y: 0 };

    // Нормалізуємо координати відносно квадратної карти
    const normalizedX = point.x / imageRect.naturalSize;
    const normalizedY = point.y / imageRect.naturalSize;

    // Конвертуємо в поточні координати
    return {
      x: normalizedX * imageRect.size,
      y: normalizedY * imageRect.size
    };
  };

  // Створення SVG path
  const createPath = (points) => {
    if (!points || points.length < 2 || !imageRect) return '';

    return points
      .map((point, index) => {
        const { x, y } = convertCoordinates(point);
        return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      })
      .join(' ');
  };

  // Рендер маркера
  const renderMarker = (point, type) => {
    if (!imageRect) return null;

    const { x, y } = convertCoordinates(point);
    const markerSize = imageRect.size * 0.015; // 1.5% від розміру карти

    return (
      <g className={`trajectory-marker ${type}`}>
        <circle
          cx={x}
          cy={y}
          r={markerSize}
          className={`marker-circle ${type}`}
        />
        {type === 'start' && (
          <circle
            cx={x}
            cy={y}
            r={markerSize * 0.5}
            className="marker-inner"
          />
        )}
      </g>
    );
  };

  return (
    <div className="trajectory-map-container" ref={containerRef}>
      <div className="map-wrapper">
        <img
          ref={imageRef}
          src={mapImageUrl}
          alt="Map"
          className="map-image"
          onLoad={handleImageLoad}
        />
        {imageLoaded && imageRect && (
          <svg
            className="trajectory-overlay"
            width={imageRect.size}
            height={imageRect.size}
            style={{
              position: 'absolute',
              left: `${imageRect.offsetX}px`,
              top: `${imageRect.offsetY}px`
            }}
          >
            {trajectoryPoints?.map((trajectory, index) => (
              <g key={index} className="trajectory-group">
                <path
                  d={createPath(trajectory.points)}
                  className={`trajectory-path ${trajectory.type || 'normal'}`}
                  style={{
                    stroke: trajectory.color || '#FF0000',
                    strokeWidth: `${imageRect.size * 0.003}px`
                  }}
                />
                {renderMarker(trajectory.points[0], 'start')}
                {renderMarker(trajectory.points[trajectory.points.length - 1], 'end')}
              </g>
            ))}
          </svg>
        )}
      </div>
    </div>
  );
};

export default TrajectoryMap; 