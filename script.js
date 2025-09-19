const LS_KEY='menuData',ADMIN_KEY='is_admin',CONFIG_KEY='menuConfig';let state=loadState(),config=loadConfig(),filter={q:'',cat:'الكل'},editId=null,cart=[];
const grid=document.getElementById('grid'),empty=document.getElementById('empty'),chips=document.getElementById('chips'),search=document.getElementById('search'),clearSearch=document.getElementById('clearSearch');
const fab=document.getElementById('fab'),hamburger=document.getElementById('hamburger'),menuDropdown=document.getElementById('menuDropdown'),loginBtn=document.getElementById('loginBtn'),settingsBtn=document.getElementById('settingsBtn'),logoutBtn=document.getElementById('logoutBtn');
const cartPill=document.getElementById('cartPill'),cartSumEl=document.getElementById('cartSum'),cartTotalEl=document.getElementById('cartTotal'),cartBar=document.getElementById('cartBar'),checkoutBtn=document.getElementById('checkoutBtn');
const loginModal=document.getElementById('loginModal'),loginForm=document.getElementById('loginForm');const settingsModal=document.getElementById('settingsModal'),settingsForm=document.getElementById('settingsForm'),waNumber=document.getElementById('waNumber'),logoPos=document.getElementById('logoPos'),logoFile=document.getElementById('logoFile'),logo=document.getElementById('logo');const waFloat=document.getElementById('whatsappFloat'),scrollTopBtn=document.getElementById('scrollTop');
function loadState(){const raw=localStorage.getItem(LS_KEY);if(raw)try{return JSON.parse(raw)}catch{};return{items:[]}}function saveState(){localStorage.setItem(LS_KEY,JSON.stringify(state))}
function loadConfig(){const raw=localStorage.getItem(CONFIG_KEY);if(raw)try{return JSON.parse(raw)}catch{};return{waNumber:'201234567890',logoPos:'left',logoDataUrl:''}}function saveConfig(){localStorage.setItem(CONFIG_KEY,JSON.stringify(config))}
function isAdmin(){return localStorage.getItem(ADMIN_KEY)==='1'}function setAdmin(v){if(v)localStorage.setItem(ADMIN_KEY,'1');else localStorage.removeItem(ADMIN_KEY);updateUI()}
function uid(){return Math.random().toString(36).slice(2,10)}
function render(){grid.innerHTML='';const items=state.items.filter(i=>i.status!=='hidden');items.forEach(it=>{const c=document.createElement('div');c.className='card';const img=document.createElement('img');img.className='thumb';img.src=it.img||'';c.appendChild(img);const body=document.createElement('div');const h=document.createElement('h3');h.textContent=it.name;body.appendChild(h);const p=document.createElement('div');p.textContent=it.price+' ج.م';body.appendChild(p);c.appendChild(body);grid.appendChild(c)});empty.style.display=items.length?'none':'block'}
function updateUI(){fab.style.display=isAdmin()?'block':'none';loginBtn.style.display=isAdmin()?'none':'block';logoutBtn.style.display=isAdmin()?'block':'none';settingsBtn.style.display=isAdmin()?'block':'none'}
hamburger.onclick=()=>menuDropdown.classList.toggle('show')
loginBtn.onclick=()=>loginModal.showModal()
loginForm.onsubmit=(e)=>{e.preventDefault();setAdmin(true);loginModal.close()}
logoutBtn.onclick=()=>{setAdmin(false)}
fab.onclick=()=>{if(!isAdmin())return;alert('إضافة صنف')}
checkoutBtn.onclick=()=>{const msg='طلب جديد';const url='https://wa.me/'+config.waNumber+'?text='+encodeURIComponent(msg);window.open(url,'_blank')}
scrollTopBtn.onclick=()=>window.scrollTo({top:0,behavior:'smooth'})
render();updateUI();
