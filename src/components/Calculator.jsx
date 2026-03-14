'use client'
import { useState } from 'react'

const INIT={d:'0',expr:'',op:null,operand:null,evaled:false}
const OM={'÷':'/','×':'*','−':'-','+':'+'}
const KEYS=[
  ['AC','sp'],['+/-','sp'],['%','sp'],['÷','op'],
  ['7',''],['8',''],['9',''],['×','op'],
  ['4',''],['5',''],['6',''],['−','op'],
  ['1',''],['2',''],['3',''],['+','op'],
  ['0','wide'],['.',''],['=','eq'],
]

export default function Calculator({open,onClose}){
  const [cs,set]=useState(INIT)
  const press=(k)=>set(s=>{
    if(k==='AC')return INIT
    if(k==='+/-')return{...s,d:s.d.startsWith('-')?s.d.slice(1):'-'+s.d}
    if(k==='%')return{...s,d:String(parseFloat(s.d)/100)}
    if(k==='='){
      if(!s.op||s.operand===null)return s
      const a=s.operand,b=parseFloat(s.d),op=s.op
      const r=op==='+'?a+b:op==='-'?a-b:op==='*'?a*b:b!==0?a/b:'Error'
      return{...s,expr:'',d:typeof r==='number'?String(parseFloat(r.toFixed(10))):'Error',op:null,operand:null,evaled:true}
    }
    if(OM[k])return{...s,operand:parseFloat(s.d),op:OM[k],expr:s.d+' '+k,evaled:false,d:'0'}
    if(k==='.'){if(s.evaled)return{...s,d:'0.',evaled:false};return s.d.includes('.')?s:{...s,d:s.d+'.'}}
    return{...s,d:(s.d==='0'||s.evaled)?k:s.d+k,evaled:false}
  })
  if(!open)return null
  return(
    <div className="overlay calc-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="calc-box">
        <div className="calc-bar">
          <span>🧮 เครื่องคิดเลข</span>
          <button className="calc-x" onClick={onClose}>×</button>
        </div>
        <div className="calc-expr">{cs.expr}</div>
        <div className="calc-disp">{cs.d}</div>
        <div className="calc-grid">
          {KEYS.map(([k,cls],i)=>(
            <button key={i} className={`cbtn ${cls}`} onClick={()=>press(k)}>{k}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
