// ====== Keys & Defaults ======
const LS_KEY = 'menuData_v3';
const CONFIG_KEY = 'menuConfig_v2';
const ADMIN_KEY = 'is_admin_v2';
const ADMIN_PIN = localStorage.getItem('admin_pin') || '1234';

const defaultConfig = {
  waNumber: '201234567890',
  logoPos: 'left',
  logoDataUrl: '' // base64
};

/** @typedef {{id:string,name:string,price:number,desc?:string,cat?:string,img?:string,status?:'available'|'soldout'|'hidden'}} MenuItem */
/** @type {{items: MenuItem[]}} */
let state = loadState();
let config = loadConfig();
let filter = { q:'', cat:'الكل' };
let editId = null;
let cart = []; // [{id, name, price, qty}]

// ====== DOM ======
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
const f_imgFile = document.getElementById('f_imgFile');
const preview = document.getElementById('preview');
const f_status = document.getElementById('f_status');

const fab = document.getElementById('fab');
const hamburger = document.getElementById('hamburger');
const menuDropdown = document.getElementById('menuDropdown');
const loginBtn = document.getElementById('loginBtn');
const settingsBtn = document.getElementById('settingsBtn');
const logoutBtn = document.getElementById('logoutBtn');
const cartPill = document.getElementById('cartPill');
const cartSumEl = document.getElementById('cartSum');
const cartTotalEl = document.getElementById('cartTotal');
const cartBar = document.getElementById('cartBar');
const checkoutBtn = document.getElementById('checkoutBtn');

const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const loginCancel = document.getElementById('loginCancel');

const settingsModal = document.getElementById('settingsModal');
const settingsForm = document.getElementById('settingsForm');
const waNumber = document.getElementById('waNumber');
const logoPos = document.getElementById('logoPos');
const logoFile = document.getElementById('logoFile');
const logoImg = document.getElementById('logo');

const nameModal = document.getElementById('nameModal');
const nameForm = document.getElementById('nameForm');
const customerName = document.getElementById('customerName');

const waFloat = document.getElementById('whatsappFloat');
const scrollTopBtn = document.getElementById('scrollTop');

// ====== Init Sample (first run) ======
function loadState(){
  const raw = localStorage.getItem(LS_KEY);
  if(raw){
    try{ return JSON.parse(raw); }catch{}
  }
  const demo = {items:[
    {id:uid(),name:'شاورما دجاج',price:85,desc:'شاورما دجاج بالثوم مع بطاطس',cat:'ساندويتشات',status:'available'},
    {id:uid(),name:'برجر لحمة',price:120,desc:'برجر لحم بقري 150 جم',cat:'ساندويتشات',status:'available'},
    {id:uid(),name:'سلطة سيزر',price:70,desc:'خص روماني، دريسينج سيزر',cat:'سلطات',status:'available'},
  ]};
  localStorage.setItem(LS_KEY, JSON.stringify(demo));
  return demo;
}
function saveState(){ localStorage.setItem(LS_KEY, JSON.stringify(state)); }

function loadConfig(){
  const raw = localStorage.getItem(CONFIG_KEY);
  if(raw){ try{ return {...defaultConfig, ...JSON.parse(raw)} }catch{} }
  localStorage.setItem(CONFIG_KEY, JSON.stringify(defaultConfig));
  return {...defaultConfig};
}
function saveConfig(){ localStorage.setItem(CONFIG_KEY, JSON.stringify(config)); }

function isAdmin(){ return localStorage.getItem(ADMIN_KEY) === '1'; }
function setAdmin(v){ if(v){ localStorage.setItem(ADMIN_KEY, '1'); } else { localStorage.removeItem(ADMIN_KEY); } updateAdminUI(); }

function uid(){ return Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4); }
function formatPrice(p){ const val = Number(p||0); return Intl.NumberFormat('ar-EG',{ style:'currency', currency:'EGP'}).format(val); }
function placeholder(){ return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100%" height="100%" fill="#e2e8f0"/></svg>`); }

// ====== Filters ======
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
  // update datalist
  catsList.innerHTML = '';
  Array.from(new Set(state.items.map(i=>i.cat).filter(Boolean))).forEach(c=>{
    const opt = document.createElement('option'); opt.value = c; catsList.appendChild(opt);
  });
}
function filtered(){
  const q = (filter.q||'').toLowerCase();
  return state.items
    .filter(i=> i.status!=='hidden')
    .filter(i=> filter.cat==='الكل' || i.cat===filter.cat)
    .filter(i=> !q || (i.name||'').toLowerCase().includes(q) || (i.desc||'').toLowerCase().includes(q) || (i.cat||'').toLowerCase().includes(q));
}

