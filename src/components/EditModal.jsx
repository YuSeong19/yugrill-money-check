'use client'
import { useState, useEffect } from 'react'

function calc(cr,cc,res,dep,sal,inc,exp){
  const ti=inc.reduce((s,i)=>s+(+i.amount||0),0)
  const te=exp.reduce((s,i)=>s+(+i.amount||0),0)
  const nc=cr-cc+ti-te,nr=res-dep
  return{nc,nr,grand:nc+nr+sal}
}
function ItemRows({items,onChange,onRemove}){
  return(
    <div className="items-list">
      {items.map(item=>(
        <div key={item.id} className="item-row">
          <input className="item-inp" type="text" placeholder="รายการ..." value={item.name} onChange={e=>onChange(item.id,'name',e.target.value)}/>
          <input className="item-inp item-amt" type="number" placeholder="0.00" value={item.amount||''} onChange={e=>onChange(item.id,'amount',+e.target.value)}/>
          <button type="button" className="item-del" onClick={e=>{e.preventDefault();e.stopPropagation();onRemove(item.id)}}>×</button>
        </div>
      ))}
    </div>
  )
}
export default function EditModal({record,open,onClose,onSave}){
  const [round,setRound]=useState('open')
  const [cr,setCr]=useState('');const [cc,setCc]=useState('')
  const [res,setRes]=useState('');const [dep,setDep]=useState('')
  const [sal,setSal]=useState('');const [emp,setEmp]=useState('')
  const [inc,setInc]=useState([]);const [exp,setExp]=useState([])
  useEffect(()=>{
    if(record&&open){
      setRound(record.round==='รอบเปิด'?'open':'close')
      setCr(record.cashRegister||'');setCc(record.cashChange||'')
      setRes(record.cashReserve||'');setDep(record.deposit||'')
      setSal(record.sales||'');setEmp(record.employee||'')
      setInc(JSON.parse(JSON.stringify(record.incomeItems||[])))
      setExp(JSON.parse(JSON.stringify(record.expenseItems||[])))
    }
  },[record,open])
  const tots=calc(+cr||0,+cc||0,+res||0,+dep||0,+sal||0,inc,exp)
  const addItem=(t)=>(t==='inc'?setInc:setExp)(p=>[...p,{id:Date.now(),name:'',amount:0}])
  const removeItem=(t,id)=>(t==='inc'?setInc:setExp)(p=>p.filter(i=>i.id!==id))
  const changeItem=(t,id,f,v)=>(t==='inc'?setInc:setExp)(p=>p.map(i=>i.id===id?{...i,[f]:v}:i))
  const handleSave=()=>{
    if(!emp.trim())return
    onSave({...record,round:round==='open'?'รอบเปิด':'รอบปิด',employee:emp.trim(),
      cashRegister:+cr||0,cashChange:+cc||0,cashReserve:+res||0,
      deposit:+dep||0,sales:+sal||0,
      incomeItems:JSON.parse(JSON.stringify(inc)),expenseItems:JSON.parse(JSON.stringify(exp)),
      netCash:tots.nc,netReserve:tots.nr,grandTotal:tots.grand})
  }
  if(!open)return null
  const F=n=>n.toFixed(2)
  return(
    <div className="overlay edit-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="edit-box">
        <div className="edit-hdr">
          <h3>✏️ แก้ไขรายการ</h3>
          <button className="edit-x" onClick={onClose}>×</button>
        </div>
        <div className="edit-body">
          <div className="round-tabs">
            <button className={`round-btn ${round==='open'?'sel-open':''}`} onClick={()=>setRound('open')}>☀️ รอบเปิด</button>
            <button className={`round-btn ${round==='close'?'sel-close':''}`} onClick={()=>setRound('close')}>🌙 รอบปิด</button>
          </div>
          <div><div className="sec-label sec-amber"><div className="sec-dot"/>เงินในเก๊ะ</div>
            <div className="card c-amber">
              <div className="field-row"><div className="field-lbl">เงินเก๊ะ</div><input className="field-inp" type="number" placeholder="0.00" value={cr} onChange={e=>setCr(e.target.value)}/></div>
              <div className="field-row"><div className="field-lbl">หักทอน</div><input className="field-inp" type="number" placeholder="0.00" value={cc} onChange={e=>setCc(e.target.value)}/></div>
            </div></div>
          <div><div className="sec-label sec-amber"><div className="sec-dot"/>เงินใต้เก๊ะ</div>
            <div className="card c-amber"><div className="field-row"><div className="field-lbl">ใต้เก๊ะ</div><input className="field-inp" type="number" placeholder="0.00" value={res} onChange={e=>setRes(e.target.value)}/></div></div></div>
          <div><div className="add-row"><div className="sec-label sec-green"><div className="sec-dot"/>เบิกเข้า</div><button className="add-btn" onClick={()=>addItem('inc')}>+ เพิ่ม</button></div>
            <ItemRows items={inc} onChange={(id,f,v)=>changeItem('inc',id,f,v)} onRemove={id=>removeItem('inc',id)}/></div>
          <div><div className="add-row"><div className="sec-label sec-red"><div className="sec-dot"/>เบิกออก</div><button className="add-btn danger" onClick={()=>addItem('exp')}>+ เพิ่ม</button></div>
            <ItemRows items={exp} onChange={(id,f,v)=>changeItem('exp',id,f,v)} onRemove={id=>removeItem('exp',id)}/></div>
          <div><div className="sec-label sec-blue"><div className="sec-dot"/>ฝากเงิน</div>
            <div className="card c-blue"><div className="field-row"><div className="field-lbl">ฝากเงิน</div><input className="field-inp" type="number" placeholder="0.00" value={dep} onChange={e=>setDep(e.target.value)}/></div></div></div>
          <div><div className="sec-label sec-teal"><div className="sec-dot"/>ยอดขาย</div>
            <div className="card c-teal"><div className="field-row"><div className="field-lbl">ยอดขาย</div><input className="field-inp" type="number" placeholder="0.00" value={sal} onChange={e=>setSal(e.target.value)}/></div></div></div>
          <div className="summary-card">
            <div className="sum-row amber"><span className="sum-lbl">รวมเงินเก๊ะสุทธิ</span><span className="sum-val">{F(tots.nc)} บ.</span></div>
            <div className="sum-row teal"><span className="sum-lbl">รวมเงินใต้เก๊ะ</span><span className="sum-val">{F(tots.nr)} บ.</span></div>
            <div className="grand-row"><span className="grand-lbl">💰 รวมยอดสุทธิ</span><span className="grand-val">{F(tots.grand)}</span></div>
          </div>
          <div className="emp-wrap">
            <span>👤</span>
            <input type="text" placeholder="ชื่อพนักงาน..." value={emp} onChange={e=>setEmp(e.target.value)}/>
          </div>
        </div>
        <div className="edit-foot">
          <button className="edit-save" onClick={handleSave}>💾 บันทึกการแก้ไข</button>
        </div>
      </div>
    </div>
  )
}
