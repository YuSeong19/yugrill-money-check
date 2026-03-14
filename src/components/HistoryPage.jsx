'use client'
import { useState } from 'react'
import * as XLSX from 'xlsx'
import SummaryChart from './SummaryChart'

export default function HistoryPage({records,active,onEdit,onDelete,onAudit,auditCount}){
  const [fm,setFM]=useState('all')
  const [fy,setFY]=useState(String(new Date().getFullYear()+543))

  const filtered=records
    .filter(r=>fm==='all'||r.month===+fm)
    .filter(r=>!fy||r.year===+fy)

  const sum=(fn)=>filtered.reduce((s,r)=>s+fn(r),0)
  const sumCR  = sum(r=>r.cashRegister||0)
  const sumCC  = sum(r=>r.cashChange||0)
  const sumInc = sum(r=>(r.incomeItems||[]).reduce((a,i)=>a+(+i.amount||0),0))
  const sumExp = sum(r=>(r.expenseItems||[]).reduce((a,i)=>a+(+i.amount||0),0))
  const sumDep = sum(r=>r.deposit||0)
  const sumSal = sum(r=>r.sales||0)
  const sumNC  = sum(r=>r.netCash||0)
  const sumNR  = sum(r=>r.netReserve||0)
  const sumGr  = sum(r=>r.grandTotal||0)

  const exportXlsx=()=>{
    const rows=[['วัน/เวลา','รอบ','พนักงาน','เงินเก๊ะ','หักทอน','เบิกเข้า','เบิกออก','ฝาก','ยอดขาย','รวมเก๊ะสุทธิ','รวมใต้เก๊ะ','ยอดสุทธิ']]
    filtered.forEach(r=>{
      const inc=(r.incomeItems||[]).reduce((s,i)=>s+(+i.amount||0),0)
      const exp=(r.expenseItems||[]).reduce((s,i)=>s+(+i.amount||0),0)
      rows.push([
        r.date+' '+r.time, r.round, r.employee,
        r.cashRegister||0, -(r.cashChange||0),
        inc, -exp, -(r.deposit||0), r.sales||0,
        r.netCash||0, r.netReserve||0, r.grandTotal||0
      ])
    })
    if(filtered.length){
      rows.push(['รวม ('+filtered.length+' รายการ)','','',
        sumCR,-sumCC,sumInc,-sumExp,-sumDep,sumSal,sumNC,sumNR,sumGr])
    }
    const wb=XLSX.utils.book_new(),ws=XLSX.utils.aoa_to_sheet(rows)
    ws['!cols']=[{wch:18},{wch:10},{wch:14},{wch:10},{wch:10},{wch:10},{wch:10},{wch:10},{wch:10},{wch:12},{wch:12},{wch:12}]
    XLSX.utils.book_append_sheet(wb,ws,'ประวัติ')
    const now=new Date()
    XLSX.writeFile(wb,`YuGrill_${now.getFullYear()+543}_${String(now.getMonth()+1).padStart(2,'0')}.xlsx`)
  }

  const F=n=>(n||0).toFixed(2)

  return(
    <div className={`page hist-page ${active?'active':''}`}>
      <div className="hist-toolbar">
        <div className="hist-title">📋 ประวัติการบันทึก</div>
        <div className="hist-filters">
          <select className="filter-sel" value={fm} onChange={e=>setFM(e.target.value)}>
            <option value="all">ทุกเดือน</option>
            {['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'].map((m,i)=>(
              <option key={i+1} value={i+1}>{m}</option>
            ))}
          </select>
          <select className="filter-sel" value={fy} onChange={e=>setFY(e.target.value)}>
            <option value="2569">2569</option>
            <option value="2568">2568</option>
          </select>
          <button className="xlsx-btn" onClick={exportXlsx}>📊 Excel</button>
          <button className="audit-btn" onClick={onAudit}>
            🔍 ประวัติแก้ไข
            {auditCount > 0 && <span className="audit-count-badge">{auditCount}</span>}
          </button>
        </div>
      </div>

      <div style={{padding:'12px 18px',borderBottom:'1px solid var(--border)',background:'var(--s2)',flexShrink:0}}>
        <SummaryChart records={records} filterYear={fy} filterMonth={fm}/>
      </div>

      <div className="table-wrap">
        <div style={{overflowX:'auto',WebkitOverflowScrolling:'touch',width:'100%'}}>
        <table className="hist-tbl">
          <thead>
            <tr>
              <th>วัน/เวลา</th>
              <th>รอบ</th>
              <th>พนักงาน</th>
              <th className="th-amber">เงินเก๊ะ</th>
              <th className="th-amber">เงินทอน</th>
              <th className="th-amber">รวมเก๊ะสุทธิ</th>
              <th className="th-amber">เงินใต้เก๊ะ</th>
              <th className="th-green">เบิกเข้า</th>
              <th className="th-red">เบิกออก</th>
              <th className="th-blue">ฝากเงิน</th>
              <th className="th-teal">ยอดขาย</th>
              <th className="th-gold">💎 รวมยอดสุทธิ</th>
              <th style={{width:86}}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length===0
              ? <tr><td colSpan={13}><div className="empty" style={{height:160}}><div className="empty-ico">📁</div><p>ยังไม่มีข้อมูล</p></div></td></tr>
              : filtered.map(r=>{
                  const inc=(r.incomeItems||[]).reduce((s,i)=>s+(+i.amount||0),0)
                  const exp=(r.expenseItems||[]).reduce((s,i)=>s+(+i.amount||0),0)
                  return(
                    <tr key={r.id} className={r.round==='รอบเปิด'?'row-open':'row-close'}>
                      <td>
                        <strong style={{display:'block',color:'var(--t1)',fontSize:12}}>{r.date}</strong>
                        <span style={{fontSize:11,color:'var(--t2)'}}>{r.time}</span>
                      </td>
                      <td style={{textAlign:'center'}}>
                        <span className={`rec-badge ${r.round==='รอบเปิด'?'badge-open':'badge-close'}`}>{r.round==='รอบเปิด'?'☀️ รอบเปิด':'🌙 รอบปิด'}</span>
                      </td>
                      <td style={{fontSize:12}}>{r.employee}</td>
                      <td className="num">{F(r.cashRegister)}</td>
                      <td className="num" style={{color:'var(--amber)'}}>−{F(r.cashChange)}</td>
                      <td className="num" style={{color:'var(--amber)',fontWeight:600}}>{F(r.netCash||0)}</td>
                      <td className="num">{F(r.cashReserve||0)}</td>
                      <td className="num" style={{color:'var(--green)'}}>+{F(inc)}</td>
                      <td className="num" style={{color:'var(--red)'}}>−{F(exp)}</td>
                      <td className="num" style={{color:'var(--blue)'}}>−{F(r.deposit||0)}</td>
                      <td className="num" style={{color:'var(--teal)'}}>{F(r.sales||0)}</td>
                      <td className="num gold">{F(r.grandTotal)}</td>
                      <td style={{textAlign:'center',whiteSpace:'nowrap'}}>
                        <button className="edit-btn" onClick={()=>onEdit(r)}>✏️</button>
                        <button className="del-row-btn" onClick={()=>onDelete(r.id)}>🗑️</button>
                      </td>
                    </tr>
                  )
                })
            }
          </tbody>
          {filtered.length>0&&(
            <tfoot>
              <tr>
                <td colSpan={3} style={{color:'var(--amber)',fontSize:12}}>📌 รวม {filtered.length} รายการ</td>
                <td className="num">{F(sumCR)}</td>
                <td className="num" style={{color:'var(--amber)'}}>−{F(sumCC)}</td>
                <td className="num" style={{color:'var(--amber)',fontWeight:600}}>{F(sumNC)}</td>
                <td className="num">{F(sum(r=>r.cashReserve||0))}</td>
                <td className="num" style={{color:'var(--green)'}}>+{F(sumInc)}</td>
                <td className="num" style={{color:'var(--red)'}}>−{F(sumExp)}</td>
                <td className="num" style={{color:'var(--blue)'}}>−{F(sumDep)}</td>
                <td className="num" style={{color:'var(--teal)'}}>{F(sumSal)}</td>
                <td className="num gold">{F(sumGr)}</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
        </div>
      </div>
    </div>
  )
}
