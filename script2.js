let reportsCreated = 0;
let reportsSolved = 0;
let isLoggedIn = false;

if (!localStorage.getItem('unihelp_user_id')) {
    localStorage.setItem('unihelp_user_id', 'user_' + Date.now());
}
const myId = localStorage.getItem('unihelp_user_id');

const markers = {}; 
const map = L.map('map', { 
    zoomControl: true,
    zoomAnimation: true 
}).setView([42.7339, 25.4858], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
map.zoomControl.setPosition('topright');

let userLocation = null;

const uniIcon = L.divIcon({
    className: 'blinking-dot',
    iconSize: [16, 16],
    iconAnchor: [8, 8], 
    popupAnchor: [0, -10]
});

function toggleModal(id) {
    const m = document.getElementById(id);
    if(m) {
        m.style.display = (m.style.display === "flex") ? "none" : "flex";
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}

function getLocationAndOpenModal() {
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            toggleModal('report-modal');
        },
        () => {
            alert("GPS failed. Click anywhere on the map to place a report manually!");
        }
    );
}

map.on('click', function(e) {
    userLocation = { lat: e.latlng.lat, lng: e.latlng.lng };
    const modal = document.getElementById('report-modal');
    
    if (modal.style.display !== "flex") {
        toggleModal('report-modal');
    }
});


let isSubmitting = false;

function submitReport() {
    if (isSubmitting) return;
    
    const titleInput = document.getElementById('input-title');
    const descInput = document.getElementById('input-desc');
    
    if (!titleInput.value || !userLocation) {
        return showToast("Title and Location required! 🦄");
    }

    toggleModal('report-modal'); 

    isSubmitting = true;

    const prob = {
        id: Date.now(),
        ownerId: myId, 
        lat: userLocation.lat,
        lng: userLocation.lng,
        title: titleInput.value,
        desc: descInput.value
    };

    addProblem(prob);
    updateLiveFeed(prob);
    
    reportsCreated++;
    document.getElementById('report-count').innerText = reportsCreated;

    titleInput.value = "";
    descInput.value = "";
    userLocation = null;
    
    setTimeout(() => { isSubmitting = false; }, 1000);
}
function addProblem(prob) {
    const confidence = 100;
    const imageTag = prob.img ? `<img src="${prob.img}" style="width:100%; border-radius:10px; margin-top:10px; max-height:150px; object-fit:cover;">` : "";

    const marker = L.marker([prob.lat, prob.lng], { 
        icon: uniIcon 
    }).addTo(map);

    if (marker.getElement()) {
        L.DomUtil.addClass(marker.getElement(), 'red-dot');
    }

    markers[prob.id] = marker;

    const isOwner = (prob.ownerId === myId);
    
    const deleteBtn = isOwner ? `
        <div style="margin-top: 10px; border-top: 1px dashed #ccc; padding-top: 10px;">
            <button class="action-btn" 
                    style="flex:1; width:100%; background: #ff4757; font-family: 'Shrikhand', cursive;" 
                    onclick="deleteProblem(${prob.id})">
                🗑️ Delete My Report
            </button>
        </div>` : "";

    const popupContent = `
        <div id="popup-${prob.id}" style="text-align:center; min-width: 200px; font-family: 'Shrikhand', cursive;">
            <h3 style="color: #8B934F; margin: 5px 0;">${prob.title}</h3>
            
            <div style="margin: 10px 0; font-family: sans-serif;">
                <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 3px;">
                    <span>Trust Score</span>
                    <span class="trust-score-percent">${confidence}%</span>
                </div>
                <div class="confidence-bg">
                    <div class="confidence-fill" style="width: ${confidence}%; height:100%; background: #8B934F;"></div>
                </div>
            </div>

            <p style="font-size: 12px; color: #666; font-family: sans-serif;">${prob.desc}</p>
            ${imageTag}

            <div style="display:flex; gap:5px; margin-top:10px;">
                <button class="vote-btn" style="flex:1" onclick="handleVote(${prob.id}, true)">✅ Real</button>
                <button class="vote-btn" style="flex:1" onclick="handleVote(${prob.id}, false)">❌ Fake</button>
            </div>

            <div style="display:flex; gap:5px; margin-top:10px;">
                <button class="action-btn" style="flex:1" onclick="protectedAction('Volunteer')">Volunteer</button>
                <button class="action-btn" style="flex:1" onclick="protectedAction('Donate')">Donate</button>
            </div>

            ${deleteBtn}
        </div>
    `;

    marker.bindPopup(popupContent);
    setTimeout(() => {
    if (marker.getElement()) {
        L.DomUtil.addClass(marker.getElement(), 'red-dot');
    }
    }, 50);

    map.flyTo([prob.lat, prob.lng], 15);
}
function protectedAction(actionName) {
    if (!isLoggedIn) {
        alert(`You must be signed in to ${actionName}. 🦄`);
        toggleModal('auth-modal');
        return;
    }
    
    if (actionName === 'Donate') {
        document.getElementById('donate-page').style.display = 'flex';
    } else if (actionName === 'Volunteer') {
        document.getElementById('volunteer-page').style.display = 'flex';
    }
}

