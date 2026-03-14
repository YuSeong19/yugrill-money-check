'use client'
import { useState, useEffect } from 'react'
import { usePushNotification } from '@/lib/usePushNotification'
import { db, SECRET_KEY } from '@/lib/firebase'
import { ref, set, onValue } from 'firebase/database'

export default function NotificationButton({ showToast }) {
  const [status, setStatus] = useState('idle') // idle | requesting | granted | denied | unsupported
  const [tokenSaved, setTokenSaved] = useState(false)
  const { requestPermission } = usePushNotification()

  // ตรวจสอบ permission ปัจจุบัน
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) { setStatus('unsupported'); return }
    const perm = Notification.permission
    if (perm === 'granted') setStatus('granted')
    else if (perm === 'denied') setStatus('denied')
  }, [])

  const handleEnable = async () => {
    if (status === 'unsupported') return
    setStatus('requesting')
    try {
      const token = await requestPermission()
      if (!token) { setStatus('denied'); return }

      // บันทึก FCM token ลง Firebase ใน path /shops/.../tokens/<deviceId>
      const deviceId = `device_${Date.now()}_${Math.random().toString(36).slice(2,8)}`
      const tokenRef = ref(db, `shops/${SECRET_KEY}/tokens/${deviceId}`)
      await set(tokenRef, { token, createdAt: Date.now(), ua: navigator.userAgent.slice(0,80) })

      // เก็บ deviceId ใน localStorage เพื่อใช้อ้างอิง
      localStorage.setItem('yugrill_device_id', deviceId)
      setStatus('granted')
      setTokenSaved(true)
      showToast?.('🔔 เปิดการแจ้งเตือนสำเร็จ!')
    } catch (err) {
      console.error(err)
      setStatus('idle')
      showToast?.('❌ ไม่สามารถเปิดการแจ้งเตือนได้', false)
    }
  }

  const handleDisable = async () => {
    const deviceId = localStorage.getItem('yugrill_device_id')
    if (deviceId) {
      const { remove } = await import('firebase/database')
      const tokenRef = ref(db, `shops/${SECRET_KEY}/tokens/${deviceId}`)
      await remove(tokenRef)
      localStorage.removeItem('yugrill_device_id')
    }
    setStatus('idle')
    setTokenSaved(false)
    showToast?.('🔕 ปิดการแจ้งเตือนแล้ว')
  }

  if (status === 'unsupported') return null

  return (
    <div className="notif-wrap">
      {status === 'granted' ? (
        <button className="notif-btn notif-on" onClick={handleDisable}>
          <span>🔔</span>
          <span>แจ้งเตือนเปิดอยู่</span>
        </button>
      ) : status === 'denied' ? (
        <div className="notif-denied">
          🔕 การแจ้งเตือนถูกบล็อก — เปิดใน Settings ของเบราว์เซอร์
        </div>
      ) : (
        <button
          className="notif-btn notif-off"
          onClick={handleEnable}
          disabled={status === 'requesting'}
        >
          <span>{status === 'requesting' ? '⏳' : '🔕'}</span>
          <span>{status === 'requesting' ? 'กำลังเปิด...' : 'เปิดการแจ้งเตือน'}</span>
        </button>
      )}
    </div>
  )
}
