const CATEGORIES = ["Uniformes", "Calzado", "Chaquetas", "Mochilas", "Abrigos", "Gorras", "Accesorios"];
const ADMIN_PASS = "589";
const WA_NUMBER = "51955802712";
const COLOR_HEX = {
  "Olivo": "#5c6b3a", "Negro": "#1a1a1a", "Coyote": "#c4a574",
  "Verde": "#2d5a27", "Blanco": "#f5f5f0", "Gris": "#6b6b6b",
  "Café": "#6b4423", "Camuflaje": "#4a5c3a"
};

const DEFAULT_PRODUCTS = [
  {
    id: 1, name: "GATO 589", category: "Uniformes", price: 189.90,
    description: "Uniforme táctico de alta resistencia, ideal para operaciones. Incluye camisa y pantalón.",
    image: "https://www.santevet.es/wp-content/uploads/2024/02/gatocomuneuropeo-97.jpg",
    variants: [
      { size: "S", colors: [{ color: "Olivo", qty: 10 }, { color: "Negro", qty: 8 }] },
      { size: "M", colors: [{ color: "Olivo", qty: 15 }, { color: "Negro", qty: 12 }] },
      { size: "L", colors: [{ color: "Olivo", qty: 7 }, { color: "Negro", qty: 5 }] }
    ]
  },
  {
    id: 2, name: "Botas Tácticas", category: "Calzado", price: 149.00,
    description: "Botas de combate impermeables, suela antideslizante.",
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400",
    variants: [
      { size: "40", colors: [{ color: "Negro", qty: 6 }] },
      { size: "42", colors: [{ color: "Negro", qty: 10 }, { color: "Café", qty: 4 }] },
      { size: "44", colors: [{ color: "Negro", qty: 8 }] }
    ]
  },
  {
    id: 3, name: "Chaqueta Softshell", category: "Chaquetas", price: 129.50,
    description: "Chaqueta impermeable y transpirable para clima variable.",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
    variants: [
      { size: "M", colors: [{ color: "Negro", qty: 9 }, { color: "Verde", qty: 5 }] },
      { size: "L", colors: [{ color: "Negro", qty: 11 }] }
    ]
  },
  {
    id: 4, name: "Mochila Táctica 40L", category: "Mochilas", price: 99.90,
    description: "Mochila modular con múltiples compartimentos y sistema MOLLE.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
    variants: [
      { size: null, colors: [{ color: "Olivo", qty: 20 }, { color: "Negro", qty: 15 }, { color: "Camuflaje", qty: 8 }] }
    ]
  },
  {
    id: 5, name: "Abrigo Polar", category: "Abrigos", price: 79.00,
    description: "Abrigo térmico polar para clima frío.",
    image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400",
    variants: [
      { size: "S", colors: [{ color: "Negro", qty: 4 }] },
      { size: "M", colors: [{ color: "Negro", qty: 7 }, { color: "Gris", qty: 3 }] },
      { size: "L", colors: [{ color: "Negro", qty: 5 }] }
    ]
  },
  {
    id: 6, name: "Gorra Táctica", category: "Gorras", price: 29.90,
    description: "Gorra ajustable con velcro para parches.",
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400",
    variants: [
      { size: null, colors: [{ color: "Negro", qty: 25 }, { color: "Olivo", qty: 18 }] }
    ]
  },
  {
    id: 7, name: "Cinturón Táctico", category: "Accesorios", price: 39.00,
    description: "Cinturón de nylon de alta resistencia con hebilla rápida.",
    image: "https://images.unsplash.com/photo-1624222247344-550fb60583fd?w=400",
    variants: [
      { size: null, colors: [{ color: "Negro", qty: 30 }, { color: "Coyote", qty: 12 }] }
    ]
  }
];

let products = [];
let cart = [];
let currentCategory = null;
let editingId = null;

