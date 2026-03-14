'use client'
import { useState, useEffect, useCallback } from 'react'

export default function PinModal({open,step,pinStored,onClose,onVerified,onSavePin}){
  const [buf,setBuf]=useState('')
  const [first,setFirst]=useState('')
  const [errMsg,setErr]=useState('')
  const [dotErr,setDE]=useState(false)
  const [curStep,setStep]=useState('verify')
  const [note,setNote]=useState('')

  // เมื่อ open เปลี่ยน ให้ reset state
  useEffect(()=>{
    if(open){
      setBuf('');setFirst('');setErr('');setDE(false)
      // step='setup' = ต้องยืนยัน PIN ก่อน แล้วค่อยตั้งใหม่
      // step='verify' = ยืนยันแล้วเรียก onVerified
      setStep('verify')
      setNote(step==='setup'?'ยืนยันรหัสปัจจุบันก่อนเปลี่ยน':'')
    }
  },[open,step])

  const pinError=(msg)=>{
    setErr(msg);setDE(true)
    setTimeout(()=>{setBuf('');setDE(false);setErr('')},700)
  }

  const submit=useCallback((entered)=>{
    if(curStep==='verify'){
      if(entered===pinStored){
        if(step==='verify'){
          // แค่ verify แล้วเรียก callback
          onClose();onVerified?.()
        } else {
          // setup mode — verify ผ่านแล้วให้ตั้งรหัสใหม่
          setBuf('');setFirst('');setStep('new1')
          setNote('กำหนดรหัส PIN ใหม่ 4 หลัก')
        }
      } else {
        pinError('รหัสไม่ถูกต้อง')
      }
    } else if(curStep==='new1'){
      setFirst(entered);setBuf('');setStep('new2');setNote('ยืนยันรหัสใหม่อีกครั้ง')
    } else if(curStep==='new2'){
      if(entered===first){
        onSavePin(entered);onClose()
      } else {
        pinError('รหัสไม่ตรงกัน')
        setTimeout(()=>{setFirst('');setBuf('');setStep('new1');setNote('กำหนดรหัส PIN ใหม่ 4 หลัก')},900)
      }
    }
  },[curStep,pinStored,step,first,onVerified,onSavePin,onClose])

  const pressKey=(k)=>{
    if(buf.length>=4)return
    const next=buf+k;setBuf(next)
    if(next.length===4)setTimeout(()=>submit(next),150)
  }

  const TITLES={
    verify:{
      icon: step==='setup'?'🔓':'🔐',
      title: step==='setup'?'ยืนยันรหัสเดิม':'ยืนยันตัวตน',
      sub: step==='setup'?'ใส่รหัสปัจจุบันก่อนเปลี่ยน':'ใส่รหัส 4 หลักของเจ้าของ'
    },
    new1:{icon:'🔑',title:'กำหนดรหัสใหม่',sub:'ใส่รหัส PIN ใหม่ 4 หลัก'},
    new2:{icon:'🔑',title:'ยืนยันรหัสใหม่',sub:'ใส่รหัสอีกครั้งเพื่อยืนยัน'},
  }
  const{icon,title,sub}=TITLES[curStep]||TITLES.verify

  if(!open)return null
  return(
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="pin-box">
        <div className="pin-hdr">
          <div className="pin-ico">{icon}</div>
          <h3>{title}</h3>
          <p>{sub}</p>
        </div>
        <div className="pin-dots">
          {[0,1,2,3].map(i=>(
            <div key={i} className={`pin-dot ${dotErr?'err':i<buf.length?'on':''}`}/>
          ))}
        </div>
        <div className="pin-errmsg">{errMsg}</div>
        {note&&<div className="pin-note">{note}</div>}
        <div className="pin-grid">
          {[1,2,3,4,5,6,7,8,9].map(n=>(
            <button key={n} className="pin-key" onClick={()=>pressKey(String(n))}>{n}</button>
          ))}
          <button className="pin-key kcancel" onClick={onClose}>ยกเลิก</button>
          <button className="pin-key" onClick={()=>pressKey('0')}>0</button>
          <button className="pin-key kdel" onClick={()=>setBuf(b=>b.slice(0,-1))}>⌫</button>
        </div>
      </div>
    </div>
  )
}
