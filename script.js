const LS_KEY = 'menuData_v1';
const ADMIN_PIN = localStorage.getItem('admin_pin') || '1234';

/** @typedef {{id:string,name:string,price:number,desc?:string,cat?:string,img?:string,status?:'available'|'soldout'|'hidden'}} MenuItem */
/** @type {{items: MenuItem[]}} */
let state = loadState();
let filter = { q:'', cat:'الكل' };
let editId = null;

function loadState(){
  const raw = localStorage.getItem(LS_KEY);
  if(raw){
    try{ return JSON.parse(raw); }catch{ /* ignore */ }
  }
  const demo = {items:[
    {id:uid(),name:'شاورما دجاج',price:85,desc:'شاورما دجاج بالثوم مع بطاطس',cat:'ساندويتشات',img:'https://images.unsplash.com/photo-1606756790138-261f08e29f87?q=80&w=800&auto=format&fit=crop',status:'available'},
    {id:uid(),name:'برجر لحمة',price:120,desc:'برجر لحم بقري 150 جم مع جبنة',cat:'ساندويتشات',img:'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop',status:'available'},
    {id:uid(),name:'سلطة سيزر',price:70,desc:'خص روماني، دريسينج سيزر، جبنة بارميزان',cat:'سلطات',img:'https://images.unsplash.com/photo-1551892374-ecf8754cf8a7?q=80&w=800&auto=format&fit=crop',status:'available'},
    {id:uid(),name:'باستا ألفريدو',price:140,desc:'مكرونة بصوص ألفريدو ودجاج',cat:'أطباق رئيسية',img:'https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=800&auto=format&fit=crop',status:'available'},
    {id:uid(),name:'تشيز كيك',price:65,desc:'تشيز كيك نيويورك',cat:'حلويات',img:'https://images.unsplash.com/photo-1541781286675-3c689b9a1b1b?q=80&w=800&auto=format&fit=crop',status:'available'}
  ]};
  localStorage.setItem(LS_KEY, JSON.stringify(demo));
  return demo;
}

function saveState(){ localStorage.setItem(LS_KEY, JSON.stringify(state)); }
function uid(){ return Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4); }

// UI refs
const grid = document.getElementById('grid');
const empty = document.getElementById('empty');
const chips = document.getElementById('chips');
const search = document.getElementById('search');
const clearSearch = document.getElementById('clearSearch');
const itemModal = document.getElementById('itemModal');
const itemForm = document.getElementById('itemForm');
const catsList = document.getElementById('catsList');
const f_name = document.getElementById('f_name');
const f_price = document.getElementById('f_price');
const f_desc = document.getElementById('f_desc');
const f_cat = document.getElementById('f_cat');
const f_img = document.getElementById('f_img');
const f_status = document.getElementById('f_status');
const fab = document.getElementById('fab');
const btnAdmin = document.getElementById('btnAdmin');
const pinModal = document.getElementById('pinModal');
const pinForm = document.getElementById('pinForm');
const btnExport = document.getElementById('btnExport');
const btnImport = document.getElementById('btnImport');
const filePicker = document.getElementById('filePicker');

function categories(){
  const set = new Set(['الكل']);
  state.items.forEach(i=>{ if(i.cat && i.status!=='hidden') set.add(i.cat); });
  return Array.from(set);
}

function renderChips(){
  chips.innerHTML = '';
  for(const c of categories()){
    const el = document.createElement('div');
    el.className = 'chip' + (filter.cat===c?' active':''); el.textContent = c;
    el.onclick = ()=>{ filter.cat = c; render(); };
    chips.appendChild(el);
  }
  catsList.innerHTML = '';
  Array.from(new Set(state.items.map(i=>i.cat).filter(Boolean))).forEach(c=>{
    const opt = document.createElement('option'); opt.value = c; catsList.appendChild(opt);
  });
}

function normalize(s){ return (s||'').toLowerCase(); }
function filtered(){
  const q = normalize(filter.q);
  return state.items.filter(i=> i.status!=='hidden').filter(i=> filter.cat==='الكل' || i.cat===filter.cat).filter(i=> !q || normalize(i.name).includes(q) || normalize(i.desc).includes(q) || normalize(i.cat).includes(q));
}

function render(){
  const items = filtered();
  grid.innerHTML = '';
  empty.style.display = items.length? 'none':'block';
  renderChips();
  for(const i of items){ grid.appendChild(card(i)); }
}