function loadData() {
  products = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
  const stockMap = JSON.parse(localStorage.getItem("tm_stock") || "{}");
  products.forEach(p => {
    p.variants.forEach(v => {
      const sizeKey = v.size === null || v.size === "" ? "_" : v.size;
      v.colors.forEach(c => {
        const key = p.id + "|" + sizeKey + "|" + c.color;
        if (stockMap[key] !== undefined) c.qty = stockMap[key];
      });
    });
  });
  const savedCart = localStorage.getItem("tm_cart");
  cart = savedCart ? JSON.parse(savedCart) : [];
  updateCartUI();
}

function saveProducts() {
  const stockMap = {};
  products.forEach(p => {
    p.variants.forEach(v => {
      const sizeKey = v.size === null || v.size === "" ? "_" : v.size;
      v.colors.forEach(c => {
        stockMap[p.id + "|" + sizeKey + "|" + c.color] = c.qty;
      });
    });
  });
  localStorage.setItem("tm_stock", JSON.stringify(stockMap));
}

function saveCart() {
  localStorage.setItem("tm_cart", JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById("cart-count").textContent = count;
  renderSidebar();
}

function showNotification(msg) {
  const n = document.getElementById("notification");
  n.textContent = msg;
  n.classList.add("show");
  setTimeout(() => n.classList.remove("show"), 2000);
}

function closeAll() {
  document.getElementById("cart-sidebar").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
}

function toggleCartSidebar() {
  const sb = document.getElementById("cart-sidebar");
  const ov = document.getElementById("overlay");
  if (sb.classList.contains("open")) closeAll();
  else { sb.classList.add("open"); ov.classList.add("show"); renderSidebar(); }
}

function renderSidebar() {
  const cont = document.getElementById("cart-sidebar-items");
  if (cart.length === 0) {
    cont.innerHTML = "<p>Carrito vacío</p>";
    document.getElementById("sidebar-total").textContent = "0.00";
    return;
  }
  let html = "", total = 0;
  cart.forEach(item => {
    const sub = item.price * item.qty; total += sub;
    html += `<div class="sidebar-item"><img src="${item.image}" alt=""><div><strong>${item.name}</strong><br>${item.size ? "Talla: " + item.size + " | " : ""}Color: ${item.color}<br>${item.qty} x S/ ${item.price.toFixed(2)}</div></div>`;
  });
  cont.innerHTML = html;
  document.getElementById("sidebar-total").textContent = total.toFixed(2);
}

function showHome(cat = null) {
  currentCategory = cat;
  const main = document.getElementById("main-content");
  let html = "";
  if (!cat) {
    html += `<div class="hero"><div class="hero-label">Equipo de servicio</div><h1>Catálogo táctico</h1><p>Uniformes, calzado, chalecos, gorras y accesorios. Vista simple del catálogo; ficha completa al entrar en cada producto. Precios en soles.</p><div class="hero-btns"><button class="btn" onclick="document.getElementById('cat-section').scrollIntoView({behavior:'smooth'})">Ver catálogo →</button><button class="btn btn-secondary" onclick="showHome('Uniformes')">Uniformes</button></div></div>`;
  }
  html += `<div class="categories" id="cat-section">`;
  html += `<button class="cat-btn ${!cat ? "active" : ""}" onclick="showHome()">Todos</button>`;
  CATEGORIES.forEach(c => { html += `<button class="cat-btn ${cat === c ? "active" : ""}" onclick="showHome('${c}')">${c}</button>`; });
  html += `</div>`;
  const featured = (cat ? products.filter(p => p.category === cat) : products).slice(0, 4);
  if (!cat) {
    html += `<div class="featured"><h2 class="section-title">Destacados</h2><div class="products-grid">`;
    featured.forEach(p => { html += productCard(p); });
    html += `</div></div>`;
  }
  const list = cat ? products.filter(p => p.category === cat) : products;
  html += `<h2 class="section-title">${cat || "Todos los productos"}</h2><div class="products-grid">`;
  if (list.length === 0) html += "<p>No hay productos en esta categoría.</p>";
  else list.forEach(p => { html += productCard(p); });
  html += `</div>`;
  main.innerHTML = html;
}

function productCard(p) {
  let totalStock = 0;
  p.variants.forEach(v => v.colors.forEach(c => totalStock += c.qty));
  return `<div class="product-card" onclick="showProduct(${p.id})"><img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Sin+imagen'"><div class="info"><div class="cat-label">${p.category}</div><h3>${p.name}</h3><div class="price">S/ ${p.price.toFixed(2)}</div><div class="stock">${totalStock} disponibles</div></div></div>`;
}

function showProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  window._currentProductId = id;
  const hasSize = p.variants.some(v => v.size !== null && v.size !== "");
  const sizes = hasSize ? p.variants.filter(v => v.size).map(v => v.size) : [];
  window._selSize = sizes[0] || null;
  const firstVar = hasSize ? p.variants.find(v => v.size === window._selSize) : p.variants[0];
  window._selColor = firstVar?.colors?.[0]?.color || null;
  const images = (p.images && p.images.length) ? p.images : [p.image];

  let thumbs = "";
  if (images.length > 1) {
    thumbs = `<div class="thumbs">` + images.map((src, i) =>
      `<button type="button" class="${i===0?"on":""}" onclick="setMainImage('${src}', this)"><img src="${src}" alt=""></button>`
    ).join("") + `</div>`;
  }

  let sizeHtml = "";
  if (sizes.length) {
    sizeHtml = `<fieldset class="opt-fieldset"><legend class="subtle">Talla</legend><div class="choices" id="size-choices">` +
      sizes.map((s, i) => `<button type="button" class="size ${i===0?"on":""}" data-size="${s}" onclick="selectSize(${id}, '${s}')">${s}</button>`).join("") +
      `</div></fieldset>`;
  }

  document.getElementById("main-content").innerHTML = `
    <div class="wrap">
      <nav class="crumbs">
        <a href="#" onclick="showHome();return false">Inicio</a><span>/</span>
        <a href="#" onclick="showHome('${p.category}');return false">${p.category}</a>
        <span>/</span><span>${p.name}</span>
      </nav>
      <article class="detail">
        <div>
          ${thumbs}
          <img class="photo" id="main-photo" src="${images[0]}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/500x600?text=Sin+imagen'">
        </div>
        <div>
          <span class="badge">${p.category}</span>
          <h1 class="detail-title">${p.name}</h1>
          <p class="price">S/ ${p.price.toFixed(2)}</p>
          <p class="muted price-note">Precio en soles (PEN)</p>
          <p class="stock-line" id="qty-avail"></p>
          ${sizeHtml}
          <fieldset class="opt-fieldset"><legend class="subtle">Color</legend>
            <div class="choices" id="color-choices"></div>
          </fieldset>
          <p class="muted detail-desc">${p.description}</p>
          <div class="add-form">
            <div class="field qty-field">
              <label>Cantidad</label>
              <input type="number" id="sel-qty" min="1" value="1">
            </div>
            <div class="hero-actions">
              <button class="btn lg" type="button" onclick="addToCart(${p.id})">Añadir al carrito</button>
              <button class="btn lg outline" type="button" onclick="showCart()">Ver carrito</button>
            </div>
          </div>
        </div>
      </article>
    </div>`;
  renderColors(id);
}

