// Firebase Messaging Service Worker
// ไฟล์นี้ต้องอยู่ที่ /public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js')

// ⚠️ ใส่ firebaseConfig จริงจาก Firebase Console > Project Settings
firebase.initializeApp({
  apiKey:            "AIzaSyA0qa87ggw5zEml4VjHJl-mCJyYjJVOP28",
  authDomain:        "yugrill-money-a33ee.firebaseapp.com",
  databaseURL:       "https://yugrill-money-a33ee-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "yugrill-money-a33ee",
  storageBucket:     "yugrill-money-a33ee.firebasestorage.app",
  messagingSenderId: "488608486415",
  appId:             "1:488608486415:web:8b50d77a9e2f66326a7f7a",
})

const messaging = firebase.messaging()

// รับ notification เมื่อแอปอยู่ background หรือปิดอยู่
messaging.onBackgroundMessage(payload => {
  const { title, body, icon } = payload.notification || {}
  self.registration.showNotification(title || '🔥 YuGrill', {
    body:     body || 'มีรายการใหม่',
    icon:     '/icon-192.png',
    badge:    '/icon-192.png',
    tag:      'yugrill-new-record',
    renotify: true,
    data:     payload.data,
  })
})

// คลิก notification → เปิดแอป
self.addEventListener('notificationclick', e => {
  e.notification.close()
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
      const existing = cs.find(c => c.url.includes(self.location.origin))
      if (existing) return existing.focus()
      return clients.openWindow('/')
    })
  )
})
