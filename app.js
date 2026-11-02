/* Replace this sample/demo array with the approved MAHSOUB product catalogue. */
const PRODUCTS = [
  {id:"mahsoub-latte",name:"MAHSOUB Latte",ar:"لاتيه محسوب",category:"coffee",price:1.750,calories:128,carbs:14.2,fat:4.8,protein:7.1,ingredients:"Espresso, steamed milk, a little care.",arIngredients:"إسبريسو، حليب مبخر، وقليل من العناية.",color:"#a87957",dark:"#69472f",foam:"#e8dfcf",servings:["Hot","Iced"],featured:true},
  {id:"pistachio-cloud",name:"Pistachio Cloud",ar:"غيمة الفستق",category:"coffee",price:2.250,calories:214,carbs:23.6,fat:9.2,protein:8.4,ingredients:"Espresso, milk, pistachio cream.",arIngredients:"إسبريسو، حليب، كريمة الفستق.",color:"#9c9a69",dark:"#68704c",foam:"#e9dfca",servings:["Hot","Iced"]},
  {id:"date-cold-brew",name:"Date Cold Brew",ar:"كولد برو بالتمر",category:"coffee",price:1.950,calories:96,carbs:18.4,fat:1.2,protein:2.6,ingredients:"Slow-steeped coffee, date syrup, milk.",arIngredients:"قهوة منقوعة على البارد، دبس تمر، حليب.",color:"#a87b51",dark:"#65452f",foam:"#d8c2a1",servings:["Hot","Iced"],featured:true},
  {id:"saffron-flat-white",name:"Saffron Flat White",ar:"فلات وايت بالزعفران",category:"coffee",price:1.850,calories:143,carbs:15.3,fat:5.4,protein:7.8,ingredients:"Espresso, steamed milk, saffron.",arIngredients:"إسبريسو، حليب مبخر، زعفران.",color:"#bd9b67",dark:"#806447",foam:"#f0e7d6",servings:["Hot","Iced"]},
  {id:"matcha-milk",name:"Matcha Milk",ar:"ماتشا بالحليب",category:"tea",price:2.100,calories:167,carbs:21.2,fat:5.1,protein:7.7,ingredients:"Stone-ground matcha, milk, light sweetness.",arIngredients:"ماتشا مطحونة بالحجر، حليب، حلاوة خفيفة.",color:"#a1a77c",dark:"#6b7951",foam:"#e7e6cf",servings:["Hot","Iced"],featured:true},
  {id:"hibiscus-cooler",name:"Hibiscus Cooler",ar:"كركديه منعش",category:"refreshers",price:1.500,calories:58,carbs:14.1,fat:0.1,protein:0.4,ingredients:"Hibiscus, citrus, a touch of honey.",arIngredients:"كركديه، حمضيات، لمسة من العسل.",color:"#b87368",dark:"#854f4c",foam:"#e7c8b8",servings:["Hot","Iced"]},
  {id:"cardamom-tea",name:"Cardamom Tea",ar:"شاي بالهيل",category:"tea",price:1.250,calories:34,carbs:7.6,fat:0.2,protein:0.5,ingredients:"Black tea, cardamom, milk on request.",arIngredients:"شاي أسود، هيل، حليب عند الطلب.",color:"#bc9862",dark:"#80613f",foam:"#eadfc8",servings:["Hot","Iced"]},
  {id:"still-water",name:"Still Water",ar:"ماء",category:"refreshers",price:0.500,calories:0,carbs:0,fat:0,protein:0,ingredients:"Still water.",arIngredients:"ماء عادي.",color:"#9aada5",dark:"#697f76",foam:"#e6ece5",servings:[],water:true}
];

