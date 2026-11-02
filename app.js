const PRODUCTS = [
  {id:"matcha",name:"Matcha",ar:"ماتشا",category:"matcha",price:1.500,calories:39,carbs:12,fat:2.2,protein:1,ingredients:["Matcha","Erythritol","Almond Milk"],arIngredients:["ماتشا","إريثريتول","حليب اللوز"],image:"attached_assets/generated_images/matcha.jpg",servings:["Hot","Iced"]},
  {id:"chocolate-milk",name:"Chocolate Milk",ar:"حليب كاكاو",category:"chocolate",price:1.000,calories:50,carbs:4.8,fat:0.9,protein:4,ingredients:["Skimmed Milk","Organic Cocoa Powder"],arIngredients:["حليب خالي الدسم","مسحوق كاكاو عضوي"],image:"attached_assets/generated_images/chocolate-milk.jpg",servings:["Hot","Iced"]},
  {id:"coffee-latte",name:"Coffee Latte",ar:"كوفي لاتيه",category:"coffee",price:1.250,calories:57,carbs:10,fat:1,protein:2,image:"attached_assets/generated_images/coffee-latte.jpg",servings:["Hot","Iced"]},
  {id:"americano",name:"Americano",ar:"أمريكانو",category:"coffee",price:1.000,calories:0,carbs:0,fat:0,protein:0,image:"attached_assets/generated_images/americano.jpg",servings:["Hot","Iced"]},
  {id:"water",name:"Water",ar:"ماء",category:"water",price:0.250,calories:0,carbs:0,fat:0,protein:0,ingredients:["Regular bottled water"],arIngredients:["ماء عادي معبأ"],image:"attached_assets/generated_images/water.jpg",servings:[],water:true}
];
const CONTACT_EMAIL="saraahdi04@icloud.com";

const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const root=document.documentElement;
let language=localStorage.getItem("mahsoub-language")==="ar"?"ar":"en";
let activePage="home",lastFocus=null,cardServings={};

function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function money(price){return `${Number(price).toFixed(3)} KWD`;}
function nutritionSummary(product){
  return language==="ar"
    ?`${product.calories} سعرة · ${product.carbs} غ كربوهيدرات · ${product.fat} غ دهون · ${product.protein} غ بروتين · لكل حصة`
    :`${product.calories} kcal · ${product.carbs} g carbs · ${product.fat} g fat · ${product.protein} g protein · per serving`;
}
function productCard(product){
  const serving=cardServings[product.id]||"Iced";
  return `<article class="product-card" data-product="${product.id}" tabindex="0" aria-label="${escapeHTML(product.name)} — ${escapeHTML(product.ar)}">
    <div class="product-visual"><img src="${product.image}" alt="${escapeHTML(language==="ar"?product.ar:product.name)}"></div>
    <div class="product-info"><div class="product-topline"><h2 class="product-name">${escapeHTML(product.name)}</h2><span class="product-price">${money(product.price)}</span></div>
      <p class="product-arabic" lang="ar" dir="rtl">${escapeHTML(product.ar)}</p>
      <p class="product-cal">${nutritionSummary(product)}</p>
      <div class="card-controls">${product.water?`<span class="water-tag">${language==="ar"?"ماء عادي معبأ":"Regular bottled water"}</span>`:`<div class="serve-switch" role="group" aria-label="${language==="ar"?"طريقة التقديم":"Serving selection"}">${product.servings.map(option=>`<button type="button" data-serving="${option}" aria-pressed="${serving===option}">${language==="ar"?(option==="Hot"?"حار":"مثلج"):option}</button>`).join("")}</div>`}
      <button class="details-button" type="button" data-details="${product.id}"><span data-en="View Details" data-ar="عرض التفاصيل">${language==="ar"?"عرض التفاصيل":"View Details"}</span><span aria-hidden="true">↗</span></button></div>
    </div></article>`;
}

function renderProducts(){
  const query=$("#productSearch").value.trim().toLocaleLowerCase();
  const category=$("#categoryFilter").value;
  const matches=PRODUCTS.filter(product=>{
    const searchable=`${product.name} ${product.ar} ${product.category}`.toLocaleLowerCase();
    return (category==="all"||product.category===category)&&(!query||searchable.includes(query));
  });
  $("#productGrid").innerHTML=matches.map(productCard).join("");
  $("#resultCount").textContent=language==="ar"?`${matches.length} من ${PRODUCTS.length} مشروبات`:`${matches.length} of ${PRODUCTS.length} drinks`;
  $("#emptyState").hidden=matches.length>0;
  $("#productGrid").hidden=matches.length===0;
  $("#clearFilters").classList.toggle("visible",Boolean(query)||category!=="all");
}