function setMainImage(src, btn) {
  const img = document.getElementById("main-photo");
  if (img) img.src = src;
  document.querySelectorAll(".thumbs button").forEach(t => t.classList.remove("on"));
  if (btn) btn.classList.add("on");
}

function selectSize(id, size) {
  window._selSize = size;
  document.querySelectorAll("#size-choices .size").forEach(b => b.classList.toggle("on", b.dataset.size === size));
  const p = products.find(x => x.id === id);
  const variant = p.variants.find(v => v.size === size) || p.variants[0];
  if (variant?.colors?.length) window._selColor = variant.colors[0].color;
  renderColors(id);
}

function selectColor(color) {
  window._selColor = color;
  document.querySelectorAll("#color-choices .choice").forEach(b => b.classList.toggle("on", b.dataset.color === color));
  updateQtyAvail();
}

function renderColors(id) {
  const p = products.find(x => x.id === id);
  const hasSize = p.variants.some(v => v.size !== null && v.size !== "");
  const variant = hasSize ? p.variants.find(v => v.size === window._selSize) || p.variants[0] : p.variants[0];
  const row = document.getElementById("color-choices");
  if (!row) return;
  row.innerHTML = "";
  let firstAvail = null;
  (variant?.colors || []).forEach(c => {
    const out = c.qty <= 0;
    if (!out && !firstAvail) firstAvail = c.color;
    const hex = COLOR_HEX[c.color] || "#888";
    const on = window._selColor === c.color ? "on" : "";
    row.innerHTML += `<button type="button" class="choice ${on} ${out?"off":""}" data-color="${c.color}" data-qty="${c.qty}" ${out?"disabled":""} onclick="selectColor('${c.color}')"><span class="swatch" style="background:${hex}"></span>${c.color}</button>`;
  });
  if (!window._selColor || !(variant?.colors || []).find(c => c.color === window._selColor && c.qty > 0))
    window._selColor = firstAvail;
  document.querySelectorAll("#color-choices .choice").forEach(b => b.classList.toggle("on", b.dataset.color === window._selColor));
  updateQtyAvail();
}