function simulateLogin() {
    isLoggedIn = true;
    toggleModal('auth-modal');
    alert("Signed in as Unihelp Hero! 🦄");
}

function logout() {
    isLoggedIn = false;
    closeProfile();
    alert("Logged out.");
}

function openProfile() {
    const profile = document.getElementById('profile-page');
    if (isLoggedIn) {
        profile.style.display = 'flex'; 
    } else {
        toggleModal('auth-modal');
    }
}

function closeProfile() { document.getElementById('profile-page').style.display = 'none'; }
function closeDonate() { document.getElementById('donate-page').style.display = 'none'; }
function closeVolunteer() { document.getElementById('volunteer-page').style.display = 'none'; }

function updateLiveFeed(prob) {
    const feed = document.getElementById('feed-container');
    if (feed.innerHTML.includes("Waiting")) feed.innerHTML = "";
    const item = document.createElement('div');
    item.className = "feed-item-style";
    item.innerHTML = `<strong>${prob.title}</strong><br><small>Just now</small>`;
    feed.prepend(item);
}

const userVotes = {}; 

function handleVote(probId, isPositive) {
    if (userVotes[probId]) {
        alert("You have already verified this report! 🦄");
        return;
    }

    const popup = document.getElementById(`popup-${probId}`);
    if (!popup) return;

    const fillBar = popup.querySelector('.confidence-fill');
    const scoreText = popup.querySelector('.trust-score-percent');
    const marker = markers[probId];

    let currentWidth = parseInt(fillBar.style.width) || 100;
    
    if (isPositive) {
        currentWidth = Math.min(currentWidth + 10, 100);
    } else {
        currentWidth = Math.max(currentWidth - 10, 0);
    }

if (currentWidth < 40) {
    fillBar.style.background = "#ff4757"; 
} else {
    fillBar.style.background = "linear-gradient(90deg, #BDDBC4, #B58FA3)";
}

    fillBar.style.width = currentWidth + '%';
    scoreText.innerText = currentWidth + '%';
    userVotes[probId] = true;

    if (marker) {
        const iconElement = marker.getElement();
        if (currentWidth === 100) {
            iconElement.classList.remove('red-dot');
            iconElement.classList.add('green-dot');
        } else {
            iconElement.classList.remove('green-dot');
            iconElement.classList.add('red-dot');
        }
    }

    if (currentWidth <= 0) {
        setTimeout(() => {
            alert("Report removed due to low community trust. 🛡️");
            if (marker) {
                map.removeLayer(marker);
                delete markers[probId];
            }
        }, 400);
    }
}

    
    fillBar.style.width = currentWidth + '%';
    scoreText.innerText = currentWidth + '%';

    
    userVotes[probId] = true;

    if (currentWidth <= 0) {
        setTimeout(() => {
            alert("Report removed due to low community trust. 🛡️");
            
            if (markers[probId]) {
                map.removeLayer(markers[probId]);
                delete markers[probId]; 
            }
        }, 400);
    }

    if (currentWidth <= 0) {
        setTimeout(() => {
            alert("This report has been marked as fake by the community and will be removed.");
            map.closePopup();
        }, 500);
    }

