/* ===== PENGATURAN TOKO ===== */
// Ganti dengan nomor WhatsApp kamu (format internasional, tanpa + atau 0 di depan)
const WA_NUMBER = "6282299119880";

/* ===== DATA MENU ===== */
// Ganti harga & deskripsi sesuai kebutuhan. c1 & c2 = warna motif batik di latar kartu.
const products = [
  { id: 1, name: "Chicken Nanban",   cat: "makanan", emoji: "🍗", desc: "Ayam goreng crispy ala Jepang dengan saus nanban asam manis dan tartar.", price: 15000, c1: "#1b2540", c2: "#c9a227", badge: "Terlaris" },
  { id: 2, name: "Chicken Mushrooms", cat: "makanan", emoji: "🍄", desc: "Ayam dimasak dengan jamur dalam saus creamy yang gurih.",               price: 15000, c1: "#5b3a29", c2: "#f0d98a", badge: "" },
  { id: 3, name: "Mac and Cheese",   cat: "makanan", emoji: "🧀", desc: "Makaroni lembut dengan saus keju melimpah, dipanggang hangat.",          price: 15000, c1: "#6b4a12", c2: "#f7d774", badge: "Favorit" },
  { id: 4, name: "Es Teh Manis",     cat: "minuman", emoji: "🥤", desc: "Teh seduh segar dengan es batu, manisnya pas.",                           price: 5000,  c1: "#2d4a6b", c2: "#e8eef5", badge: "" },
];

/* ===== STATE ===== */
let cart = [];
try { cart = JSON.parse(localStorage.getItem("dapurbatik_cart")) || []; } catch (e) { cart = []; }
let activeCat = "semua";

/* ===== HELPER ===== */
const rupiah = n => "Rp" + n.toLocaleString("id-ID");
const $ = id => document.getElementById(id);

// Membuat motif batik (SVG) sebagai latar kartu — tanpa perlu file gambar
function batikArt(c1, c2) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'>
    <rect width='80' height='80' fill='${c1}'/>
    <g fill='none' stroke='${c2}' stroke-width='2' opacity='.85'>
      <ellipse cx='40' cy='20' rx='11' ry='18'/><ellipse cx='40' cy='60' rx='11' ry='18'/>
      <ellipse cx='20' cy='40' rx='18' ry='11'/><ellipse cx='60' cy='40' rx='18' ry='11'/>
    </g>
    <circle cx='40' cy='40' r='4' fill='${c2}'/>
    <circle cx='0' cy='0' r='3' fill='${c2}'/><circle cx='80' cy='0' r='3' fill='${c2}'/>
    <circle cx='0' cy='80' r='3' fill='${c2}'/><circle cx='80' cy='80' r='3' fill='${c2}'/>
  </svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 1800);
}

/* ===== RENDER MENU ===== */
function renderProducts() {
  const list = activeCat === "semua" ? products : products.filter(p => p.cat === activeCat);
  $("productGrid").innerHTML = list.map(p => `
    <article class="card">
      <div class="card-img" style="background-image:${batikArt(p.c1, p.c2)}">
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
        <span class="emoji">${p.emoji}</span>
      </div>
      <div class="card-body">
        <span class="card-cat">${p.cat}</span>
        <h3 class="card-title">${p.name}</h3>
        <p class="card-motif">${p.desc}</p>
        <div class="card-foot">
          <span class="price">${rupiah(p.price)}</span>
          <button class="add-btn" onclick="addToCart(${p.id})">+ Pesan</button>
        </div>
      </div>
    </article>
  `).join("");
}

/* ===== KERANJANG ===== */
function saveCart() {
  try { localStorage.setItem("dapurbatik_cart", JSON.stringify(cart)); } catch (e) {}
}

function addToCart(id) {
  const item = cart.find(i => i.id === id);
  item ? item.qty++ : cart.push({ id, qty: 1 });
  saveCart(); renderCart();
  toast("Ditambahkan ke pesanan ✓");
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart(); renderCart();
}

function renderCart() {
  const box = $("cartItems");
  let total = 0, count = 0;

  if (cart.length === 0) {
    box.innerHTML = `<p class="empty">Belum ada pesanan 🍽️</p>`;
  } else {
    box.innerHTML = cart.map(i => {
      const p = products.find(x => x.id === i.id);
      total += p.price * i.qty;
      count += i.qty;
      return `
        <div class="cart-item">
          <div class="ci-img" style="background-image:${batikArt(p.c1, p.c2)}">${p.emoji}</div>
          <div class="ci-info"><strong>${p.name}</strong><span>${rupiah(p.price)}</span></div>
          <div class="qty">
            <button onclick="changeQty(${p.id}, -1)">−</button>
            <span>${i.qty}</span>
            <button onclick="changeQty(${p.id}, 1)">+</button>
          </div>
        </div>`;
    }).join("");
  }

  $("cartTotal").textContent = rupiah(total);
  $("cartCount").textContent = count;
}

function openCart()  { $("drawer").classList.add("open");  $("overlay").classList.add("show"); }
function closeCart() { $("drawer").classList.remove("open"); $("overlay").classList.remove("show"); }

/* ===== CHECKOUT KE WHATSAPP ===== */
function checkout() {
  if (cart.length === 0) { toast("Belum ada pesanan"); return; }
  let total = 0;
  const lines = cart.map((i, idx) => {
    const p = products.find(x => x.id === i.id);
    total += p.price * i.qty;
    return `${idx + 1}. ${p.name} x${i.qty} = ${rupiah(p.price * i.qty)}`;
  });
  const msg = `Halo Dapur Batik, saya ingin memesan:\n\n${lines.join("\n")}\n\nTotal: ${rupiah(total)}\n\nNama:\nAlamat pengantaran:\nCatatan:`;
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
}

/* ===== EVENT LISTENER ===== */
$("filters").addEventListener("click", e => {
  const btn = e.target.closest(".chip");
  if (!btn) return;
  document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
  btn.classList.add("active");
  activeCat = btn.dataset.cat;
  renderProducts();
});
$("openCart").addEventListener("click", openCart);
$("closeCart").addEventListener("click", closeCart);
$("overlay").addEventListener("click", closeCart);
$("checkoutBtn").addEventListener("click", checkout);

/* ===== INIT ===== */
renderProducts();
renderCart();
