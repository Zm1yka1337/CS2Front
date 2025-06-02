import React, { useState } from 'react';
import '../styles/TrajectoryMap.css'; // Стилі для цього компонента

const TrajectoryMap = ({ mapImageUrl, mapOriginalWidth, mapOriginalHeight, trajectoryPoints }) => {
  const [imgNaturalDimensions, setImgNaturalDimensions] = useState({ width: 0, height: 0 });

  if (!mapImageUrl || !mapOriginalWidth || !mapOriginalHeight || !trajectoryPoints || trajectoryPoints.length < 2) {
    // Якщо даних недостатньо, не рендеримо нічого або показуємо повідомлення
    return <div className="trajectory-map-container error">Даних для відображення траєкторії недостатньо.</div>;
  }

  // Перетворюємо масив точок в рядок для атрибута 'points' SVG <polyline>
  const pointsString = trajectoryPoints.map(p => `${p.x},${p.y}`).join(' ');

  const handleImageLoad = (event) => {
    setImgNaturalDimensions({
      width: event.target.naturalWidth,
      height: event.target.naturalHeight,
    });
  };

  let viewBoxAspectRatio = 'N/A';
  if (mapOriginalHeight && mapOriginalHeight !== 0) {
    viewBoxAspectRatio = (mapOriginalWidth / mapOriginalHeight).toFixed(4);
  }

  let imageAspectRatio = 'Завантаження...';
  if (imgNaturalDimensions.height !== 0) {
    imageAspectRatio = (imgNaturalDimensions.width / imgNaturalDimensions.height).toFixed(4);
  }

  let warningMessage = null;
  if (imgNaturalDimensions.height !== 0 && mapOriginalHeight && mapOriginalHeight !== 0) {
    const threshold = 0.01; // Допустима похибка для чисел з плаваючою комою
    if (Math.abs(parseFloat(viewBoxAspectRatio) - parseFloat(imageAspectRatio)) > threshold) {
      warningMessage = (
        <div style={{ color: 'red', fontWeight: 'bold', textAlign: 'left', marginTop: '10px', padding: '10px', border: '2px solid red', backgroundColor: '#fff0f0' }}>
          <h4>КРИТИЧНА ПОМИЛКА АДАПТИВНОСТІ!</h4>
          <p>Траєкторії БУДУТЬ 'з'їжджати' при зміні розміру екрана.</p>
          <p>Співвідношення сторін <strong>ViewBox</strong> (з ваших даних): <strong>{viewBoxAspectRatio}</strong> (використано mapOriginalWidth: {mapOriginalWidth}, mapOriginalHeight: {mapOriginalHeight})</p>
          <p>Співвідношення сторін <strong>Зображення</strong> (реальне з файлу): <strong>{imageAspectRatio}</strong> (реальні розміри картинки: {imgNaturalDimensions.width}px × {imgNaturalDimensions.height}px)</p>
          <p style={{ marginTop: '10px' }}><strong>ЦІ ДВА ЗНАЧЕННЯ СПІВВІДНОШЕННЯ СТОРІН МАЮТЬ БУТИ ПРАКТИЧНО ОДНАКОВИМИ!</strong></p>
          <p style={{ marginTop: '15px' }}><strong>Щоб виправити це для поточної карти:</strong></p>
          <ol style={{ margin: '5px 0 0 20px', paddingLeft: '0' }}>
            <li>Запам'ятайте реальні розміри зображення: <strong>{imgNaturalDimensions.width}px × {imgNaturalDimensions.height}px</strong>.</li>
            <li>Відкрийте ваш файл даних (наприклад, <code>src/data/nades.js</code>).</li>
            <li>Знайдіть об'єкт, що відповідає цій карті/гранаті.</li>
            <li>Встановіть у ньому такі значення:</li>
            <ul style={{ margin: '5px 0 0 20px', paddingLeft: '0', listStyleType: 'disc' }}>
              <li><code>mapOriginalWidth: {imgNaturalDimensions.width},</code></li>
              <li><code>mapOriginalHeight: {imgNaturalDimensions.height},</code></li>
            </ul>
            <li>Або, якщо ви хочете використовувати іншу базову ширину для ViewBox (наприклад, 1000), то встановіть:</li>
            <ul style={{ margin: '5px 0 0 20px', paddingLeft: '0', listStyleType: 'disc' }}>
              <li><code>mapOriginalWidth: 1000,</code> (або інше бажане значення)</li>
              <li><code>mapOriginalHeight: {Math.round((imgNaturalDimensions.height / imgNaturalDimensions.width) * 1000)},</code> (розраховано для ширини 1000)</li>
            </ul>
            <li>Переконайтеся, що всі координати <code>trajectoryPoints</code> для цієї гранати задані відносно обраних вами <code>mapOriginalWidth</code> та <code>mapOriginalHeight</code>.</li>
          </ol>
        </div>
      );
    }
  }

  return (
    <div className="trajectory-map-outer-container"> {/* Обгортка для карти та діагностики */}
      <div className="trajectory-map-container">
        <img 
          src={mapImageUrl} 
          alt="Map background" 
          className="map-background-image"
          onLoad={handleImageLoad} // Обробник завантаження зображення
        />
        <svg
          className="trajectory-svg-overlay"
          viewBox={`0 0 ${mapOriginalWidth} ${mapOriginalHeight}`}
          preserveAspectRatio="xMinYMin meet" // Змінено з xMidYMid meet
        >
          <polyline
            points={pointsString}
            className="trajectory-line"
            fill="none"
            stroke="#FF0000" // Колір лінії (наприклад, червоний)
            strokeWidth="8"   // Зменшено з 10
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Можна додати маркери для початку/кінця траєкторії, якщо потрібно */}
          {trajectoryPoints.length > 0 && (
            <circle 
              cx={trajectoryPoints[0].x} 
              cy={trajectoryPoints[0].y} 
              r="12" // Зменшено з 15
              fill="rgba(0, 255, 0, 0.7)" // Зелений напівпрозорий
              stroke="#000000"
              strokeWidth="3" // Зменшено з 5
            />
          )}
          {trajectoryPoints.length > 0 && (
            <circle 
              cx={trajectoryPoints[trajectoryPoints.length - 1].x} 
              cy={trajectoryPoints[trajectoryPoints.length - 1].y} 
              r="12" // Зменшено з 15
              fill="rgba(255, 0, 0, 0.7)" // Червоний напівпрозорий
              stroke="#000000"
              strokeWidth="3" // Зменшено з 5
            />
          )}
        </svg>
      </div>
      <div className="trajectory-debug-info">
        <h4>Діагностика траєкторії:</h4>
        <p><strong>ViewBox SVG:</strong> {`0 0 ${mapOriginalWidth} ${mapOriginalHeight}`}</p>
        <p><strong>Співвідношення сторін ViewBox:</strong> {viewBoxAspectRatio}</p>
        <p><strong>Розміри завантаж. зображення (natural):</strong> {imgNaturalDimensions.width} x {imgNaturalDimensions.height}</p>
        <p><strong>Співвідношення сторін зображення:</strong> {imageAspectRatio}</p>
        {warningMessage}
      </div>
    </div>
  );
};

export default TrajectoryMap; 