function handleMission(buttonElement, type) {
    const card = buttonElement.closest('.charity-card');
    card.classList.add('success-card');
    if (reportsSolved % 10 === 0 && reportsSolved !== 0) {
    const badge = document.querySelector('.badge');
    badge.classList.add('level-up-animate');
    setTimeout(() => badge.classList.remove('level-up-animate'), 600);
    showToast("LEVEL UP! You are becoming a Legend! 🦄");
    }
    
    reportsSolved++;
    updateProfileUI(); 
    
    if (reportsSolved % 10 === 0 && reportsSolved !== 0) {
        const newLevel = Math.floor(reportsSolved / 10) + 1;
        triggerReward(newLevel);
    }

    const originalText = buttonElement.innerText;
    buttonElement.innerText = "Mission Joined! ✨";
    buttonElement.style.background = "#28a745";

    setTimeout(() => {
        alert(type === 'volunteer' ? "Hero application sent! 🐾" : "Redirecting to donation page...");
        card.classList.remove('success-card');
        buttonElement.innerText = originalText;
        buttonElement.style.background = "";
    }, 500);
}
function updateProfileUI() {
    const solvedDisplay = document.getElementById('solved-count');
    if(solvedDisplay) solvedDisplay.innerText = reportsSolved;

    const currentLevel = Math.floor(reportsSolved / 10) + 1;
    
    const badge = document.querySelector('.badge');
    if (badge) {
        if (currentLevel === 1) {
            badge.innerText = "Level 1: Scout 🛡️";
            badge.style.background = "var(--mauve)";
        } else if (currentLevel === 2) {
            badge.innerText = "Level 2: Guardian ⚔️";
            badge.style.background = "#7A89C2"; 
        } else if (currentLevel >= 3) {
            badge.innerText = `Level ${currentLevel}: Bulgarian Legend 🇧🇬`;
            badge.style.background = "#333"; 
        }
    }

    const progressPercent = (reportsSolved % 10) * 10; 
    const progressBar = document.querySelector('.progress-bar-fill');
    if (progressBar) {
        progressBar.style.width = progressPercent + "%";
    }
}
function simulateLogin() {
    const email = document.querySelector('#auth-modal input[type="email"]').value;
    const pass = document.querySelector('#auth-modal input[type="password"]').value;
    const modalContent = document.querySelector('#auth-modal .modal-content');

    if (!email || !pass) {
        modalContent.classList.add('shake-it');
        
        setTimeout(() => modalContent.classList.remove('shake-it'), 400);
        return;
    }

    isLoggedIn = true;
    toggleModal('auth-modal');
    alert("Signed in as Unihelp Hero! 🦄");
}
map.on('click', function() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
    }
});
function showToast(message) {
    const x = document.getElementById("toast");
    x.innerText = message;
    x.className = "show";
    setTimeout(() => { x.className = x.className.replace("show", ""); }, 3000);
}

function triggerReward(level) {
    const modal = document.getElementById('reward-modal');
    const text = document.getElementById('reward-text');
    const badgeIcon = document.getElementById('reward-badge');
    
    if (level === 2) {
        text.innerHTML = "You've earned the <strong>Green Heart</strong> badge! <br> Your reports now carry more weight.";
        badgeIcon.innerText = "💚";
    } else if (level === 3) {
        text.innerHTML = "<strong>Bulgarian Legend Unlocked!</strong> <br> You've earned a permanent spot on the Hero Feed.";
        badgeIcon.innerText = "🇧🇬";
    } else {
        text.innerHTML = `You reached Level ${level}! <br> You've earned 500 Hero Points.`;
        badgeIcon.innerText = "💎";
    }

    toggleModal('reward-modal');
    createConfetti();
}

function createConfetti() {
    const colors = ['#BDDBC4', '#B58FA3', '#FFD700', '#F0FFF4'];
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 2 + 's';
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 3000);
    }
}

function deleteProblem(id) {
    if (confirm("Groovy! Are you sure you want to remove your report? 🦄")) {
        if (markers[id]) {
            map.removeLayer(markers[id]); 
            delete markers[id];           
            showToast("Report deleted! 💨");
        }
    }
}