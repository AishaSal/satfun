// CHANGE THIS TO YOUR JSON URL
const jsonUrl = "https://gamemonetize.com/feed.php?format=0&links=1&num=100&page=1";

const container = document.getElementById("game-container");

/* Load Games from JSON */
async function loadGames() {
  try {
    const res = await fetch(jsonUrl);
    const games = await res.json();
    buildCards(games);
  } catch (err) {
    console.error("Error loading games:", err);
  }
}

/* Build Game Cards */
function buildCards(games) {
  games.forEach(game => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <img src="${game.image}" alt="${game.title}">
      <div class="card-body">
        <h3 class="card-title">${game.title}</h3>
        <p class="card-desc">${game.description}</p>
        <button class="btn open-window"
                data-title="${game.title}"
                data-img="${game.image}"
                data-details="${game.details}"
                data-url="${game.game_url}">
            Play Game
        </button>
      </div>
    `;

    container.appendChild(card);
  });

  setupModalButtons();
}

/* ---------- Popup Window Logic ---------- */
const modal = document.getElementById("popupModal");
const modalBody = document.getElementById("modal-body");
const closeBtn = document.querySelector(".close-btn");

function setupModalButtons() {
  document.querySelectorAll(".open-window").forEach(btn => {
    btn.onclick = () => {
      modalBody.innerHTML = `
        <h2>${btn.dataset.title}</h2>
        <iframe src="${btn.dataset.url}"></iframe>
        <p>${btn.dataset.details}</p>
      `;
      modal.style.display = "block";
    };
  });
}

closeBtn.onclick = () => modal.style.display = "none";
window.onclick = e => { if (e.target === modal) modal.style.display = "none"; };

/* Prevent broken images */
document.addEventListener("error", function(e) {
  if (e.target.tagName === "IMG") {
    e.target.src = "fallback.jpg"; 
  }
}, true);

loadGames();
