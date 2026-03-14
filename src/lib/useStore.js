'use client'
import { useState, useEffect, useCallback } from 'react'
import { recordsRef, pinRef, db, SECRET_KEY, ref, set, remove, onValue } from './firebase'

// บันทึก audit log ลง Firebase
async function writeAudit(action, payload) {
  try {
    const id = Date.now()
    const now = new Date()
    await set(ref(db, `shops/${SECRET_KEY}/audit/${id}`), {
      id,
      action,          // 'edit' | 'delete'
      ts: id,
      date: now.toLocaleDateString('th-TH'),
      time: now.toTimeString().slice(0,5),
      ...payload,
    })
  } catch (err) {
    console.warn('Audit log error:', err)
  }
}

// ส่ง push notification ไปทุกอุปกรณ์
async function sendPushToAll(record) {
  try {
    const { onValue: ov, ref: r } = await import('firebase/database')
    const tokensRef = r(db, `shops/${SECRET_KEY}/tokens`)
    const snap = await new Promise(resolve => {
      const unsub = ov(tokensRef, s => { unsub(); resolve(s) })
    })
    const tokensData = snap.val()
    if (!tokensData) return
    const tokens = Object.values(tokensData).map(t => t.token).filter(Boolean)
    if (!tokens.length) return
    await fetch('/api/notify', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ record, tokens }),
    })
  } catch (err) {
    console.warn('Push notification error:', err)
  }
}

export function useStore() {
  const [records,     setRecords]  = useState([])
  const [auditLogs,   setAudit]    = useState([])
  const [cloudStatus, setCloud]    = useState('syncing')
  const [pinStored,   setPin]      = useState('1234')

  useEffect(() => {
    const u1 = onValue(recordsRef, snap => {
      const data = snap.val()
      setRecords(data ? Object.values(data).sort((a, b) => b.id - a.id) : [])
      setCloud('ok')
    }, () => setCloud('offline'))

    const u2 = onValue(pinRef, snap => setPin(snap.val() || '1234'))

    // subscribe audit logs
    const u3 = onValue(ref(db, `shops/${SECRET_KEY}/audit`), snap => {
      const data = snap.val()
      setAudit(data ? Object.values(data).sort((a, b) => b.ts - a.ts) : [])
    })

    return () => { u1(); u2(); u3() }
  }, [])

  const saveRecord = useCallback(async (record) => {
    setCloud('syncing')
    await set(ref(db, `shops/${SECRET_KEY}/records/${record.id}`), record)
    setCloud('ok')
    sendPushToAll(record)
  }, [])

  const deleteRecord = useCallback(async (id, snapshot) => {
    setCloud('syncing')
    // บันทึก audit ก่อนลบ
    await writeAudit('delete', {
      recordId: id,
      before: snapshot || null,
      after:  null,
    })
    await remove(ref(db, `shops/${SECRET_KEY}/records/${id}`))
    setCloud('ok')
  }, [])

  const updateRecord = useCallback(async (record, before) => {
    setCloud('syncing')
    // บันทึก audit ก่อนแก้ไข
    await writeAudit('edit', {
      recordId: record.id,
      before: before || null,
      after:  record,
    })
    await set(ref(db, `shops/${SECRET_KEY}/records/${record.id}`), record)
    setCloud('ok')
  }, [])

  const deleteAudit = useCallback(async (id) => {
    await remove(ref(db, `shops/${SECRET_KEY}/audit/${id}`))
  }, [])

  const savePin = useCallback(async (pin) => {
    await set(pinRef, pin)
  }, [])

  return { records, auditLogs, cloudStatus, pinStored, saveRecord, deleteRecord, updateRecord, savePin, deleteAudit }
}
