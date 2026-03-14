'use client'
import { useEffect, useCallback, useRef } from 'react'

// ⚠️ ใส่ VAPID Key จาก Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
const VAPID_KEY = 'ypPcIyXapLgcUq2rLAJ8dOIPJkj25wehg8CGEg9HYrs'

// ⚠️ ใส่ firebaseConfig จริงจาก Firebase Console > Project Settings
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyA0qa87ggw5zEml4VjHJl-mCJyYjJVOP28",
  authDomain:        "yugrill-money-a33ee.firebaseapp.com",
  databaseURL:       "https://yugrill-money-a33ee-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "yugrill-money-a33ee",
  storageBucket:     "yugrill-money-a33ee.firebasestorage.app",
  messagingSenderId: "488608486415",
  appId:             "1:488608486415:web:8b50d77a9e2f66326a7f7a",
}

let messagingInstance = null

async function getMessaging() {
  if (messagingInstance) return messagingInstance
  const { initializeApp, getApps } = await import('firebase/app')
  const { getMessaging: getFCM, getToken, onMessage } = await import('firebase/messaging')
  const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG)
  messagingInstance = { fcm: getFCM(app), getToken, onMessage }
  return messagingInstance
}

export function usePushNotification({ onNewRecord } = {}) {
  const permRef  = useRef(null)
  const tokenRef = useRef(null)

  // ขอ permission + ลงทะเบียน SW + รับ FCM token
  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined') return null
    if (!('Notification' in window)) {
      console.warn('Browser ไม่รองรับ Notification')
      return null
    }

    // ขอ permission
    const perm = await Notification.requestPermission()
    permRef.current = perm
    if (perm !== 'granted') return null

    try {
      // ลงทะเบียน Service Worker
      const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
      const { fcm, getToken } = await getMessaging()

      // รับ FCM token
      const token = await getToken(fcm, {
        vapidKey:            VAPID_KEY,
        serviceWorkerRegistration: reg,
      })
      tokenRef.current = token
      console.log('FCM token:', token)
      return token
    } catch (err) {
      console.error('FCM setup error:', err)
      return null
    }
  }, [])

  // รับ notification เมื่อแอปอยู่ foreground (เปิดอยู่)
  useEffect(() => {
    if (typeof window === 'undefined') return
    let unsub = null
    getMessaging().then(({ fcm, onMessage }) => {
      unsub = onMessage(fcm, payload => {
        const { title, body } = payload.notification || {}
        // แสดง native notification แม้แอปเปิดอยู่
        if (Notification.permission === 'granted') {
          new Notification(title || '🔥 YuGrill', {
            body:  body || 'มีรายการใหม่',
            icon:  '/icon-192.png',
            tag:   'yugrill-foreground',
          })
        }
        onNewRecord?.(payload)
      })
    }).catch(() => {})
    return () => unsub?.()
  }, [onNewRecord])

  return {
    requestPermission,
    getToken: () => tokenRef.current,
    permission: permRef.current,
  }
}
