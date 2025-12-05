// script.js
// ← PUT YOUR WORKER URL HERE (Cloudflare Worker URL)
const WORKER_URL = "https://your-worker-name.workers.dev";

const elPlayer = document.getElementById("player");
const btnSearch = document.getElementById("searchBtn");
const btnClear = document.getElementById("clearBtn");
const results = document.getElementById("results");
const msg = document.getElementById("message");

// language toggle
const btnEn = document.getElementById("btn-en");
const btnAr = document.getElementById("btn-ar");
const titleEn = document.getElementById("title");
const titleAr = document.getElementById("title-ar");

function setLang(lang){
  if(lang === "ar"){
    document.documentElement.lang = "ar"; document.documentElement.dir = "rtl";
    titleEn.classList.add("hidden"); titleAr.classList.remove("hidden");
    btnAr.style.opacity = "0.6"; btnEn.style.opacity = "1";
  } else {
    document.documentElement.lang = "en"; document.documentElement.dir = "ltr";
    titleEn.classList.remove("hidden"); titleAr.classList.add("hidden");
    btnAr.style.opacity = "1"; btnEn.style.opacity = "0.6";
  }
}
btnEn.onclick = () => setLang("en");
btnAr.onclick = () => setLang("ar");
// default Arabic
setLang("ar");

// search handler
btnSearch.onclick = () => doLookup();
btnClear.onclick = () => { elPlayer.value = ""; results.innerHTML = ""; msg.textContent = ""; };

elPlayer.addEventListener("keydown", e => {
  if(e.key === "Enter") doLookup();
});

async function doLookup(){
  const player = elPlayer.value.trim();
  if(!player){ msg.textContent = (document.documentElement.lang === "ar") ? "ادخل اسم اللاعب" : "Enter player name"; return; }
  msg.textContent = (document.documentElement.lang === "ar") ? "جاري التحميل..." : "Loading...";
  results.innerHTML = "";

  try {
    const res = await fetch(`${WORKER_URL}?player=${encodeURIComponent(player)}`);
    const data = await res.json();

    if(!data.ok){
      msg.textContent = (document.documentElement.lang === "ar") ? "خطأ في الاستعلام" : "Query error";
      console.error(data);
      return;
    }

    // Show Tracker stats if available
    const tracker = data.tracker;
    const statsSegment = tracker?.data?.segments?.[0] || null;
    const stats = statsSegment?.stats || tracker?.data?.platformInfo || null;

    // Build stats card
    const wins = stats?.wins?.displayValue || statVal(tracker, "wins") || "N/A";
    const kills = stats?.kills?.displayValue || statVal(tracker, "kills") || "N/A";
    const kd = stats?.kd?.displayValue || statVal(tracker, "kd") || "N/A";
    const matches = stats?.matches?.displayValue || statVal(tracker, "matches") || "N/A";

    const statsHtml = `
      <div class="card">
        <div class="h-row">
          <div>
            <h3>${document.documentElement.lang === "ar" ? "إحصائيات اللاعب" : "Player Stats"}</h3>
            <p class="muted">${document.documentElement.lang === "ar" ? "اللاعب" : "Player"}: <strong>${player}</strong></p>
            <p>${document.documentElement.lang === "ar" ? "الانتصارات" : "Wins"}: <strong>${wins}</strong></p>
            <p>${document.documentElement.lang === "ar" ? "القتل" : "Kills"}: <strong>${kills}</strong></p>
            <p>${document.documentElement.lang === "ar" ? "نسبة K/D" : "K/D"}: <strong>${kd}</strong></p>
            <p>${document.documentElement.lang === "ar" ? "المباريات" : "Matches"}: <strong>${matches}</strong></p>
          </div>
        </div>
      </div>
    `;

    results.innerHTML = statsHtml;

    // Inventory (Fortnite-API)
    const inventory = data.inventory;
    if(inventory && Array.isArray(inventory) && inventory.length){
      const invItems = inventory.map(it => {
        // many providers return id, name, images.icon etc - try common shapes
        const name = it.name || it.displayName || it.itemName || it.templateId || "Item";
        const image = it.images?.icon || it.image || it.icon || "";
        return `<div class="inv-item"><img src="${image}" alt="${escapeHtml(name)}" onerror="this.style.opacity=0.4;"><p>${escapeHtml(name)}</p></div>`;
      }).join("");
      results.innerHTML += `<div class="card"><h3>${document.documentElement.lang === "ar" ? "الممتلكات / المظاهر" : "Inventory / Cosmetics"}</h3><div class="inv-grid">${invItems}</div></div>`;
    } else {
      results.innerHTML += `<div class="card center muted">${document.documentElement.lang === "ar" ? "لا توجد بيانات للممتلكات" : "No inventory data available."}</div>`;
    }

    msg.textContent = "";
  } catch (err) {
    console.error(err);
    msg.textContent = (document.documentElement.lang === "ar") ? "فشل الاتصال" : "Fetch failed";
  }
}

function statVal(tracker, key){
  // helper to try to find numeric stat as fallback
  try{
    const s = tracker?.data?.stats || tracker?.data?.segments?.[0]?.stats;
    return s?.[key]?.displayValue || s?.[key]?.value || null;
  }catch(e){return null;}
}

function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }
