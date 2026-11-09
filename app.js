const PRODUCTS = [
  {id:"matcha",name:"Matcha",ar:"ماتشا",category:"matcha",price:1.500,calories:39,carbs:12,fat:2.2,protein:1,ingredients:["Matcha","Erythritol","Almond Milk"],arIngredients:["ماتشا","إريثريتول","حليب اللوز"],image:"attached_assets/generated_images/matcha.jpg",servings:["Hot","Iced"]},
  {id:"chocolate-milk",name:"Chocolate Milk",ar:"حليب كاكاو",category:"chocolate",price:1.000,calories:50,carbs:4.8,fat:0.9,protein:4,ingredients:["Skimmed Milk","Organic Cocoa Powder"],arIngredients:["حليب خالي الدسم","مسحوق كاكاو عضوي"],image:"attached_assets/generated_images/chocolate-milk.jpg",servings:["Hot","Iced"]},
  {id:"coffee-latte",name:"Coffee Latte",ar:"كوفي لاتيه",category:"coffee",price:1.250,calories:57,carbs:10,fat:1,protein:2,ingredients:["Low-fat Milk","Espresso Shot","Zero-Calorie Caramel Syrup","Stevia","Erythritol"],arIngredients:["حليب قليل الدسم","شوت إسبريسو","سيرب كراميل خالي من السعرات","ستيفيا","إريثريتول"],image:"attached_assets/generated_images/coffee-latte.jpg",servings:["Hot","Iced"]},
  {id:"americano",name:"Americano",ar:"أمريكانو",category:"coffee",price:1.000,calories:0,carbs:0,fat:0,protein:0,ingredients:["Espresso Shot","Water","Ice"],arIngredients:["شوت إسبريسو","ماء","ثلج"],image:"attached_assets/generated_images/americano.jpg",servings:["Hot","Iced"]},
  {id:"water",name:"Water",ar:"ماء",category:"water",price:0.250,calories:0,carbs:0,fat:0,protein:0,ingredients:["Regular bottled water"],arIngredients:["ماء عادي معبأ"],image:"attached_assets/generated_images/water.jpg",servings:[],water:true}
];
const BESTSELLER_IDS=["matcha","chocolate-milk","coffee-latte","americano"];
const CONTACT_EMAIL="saraahdi04@icloud.com";

const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const root=document.documentElement;
let language=localStorage.getItem("mahsoub-language")==="ar"?"ar":"en";
let activePage="home",lastFocus=null,cardServings={};
let cart=[],cartConfirmation=null,cartFocus=null;
try{
  const savedCart=JSON.parse(localStorage.getItem("mahsoub-cart")||"[]");
  if(Array.isArray(savedCart))cart=savedCart.filter(item=>{
    if(!item||!Number.isSafeInteger(item.quantity)||item.quantity<=0)return false;
    const product=PRODUCTS.find(product=>product.id===item.id);
    return product&&(product.water?item.serving==="none":product.servings.includes(item.serving));
  });
}catch{cart=[];}

