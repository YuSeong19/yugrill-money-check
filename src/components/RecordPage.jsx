'use client'
import { useState } from 'react'
import NotificationButton from './NotificationButton'

function calc(cr,cc,res,dep,sal,inc,exp){
  const ti=inc.reduce((s,i)=>s+(+i.amount||0),0)
  const te=exp.reduce((s,i)=>s+(+i.amount||0),0)
  const nc=cr-cc+ti-te,nr=res-dep
  return{nc,nr,grand:nc+nr+sal}
}
function ItemsList({items,onChange,onRemove}){
  return(
    <div className="items-list">
      {items.map(item=>(
        <div key={item.id} className="item-row">
          <input
            className="item-inp"
            type="text"
            placeholder="ชื่อรายการ..."
            value={item.name}
            onChange={e=>onChange(item.id,'name',e.target.value)}
          />
          <input
            className="item-inp item-amt"
            type="number"
            placeholder="0.00"
            value={item.amount||''}
            onChange={e=>onChange(item.id,'amount',+e.target.value)}
          />
          <button
            type="button"
            className="item-del"
            onClick={e=>{e.preventDefault();e.stopPropagation();onRemove(item.id)}}
          >×</button>
        </div>
      ))}
    </div>
  )
}
export default function RecordPage({records,onSave,onCalc,showToast}){
  const [round,setRound]=useState('open')
  const [cr,setCr]=useState('')
  const [cc,setCc]=useState('')
  const [res,setRes]=useState('')
  const [dep,setDep]=useState('')
  const [sal,setSal]=useState('')
  const [emp,setEmp]=useState('')
  const [inc,setInc]=useState([])
  const [exp,setExp]=useState([])
  const [empErr,setEmpErr]=useState(false)
  const tots=calc(+cr||0,+cc||0,+res||0,+dep||0,+sal||0,inc,exp)
  const addItem=(t)=>(t==='inc'?setInc:setExp)(p=>[...p,{id:Date.now(),name:'',amount:0}])
  const removeItem=(t,id)=>(t==='inc'?setInc:setExp)(p=>p.filter(i=>i.id!==id))
  const changeItem=(t,id,f,v)=>(t==='inc'?setInc:setExp)(p=>p.map(i=>i.id===id?{...i,[f]:v}:i))
  const handleSave=()=>{
    if(!emp.trim()){setEmpErr(true);setTimeout(()=>setEmpErr(false),2500);return}
    const now=new Date()
    onSave({
      id:Date.now(),date:now.toLocaleDateString('th-TH'),time:now.toTimeString().slice(0,5),
      round:round==='open'?'รอบเปิด':'รอบปิด',employee:emp.trim(),
      cashRegister:+cr||0,cashChange:+cc||0,cashReserve:+res||0,
      deposit:+dep||0,sales:+sal||0,
      incomeItems:JSON.parse(JSON.stringify(inc)),expenseItems:JSON.parse(JSON.stringify(exp)),
      netCash:tots.nc,netReserve:tots.nr,grandTotal:tots.grand,
      month:now.getMonth()+1,year:now.getFullYear()+543,
    })
  }
  const now=new Date(),todayStr=now.toLocaleDateString('th-TH')
  const cm=now.getMonth()+1,cy=now.getFullYear()+543
  const todayCount=records.filter(r=>r.date===todayStr).length
  const monthTotal=records.filter(r=>r.month===cm&&r.year===cy).reduce((s,r)=>s+r.grandTotal,0)
  const F=n=>n.toFixed(2)
  return(
    <div className="page active">
      <div className="left-panel">
        <div className="round-tabs">
          <button className={`round-btn ${round==='open'?'sel-open':''}`} onClick={()=>setRound('open')}>☀️ รอบเปิด</button>
          <button className={`round-btn ${round==='close'?'sel-close':''}`} onClick={()=>setRound('close')}>🌙 รอบปิด</button>
        </div>
        <button className="calc-shortcut" onClick={onCalc}>🧮 เครื่องคิดเลข</button>

        <div>
          <div className="sec-label sec-amber"><div className="sec-dot"/>เงินในเก๊ะ &amp; เงินทอน</div>
          <div className="card c-amber">
            <div className="field-row"><div className="field-lbl">เงินเก๊ะ</div><input className="field-inp" type="number" placeholder="0.00" value={cr} onChange={e=>setCr(e.target.value)}/><button className="field-clr" onClick={()=>setCr('')}>✕</button></div>
            <div className="field-row"><div className="field-lbl">หักทอน (−)</div><input className="field-inp" type="number" placeholder="0.00" value={cc} onChange={e=>setCc(e.target.value)}/><button className="field-clr" onClick={()=>setCc('')}>✕</button></div>
          </div>
        </div>

        <div>
          <div className="sec-label sec-amber"><div className="sec-dot"/>เงินใต้เก๊ะ (สำรอง)</div>
          <div className="card c-amber">
            <div className="field-row"><div className="field-lbl">ใต้เก๊ะ</div><input className="field-inp" type="number" placeholder="0.00" value={res} onChange={e=>setRes(e.target.value)}/><button className="field-clr" onClick={()=>setRes('')}>✕</button></div>
          </div>
        </div>

        <div>
          <div className="add-row">
            <div className="sec-label sec-green"><div className="sec-dot"/>เบิกเข้า</div>
            <button className="add-btn" onClick={()=>addItem('inc')}>+ เพิ่ม</button>
          </div>
          <ItemsList items={inc} onChange={(id,f,v)=>changeItem('inc',id,f,v)} onRemove={id=>removeItem('inc',id)}/>
        </div>

        <div>
          <div className="add-row">
            <div className="sec-label sec-red"><div className="sec-dot"/>เบิกออก</div>
            <button className="add-btn danger" onClick={()=>addItem('exp')}>+ เพิ่ม</button>
          </div>
          <ItemsList items={exp} onChange={(id,f,v)=>changeItem('exp',id,f,v)} onRemove={id=>removeItem('exp',id)}/>
        </div>

        <div>
          <div className="sec-label sec-blue"><div className="sec-dot"/>ฝากเงิน</div>
          <div className="card c-blue">
            <div className="field-row"><div className="field-lbl">ฝากเงิน (−)</div><input className="field-inp" type="number" placeholder="0.00" value={dep} onChange={e=>setDep(e.target.value)}/><button className="field-clr" onClick={()=>setDep('')}>✕</button></div>
          </div>
        </div>

        <div>
          <div className="sec-label sec-teal"><div className="sec-dot"/>ยอดขายวันนี้</div>
          <div className="card c-teal">
            <div className="field-row"><div className="field-lbl">ยอดขาย</div><input className="field-inp" type="number" placeholder="0.00" value={sal} onChange={e=>setSal(e.target.value)}/><button className="field-clr" onClick={()=>setSal('')}>✕</button></div>
          </div>
        </div>

        <div className="summary-card">
          <div className="sum-row amber"><span className="sum-lbl">รวมเงินเก๊ะสุทธิ</span><span className="sum-val">{F(tots.nc)} บ.</span></div>
          <div className="sum-row teal"><span className="sum-lbl">รวมเงินใต้เก๊ะ</span><span className="sum-val">{F(tots.nr)} บ.</span></div>
          <div className="grand-row">
            <span className="grand-lbl">💰 รวมยอดสุทธิ</span>
            <span className="grand-val">{F(tots.grand)}</span>
          </div>
        </div>

        <div className={`emp-wrap ${empErr?'err':''}`}>
          <span>👤</span>
          <input type="text" placeholder={empErr?'⚠️ กรุณาใส่ชื่อก่อน!':'ชื่อพนักงาน...'} value={emp} onChange={e=>setEmp(e.target.value)}/>
        </div>

        <NotificationButton showToast={showToast}/>

        <button className={`save-btn ${round==='close'?'save-btn-close':''}`} onClick={handleSave}>
          {round==='open'?'☀️':'🌙'} บันทึก{round==='open'?'รอบเปิด':'รอบปิด'}
        </button>
      </div>

      <div className="right-panel">
        <div className="stat-grid">
          <div className="stat-card blue"><div className="stat-ico">📅</div><div className="stat-val">{todayCount}</div><div className="stat-lbl">บันทึกวันนี้</div></div>
          <div className="stat-card teal"><div className="stat-ico">📈</div><div className="stat-val">{monthTotal.toLocaleString('th-TH',{maximumFractionDigits:0})}</div><div className="stat-lbl">ยอดเดือนนี้ (บ.)</div></div>
          <div className="stat-card purple"><div className="stat-ico">🗂️</div><div className="stat-val">{records.length}</div><div className="stat-lbl">รายการทั้งหมด</div></div>
        </div>

        <div className="recent-panel">
          <div className="panel-hdr">
            <div className="panel-title">📋 รายการล่าสุด</div>
          </div>
          <div className="panel-body">
            {records.length===0
              ?<div className="empty"><div className="empty-ico">📁</div><p>ยังไม่มีข้อมูล</p></div>
              :records.slice(0,8).map(r=>(
                <div key={r.id} className="rec-card">
                  <div className="rec-left">
                    <span className={`rec-badge ${r.round==='รอบเปิด'?'badge-open':'badge-close'}`}>{r.round==='รอบเปิด'?'☀️ รอบเปิด':'🌙 รอบปิด'}</span>
                    <div>
                      <div><span className="rec-date">{r.date}</span><span className="rec-time">{r.time}</span></div>
                      <div className="rec-emp">👤 {r.employee}</div>
                    </div>
                  </div>
                  <div className="rec-right">
                    <div className="rec-total">{(r.grandTotal||0).toFixed(2)}</div>
                    <div className="rec-sales">ขาย {(r.sales||0).toFixed(2)} บ.</div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}