function updateQtyAvail() {
  const p = products.find(x => x.id === window._currentProductId);
  if (!p) return;
  const hasSize = p.variants.some(v => v.size !== null && v.size !== "");
  const variant = hasSize ? p.variants.find(v => v.size === window._selSize) || p.variants[0] : p.variants[0];
  const col = (variant?.colors || []).find(c => c.color === window._selColor);
  const max = col ? col.qty : 0;
  const el = document.getElementById("qty-avail");
  if (el) {
    if (max <= 0) { el.textContent = "Agotado"; el.className = "stock-line stock-out"; }
    else if (max <= 5) { el.textContent = max + " disponibles"; el.className = "stock-line stock-low"; }
    else { el.textContent = max + " disponibles"; el.className = "stock-line stock-ok"; }
  }
  const qtyInput = document.getElementById("sel-qty");
  if (qtyInput) {
    qtyInput.max = Math.max(1, max);
    if (parseInt(qtyInput.value) > max) qtyInput.value = Math.max(1, max);
  }
}

function addToCart(id) {
  const p = products.find(x => x.id === id);
  const hasSize = p.variants.some(v => v.size !== null && v.size !== "");
  const size = hasSize ? window._selSize : null;
  const color = window._selColor;
  let qty = parseInt(document.getElementById("sel-qty").value) || 1;
  if (!color) { showNotification("Sin stock"); return; }
  let variant = hasSize ? p.variants.find(v => v.size === size) : p.variants[0];
  let col = variant.colors.find(c => c.color === color);
  if (!col || col.qty < qty) { showNotification("Cantidad no disponible"); return; }
  const exist = cart.find(i => i.id === id && i.size === size && i.color === color);
  if (exist) {
    if (exist.qty + qty > col.qty) { showNotification("Excede stock"); return; }
    exist.qty += qty;
  } else cart.push({ id, name: p.name, price: p.price, image: p.image, size, color, qty });
  saveCart();
  showNotification("Añadido al carrito");
}

function showCart() {
  closeAll();
  const main = document.getElementById("main-content");
  let html = `<h2 class="section-title">Carrito de compras</h2>`;
  if (cart.length === 0) html += `<p>El carrito está vacío.</p><button class="btn" onclick="showHome()">Seguir comprando</button>`;
  else {
    html += `<table class="cart-table"><thead><tr><th></th><th>Producto</th><th>Detalle</th><th>Cant.</th><th>Precio</th><th>Subtotal</th><th></th></tr></thead><tbody>`;
    let total = 0;
    cart.forEach((item, idx) => {
      const sub = item.price * item.qty; total += sub;
      html += `<tr><td><img src="${item.image}" alt=""></td><td>${item.name}</td><td>${item.size ? "Talla " + item.size + " / " : ""}${item.color}</td><td>${item.qty}</td><td>S/ ${item.price.toFixed(2)}</td><td>S/ ${sub.toFixed(2)}</td><td><button class="btn-secondary" onclick="removeFromCart(${idx})">Eliminar</button></td></tr>`;
    });
    html += `</tbody></table><p class="total-row">Total: S/ ${total.toFixed(2)}</p><button class="btn" onclick="showCheckout()">Realizar compra</button><button class="btn btn-secondary" onclick="showHome()">Seguir comprando</button>`;
  }
  main.innerHTML = html;
}

