// API Route: POST /api/notify
// เรียกเมื่อบันทึกรายการใหม่ → ส่ง FCM push ไปทุกอุปกรณ์ที่ subscribe ไว้

import { NextResponse } from 'next/server'

// ⚠️ ตั้งค่า Environment Variables ใน Vercel:
// FIREBASE_SERVER_KEY = Server Key จาก Firebase Console > Project Settings > Cloud Messaging > Server key (Legacy)
// หรือใช้ FCM HTTP v1 API กับ Service Account (แนะนำ)

export async function POST(req) {
  try {
    const body = await req.json()
    const { record, tokens } = body

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({ ok: true, sent: 0 })
    }

    const serverKey = process.env.FIREBASE_SERVER_KEY
    if (!serverKey) {
      return NextResponse.json({ error: 'FIREBASE_SERVER_KEY not set' }, { status: 500 })
    }

    const roundLabel = record.round === 'รอบเปิด' ? '☀️ รอบเปิด' : '🌙 รอบปิด'
    const totalFmt   = (record.grandTotal || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })

    // ส่งทีละ token (FCM Legacy API)
    const results = await Promise.allSettled(
      tokens.map(token =>
        fetch('https://fcm.googleapis.com/fcm/send', {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `key=${serverKey}`,
          },
          body: JSON.stringify({
            to: token,
            notification: {
              title: `🔥 YuGrill — ${roundLabel}`,
              body:  `${record.employee} · ยอดสุทธิ ${totalFmt} บ.`,
              icon:  '/icon-192.png',
            },
            data: {
              recordId: String(record.id),
              round:    record.round,
            },
          }),
        }).then(r => r.json())
      )
    )

    const sent = results.filter(r => r.status === 'fulfilled').length
    return NextResponse.json({ ok: true, sent })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