const $=(s,root=document)=>root.querySelector(s), $$=(s,root=document)=>[...root.querySelectorAll(s)];
let language="en", activePage="home", lastFocus=null, cardServings={};
const root=document.documentElement;
function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function money(price){return `${Number(price).toFixed(3)} KWD`;}
function drinkArt(product, serving="Iced"){
  return `<div class="drink-art" aria-hidden="true"><div class="drink-top"></div><div class="drink-cup" style="--drink-color:${product.color};--drink-dark:${product.dark};--drink-foam:${product.foam}"></div>${serving==="Iced"&&!product.water?'<i class="drink-ice"></i><i class="drink-ice two"></i>':''}<div class="drink-sleeve"><img src="attached_assets/IMG_1707_1793637320300.jpeg" alt=""></div></div>`;
}
function productCard(p,preview=false){
  const serving=cardServings[p.id]||p.servings[0]||"Iced";
  const title=language==="ar"?p.ar:p.name;
  return `<article class="product-card" data-product="${p.id}" tabindex="0" aria-label="${escapeHTML(title)} — ${language==="ar"?"عرض التفاصيل":"view details"}">
    <div class="product-visual" style="--drink-color:${p.color};--drink-dark:${p.dark};--drink-foam:${p.foam}"><span class="product-visual-label">${p.water?"PURE & SIMPLE":p.category.toUpperCase()}</span>${drinkArt(p,serving)}</div>
    <div class="product-info"><div class="product-topline"><h3 class="product-name">${escapeHTML(title)}</h3><span class="product-price">${money(p.price)}</span></div><p class="product-arabic" lang="${language==="ar"?"en":"ar"}" dir="${language==="ar"?"ltr":"rtl"}">${escapeHTML(language==="ar"?p.name:p.ar)}</p><p class="product-cal">${p.calories} kcal <span>·</span> ${language==="ar"?"لكل حصة":"per serving"} <span>·</span> ${language==="ar"?"تجريبي":"sample"}</p><div class="card-controls">${p.water?'<span class="water-tag">'+(language==="ar"?"بدون إضافات":"No fuss")+'</span>':`<div class="serve-switch" role="group" aria-label="${language==="ar"?"خيارات التقديم":"Serving options"}">${p.servings.map(opt=>`<button type="button" data-serving="${opt}" aria-pressed="${serving===opt}" aria-label="${opt} ${language==="ar"?"تقديم":"serve"}">${language==="ar"?(opt==="Hot"?"حار":"مثلج"):opt.toUpperCase()}</button>`).join("")}</div>`}<button class="details-button" type="button" data-details="${p.id}">${language==="ar"?"التفاصيل":"Details"} <span aria-hidden="true">↗</span></button></div></div></article>`;
}
function renderProducts(){
  const query=$("#productSearch").value.trim().toLocaleLowerCase();
  const category=$("#categoryFilter").value;
  const matches=PRODUCTS.filter(p=>(category==="all"||p.category===category)&&(!query||`${p.name} ${p.ar} ${p.category}`.toLocaleLowerCase().includes(query)));
  $("#productGrid").innerHTML=matches.map(p=>productCard(p)).join("");
  $("#resultCount").textContent=language==="ar"?`${matches.length} مشروبات · بيانات تجريبية`:`${matches.length} drinks · sample data`;
  $("#emptyState").hidden=matches.length>0;
  $("#productGrid").hidden=matches.length===0;
  $("#clearFilters").classList.toggle("visible",Boolean(query)||category!=="all");
}
function renderFeatured(){
  $("#featuredProducts").innerHTML=PRODUCTS.filter(p=>p.featured).slice(0,3).map(p=>productCard(p,true)).join("");
}
function setLanguage(next){
  language=next;root.lang=next;root.dir=next==="ar"?"rtl":"ltr";
  $$("[data-en][data-ar]").forEach(el=>{el.innerHTML=el.dataset[next];});
  $$("[data-placeholder-en]").forEach(el=>el.placeholder=el.dataset[`placeholder${next==="en"?"En":"Ar"}`]);
  $("#languageToggle").textContent=next==="en"?"عربي":"English";
  $("#languageToggle").setAttribute("aria-label",next==="en"?"Switch to Arabic":"Switch to English");
  $("#productSearch").placeholder=next==="en"?$("#productSearch").dataset.placeholderEn:$("#productSearch").dataset.placeholderAr;
  document.title=next==="en"?"MAHSOUB — A little more considered":"محسوب — اختيار أكثر وعياً";
  renderFeatured();renderProducts();
  if(!$("#productModal").hidden){const id=$("#productModal").dataset.productId;openProduct(id,false);}
}
function showPage(page){
  if(!$("#"+page))return;
  activePage=page;
  $$(".page-view").forEach(v=>v.classList.toggle("active",v.id===page));
  $$(".nav-link").forEach(a=>a.classList.toggle("active",a.dataset.page===page));
  $("#menuToggle").setAttribute("aria-expanded","false");$(".main-nav").classList.remove("open");
  if(location.hash!==`#${page}`)history.replaceState(null,"",`#${page}`);
  window.scrollTo({top:0,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});
}
function openProduct(id,focus=true){
  const p=PRODUCTS.find(x=>x.id===id);if(!p)return;
  const modal=$("#productModal");modal.dataset.productId=id;
  const serving=cardServings[p.id]||p.servings[0]||"Iced";
  $("#modalVisual").innerHTML=drinkArt(p,serving);
  $("#modalTitle").textContent=p.name;$("#modalArabic").textContent=p.ar;
  $("#modalPrice").textContent=money(p.price);
  $("#modalDescription").textContent=language==="ar"?p.arIngredients:p.ingredients;
  const stats=language==="ar"?[["السعرات",`${p.calories}`,"سعرة"],["الكربوهيدرات",`${p.carbs}g`,"g"],["الدهون",`${p.fat}g`,"g"],["البروتين",`${p.protein}g`,"g"]]:[["Calories",`${p.calories}`,"kcal"],["Carbs",`${p.carbs}g`,"g"],["Fat",`${p.fat}g`,"g"],["Protein",`${p.protein}g`,"g"]];
  $("#nutritionGrid").innerHTML=stats.map(s=>`<div class="nutrition-stat"><strong>${s[1]}</strong><span>${s[0]} · ${s[2]}</span></div>`).join("");
  const servings=p.water?(language==="ar"?["ماء عادي"]:["Still"]):p.servings.map(s=>language==="ar"?(s==="Hot"?"حار":"مثلج"):s);
  $("#servingOptions").innerHTML=servings.map(s=>`<span class="serving-chip">${s}</span>`).join("");
  modal.hidden=false;document.body.classList.add("modal-open");
  if(focus)lastFocus=document.activeElement;
  $("#modalClose").focus();
}
function closeModal(){if($("#productModal").hidden)return;$("#productModal").hidden=true;document.body.classList.remove("modal-open");if(lastFocus&&lastFocus.focus)lastFocus.focus();}
function updateCardServing(button){
  const card=button.closest("[data-product]"),p=PRODUCTS.find(x=>x.id===card.dataset.product);if(!p)return;
  cardServings[p.id]=button.dataset.serving;
  card.querySelectorAll("[data-serving]").forEach(b=>b.setAttribute("aria-pressed",String(b===button)));
  const art=card.querySelector(".drink-art");if(art){const old=art.parentElement;art.remove();old.insertAdjacentHTML("beforeend",drinkArt(p,button.dataset.serving));}
}
document.addEventListener("click",e=>{
  const nav=e.target.closest("[data-page]");if(nav){e.preventDefault();showPage(nav.dataset.page);return;}
  const go=e.target.closest("[data-go]");if(go){showPage(go.dataset.go);return;}
  const serve=e.target.closest("[data-serving]");if(serve){e.stopPropagation();updateCardServing(serve);return;}
  const details=e.target.closest("[data-details]");if(details){e.stopPropagation();openProduct(details.dataset.details);return;}
  const card=e.target.closest("[data-product]");if(card){openProduct(card.dataset.product);return;}
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){closeModal();$("#menuToggle").setAttribute("aria-expanded","false");$(".main-nav").classList.remove("open");}
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();showPage("menu");$("#productSearch").focus();}
  if((e.key==="Enter"||e.key===" ")&&e.target.matches(".product-card")){e.preventDefault();openProduct(e.target.dataset.product);}
  if(e.key==="Tab"&&!$("#productModal").hidden){const focusables=$$('button,[href],input,select,textarea,[tabindex="0"]',$("#productModal")).filter(el=>!el.disabled);if(e.shiftKey&&document.activeElement===focusables[0]){e.preventDefault();focusables.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===focusables.at(-1)){e.preventDefault();focusables[0].focus()}}
});
$("#languageToggle").addEventListener("click",()=>setLanguage(language==="en"?"ar":"en"));
$("#themeToggle").addEventListener("click",()=>{const dark=root.dataset.theme!=="dark";root.dataset.theme=dark?"dark":"light";$("#themeToggle").setAttribute("aria-label",dark?"Switch to light mode":"Switch to dark mode");$("#themeToggle .theme-symbol").textContent=dark?"☼":"◐";localStorage.setItem("mahsoub-theme",root.dataset.theme)});
$("#menuToggle").addEventListener("click",()=>{const open=$("#menuToggle").getAttribute("aria-expanded")!=="true";$("#menuToggle").setAttribute("aria-expanded",String(open));$(".main-nav").classList.toggle("open",open)});
$("#productSearch").addEventListener("input",renderProducts);$("#categoryFilter").addEventListener("change",renderProducts);
function resetFilters(){$("#productSearch").value="";$("#categoryFilter").value="all";renderProducts();$("#productSearch").focus();}
$("#clearFilters").addEventListener("click",resetFilters);$("#emptyReset").addEventListener("click",resetFilters);
$("#modalClose").addEventListener("click",closeModal);
$("#productModal").addEventListener("click",e=>{if(e.target===$("#productModal"))closeModal();});
$("#contactForm").addEventListener("submit",e=>{e.preventDefault();const status=$("#formStatus");status.textContent=language==="ar"?"شكراً لرسالتك. هذا نموذج تجريبي، ولم يتم إرسالها.":"Thanks for your note. This is a demo form, so nothing was sent.";e.currentTarget.reset();});
$("#productSearch").addEventListener("keydown",e=>{if(e.key==="Escape"&&e.currentTarget.value){e.currentTarget.value="";renderProducts();}});
const savedTheme=localStorage.getItem("mahsoub-theme");if(savedTheme){root.dataset.theme=savedTheme;$("#themeToggle").setAttribute("aria-label",savedTheme==="dark"?"Switch to light mode":"Switch to dark mode");$("#themeToggle .theme-symbol").textContent=savedTheme==="dark"?"☼":"◐";}
renderFeatured();renderProducts();
const firstPage=location.hash.slice(1);if(["home","menu","about","contact"].includes(firstPage))showPage(firstPage);
