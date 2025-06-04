import app from '../components/firebase'; 

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

// Імпорти для Cloud Firestore
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  Timestamp, 
  addDoc,
  query,
  orderBy,
  where,
  deleteDoc
} from "firebase/firestore";

// Використовуємо імпортований app для отримання auth та db
const auth = getAuth(app);
const db = getFirestore(app); // Ініціалізуємо Cloud Firestore
const googleProvider = new GoogleAuthProvider();

// Функція для збереження/оновлення даних користувача в Cloud Firestore
const saveUserToDB = async (user, additionalData = {}) => {
  if (!user || !user.uid) {
    console.error("saveUserToDB: Неправильний об'єкт user або відсутній uid");
    return;
  }
  
  const userDocRef = doc(db, "users", user.uid);
  try {
    const docSnap = await getDoc(userDocRef);
    const dataToSave = {
      email: user.email,
      displayName: additionalData.displayName || user.displayName || user.email.split('@')[0],
      photoURL: additionalData.photoURL || user.photoURL || null,
      // createdAt обробляється або з additionalData, або з метаданих користувача, або як новий Timestamp
      createdAt: additionalData.createdAt || (user.metadata && user.metadata.creationTime ? Timestamp.fromDate(new Date(user.metadata.creationTime)) : Timestamp.fromDate(new Date())),
      ...additionalData 
    };

    if (!docSnap.exists()) {
      await setDoc(userDocRef, dataToSave);
      console.log("User saved to Firestore DB:", user.uid, dataToSave);
    } else {
      const existingData = docSnap.data();
      const updateData = {
        ...dataToSave,
        createdAt: additionalData.createdAt || existingData.createdAt || dataToSave.createdAt,
        lastLogin: Timestamp.fromDate(new Date()) 
      };
      await setDoc(userDocRef, updateData, { merge: true });
      console.log("User data updated in Firestore DB:", user.uid, updateData);
    }
  } catch (error) {
    console.error("Error saving user to Firestore DB:", error);
    throw error; 
  }
};

// Реєстрація через Email/Пароль
export const registerWithEmailAndPassword = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Потенційно: await updateProfile(userCredential.user, { displayName }); (потрібен імпорт updateProfile)
    await saveUserToDB(userCredential.user, { 
      displayName,
      createdAt: Timestamp.fromDate(new Date()) // Явно встановлюємо createdAt тут
    });
    return { user: userCredential.user };
  } catch (error) {
    console.error("Registration error in firebaseService:", error);
    return { error };
  }
};

// Вхід через Email/Пароль
export const signInWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await firebaseSignInWithEmailAndPassword(auth, email, password);
    await saveUserToDB(userCredential.user, { lastLogin: Timestamp.fromDate(new Date()) }); 
    return { user: userCredential.user };
  } catch (error) {
    return { error };
  }
};

// Вхід через Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // saveUserToDB використає displayName та photoURL з result.user
    await saveUserToDB(result.user, { 
      // createdAt буде встановлено в saveUserToDB, якщо користувач новий, 
      // або оновлено lastLogin, якщо існуючий
    });
    return { user: result.user };
  } catch (error) {
    console.error("Google sign-in error:", error);
    return { error };
  }
};

// Вихід
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { error };
  }
};

// Слухач зміни стану автентифікації
export const onAuthStatusChanged = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      saveUserToDB(user).catch(err => console.error("Error in onAuthStatusChanged -> saveUserToDB:", err)); 
    }
    callback(user);
  });
};

// --- API для карт і лайн-апів ---

export const getAllNadeData = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/maps`);
    if (!response.ok) throw new Error('Failed to fetch maps');
    return await response.json();
  } catch (error) {
    console.error("Error fetching all nade data from API:", error);
    return { error };
  }
};

export const getNadeDataForMap = async (mapId) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/maps/${mapId}`);
    if (!response.ok) throw new Error('Failed to fetch map');
    return await response.json();
  } catch (error) {
    console.error(`Error fetching nade data for map ${mapId} from API:`, error);
    return { error };
  }
};

