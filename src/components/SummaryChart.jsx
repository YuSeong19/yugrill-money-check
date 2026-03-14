'use client'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { useState } from 'react'

const MONTHS_SHORT = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']

function buildData(records, year) {
  // group by month
  const byMonth = {}
  records
    .filter(r => r.year === +year)
    .forEach(r => {
      const m = r.month
      if (!byMonth[m]) byMonth[m] = { open: 0, close: 0 }
      if (r.round === 'รอบเปิด') byMonth[m].open  += r.grandTotal || 0
      else                       byMonth[m].close += r.grandTotal || 0
    })
  return Array.from({length:12}, (_, i) => ({
    name: MONTHS_SHORT[i],
    รอบเปิด: Math.round(byMonth[i+1]?.open  || 0),
    รอบปิด:  Math.round(byMonth[i+1]?.close || 0),
  }))
}

function buildDailyData(records, year, month) {
  const byDay = {}
  records
    .filter(r => r.year === +year && (month === 'all' || r.month === +month))
    .forEach(r => {
      const key = r.date
      if (!byDay[key]) byDay[key] = { date: key, รอบเปิด: 0, รอบปิด: 0 }
      if (r.round === 'รอบเปิด') byDay[key].รอบเปิด += r.grandTotal || 0
      else                       byDay[key].รอบปิด  += r.grandTotal || 0
    })
  return Object.values(byDay)
    .sort((a,b) => a.date.localeCompare(b.date))
    .map(d => ({
      ...d,
      name: d.date.slice(0,5), // dd/mm
      รอบเปิด: Math.round(d.รอบเปิด),
      รอบปิด:  Math.round(d.รอบปิด),
    }))
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s,p) => s + (p.value||0), 0)
  return (
    <div style={{background:'#fff',border:'1px solid #e5dfd6',borderRadius:12,padding:'10px 14px',boxShadow:'0 4px 20px rgba(100,70,40,.12)',fontSize:12}}>
      <div style={{fontWeight:700,color:'#2d2420',marginBottom:6}}>{label}</div>
      {payload.map((p,i) => (
        <div key={i} style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:p.color}}/>
          <span style={{color:'#7d6b58'}}>{p.name}:</span>
          <span style={{fontFamily:'DM Mono,monospace',fontWeight:600,color:p.color}}>
            {p.value.toLocaleString('th-TH')}
          </span>
        </div>
      ))}
      {payload.length > 1 && (
        <div style={{borderTop:'1px solid #e5dfd6',marginTop:6,paddingTop:6,fontWeight:700,color:'#e07b2a',fontFamily:'DM Mono,monospace'}}>
          รวม: {total.toLocaleString('th-TH')}
        </div>
      )}
    </div>
  )
}

export default function SummaryChart({ records, filterYear, filterMonth }) {
  const [mode, setMode] = useState('month') // 'month' | 'day' | 'bar'

  const year = filterYear || String(new Date().getFullYear()+543)
  const monthData = buildData(records, year)
  const dayData   = buildDailyData(records, year, filterMonth || 'all')
  const data      = mode === 'day' ? dayData : monthData

  const hasData = data.some(d => d.รอบเปิด > 0 || d.รอบปิด > 0)
  const fmtY = v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v

  const tabStyle = (t) => ({
    padding:'5px 12px', borderRadius:20, fontSize:11, fontWeight:700,
    cursor:'pointer', border:'1px solid',
    background: mode===t ? 'var(--open-main)' : 'var(--s3)',
    color:       mode===t ? 'white'            : 'var(--t2)',
    borderColor: mode===t ? 'var(--open-main)' : 'var(--border)',
    transition: 'all .2s',
  })

  return (
    <div className="chart-wrap">
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:8,marginBottom:14}}>
        <div>
          <div className="chart-title">📈 ภาพรวมยอดสุทธิ</div>
          <div className="chart-sub">ปี {year}{filterMonth && filterMonth!=='all' ? ` · ${MONTHS_SHORT[+filterMonth-1]}` : ' · ทุกเดือน'}</div>
        </div>
        <div style={{display:'flex',gap:6}}>
          <button style={tabStyle('month')} onClick={()=>setMode('month')}>รายเดือน</button>
          <button style={tabStyle('day')}   onClick={()=>setMode('day')}>รายวัน</button>
          <button style={tabStyle('bar')}   onClick={()=>setMode('bar')}>แท่ง</button>
        </div>
      </div>

      {!hasData ? (
        <div className="empty" style={{height:160}}>
          <div className="empty-ico">📊</div>
          <p>ยังไม่มีข้อมูลสำหรับปี {year}</p>
        </div>
      ) : mode === 'bar' ? (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthData} margin={{top:4,right:4,left:0,bottom:0}} barSize={10} barGap={3}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5dfd6" vertical={false}/>
            <XAxis dataKey="name" tick={{fontSize:10,fill:'#b5a090'}} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={fmtY} tick={{fontSize:10,fill:'#b5a090'}} axisLine={false} tickLine={false} width={34}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Bar dataKey="รอบเปิด" fill="#f5a050" radius={[4,4,0,0]}/>
            <Bar dataKey="รอบปิด"  fill="#7aaad8" radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{top:4,right:4,left:0,bottom:0}}>
            <defs>
              <linearGradient id="gOpen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f5a050" stopOpacity={0.35}/>
                <stop offset="95%" stopColor="#f5a050" stopOpacity={0.02}/>
              </linearGradient>
              <linearGradient id="gClose" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#7aaad8" stopOpacity={0.35}/>
                <stop offset="95%" stopColor="#7aaad8" stopOpacity={0.02}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5dfd6" vertical={false}/>
            <XAxis dataKey="name" tick={{fontSize:10,fill:'#b5a090'}} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={fmtY} tick={{fontSize:10,fill:'#b5a090'}} axisLine={false} tickLine={false} width={34}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Area type="monotone" dataKey="รอบเปิด" stroke="#e07b2a" strokeWidth={2} fill="url(#gOpen)"  dot={false} activeDot={{r:5,fill:'#e07b2a',strokeWidth:2,stroke:'white'}}/>
            <Area type="monotone" dataKey="รอบปิด"  stroke="#4a7abf" strokeWidth={2} fill="url(#gClose)" dot={false} activeDot={{r:5,fill:'#4a7abf',strokeWidth:2,stroke:'white'}}/>
          </AreaChart>
        </ResponsiveContainer>
      )}

      <div className="chart-legend">
        <div className="legend-item"><div className="legend-dot" style={{background:'#e07b2a'}}/> ☀️ รอบเปิด</div>
        <div className="legend-item"><div className="legend-dot" style={{background:'#4a7abf'}}/> 🌙 รอบปิด</div>
      </div>
    </div>
  )
}