function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function money(price){return `${Number(price).toFixed(3)} KWD`;}
function ingredientMarkup(product){
  const ingredients=language==="ar"?product.arIngredients:product.ingredients;
  return ingredients?`<span class="ingredients-label">${language==="ar"?"المكونات":"Ingredients"}</span><span class="ingredient-list">${ingredients.map(escapeHTML).join(language==="ar"?"، ":", ")}</span>`:"";
}
function nutritionSummary(product){
  return language==="ar"
    ?`${product.calories} سعرة · ${product.carbs} غ كربوهيدرات · ${product.fat} غ دهون · ${product.protein} غ بروتين · لكل حصة`
    :`${product.calories} kcal · ${product.carbs} g carbs · ${product.fat} g fat · ${product.protein} g protein · per serving`;
}
function calorieDisplay(product){
  const value=Number(product.calories);
  const width=value===0?0:Math.max(4,Math.min(100,value/57*100));
  const label=language==="ar"?`${value} سعرة`:`${value} kcal`;
  return `<div class="calorie-display" role="progressbar" aria-label="${language==="ar"?"السعرات الحرارية لكل حصة":"Calories per serving"}" aria-valuemin="0" aria-valuemax="57" aria-valuenow="${value}" aria-valuetext="${label}"><span class="calorie-track" aria-hidden="true"><span class="calorie-fill" style="width:${width}%"></span></span><span class="calorie-value">${label}</span></div>`;
}
function productCard(product){
  const serving=cardServings[product.id]||"Iced";
  return `<article class="product-card" data-product="${product.id}" tabindex="0" aria-label="${escapeHTML(product.name)} — ${escapeHTML(product.ar)}">
    <div class="product-visual"><img src="${product.image}" alt="${escapeHTML(language==="ar"?product.ar:product.name)}"></div>
    <div class="product-info"><div class="product-topline"><h2 class="product-name">${escapeHTML(product.name)}</h2><span class="product-price">${money(product.price)}</span></div>
      <p class="product-arabic" lang="ar" dir="rtl">${escapeHTML(product.ar)}</p>
       <p class="card-ingredients">${ingredientMarkup(product)}</p>
       ${calorieDisplay(product)}<p class="product-cal">${nutritionSummary(product)}</p>
      <div class="card-controls">${product.water?`<span class="water-tag">${language==="ar"?"ماء عادي معبأ":"Regular bottled water"}</span>`:`<div class="serve-switch" role="group" aria-label="${language==="ar"?"طريقة التقديم":"Serving selection"}">${product.servings.map(option=>`<button type="button" data-serving="${option}" aria-pressed="${serving===option}">${language==="ar"?(option==="Hot"?"حار":"مثلج"):option}</button>`).join("")}</div>`}
      <button class="details-button" type="button" data-details="${product.id}"><span data-en="View Details" data-ar="عرض التفاصيل">${language==="ar"?"عرض التفاصيل":"View Details"}</span><span aria-hidden="true">↗</span></button><button class="add-cart-button" type="button" data-add-cart="${product.id}">${language==="ar"?"أضف إلى السلة":"Add to Cart"}</button></div>
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
function featuredCard(product){
  const serving=cardServings[product.id]||"Iced";
  return `<article class="featured-card" data-featured-product="${product.id}">
    <img src="${product.image}" alt="${escapeHTML(language==="ar"?product.ar:product.name)}">
    <div class="featured-info"><h3>${escapeHTML(product.name)}</h3><p class="product-arabic" lang="ar" dir="rtl">${escapeHTML(product.ar)}</p><span class="product-price">${money(product.price)}</span><p class="card-ingredients">${ingredientMarkup(product)}</p>${calorieDisplay(product)}
    ${product.water?"":`<div class="serve-switch" role="group" aria-label="${language==="ar"?"طريقة التقديم":"Serving selection"}">${product.servings.map(option=>`<button type="button" data-serving="${option}" aria-pressed="${serving===option}">${language==="ar"?(option==="Hot"?"حار":"مثلج"):option}</button>`).join("")}</div>`}
    <button class="add-cart-button" type="button" data-add-cart="${product.id}">${language==="ar"?"أضف إلى السلة":"Add to Cart"}</button></div>
  </article>`;
}

function renderFeatured(){ $("#featuredGrid").innerHTML=PRODUCTS.slice(0,3).map(featuredCard).join(""); }
function saveCart(){localStorage.setItem("mahsoub-cart",JSON.stringify(cart));}
function cartItemCount(){return cart.reduce((total,item)=>total+item.quantity,0);}
function currentServing(id){return PRODUCTS.find(item=>item.id===id)?.water?"none":cardServings[id]||"Iced";}
function addToCart(id,serving=currentServing(id)){
  const product=PRODUCTS.find(item=>item.id===id);if(!product)return;
  const chosen=product.water?"none":serving;
  const existing=cart.find(item=>item.id===id&&item.serving===chosen);
  if(existing)existing.quantity+=1;else cart.push({id,serving:chosen,quantity:1});
  cartConfirmation=null;saveCart();renderCart();renderCartCount();
  const button=$("#cartToggle");
  button.setAttribute("aria-label",language==="ar"?`فتح السلة، ${cartItemCount()} عناصر`:`Open shopping cart, ${cartItemCount()} items`);
}
function renderCartCount(){
  $("#cartCount").textContent=cartItemCount();
  $("#cartToggle").setAttribute("aria-label",language==="ar"?`فتح السلة، ${cartItemCount()} عناصر`:`Open shopping cart, ${cartItemCount()} items`);
}
function renderCart(){
  const content=$("#cartContent");
  if(cartConfirmation){
    const lines=cartConfirmation.items.map(item=>{
      const product=PRODUCTS.find(entry=>entry.id===item.id);
      return `<div class="confirmation-line"><span>${escapeHTML(language==="ar"?product.ar:product.name)} × ${item.quantity}${item.serving==="none"?"":` · ${language==="ar"?(item.serving==="Hot"?"حار":"مثلج"):item.serving}`}</span><strong>${money(product.price*item.quantity)}</strong></div>`;
    }).join("");
    content.innerHTML=`<div class="order-confirmation" role="status"><span class="confirmation-mark" aria-hidden="true">✓</span><h3>${language==="ar"?"تم تأكيد طلبكم محلياً":"Order confirmed locally"}</h3><p>${language==="ar"?"تم حفظ تأكيدك في هذه الصفحة فقط. لم يتم إرسال أي طلب حقيقي أو معالجة أي دفعة.":"This confirmation exists on this page only. No real order was sent and no payment was processed."}</p><div class="confirmation-lines">${lines}<div class="confirmation-line"><strong>${language==="ar"?"الإجمالي":"Total"}</strong><strong>${money(cartConfirmation.total)}</strong></div></div><button class="button button-dark" type="button" id="confirmationDone">${language==="ar"?"متابعة التصفح":"Continue browsing"}</button></div>`;
    return;
  }
  if(!cart.length){
    content.innerHTML=`<div class="cart-empty"><span class="cart-empty-mark" aria-hidden="true">—</span><h3>${language==="ar"?"سلتكم فارغة":"Your basket is empty"}</h3><p>${language==="ar"?"اختاروا مشروباً من القائمة للبدء.":"Choose a drink from the menu to get started."}</p><button class="button button-dark" type="button" id="cartBrowse">${language==="ar"?"استكشفوا القائمة":"Browse the menu"}</button></div>`;
    return;
  }
  const subtotal=cart.reduce((sum,item)=>sum+PRODUCTS.find(product=>product.id===item.id).price*item.quantity,0);
  const items=cart.map(item=>{
    const product=PRODUCTS.find(entry=>entry.id===item.id);
    const serving=item.serving==="none"?(language==="ar"?"ماء عادي معبأ":"Regular bottled water"):(language==="ar"?(item.serving==="Hot"?"حار":"مثلج"):item.serving);
    return `<article class="cart-item"><img src="${product.image}" alt=""><div><h3>${escapeHTML(language==="ar"?product.ar:product.name)}</h3><p>${serving} · ${money(product.price)} ${language==="ar"?"للوحدة":"each"}</p><div class="quantity-control" aria-label="${language==="ar"?"الكمية":"Quantity"}"><button type="button" data-quantity="-1" data-key="${item.id}|${item.serving}" aria-label="${language==="ar"?"تقليل الكمية":"Decrease quantity"}">−</button><output>${item.quantity}</output><button type="button" data-quantity="1" data-key="${item.id}|${item.serving}" aria-label="${language==="ar"?"زيادة الكمية":"Increase quantity"}">+</button></div><button class="remove-item" type="button" data-remove="${item.id}|${item.serving}">${language==="ar"?"إزالة":"Remove"}</button></div><strong class="cart-item-price">${money(product.price*item.quantity)}</strong></article>`;
  }).join("");
  content.innerHTML=`<div class="cart-items">${items}</div><div class="cart-summary"><div class="summary-row"><span>${language==="ar"?"عدد العناصر":"Items"} (${cartItemCount()})</span><strong>${money(subtotal)}</strong></div><div class="summary-row"><span>${language==="ar"?"المجموع الفرعي":"Subtotal"}</span><strong>${money(subtotal)}</strong></div><div class="summary-row total"><span>${language==="ar"?"الإجمالي":"Total"}</span><strong>${money(subtotal)}</strong></div><button class="button button-dark checkout-button" id="checkoutButton" type="button">${language==="ar"?"تأكيد الطلب":"Checkout"} <span aria-hidden="true">↗</span></button><p class="local-order-note">${language==="ar"?"تأكيد محلي فقط — لن يتم إرسال طلب حقيقي أو معالجة دفعة.":"Local-only confirmation — no real order is sent and no payment is processed."}</p></div>`;
}
function openCart(){
  cartFocus=document.activeElement;$("#cartOverlay").hidden=false;document.body.classList.add("modal-open");renderCart();$("#cartClose").focus();
}
function closeCart(){
  if($("#cartOverlay").hidden)return;
  $("#cartOverlay").hidden=true;document.body.classList.remove("modal-open");cartConfirmation=null;
  if(cartFocus?.focus)cartFocus.focus();
}
function updateCartItem(key,delta){
  const [id,serving]=key.split("|");
  const item=cart.find(entry=>entry.id===id&&entry.serving===serving);if(!item)return;
  item.quantity+=delta;
  if(item.quantity<=0)cart=cart.filter(entry=>entry!==item);
  saveCart();renderCart();renderCartCount();
  ($(`[data-quantity="${delta}"][data-key="${key}"]`)||$("#cartClose")).focus();
}
function checkout(){
  const items=cart.map(item=>({...item}));
  const total=items.reduce((sum,item)=>sum+PRODUCTS.find(product=>product.id===item.id).price*item.quantity,0);
  cartConfirmation={items,total};cart=[];saveCart();renderCartCount();renderCart();
  $("#confirmationDone").focus();
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
  $("#cartClose").setAttribute("aria-label",language==="ar"?"إغلاق سلة التسوق":"Close shopping cart");
  document.title=language==="ar"?"محسوب — كل رشفة محسوبة.":"MAHSOUB — Every Sip Counts.";
  renderProducts();
  renderFeatured();
  renderCartCount();
  if(!$("#cartOverlay").hidden)renderCart();
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
    description.hidden=false;
    description.innerHTML=ingredientMarkup(product);
  }else{
    description.hidden=true;
    description.textContent="";
  }
  const stats=language==="ar"
    ?[["السعرات",product.calories,"سعرة"],["الكربوهيدرات",product.carbs,"غ"],["الدهون",product.fat,"غ"],["البروتين",product.protein,"غ"]]
    :[["Calories",product.calories,"kcal"],["Carbs",product.carbs,"g"],["Fat",product.fat,"g"],["Protein",product.protein,"g"]];
  $("#nutritionGrid").innerHTML=stats.map(([label,value,unit],index)=>`<div class="nutrition-stat">${index===0?`<strong>${value}</strong><span>${label} · ${unit}</span><span class="nutrition-mini-track" aria-hidden="true"><span style="width:${value===0?0:Math.max(4,Math.min(100,Number(value)/57*100))}%"></span></span><span class="sr-only">${language==="ar"?`${value} سعرة حرارية لكل حصة`:`${value} kcal per serving`}</span>`:`<strong>${value}</strong><span>${label} · ${unit}</span>`}</div>`).join("");
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
  $$(`[data-product="${productId}"],[data-featured-product="${productId}"]`).forEach(card=>{
    $$("[data-serving]",card).forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.serving===serving)));
  });
  if(!$("#productModal").hidden&&$("#productModal").dataset.productId===productId)
    $$("[data-modal-serving]",$("#servingOptions")).forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.modalServing===serving)));
}

document.addEventListener("click",event=>{
  const pageLink=event.target.closest("[data-page]");
  if(pageLink){event.preventDefault();showPage(pageLink.dataset.page);return;}
  const go=event.target.closest("[data-go]");
  if(go){showPage(go.dataset.go);return;}
  const serving=event.target.closest("[data-serving]");
  if(serving){event.stopPropagation();const holder=serving.closest("[data-product],[data-featured-product]");setServing(holder.dataset.product||holder.dataset.featuredProduct,serving.dataset.serving);return;}
  const modalServing=event.target.closest("[data-modal-serving]");
  if(modalServing){setServing($("#productModal").dataset.productId,modalServing.dataset.modalServing);return;}
  const add=event.target.closest("[data-add-cart]");
  if(add){event.stopPropagation();addToCart(add.dataset.addCart);openCart();return;}
  const detail=event.target.closest("[data-details]");
  if(detail){event.stopPropagation();openProduct(detail.dataset.details);return;}
  if(event.target.closest("#cartToggle")){openCart();return;}
  if(event.target.closest("#cartClose")){closeCart();return;}
  if(event.target.closest("#modalAddToCart")){const id=$("#productModal").dataset.productId;addToCart(id,currentServing(id));closeModal();openCart();return;}
  if(event.target.closest("#checkoutButton")){checkout();return;}
  if(event.target.closest("#cartBrowse")){closeCart();showPage("menu");return;}
  if(event.target.closest("#confirmationDone")){closeCart();return;}
  const quantity=event.target.closest("[data-quantity]");
  if(quantity){updateCartItem(quantity.dataset.key,Number(quantity.dataset.quantity));return;}
  const remove=event.target.closest("[data-remove]");
  if(remove){const [id,servingValue]=remove.dataset.remove.split("|");cart=cart.filter(item=>!(item.id===id&&item.serving===servingValue));saveCart();renderCart();renderCartCount();$("#cartClose").focus();return;}
  if(event.target===$("#cartOverlay")){closeCart();return;}
  const card=event.target.closest(".product-card");
  if(card){openProduct(card.dataset.product);return;}
});

document.addEventListener("keydown",event=>{
  if(event.key==="Escape"){
    closeModal();
    closeCart();
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
  if(event.key==="Tab"&&!$("#cartOverlay").hidden){
    const focusables=$$('button,[href],input,select,textarea,[tabindex="0"]',$("#cartOverlay")).filter(element=>!element.disabled);
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
$("#modalClose").addEventListener("click",closeModal);
$("#productModal").addEventListener("click",event=>{if(event.target===$("#productModal"))closeModal();});
$("#productSearch").addEventListener("keydown",event=>{if(event.key==="Escape"&&event.currentTarget.value){event.currentTarget.value="";renderProducts();}});

const contactForm=$("#contactForm");
const heroVideo=$(".hero-video");
const heroSource=$("source",heroVideo);
const reducedMotion=matchMedia("(prefers-reduced-motion: reduce)");
function stopHeroVideo(){
  heroVideo.hidden=true;
}
function syncHeroMotion(){
  if(reducedMotion.matches){heroVideo.pause();stopHeroVideo();return;}
  heroVideo.hidden=false;
  if(!heroSource.getAttribute("src")){heroSource.src=heroSource.dataset.src;heroVideo.load();}
  heroVideo.play().catch(stopHeroVideo);
}
heroVideo.addEventListener("error",stopHeroVideo);
heroSource.addEventListener("error",stopHeroVideo);
reducedMotion.addEventListener("change",syncHeroMotion);
syncHeroMotion();
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
    const bad=!value||value.length>field.maxLength||(field.type==="email"&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
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
  status.textContent=language==="ar"
    ?"من المفترض أن يفتح تطبيق البريد مسودةً لرسالتك. اضغط إرسال لإيصالها؛ لا يمكن لهذه الصفحة تأكيد التسليم."
    :"Your email app should open with a draft. Press Send there to deliver it; this page cannot confirm delivery.";
  status.className="form-status";
  window.location.href=`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
});

window.addEventListener("popstate",()=>showPage(location.hash.slice(1)||"home",false));
const savedTheme=localStorage.getItem("mahsoub-theme");
root.dataset.theme=savedTheme==="dark"?"dark":"light";
applyTranslations();
const initialPage=location.hash.slice(1);
if(["home","menu","about","contact"].includes(initialPage))showPage(initialPage,false);