// --- API для коментарів (якщо є відповідні ендпоінти на сервері) ---
export const getNadeComments = async (mapId, nadeId) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/maps/${mapId}/comments/${nadeId}`);
    if (!response.ok) throw new Error('Failed to fetch comments');
    return await response.json();
  } catch (error) {
    console.error("Error fetching nade comments from API:", error);
    return { error };
  }
};

export const addCommentToNade = async (mapId, nadeId, userId, userName, text) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/maps/${mapId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nadeId, userId, userName, text })
    });
    if (!response.ok) throw new Error('Failed to add comment');
    return await response.json();
  } catch (error) {
    console.error("Error adding comment via API:", error);
    return { error };
  }
};

export const deleteNadeComment = async (mapId, commentId, userId) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/maps/${mapId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (!response.ok) throw new Error('Failed to delete comment');
    return await response.json();
  } catch (error) {
    console.error("Error deleting comment via API:", error);
    return { error };
  }
};

// --- Функції для улюблених гранат ---

// Додавання гранати до улюблених
export const addNadeToFavorites = async (userId, mapId, nadeId) => {
  if (!userId || !mapId || !nadeId) {
    console.error("addNadeToFavorites: Відсутні userId, mapId або nadeId");
    return { error: "Відсутні необхідні ідентифікатори" };
  }
  const userDocRef = doc(db, "users", userId);
  try {
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) {
      console.error(`User document with ID ${userId} not found.`);
      return { error: "Користувача не знайдено" };
    }

    const userData = docSnap.data();
    const favorites = userData.favorites || [];
    
    // Перевірка, чи граната вже не в улюблених
    if (favorites.some(fav => fav.mapId === mapId && fav.nadeId === nadeId)) {
      console.log("Nade already in favorites");
      return { success: true, message: "Граната вже в улюблених" }; 
    }

    favorites.push({ mapId, nadeId, addedAt: Timestamp.fromDate(new Date()) });
    await setDoc(userDocRef, { favorites }, { merge: true });
    console.log(`Nade ${nadeId} on map ${mapId} added to favorites for user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Error adding nade to favorites:", error);
    return { error };
  }
};

// Видалення гранати з улюблених
export const removeNadeFromFavorites = async (userId, mapId, nadeId) => {
  if (!userId || !mapId || !nadeId) {
    console.error("removeNadeFromFavorites: Відсутні userId, mapId або nadeId");
    return { error: "Відсутні необхідні ідентифікатори" };
  }
  const userDocRef = doc(db, "users", userId);
  try {
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) {
      console.error(`User document with ID ${userId} not found.`);
      return { error: "Користувача не знайдено" };
    }

    const userData = docSnap.data();
    let favorites = userData.favorites || [];

    const initialLength = favorites.length;
    favorites = favorites.filter(fav => !(fav.mapId === mapId && fav.nadeId === nadeId));

    if (favorites.length === initialLength) {
        console.log("Nade not found in favorites to remove");
        return { success: true, message: "Гранати немає в улюблених" };
    }

    await setDoc(userDocRef, { favorites }, { merge: true });
    console.log(`Nade ${nadeId} on map ${mapId} removed from favorites for user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Error removing nade from favorites:", error);
    return { error };
  }
};

// Отримання списку улюблених гранат користувача
export const getUserFavoriteNades = async (userId) => {
  if (!userId) {
    console.error("getUserFavoriteNades: Відсутній userId");
    return { error: "Відсутній ідентифікатор користувача" };
  }
  const userDocRef = doc(db, "users", userId);
  try {
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const userData = docSnap.data();
      return userData.favorites || []; // Повертаємо масив або порожній масив
    } else {
      console.log(`User document with ID ${userId} not found.`);
      return []; // Користувача немає, отже, немає улюблених
    }
  } catch (error) {
    console.error("Error fetching user favorite nades:", error);
    return { error }; // Повертаємо об'єкт з помилкою
  }
};

// --- Функції для статистики переглядів відео ---

// Запис перегляду відео гранати
export const recordNadeView = async (userId, mapId, nadeId) => {
  if (!userId || !mapId || !nadeId) {
    console.error("recordNadeView: Відсутні userId, mapId або nadeId");
    return { error: "Відсутні необхідні ідентифікатори" };
  }
  const userDocRef = doc(db, "users", userId);
  const viewKey = `${mapId}_${nadeId}`;

  try {
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) {
      console.warn(`User document with ID ${userId} not found. Cannot record view.`);
      // Можливо, варто створити документ користувача, якщо його немає,
      // але це може бути непередбачувано, якщо saveUserToDB не спрацював раніше.
      // Поки що просто виходимо, якщо користувача немає.
      return { error: "Користувача не знайдено" }; 
    }

    const userData = docSnap.data();
    const videoViews = userData.videoViews || {}; // { "mapId_nadeId": count, ... }
    
    videoViews[viewKey] = (videoViews[viewKey] || 0) + 1;
    
    await setDoc(userDocRef, { videoViews }, { merge: true });
    console.log(`View recorded for nade ${nadeId} on map ${mapId} by user ${userId}. Total views: ${videoViews[viewKey]}`);
    return { success: true, newViewCount: videoViews[viewKey] };
  } catch (error) {
    console.error("Error recording nade view:", error);
    return { error };
  }
};

// Отримання статистики переглядів для користувача
export const getUserVideoViewStats = async (userId) => {
  if (!userId) {
    console.error("getUserVideoViewStats: Відсутній userId");
    return { error: "Відсутній ідентифікатор користувача" };
  }
  const userDocRef = doc(db, "users", userId);
  try {
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const userData = docSnap.data();
      return userData.videoViews || {}; // Повертаємо об'єкт або порожній об'єкт
    } else {
      console.log(`User document with ID ${userId} not found. No view stats.`);
      return {}; 
    }
  } catch (error) {
    console.error("Error fetching user video view stats:", error);
    return { error }; 
  }
}; 