function removeFromCart(idx) { cart.splice(idx, 1); saveCart(); showCart(); }

function showCheckout() {
  closeAll();
  if (cart.length === 0) { showNotification("Carrito vacío"); return; }
  const main = document.getElementById("main-content");
  let total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  let summary = "<ul class='order-summary'>";
  cart.forEach(i => { summary += `<li>${i.qty}x ${i.name} ${i.size ? "(" + i.size + ")" : ""} - ${i.color} — S/ ${(i.price * i.qty).toFixed(2)}</li>`; });
  summary += `<li><strong>Total: S/ ${total.toFixed(2)}</strong></li></ul>`;
  main.innerHTML = `<div class="checkout-form"><h2>Realizar pedido</h2>${summary}<label>Nombre completo *</label><input type="text" id="chk-name" required><label>Celular (9 dígitos Perú) *</label><input type="tel" id="chk-phone" maxlength="9" pattern="[0-9]{9}" required><label>Ciudad de envío *</label><input type="text" id="chk-city" value="Iquitos, Loreto, Perú" required><label>Dirección en Iquitos *</label><input type="text" id="chk-address" required><label>Referencia</label><input type="text" id="chk-ref"><button class="btn" onclick="submitOrder()">Realizar pedido</button><button class="btn btn-secondary" onclick="showCart()">Volver al carrito</button></div>`;
}

function submitOrder() {
  const name = document.getElementById("chk-name").value.trim();
  const phone = document.getElementById("chk-phone").value.trim();
  const city = document.getElementById("chk-city").value.trim();
  const address = document.getElementById("chk-address").value.trim();
  const ref = document.getElementById("chk-ref").value.trim();
  if (!name || !phone || !city || !address) { showNotification("Completa los campos obligatorios"); return; }
  if (!/^\d{9}$/.test(phone)) { showNotification("Celular debe ser 9 dígitos"); return; }
  cart.forEach(item => {
    const p = products.find(x => x.id === item.id);
    if (!p) return;
    const hasSize = p.variants.some(v => v.size !== null && v.size !== "");
    let variant = hasSize ? p.variants.find(v => v.size === item.size) : p.variants[0];
    if (variant) { const col = variant.colors.find(c => c.color === item.color); if (col) col.qty = Math.max(0, col.qty - item.qty); }
  });
  saveProducts();
  let msg = `*Nuevo pedido - Tienda Militar*%0A%0A*Cliente:* ${name}%0A*Celular:* ${phone}%0A*Ciudad:* ${city}%0A*Dirección:* ${address}%0A`;
  if (ref) msg += `*Referencia:* ${ref}%0A`;
  msg += `%0A*Productos:*%0A`;
  let total = 0;
  cart.forEach(i => { const sub = i.price * i.qty; total += sub; msg += `- ${i.qty}x ${i.name}`; if (i.size) msg += ` (Talla ${i.size})`; msg += ` Color: ${i.color} — S/ ${sub.toFixed(2)}%0A`; });
  msg += `%0A*Total: S/ ${total.toFixed(2)}*`;
  cart = []; saveCart();
  window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, "_blank");
  showNotification("Pedido enviado a WhatsApp");
  setTimeout(() => showHome(), 1500);
}

function showAdminLogin() {
  document.getElementById("main-content").innerHTML = `<div class="admin-login"><h2>Administrador</h2><label>Contraseña</label><input type="password" id="admin-pass"><button class="btn" onclick="checkAdmin()">Ingresar</button></div>`;
}

function checkAdmin() {
  if (document.getElementById("admin-pass").value === ADMIN_PASS) showAdminPanel();
  else showNotification("Contraseña incorrecta");
}