// ====== Render ======
function render(){
  const items = filtered();
  grid.innerHTML = '';
  empty.style.display = items.length? 'none':'block';
  renderChips();

  for(const it of items){ grid.appendChild(card(it)); }
  updateCartUI();
  applyLogo();
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

  // quantity & add to cart
  const qtyBox = document.createElement('div'); qtyBox.className='quantity'; foot.appendChild(qtyBox);
  const minus = document.createElement('button'); minus.textContent='-'; qtyBox.appendChild(minus);
  const qty = document.createElement('span'); qty.textContent='1'; qtyBox.appendChild(qty);
  const plus = document.createElement('button'); plus.textContent='+'; qtyBox.appendChild(plus);
  const addBtn = document.createElement('button'); addBtn.className='btn primary'; addBtn.textContent='أضف للسلة'; addBtn.style.marginInlineStart='8px'; foot.appendChild(addBtn);
  if(item.status==='soldout'){ addBtn.disabled=true; addBtn.textContent='غير متاح'; }

  minus.onclick=()=>{ const v = Math.max(1, Number(qty.textContent)-1); qty.textContent=String(v); };
  plus.onclick =()=>{ const v = Number(qty.textContent)+1; qty.textContent=String(v); };
  addBtn.onclick =()=> addToCart(item, Number(qty.textContent));

  // admin tools
  const tools = document.createElement('div'); tools.className='admin-tools'; body.appendChild(tools);
  const editBtn = document.createElement('button'); editBtn.className='btn'; editBtn.textContent='تعديل'; editBtn.onclick=()=>openEdit(item.id); tools.appendChild(editBtn);
  const delBtn = document.createElement('button'); delBtn.className='btn'; delBtn.textContent='حذف'; delBtn.onclick=()=>removeItem(item.id); tools.appendChild(delBtn);

  return c;
}

// ====== Cart ======
function addToCart(item, qty=1){
  if(item.status==='soldout') return;
  const ex = cart.find(c=>c.id===item.id);
  if(ex){ ex.qty += qty; } else { cart.push({ id:item.id, name:item.name, price:item.price, qty }); }
  updateCartUI();
}
function cartTotal(){ return cart.reduce((s,c)=> s + (c.price*c.qty), 0); }
function updateCartUI(){
  const total = cartTotal();
  cartPill.style.display = 'inline-flex';
  cartTotalEl.textContent = total.toFixed(2);
  cartSumEl.textContent = total.toFixed(2);
  cartBar.style.display = total>0 ? 'flex' : 'none';
}

// ====== WhatsApp Checkout ======
checkoutBtn?.addEventListener('click', ()=>{
  if(cart.length===0) return;
  nameModal.showModal();
});
nameForm?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = (customerName.value||'عميل');
  const lines = cart.map(c=>`- ${c.name} x${c.qty} = ${c.price*c.qty} ج.م`).join('%0A');
  const total = cartTotal().toFixed(2);
  const msg = `طلب جديد من ${name}%0A${lines}%0Aالإجمالي: ${total} ج.م`;
  const wa = (config.waNumber||'201234567890').replace(/[^0-9]/g,'');
  const url = `https://wa.me/${wa}?text=${msg}`;
  window.open(url,'_blank');
  nameModal.close();
});

// ====== Admin: Login / Logout / Settings ======
function updateAdminUI(){
  document.body.classList.toggle('admin', isAdmin());
  fab.style.display = isAdmin()? 'block' : 'none';
  loginBtn.style.display = isAdmin()? 'none' : 'block';
  logoutBtn.style.display = isAdmin()? 'block' : 'none';
  settingsBtn.style.display = isAdmin()? 'block' : 'none';
}
hamburger.addEventListener('click', ()=> menuDropdown.classList.toggle('show') );

