'use client'
import { useState, useEffect } from 'react'

const DAYS   = ['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.']
const MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']

export default function Header({ cloudStatus, onCalc, onLock }) {
  const [now, setNow] = useState(null)
  const [dark, setDark] = useState(false)

  // โหลด theme จาก localStorage
  useEffect(() => {
    const saved = localStorage.getItem('yugrill-theme')
    // ถ้าไม่มีค่า ใช้ system preference
    const prefersDark = saved
      ? saved === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches
    setDark(prefersDark)
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
  }, [])

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    localStorage.setItem('yugrill-theme', next ? 'dark' : 'light')
  }

  const dateStr = now ? `${DAYS[now.getDay()]} ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()+543}` : ''
  const timeStr = now ? now.toTimeString().slice(0,8) : '--:--:--'

  return (
    <header className="header">
      <div className="logo">
        <div className="logo-flame">
          <img src="/logo.png" alt="YuGrill" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'inherit'}}/>
        </div>
        <div>
          <div className="logo-name">YuGrill</div>
          <div className="logo-sub">ระบบบันทึกเงิน</div>
        </div>
      </div>
      <div className="header-right">
        <div className="hdr-time">
          <div className="hdr-date">{dateStr}</div>
          <div className="hdr-clock">{timeStr}</div>
        </div>
        <div className={`cloud-pill ${cloudStatus}`}>
          <div className={`cloud-dot ${cloudStatus==='syncing'?'pulse':''}`}/>
          <span>{cloudStatus==='ok'?'Cloud':cloudStatus==='syncing'?'ซิงค์...':'Offline'}</span>
        </div>
        <button className="hdr-btn" onClick={toggleTheme} title={dark?'โหมดสว่าง':'โหมดมืด'}>
          {dark ? '☀️' : '🌙'}
        </button>
        <button className="hdr-btn" onClick={onCalc} title="เครื่องคิดเลข">🧮</button>
        <button className="hdr-btn" onClick={onLock} title="ตั้งค่ารหัส">
          🔒<div className="pin-dot-ind"/>
        </button>
      </div>
    </header>
  )
}