function applyTranslations(){
  root.lang=language;
  root.dir=language==="ar"?"rtl":"ltr";
  $$("[data-en][data-ar]").forEach(element=>{element.innerHTML=element.dataset[language];});
  $$("[data-alt-en][data-alt-ar]").forEach(element=>{element.alt=element.dataset[`alt${language==="en"?"En":"Ar"}`];});
  $$("[data-placeholder-en][data-placeholder-ar]").forEach(element=>{element.placeholder=element.dataset[`placeholder${language==="en"?"En":"Ar"}`];});
  $("#languageToggle").innerHTML=`<span${language==="en"?' class="current-language"':""}>EN</span><span aria-hidden="true"> / </span><span${language==="ar"?' class="current-language"':""}>AR</span>`;
  $("#languageToggle").setAttribute("aria-label",language==="en"?"Language: English. Switch to Arabic":"اللغة: العربية. التبديل إلى الإنجليزية");
  $("#themeLabel").textContent=root.dataset.theme==="dark"?(language==="ar"?"فاتح":"Light"):(language==="ar"?"داكن":"Dark");
  $("#themeToggle").setAttribute("aria-label",root.dataset.theme==="dark"?(language==="ar"?"التبديل إلى الوضع الفاتح":"Switch to light mode"):(language==="ar"?"التبديل إلى الوضع الداكن":"Switch to dark mode"));
  $("#menuToggle").setAttribute("aria-label",language==="ar"?"فتح قائمة التنقل":"Open navigation");
  $(".main-nav").setAttribute("aria-label",language==="ar"?"التنقل الرئيسي":"Main navigation");
  $(".brand").setAttribute("aria-label",language==="ar"?"الصفحة الرئيسية لمحسوب":"MAHSOUB home");
  $("#modalClose").setAttribute("aria-label",language==="ar"?"إغلاق تفاصيل المنتج":"Close product details");
  document.title=language==="ar"?"محسوب — كل رشفة محسوبة.":"MAHSOUB — Every Sip Counts.";
  renderProducts();
  if(!$("#productModal").hidden)openProduct($("#productModal").dataset.productId,false);
}

function setLanguage(next){language=next;localStorage.setItem("mahsoub-language",next);applyTranslations();}

function showPage(page,writeHistory=true){
  if(!$("#"+page))return;
  activePage=page;
  $$(".page-view").forEach(view=>view.classList.toggle("active",view.id===page));
  $$(".nav-link").forEach(link=>link.classList.toggle("active",link.dataset.page===page));
  $("#menuToggle").setAttribute("aria-expanded","false");
  $(".main-nav").classList.remove("open");
  if(writeHistory&&location.hash!==`#${page}`)history.pushState({page},"",`#${page}`);
  window.scrollTo({top:0,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});
}

function openProduct(id,focus=true){
  const product=PRODUCTS.find(item=>item.id===id);if(!product)return;
  const modal=$("#productModal");
  modal.dataset.productId=id;
  $("#modalVisual").innerHTML=`<img src="${product.image}" alt="${escapeHTML(language==="ar"?product.ar:product.name)}">`;
  $("#modalTitle").textContent=product.name;
  $("#modalArabic").textContent=product.ar;
  $("#modalPrice").textContent=money(product.price);
  const description=$("#modalDescription");
  if(product.ingredients){
    const ingredientList=language==="ar"?product.arIngredients:product.ingredients;
    description.hidden=false;
    description.innerHTML=`<span class="ingredients-label">${language==="ar"?"المكونات":"Ingredients"}</span>${ingredientList.map(escapeHTML).join(language==="ar"?"، ":", ")}`;
  }else{
    description.hidden=true;
    description.textContent="";
  }
  const stats=language==="ar"
    ?[["السعرات",product.calories,"سعرة"],["الكربوهيدرات",product.carbs,"غ"],["الدهون",product.fat,"غ"],["البروتين",product.protein,"غ"]]
    :[["Calories",product.calories,"kcal"],["Carbs",product.carbs,"g"],["Fat",product.fat,"g"],["Protein",product.protein,"g"]];
  $("#nutritionGrid").innerHTML=stats.map(([label,value,unit])=>`<div class="nutrition-stat"><strong>${value}</strong><span>${label} · ${unit}</span></div>`).join("");
  const serving=cardServings[id]||"Iced";
  $("#servingOptions").innerHTML=product.water
    ?`<span class="serving-chip" aria-label="${language==="ar"?"ماء عادي معبأ":"Regular bottled water"}">${language==="ar"?"ماء عادي معبأ":"Regular bottled water"}</span>`
    :product.servings.map(option=>`<button class="serving-chip" type="button" data-modal-serving="${option}" aria-pressed="${option===serving}">${language==="ar"?(option==="Hot"?"حار":"مثلج"):option}</button>`).join("");
  modal.hidden=false;
  document.body.classList.add("modal-open");
  if(focus)lastFocus=document.activeElement;
  $("#modalClose").focus();
}

function closeModal(){
  const modal=$("#productModal");if(modal.hidden)return;
  modal.hidden=true;
  document.body.classList.remove("modal-open");
  if(lastFocus&&lastFocus.focus)lastFocus.focus();
}

function setServing(productId,serving){
  cardServings[productId]=serving;
  const card=$(`[data-product="${productId}"]`);
  if(card)$$("[data-serving]",card).forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.serving===serving)));
  if(!$("#productModal").hidden&&$("#productModal").dataset.productId===productId)
    $$("[data-modal-serving]",$("#servingOptions")).forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.modalServing===serving)));
}

