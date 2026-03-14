'use client'
import { useState, useRef, useCallback } from 'react'
import { useStore } from '@/lib/useStore'
import Header      from './Header'
import RecordPage  from './RecordPage'
import HistoryPage from './HistoryPage'
import PinModal    from './PinModal'
import EditModal   from './EditModal'
import Calculator  from './Calculator'
import AuditLog    from './AuditLog'

function Toast({msg,ok}){
  if(!msg)return null
  return <div className={`toast show ${ok?'ok':'err'}`}>{msg}</div>
}
function Confirm({state,onClose}){
  if(!state)return null
  return(
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="confirm-box">
        <div className="confirm-body">
          <div className="confirm-ico">🗑️</div>
          <div><div className="confirm-title">ยืนยันการลบ</div><div className="confirm-msg">{state.msg}</div></div>
        </div>
        <div className="confirm-btns">
          <button className="btn-cancel" onClick={onClose}>ยกเลิก</button>
          <button className="btn-confirm" onClick={()=>{onClose();state.onOk()}}>ลบรายการ</button>
        </div>
      </div>
    </div>
  )
}

export default function App(){
  const{records,auditLogs,cloudStatus,pinStored,saveRecord,deleteRecord,updateRecord,savePin,deleteAudit}=useStore()
  const [tab,setTab]=useState('record')
  const [calcOpen,setCalc]=useState(false)
  const [editRec,setEditRec]=useState(null)
  const [editBefore,setEditBefore]=useState(null) // snapshot ก่อนแก้ไข
  const [confirm,setConfirm]=useState(null)
  const [toast,setToast]=useState(null)
  const [pin,setPin]=useState({open:false,step:'verify',afterVerify:null})
  const [auditOpen,setAuditOpen]=useState(false)
  const timer=useRef(null)

  const showToast=useCallback((msg,ok=true)=>{
    setToast({msg,ok});clearTimeout(timer.current)
    timer.current=setTimeout(()=>setToast(null),3000)
  },[])

  const requirePin=useCallback((cb)=>{
    setPin({open:true,step:'verify',afterVerify:cb})
  },[])

  const handleSave=useCallback(async(record)=>{
    await saveRecord(record);showToast('✅ บันทึกสำเร็จ!')
  },[saveRecord,showToast])

  const handleEditClick=useCallback((record)=>{
    requirePin(()=>{
      setEditBefore(JSON.parse(JSON.stringify(record))) // เก็บ snapshot ก่อนแก้
      setEditRec(record)
    })
  },[requirePin])

  const handleEditSave=useCallback(async(record)=>{
    await updateRecord(record, editBefore) // ส่ง before snapshot
    setEditRec(null)
    setEditBefore(null)
    showToast('✅ แก้ไขสำเร็จ!')
  },[updateRecord,editBefore,showToast])

  const handleDeleteClick=useCallback((id)=>{
    // หา snapshot ของ record ที่จะลบ
    const snapshot=records.find(r=>r.id===id)||null
    requirePin(()=>{
      setConfirm({msg:'ลบรายการนี้ออกจากระบบ?',onOk:async()=>{
        await deleteRecord(id, snapshot) // ส่ง snapshot ไปด้วย
        showToast('🗑️ ลบสำเร็จ!')
      }})
    })
  },[requirePin,deleteRecord,records,showToast])

  // เปิด AuditLog ต้อง verify PIN ก่อน
  const handleAuditOpen=useCallback(()=>{
    requirePin(()=>setAuditOpen(true))
  },[requirePin])

  const handlePinVerified=useCallback(()=>{
    const cb=pin.afterVerify
    setPin(p=>({...p,open:false}))
    cb?.()
  },[pin.afterVerify])

  const handlePinSave=useCallback(async(newPin)=>{
    await savePin(newPin);showToast('✅ เปลี่ยนรหัสสำเร็จ!')
  },[savePin,showToast])

  return(
    <div className="app">
      <Header cloudStatus={cloudStatus} onCalc={()=>setCalc(true)} onLock={()=>setPin({open:true,step:'setup',afterVerify:null})}/>
      <nav className="page-nav">
        <button className={`nav-btn ${tab==='record'?'active':''}`} onClick={()=>setTab('record')}>📝 บันทึกเงิน</button>
        <button className={`nav-btn ${tab==='history'?'active':''}`} onClick={()=>setTab('history')}>📋 ประวัติ</button>
      </nav>
      <div className="pages">
        {tab==='record'&&<RecordPage records={records} onSave={handleSave} onCalc={()=>setCalc(true)} showToast={showToast}/>}
        {tab==='history'&&<HistoryPage records={records} active={tab==='history'} onEdit={handleEditClick} onDelete={handleDeleteClick} onAudit={handleAuditOpen} auditCount={auditLogs.length}/>}
      </div>
      <Calculator open={calcOpen} onClose={()=>setCalc(false)}/>
      <PinModal open={pin.open} step={pin.step} pinStored={pinStored} onClose={()=>setPin(p=>({...p,open:false}))} onVerified={handlePinVerified} onSavePin={handlePinSave}/>
      <EditModal record={editRec} open={!!editRec} onClose={()=>{setEditRec(null);setEditBefore(null)}} onSave={handleEditSave}/>
      <Confirm state={confirm} onClose={()=>setConfirm(null)}/>
      {auditOpen&&<AuditLog logs={auditLogs} onClose={()=>setAuditOpen(false)} onDeleteAudit={deleteAudit} requirePin={requirePin}/>}
      <Toast msg={toast?.msg} ok={toast?.ok}/>
    </div>
  )
}
