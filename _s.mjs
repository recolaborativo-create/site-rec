import { chromium } from '@playwright/test'
const [,,path,out,vw='1280']=process.argv
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:+vw,height:1200}})
await p.addInitScript(()=>localStorage.setItem('rec-theme','dark'))
await p.goto('http://localhost:4321'+path,{waitUntil:'networkidle'})
await p.evaluate(()=>document.querySelectorAll('[data-reveal]').forEach(e=>{e.classList.add('in-view');e.style.opacity='1';e.style.transform='none'}))
await p.waitForTimeout(600); await p.screenshot({path:out,fullPage:true}); await b.close(); console.log('ok')