function card(item){
  const c = document.createElement('div'); c.className = 'card';
  const img = document.createElement('img'); img.className='thumb'; img.alt=item.name; img.loading='lazy'; img.src=item.img||placeholder(); c.appendChild(img);
  const body = document.createElement('div'); body.style.flex='1'; c.appendChild(body);
  const top = document.createElement('div'); top.className='title'; body.appendChild(top);
  const h = document.createElement('h3'); h.textContent = item.name; top.appendChild(h);
  const price = document.createElement('div'); price.className='price'; price.textContent = formatPrice(item.price); top.appendChild(price);
  const d = document.createElement('div'); d.className='desc'; d.textContent = item.desc || ''; body.appendChild(d);
  const foot = document.createElement('div'); foot.style.display='flex'; foot.style.justifyContent='space-between'; foot.style.alignItems='center'; body.appendChild(foot);
  const badge = document.createElement('span'); badge.className='badge'; badge.textContent = item.cat||'بدون قسم'; foot.appendChild(badge);
  const tools = document.createElement('div'); tools.className='admin-tools'; foot.appendChild(tools);
  const editBtn = document.createElement('button'); editBtn.className='btn'; editBtn.textContent='تعديل'; editBtn.onclick=()=>openEdit(item.id); tools.appendChild(editBtn);
  const delBtn = document.createElement('button'); delBtn.className='btn danger'; delBtn.textContent='حذف'; delBtn.onclick=()=>removeItem(item.id); tools.appendChild(delBtn);
  if(item.status==='soldout'){ const so = document.createElement('div'); so.textContent='غير متاح'; so.className='badge'; so.style.background='rgba(239,68,68,.15)'; so.style.borderColor='rgba(239,68,68,.4)'; so.style.color='#fecaca'; body.appendChild(so); }
  return c;
}

function formatPrice(p){ const val = Number(p||0); return Intl.NumberFormat('ar-EG',{ style:'currency', currency:'EGP'}).format(val); }
function placeholder(){ return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="100%" height="100%" fill="#0b1020"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="12" fill="#94a3b8">No Image</text></svg>`); }
search.addEventListener('input', e=>{ filter.q = e.target.value; render(); });
clearSearch.addEventListener('click', ()=>{ filter.q=''; search.value=''; render(); });
btnAdmin.addEventListener('click', ()=>{ if(document.body.classList.contains('admin')){ document.body.classList.remove('admin'); return; } pinModal.showModal(); });
pinForm.addEventListener('submit', (e)=>{ e.preventDefault(); const pin = document.getElementById('pinInput').value || ''; if(pin === ADMIN_PIN){ document.body.classList.add('admin'); pinModal.close(); } else { alert('رمز غير صحيح'); } });
fab.addEventListener('click', ()=>{ if(!ensureAdmin()) return; openCreate(); });
function ensureAdmin(){ if(!document.body.classList.contains('admin')){ alert('شغّل وضع الإدارة أولًا'); return false; } return true; }
function openCreate(){ editId = null; f_name.value=''; f_price.value=''; f_desc.value=''; f_cat.value=''; f_img.value=''; f_status.value='available'; itemModal.showModal(); }
function openEdit(id){ if(!ensureAdmin()) return; const it = state.items.find(x=>x.id===id); if(!it) return; editId = id; f_name.value=it.name||''; f_price.value=it.price||0; f_desc.value=it.desc||''; f_cat.value=it.cat||''; f_img.value=it.img||''; f_status.value=it.status||'available'; itemModal.showModal(); }
itemForm.addEventListener('submit', (e)=>{ e.preventDefault(); const data = { name: f_name.value.trim(), price: Number(f_price.value||0), desc: f_desc.value.trim(), cat: f_cat.value.trim(), img: f_img.value.trim(), status: f_status.value }; if(!data.name){ alert('اكتب اسم الصنف'); return; } if(editId){ const idx = state.items.findIndex(x=>x.id===editId); if(idx>-1){ state.items[idx] = { ...state.items[idx], ...data } } } else { state.items.unshift({ id: uid(), ...data }); } saveState(); render(); itemModal.close(); });
function removeItem(id){ if(!confirm('متأكد من حذف الصنف؟')) return; state.items = state.items.filter(x=>x.id!==id); saveState(); render(); }
btnExport.addEventListener('click', ()=>{ const blob = new Blob([JSON.stringify(state,null,2)], {type:'application/json'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'menu-data.json'; a.click(); URL.revokeObjectURL(url); });
btnImport.addEventListener('click', ()=> filePicker.click());
filePicker.addEventListener('change', async (e)=>{ const file = e.target.files?.[0]; if(!file) return; try{ const text = await file.text(); const data = JSON.parse(text); if(!data.items || !Array.isArray(data.items)) throw new Error('صيغة غير صحيحة'); state = data; saveState(); render(); }catch(err){ alert('حدث خطأ في قراءة الملف: '+err.message); } finally{ filePicker.value=''; } });
render();