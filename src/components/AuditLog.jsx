'use client'
import { useState } from 'react'

const MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']

function DiffRow({ label, before, after, money }) {
  if (before === undefined && after === undefined) return null
  const changed = JSON.stringify(before) !== JSON.stringify(after)
  const F = v => (typeof v === 'number') ? v.toFixed(2) : (v ?? '—')
  return (
    <div className={`diff-row ${changed ? 'diff-changed' : ''}`}>
      <span className="diff-label">{label}</span>
      <span className="diff-before">{F(before)}</span>
      <span className="diff-arrow">→</span>
      <span className="diff-after">{F(after)}</span>
    </div>
  )
}

function AuditCard({ log, onDelete }) {
  const [open, setOpen] = useState(false)
  const isEdit   = log.action === 'edit'
  const isDelete = log.action === 'delete'
  const rec = log.before || log.after || {}

  return (
    <div className={`audit-card ${isDelete ? 'audit-delete' : 'audit-edit'}`}>
      <div className="audit-card-hdr" onClick={() => setOpen(o => !o)}>
        <div className="audit-left">
          <span className={`audit-badge ${isDelete ? 'abadge-del' : 'abadge-edit'}`}>
            {isDelete ? '🗑️ ลบ' : '✏️ แก้ไข'}
          </span>
          <div>
            <div className="audit-meta-top">
              <span className="audit-date">{log.date}</span>
              <span className="audit-time">{log.time}</span>
              {rec.employee && <span className="audit-emp">· {rec.employee}</span>}
            </div>
            <div className="audit-meta-bot">
              {rec.round && <span className={`rec-badge ${rec.round==='รอบเปิด'?'badge-open':'badge-close'}`}>{rec.round==='รอบเปิด'?'☀️ รอบเปิด':'🌙 รอบปิด'}</span>}
              {rec.date  && <span className="audit-rec-date">{rec.date}</span>}
            </div>
          </div>
        </div>
        <div className="audit-right">
          {isDelete
            ? <span className="audit-total-del">{(rec.grandTotal||0).toFixed(2)}</span>
            : log.after && <span className="audit-total-edit">{(log.after.grandTotal||0).toFixed(2)}</span>
          }
          <button
            type="button"
            className="audit-del-btn"
            onClick={e => { e.stopPropagation(); onDelete(log.id) }}
            title="ลบประวัตินี้"
          >🗑️</button>
          <span className="audit-chevron">{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {open && (
        <div className="audit-detail">
          {isDelete && (
            <div className="audit-del-msg">
              ลบรายการวันที่ {rec.date} {rec.time} · {rec.employee}
            </div>
          )}
          {isEdit && log.before && log.after && (
            <div className="diff-list">
              <DiffRow label="เงินเก๊ะ"    before={log.before.cashRegister} after={log.after.cashRegister}/>
              <DiffRow label="เงินทอน"     before={log.before.cashChange}   after={log.after.cashChange}/>
              <DiffRow label="ใต้เก๊ะ"     before={log.before.cashReserve}  after={log.after.cashReserve}/>
              <DiffRow label="ฝากเงิน"     before={log.before.deposit}      after={log.after.deposit}/>
              <DiffRow label="ยอดขาย"      before={log.before.sales}        after={log.after.sales}/>
              <DiffRow label="พนักงาน"     before={log.before.employee}     after={log.after.employee}/>
              <DiffRow label="รอบ"         before={log.before.round}        after={log.after.round}/>
              <DiffRow label="ยอดสุทธิ"   before={log.before.grandTotal}   after={log.after.grandTotal}/>
            </div>
          )}
          {isEdit && log.before && log.after && (
            <div className="audit-items-diff">
              {/* เบิกเข้า */}
              {(log.before.incomeItems?.length > 0 || log.after.incomeItems?.length > 0) && (
                <div className="audit-items-section">
                  <div className="audit-items-title">เบิกเข้า</div>
                  <div className="audit-items-cols">
                    <div className="audit-items-col">
                      <div className="audit-col-hdr">ก่อน</div>
                      {(log.before.incomeItems||[]).map((it,i)=>(
                        <div key={i} className="audit-item-row">{it.name} <span>{(+it.amount||0).toFixed(2)}</span></div>
                      ))}
                      {!(log.before.incomeItems?.length) && <div className="audit-empty-items">ไม่มี</div>}
                    </div>
                    <div className="audit-items-col">
                      <div className="audit-col-hdr">หลัง</div>
                      {(log.after.incomeItems||[]).map((it,i)=>(
                        <div key={i} className="audit-item-row">{it.name} <span>{(+it.amount||0).toFixed(2)}</span></div>
                      ))}
                      {!(log.after.incomeItems?.length) && <div className="audit-empty-items">ไม่มี</div>}
                    </div>
                  </div>
                </div>
              )}
              {/* เบิกออก */}
              {(log.before.expenseItems?.length > 0 || log.after.expenseItems?.length > 0) && (
                <div className="audit-items-section">
                  <div className="audit-items-title">เบิกออก</div>
                  <div className="audit-items-cols">
                    <div className="audit-items-col">
                      <div className="audit-col-hdr">ก่อน</div>
                      {(log.before.expenseItems||[]).map((it,i)=>(
                        <div key={i} className="audit-item-row">{it.name} <span>{(+it.amount||0).toFixed(2)}</span></div>
                      ))}
                      {!(log.before.expenseItems?.length) && <div className="audit-empty-items">ไม่มี</div>}
                    </div>
                    <div className="audit-items-col">
                      <div className="audit-col-hdr">หลัง</div>
                      {(log.after.expenseItems||[]).map((it,i)=>(
                        <div key={i} className="audit-item-row">{it.name} <span>{(+it.amount||0).toFixed(2)}</span></div>
                      ))}
                      {!(log.after.expenseItems?.length) && <div className="audit-empty-items">ไม่มี</div>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function AuditLog({ logs, onClose, onDeleteAudit, requirePin }) {
  const [fm, setFM] = useState('all')
  const [confirm, setConfirm] = useState(null)
  const filtered = logs.filter(l => fm === 'all' || l.action === fm)

  const handleDelete = (id) => {
    requirePin(() => {
      setConfirm(id)
    })
  }

  const confirmDelete = async () => {
    if (!confirm) return
    await onDeleteAudit(confirm)
    setConfirm(null)
  }

  return (
    <div className="audit-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="audit-box">
        <div className="audit-hdr">
          <div>
            <div className="audit-hdr-title">🔍 ประวัติการแก้ไข</div>
            <div className="audit-hdr-sub">ดูได้เฉพาะเจ้าของ</div>
          </div>
          <button className="edit-x" onClick={onClose}>×</button>
        </div>

        <div className="audit-toolbar">
          {['all','edit','delete'].map(v => (
            <button
              key={v}
              className={`audit-filter-btn ${fm===v?'active':''}`}
              onClick={() => setFM(v)}
            >
              {v==='all'?'ทั้งหมด':v==='edit'?'✏️ แก้ไข':'🗑️ ลบ'}
              <span className="audit-count">
                {v==='all' ? logs.length : logs.filter(l=>l.action===v).length}
              </span>
            </button>
          ))}
        </div>

        <div className="audit-body">
          {filtered.length === 0
            ? <div className="empty"><div className="empty-ico">📋</div><p>ยังไม่มีประวัติการแก้ไข</p></div>
            : filtered.map(log => <AuditCard key={log.id} log={log} onDelete={handleDelete}/>)
          }
        </div>
      </div>

      {/* Confirm delete dialog */}
      {confirm && (
        <div className="overlay" style={{zIndex:900}} onClick={e=>e.target===e.currentTarget&&setConfirm(null)}>
          <div className="confirm-box">
            <div className="confirm-body">
              <div className="confirm-ico">🗑️</div>
              <div>
                <div className="confirm-title">ลบประวัตินี้?</div>
                <div className="confirm-msg">รายการนี้จะหายไปถาวร</div>
              </div>
            </div>
            <div className="confirm-btns">
              <button className="btn-cancel" onClick={()=>setConfirm(null)}>ยกเลิก</button>
              <button className="btn-confirm" onClick={confirmDelete}>ลบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
