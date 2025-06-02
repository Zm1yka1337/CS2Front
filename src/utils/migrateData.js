import { doc, setDoc, getFirestore, Timestamp } from "firebase/firestore";
// Імпортуємо 'app' з вашого центрального файлу конфігурації Firebase
import app from '../components/firebase'; // Переконайтеся, що шлях правильний!

import { maps as nadesDataFromJsFile } from '../data/nades.js';

// Отримуємо екземпляр Firestore з імпортованого 'app'
const db = getFirestore(app);

export const migrateNadesToFirestore = async () => {
  if (!nadesDataFromJsFile || !Array.isArray(nadesDataFromJsFile)) {
    console.error("Дані з nades.js не завантажені або не є масивом.");
    alert("Помилка: Дані з nades.js не завантажені або не є масивом.");
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (const map of nadesDataFromJsFile) {
    if (!map || !map.id) {
      console.warn("Пропущена карта: відсутні дані карти або ID.", map);
      errorCount++;
      continue;
    }

    const mapId = map.id;
    // Готуємо дані для Firestore, виключаючи поля, які не потрібні на верхньому рівні документа карти,
    // якщо вони вже оброблені (наприклад, nades та spots обробляються окремо)
    const mapDocumentData = {
      name: map.name || "",
      image: map.image || "", // Головне зображення карти для огляду
      backgroundImage: map.backgroundImage || "", // Для карток на головній сторінці
      icon: map.icon || "", // Іконка карти
      // createdAt: Timestamp.now(), // Можна додати час створення/оновлення документа карти
      spots: [], // Заповнимо нижче
    };

    if (Array.isArray(map.spots)) {
      mapDocumentData.spots = map.spots.map(spot => {
        const processedNades = (Array.isArray(spot.nades) ? spot.nades : []).map(nade => ({
          // Розгортаємо всі існуючі поля гранати
          ...nade,
          // Переконуємося, що позиції є об'єктами (map у Firestore)
          // Якщо вони вже об'єкти {x, y}, то нічого не зміниться
          // Якщо вони null/undefined, встановлюємо значення за замовчуванням
          startPosition: typeof nade.startPosition === 'object' && nade.startPosition !== null 
                           ? nade.startPosition 
                           : (nade.startPosition ? { x: parseFloat(String(nade.startPosition.x || 0)), y: parseFloat(String(nade.startPosition.y || 0)) } : { x:0, y:0 }),
          endPosition: typeof nade.endPosition === 'object' && nade.endPosition !== null 
                         ? nade.endPosition 
                         : (nade.endPosition ? { x: parseFloat(String(nade.endPosition.x || 0)), y: parseFloat(String(nade.endPosition.y || 0)) } : {x:0, y:0}),
          // videoUrl: nade.videoUrl || "", // Переконуємося, що є значення за замовчуванням
          // Додаємо інші поля гранати з nades.js, якщо вони є
          // title: nade.title || "",
          // description: nade.description || "",
          // difficulty: nade.difficulty || "",
          // tickrate: nade.tickrate || "",
          // technique: nade.technique || "",
          // team: nade.team || "", 
          // type: nade.type || "",
        }));
        return {
          id: spot.id || `spot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Генеруємо ID, якщо немає
          name: spot.name || "",
          position: typeof spot.position === 'object' && spot.position !== null 
                      ? spot.position 
                      : (spot.position ? { x: parseFloat(String(spot.position.x || 0)), y: parseFloat(String(spot.position.y || 0)) } : {x:0, y:0}),
          nades: processedNades,
        };
      });
    }

    try {
      const mapDocRef = doc(db, "map_lineups", mapId);
      await setDoc(mapDocRef, mapDocumentData);
      console.log(`Дані для карти ${mapId} успішно завантажено/оновлено до Firestore.`);
      successCount++;
    } catch (error) {
      console.error(`Помилка при завантаженні даних для карти ${mapId}:`, error);
      errorCount++;
    }
  }
  alert(`Міграція завершена! Успішно: ${successCount}, Помилок: ${errorCount}`);
}; 