function showAdminPanel() {
  editingId = null;
  let html = `<div class="admin-panel"><h2>Panel Administrador</h2><button class="btn" onclick="showProductForm()">+ Agregar producto</button><button class="btn btn-secondary" onclick="showHome()">Volver a tienda</button><div class="product-list-admin"><h3>Productos existentes</h3>`;
  products.forEach(p => {
    html += `<div class="item"><span>${p.name} — ${p.category} — S/ ${p.price.toFixed(2)}</span><div><button class="btn" onclick="editProduct(${p.id})">Editar</button><button class="btn-secondary" onclick="deleteProduct(${p.id})">Eliminar</button></div></div>`;
  });
  html += `</div></div>`;
  document.getElementById("main-content").innerHTML = html;
}

function showProductForm(id = null) {
  editingId = id;
  const p = id ? products.find(x => x.id === id) : null;
  let html = `<div class="form-section"><h2>${p ? "Editar" : "Agregar"} producto</h2><label>Nombre *</label><input type="text" id="f-name" value="${p ? p.name : ""}"><label>Categoría *</label><select id="f-cat">`;
  CATEGORIES.forEach(c => { html += `<option value="${c}" ${p && p.category === c ? "selected" : ""}>${c}</option>`; });
  html += `</select><label>Precio *</label><input type="number" id="f-price" step="0.01" min="0" value="${p ? p.price : ""}"><label>Link de foto *</label><input type="url" id="f-image" value="${p ? p.image : ""}"><label>Descripción</label><textarea id="f-desc" rows="3">${p ? p.description : ""}</textarea><h3>Variantes (Talla opcional)</h3><p style="font-size:0.85em;color:#aaa">Si no tiene talla, deja el campo Talla vacío.</p><div id="variants-container"></div><button class="btn-secondary" onclick="addVariantRow()">+ Agregar variante</button><br><br><button class="btn" onclick="saveProductForm()">Guardar</button><button class="btn btn-secondary" onclick="showAdminPanel()">Cancelar</button></div>`;
  document.getElementById("main-content").innerHTML = html;
  if (p && p.variants) p.variants.forEach(v => v.colors.forEach(c => addVariantRow(v.size, c.color, c.qty)));
  else addVariantRow();
}

function addVariantRow(size = "", color = "", qty = "") {
  const cont = document.getElementById("variants-container");
  const div = document.createElement("div");
  div.className = "variant-row";
  div.innerHTML = `<input type="text" placeholder="Talla (opcional)" value="${size || ""}" class="v-size"><input type="text" placeholder="Color" value="${color || ""}" class="v-color"><input type="number" placeholder="Cantidad" value="${qty || ""}" class="v-qty" min="0"><button class="btn-secondary" onclick="this.parentElement.remove()">×</button>`;
  cont.appendChild(div);
}

function saveProductForm() {
  const name = document.getElementById("f-name").value.trim();
  const category = document.getElementById("f-cat").value;
  const price = parseFloat(document.getElementById("f-price").value);
  const image = document.getElementById("f-image").value.trim();
  const description = document.getElementById("f-desc").value.trim();
  if (!name || !category || isNaN(price) || !image) { showNotification("Completa campos obligatorios"); return; }
  const rows = document.querySelectorAll(".variant-row");
  const variantMap = {};
  rows.forEach(row => {
    const size = row.querySelector(".v-size").value.trim() || null;
    const color = row.querySelector(".v-color").value.trim();
    const qty = parseInt(row.querySelector(".v-qty").value) || 0;
    if (!color) return;
    const key = size || "__null__";
    if (!variantMap[key]) variantMap[key] = { size, colors: [] };
    variantMap[key].colors.push({ color, qty });
  });
  const variants = Object.values(variantMap);
  if (!variants.length) { showNotification("Agrega al menos una variante"); return; }
  if (editingId) {
    const p = products.find(x => x.id === editingId);
    Object.assign(p, { name, category, price, image, description, variants });
  } else {
    const newId = products.length ? Math.max(...products.map(x => x.id)) + 1 : 1;
    products.push({ id: newId, name, category, price, image, description, variants });
  }
  saveProducts();
  showNotification("Producto guardado");
  showAdminPanel();
}

function editProduct(id) { showProductForm(id); }
function deleteProduct(id) {
  if (!confirm("¿Eliminar este producto?")) return;
  products = products.filter(p => p.id !== id);
  saveProducts();
  showAdminPanel();
}

loadData();
showHome();
