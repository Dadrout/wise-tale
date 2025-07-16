// Скрипт для миграции пользователей
// Добавляет поле providerId для существующих пользователей

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, updateDoc, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAaYnmkiIR01-kuFYQRR7RGK8HWVs7duLg",
  authDomain: "time-capsule-d5a66.firebaseapp.com",
  projectId: "time-capsule-d5a66",
  storageBucket: "time-capsule-d5a66.firebasestorage.app",
  messagingSenderId: "218071541143",
  appId: "1:218071541143:web:c3eadd2c64274082ff50d2",
  measurementId: "G-YWMXJ6FHD3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateUsers() {
  try {
    console.log('🔍 Начинаем миграцию пользователей...');
    
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const docSnap of snapshot.docs) {
      const userData = docSnap.data();
      
      // Пропускаем пользователей, у которых уже есть providerId
      if (userData.providerId) {
        console.log(`⏭️ Пользователь ${userData.email} уже имеет providerId: ${userData.providerId}`);
        skippedCount++;
        continue;
      }
      
      // Определяем providerId на основе существующих данных
      let providerId = 'password'; // по умолчанию
      
      // Если у пользователя есть displayName и он отличается от username,
      // и email содержит gmail, вероятно это Google пользователь
      if (userData.displayName && 
          userData.displayName !== userData.username &&
          (userData.email.includes('@gmail.com') || userData.email.includes('@googlemail.com'))) {
        providerId = 'google.com';
      }
      
      // Обновляем пользователя
      await updateDoc(doc(db, 'users', docSnap.id), {
        providerId: providerId,
        updatedAt: new Date()
      });
      
      console.log(`✅ Обновлен пользователь ${userData.email} с providerId: ${providerId}`);
      updatedCount++;
    }
    
    console.log(`\n📊 Миграция завершена:`);
    console.log(`✅ Обновлено пользователей: ${updatedCount}`);
    console.log(`⏭️ Пропущено пользователей: ${skippedCount}`);
    console.log(`📝 Всего обработано: ${updatedCount + skippedCount}`);
    
  } catch (error) {
    console.error('❌ Ошибка при миграции:', error);
  }
}

// Запускаем миграцию
migrateUsers(); 