loginBtn.addEventListener('click', ()=> { 
  loginModal.showModal(); 
  menuDropdown.classList.remove('show'); 
});
loginForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const pin = document.getElementById('pinInput').value || '';
  if(pin === ADMIN_PIN){ 
    setAdmin(true); 
    loginModal.close(); 
  }
  else { alert('رمز غير صحيح'); }
});
loginCancel.addEventListener('click', ()=> { loginModal.close(); });

logoutBtn.addEventListener('click', ()=>{
  setAdmin(false);
  menuDropdown.classList.remove('show');
});

settingsBtn.addEventListener('click', ()=>{
  if(!isAdmin()) return;
  waNumber.value = config.waNumber||'';
  logoPos.value = config.logoPos||'left';
  settingsModal.showModal();
  menuDropdown.classList.remove('show');
});
settingsForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  config.waNumber = (waNumber.value||'').trim();
  config.logoPos = logoPos.value;
  saveConfig();
  settingsModal.close();
  applyLogo();
});

// logo upload
logoFile.addEventListener('change', async (e)=>{
  const file = e.target.files?.[0]; if(!file) return;
  const dataUrl = await fileToDataUrl(file);
  config.logoDataUrl = dataUrl;
  saveConfig();
  applyLogo();
});
function applyLogo(){
  if(config.logoDataUrl){ logoImg.src = config.logoDataUrl; } else { logoImg.removeAttribute('src'); }
  document.body.classList.remove('logo-left','logo-center','logo-right');
  const cls = config.logoPos==='center' ? 'logo-center' : (config.logoPos==='right' ? 'logo-right' : 'logo-left');
  document.body.classList.add(cls);
}

// ====== Items CRUD ======
fab.addEventListener('click', ()=>{ if(!isAdmin()) return; openCreate(); });

function openCreate(){
  editId = null;
  f_name.value=''; f_price.value=''; f_desc.value=''; f_cat.value=''; f_status.value='available';
  preview.src=''; f_imgFile.value='';
  itemModal.showModal();
}
function openEdit(id){
  if(!isAdmin()) return;
  const it = state.items.find(x=>x.id===id); if(!it) return;
  editId = id;
  f_name.value=it.name||''; f_price.value=it.price||0; f_desc.value=it.desc||''; f_cat.value=it.cat||''; f_status.value=it.status||'available';
  preview.src = it.img || '';
  f_imgFile.value = '';
  itemModal.showModal();
}
itemForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const data = {
    name: f_name.value.trim(),
    price: Number(f_price.value||0),
    desc: f_desc.value.trim(),
    cat: f_cat.value.trim(),
    status: f_status.value
  };
  if(!data.name){ alert('اكتب اسم الصنف'); return; }

  // handle image file => base64
  let imgData = null;
  const file = f_imgFile.files?.[0];
  if(file){ imgData = await fileToDataUrl(file); }
  else if(preview.src){ imgData = preview.src; }

  if(editId){
    const idx = state.items.findIndex(x=>x.id===editId);
    if(idx>-1){ state.items[idx] = { ...state.items[idx], ...data, img: imgData??state.items[idx].img } }
  } else {
    state.items.unshift({ id: uid(), ...data, img: imgData });
  }
  saveState(); render(); itemModal.close();
});
function removeItem(id){
  if(!confirm('متأكد من حذف الصنف؟')) return;
  state.items = state.items.filter(x=>x.id!==id);
  saveState(); render();
}

// preview image live
f_imgFile.addEventListener('change', async (e)=>{
  const file = e.target.files?.[0]; if(!file) return;
  preview.src = await fileToDataUrl(file);
});

// ====== Search ======
search.addEventListener('input', e=>{ filter.q = e.target.value; render(); });
clearSearch.addEventListener('click', ()=>{ filter.q=''; search.value=''; render(); });

// ====== Utils ======
function fileToDataUrl(file){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = ()=> resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ====== Floating Buttons ======
waFloat.addEventListener('click', (e)=>{
  e.preventDefault();
  const wa = (config.waNumber||'201234567890').replace(/[^0-9]/g,'');
  const url = `https://wa.me/${wa}`;
  window.open(url, '_blank');
});
scrollTopBtn.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}) );

// ====== First render ======
function bootstrap(){
  if(!localStorage.getItem(CONFIG_KEY)) saveConfig();
  updateAdminUI();
  applyLogo();
  render();
}
bootstrap();