document.addEventListener("click",event=>{
  const pageLink=event.target.closest("[data-page]");
  if(pageLink){event.preventDefault();showPage(pageLink.dataset.page);return;}
  const go=event.target.closest("[data-go]");
  if(go){showPage(go.dataset.go);return;}
  const serving=event.target.closest("[data-serving]");
  if(serving){event.stopPropagation();setServing(serving.closest("[data-product]").dataset.product,serving.dataset.serving);return;}
  const modalServing=event.target.closest("[data-modal-serving]");
  if(modalServing){setServing($("#productModal").dataset.productId,modalServing.dataset.modalServing);return;}
  const detail=event.target.closest("[data-details]");
  if(detail){event.stopPropagation();openProduct(detail.dataset.details);return;}
  const card=event.target.closest(".product-card");
  if(card){openProduct(card.dataset.product);return;}
});

document.addEventListener("keydown",event=>{
  if(event.key==="Escape"){
    closeModal();
    $("#menuToggle").setAttribute("aria-expanded","false");
    $(".main-nav").classList.remove("open");
  }
  if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="k"){event.preventDefault();showPage("menu");$("#productSearch").focus();}
  if((event.key==="Enter"||event.key===" ")&&event.target.matches(".product-card")){event.preventDefault();openProduct(event.target.dataset.product);}
  if(event.key==="Tab"&&!$("#productModal").hidden){
    const focusables=$$('button,[href],input,select,textarea,[tabindex="0"]',$("#productModal")).filter(element=>!element.disabled);
    if(event.shiftKey&&document.activeElement===focusables[0]){event.preventDefault();focusables.at(-1).focus();}
    else if(!event.shiftKey&&document.activeElement===focusables.at(-1)){event.preventDefault();focusables[0].focus();}
  }
});

$("#languageToggle").addEventListener("click",()=>setLanguage(language==="en"?"ar":"en"));
$("#themeToggle").addEventListener("click",()=>{
  root.dataset.theme=root.dataset.theme==="dark"?"light":"dark";
  localStorage.setItem("mahsoub-theme",root.dataset.theme);
  applyTranslations();
});
$("#menuToggle").addEventListener("click",()=>{
  const open=$("#menuToggle").getAttribute("aria-expanded")!=="true";
  $("#menuToggle").setAttribute("aria-expanded",String(open));
  $(".main-nav").classList.toggle("open",open);
});
$("#productSearch").addEventListener("input",renderProducts);
$("#categoryFilter").addEventListener("change",renderProducts);
function resetFilters(){$("#productSearch").value="";$("#categoryFilter").value="all";renderProducts();$("#productSearch").focus();}
$("#clearFilters").addEventListener("click",resetFilters);
$("#emptyReset").addEventListener("click",resetFilters);
$("#modalClose").addEventListener("click",closeModal);
$("#productModal").addEventListener("click",event=>{if(event.target===$("#productModal"))closeModal();});
$("#productSearch").addEventListener("keydown",event=>{if(event.key==="Escape"&&event.currentTarget.value){event.currentTarget.value="";renderProducts();}});

const contactForm=$("#contactForm");
contactForm.addEventListener("input",event=>{
  if(event.target.matches("input,textarea"))event.target.removeAttribute("aria-invalid");
  $("#formStatus").textContent="";
  $("#formStatus").className="form-status";
});
contactForm.addEventListener("submit",event=>{
  event.preventDefault();
  const fields=[$("#contactName"),$("#contactEmail"),$("#contactMessage")];
  let invalid=null;
  for(const field of fields){
    const value=field.value.trim();
    const bad=!value||(field.type==="email"&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
    field.setAttribute("aria-invalid",String(bad));
    if(bad&&!invalid)invalid=field;
  }
  const status=$("#formStatus");
  if(invalid){
    status.textContent=language==="ar"?"يرجى إدخال اسمك وبريد إلكتروني صحيح ورسالة.":"Please enter your name, a valid email address, and a message.";
    status.className="form-status error";
    invalid.focus();
    return;
  }
  const name=$("#contactName").value.trim();
  const email=$("#contactEmail").value.trim();
  const message=$("#contactMessage").value.trim();
  const subject=encodeURIComponent("MAHSOUB website message");
  const body=encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
  status.textContent=language==="ar"?"سيفتح تطبيق البريد برسالتك. اضغط إرسال لإيصالها إلينا.":"Your email app will open with your message. Press Send there to deliver it.";
  status.className="form-status success";
  window.location.href=`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
});

window.addEventListener("popstate",()=>showPage(location.hash.slice(1)||"home",false));
const savedTheme=localStorage.getItem("mahsoub-theme");
root.dataset.theme=savedTheme==="dark"?"dark":"light";
applyTranslations();
const initialPage=location.hash.slice(1);
if(["home","menu","about","contact"].includes(initialPage))showPage(initialPage,false);
