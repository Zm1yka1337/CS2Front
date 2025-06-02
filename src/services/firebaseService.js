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

// --- Функції для роботи з Cloud Firestore (гранати) ---

export const getAllNadeData = async () => {
  try {
    const lineupsCollectionRef = collection(db, 'map_lineups');
    const querySnapshot = await getDocs(lineupsCollectionRef);
    const allData = {};
    querySnapshot.forEach((doc) => {
      allData[doc.id] = doc.data();
    });
    if (Object.keys(allData).length === 0) {
      console.log("No nade data available in Firestore's map_lineups collection");
      return null;
    }
    return allData;
  } catch (error) {
    console.error("Error fetching all nade data from Firestore:", error);
    return { error }; // Повертаємо об'єкт з помилкою для кращої обробки
  }
};

export const getNadeDataForMap = async (mapId) => {
  try {
    const mapDocRef = doc(db, "map_lineups", mapId);
    const docSnap = await getDoc(mapDocRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log(`No data found for map ${mapId} in Firestore's map_lineups collection`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching nade data for map ${mapId} from Firestore:`, error);
    return { error }; // Повертаємо об'єкт з помилкою
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

// --- Функції для коментарів до гранат ---

// Додавання коментаря до гранати
export const addCommentToNade = async (mapId, nadeId, userId, userName, text) => {
  if (!mapId || !nadeId || !userId || !userName || !text) {
    console.error("addCommentToNade: Відсутні необхідні параметри.");
    return { error: "Відсутні необхідні параметри для додавання коментаря." };
  }
  try {
    const commentsCollectionRef = collection(db, "map_lineups", mapId, "map_comments");
    
    const newComment = {
      nadeId,
      userId,
      userName,
      text,
      createdAt: Timestamp.fromDate(new Date()),
    };

    const docRef = await addDoc(commentsCollectionRef, newComment);
    console.log("Comment added to map_comments with ID: ", docRef.id);
    return { success: true, commentId: docRef.id, comment: {id: docRef.id, ...newComment} };
  } catch (error) {
    console.error("Error adding comment to nade (in map_comments):", error);
    return { error: "Помилка під час додавання коментаря." };
  }
};

// Отримання коментарів для гранати
export const getNadeComments = async (mapId, nadeId) => {
  if (!mapId || !nadeId) {
    console.error("getNadeComments: Відсутні mapId або nadeId.");
    return { error: "Відсутні ідентифікатори для завантаження коментарів." };
  }
  try {
    const commentsCollectionRef = collection(db, "map_lineups", mapId, "map_comments");
    
    const q = query(
      commentsCollectionRef, 
      where("nadeId", "==", nadeId), 
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const comments = [];
    querySnapshot.forEach((doc) => {
      comments.push({ id: doc.id, ...doc.data() });
    });
    
    return comments; 
  } catch (error) {
    console.error("Error fetching nade comments (from map_comments):", error);
    if (error.code === 'failed-precondition') {
      console.warn("Firestore query failed. This might be due to a missing composite index. See instructions.");
      return { error: "Query failed, missing index?", needsIndex: true, comments: [] }; 
    }
    return []; 
  }
};

// Видалення коментаря до гранати
export const deleteNadeComment = async (mapId, commentId, userId) => {
  if (!mapId || !commentId || !userId) {
    console.error("deleteNadeComment: Відсутні mapId, commentId або userId.");
    return { error: "Відсутні необхідні параметри для видалення коментаря." };
  }
  try {
    const commentDocRef = doc(db, "map_lineups", mapId, "map_comments", commentId);
    const commentSnap = await getDoc(commentDocRef);

    if (!commentSnap.exists()) {
      console.error("deleteNadeComment: Comment not found.");
      return { error: "Коментар не знайдено." };
    }

    const commentData = commentSnap.data();
    if (commentData.userId !== userId) {
      console.warn("deleteNadeComment: User is not authorized to delete this comment.");
      return { error: "Ви не можете видалити цей коментар." };
    }

    await deleteDoc(commentDocRef);
    console.log(`Comment ${commentId} deleted successfully by user ${userId} from map ${mapId}.`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting nade comment:", error);
    return { error: "Помилка під час видалення коментаря." };
  }
}; 