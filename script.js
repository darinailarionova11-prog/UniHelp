let user = localStorage.getItem("user");
let problems = JSON.parse(localStorage.getItem("problems")) || [];
let myLat = null;
let myLng = null;

function toggleTheme(){
  document.body.classList.toggle("light");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("light")
  );
}

if(localStorage.getItem("theme") === "true"){
  document.body.classList.add("light");
}

function useMyLocation(){
  if(!navigator.geolocation){
    alert("Geolocation not supported!");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      myLat = pos.coords.latitude;
      myLng = pos.coords.longitude;

      const loc = document.getElementById("locText");
      if(loc){
        loc.innerText = "📍 Location added!";
      }
    },
    err => alert("Location permission denied!")
  );
}

function saveProblem(){
  let p = {
    title: document.getElementById("title").value,
    desc: document.getElementById("desc").value,
    img: document.getElementById("img").value,
    lat: myLat,
    lng: myLng,
    user: user
  };

  if(!p.title || !p.desc){
    alert("Please fill title and description!");
    return;
  }

  problems.push(p);
  localStorage.setItem("problems", JSON.stringify(problems));

  showNotif("Problem added!");
  location.href = "explore.html";
}

if(typeof L !== "undefined" && document.getElementById("map")){

  let map = L.map('map').setView([42.7,25.4],7);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    .addTo(map);

  navigator.geolocation.watchPosition(pos=>{
    let lat = pos.coords.latitude;
    let lng = pos.coords.longitude;

    L.circle([lat,lng],{
      radius:50,
      color:'blue'
    }).addTo(map).bindPopup("You are here");
  });

  problems.forEach(p=>{
    if(p.lat){
      L.marker([p.lat,p.lng])
        .addTo(map)
        .bindPopup(`<b>${p.title}</b><br>${p.desc}`);
    }
  });
}

function render(data){
  let c = document.getElementById("cards");
  if(!c) return;

  c.innerHTML = "";

  data.forEach((p,i)=>{
    c.innerHTML += `
      <div class="problem-card glass">
        <img src="${p.img || 'https://via.placeholder.com/300'}">
        <div style="padding:10px">
          <h3>${p.title}</h3>
          <p>${p.desc}</p>
          <button onclick="deleteProblem(${i})">🗑️</button>
        </div>
      </div>
    `;
  });
}

if(document.getElementById("cards")){
  render(problems);
}

function deleteProblem(i){
  problems.splice(i,1);
  localStorage.setItem("problems", JSON.stringify(problems));
  render(problems);
}

function search(){
  let val = document.querySelector(".search")?.value.toLowerCase() || "";
  let filtered = problems.filter(p =>
    p.title.toLowerCase().includes(val)
  );

  render(filtered);
}

function showNotif(msg){
  let n = document.getElementById("notif");
  if(!n) return;

  n.innerText = msg;
  n.classList.remove("hidden");

  setTimeout(()=>n.classList.add("hidden"),2000);
}

if(document.getElementById("username")){
  document.getElementById("username").innerText = user;
}

function logout(){
  localStorage.removeItem("user");
  location.href = "index.html";
}

if(!user && !location.href.includes("index.html")){
  location.href = "index.html";
}

if(document.getElementById("username")){

  let saved = JSON.parse(localStorage.getItem("saved")) || [];

  document.getElementById("username").innerText = user;

  let img = localStorage.getItem("profileImg");
  if(img){
    document.getElementById("profileImg").src = img;
  }

  navigator.geolocation.getCurrentPosition(pos=>{
    let lat = pos.coords.latitude.toFixed(3);
    let lng = pos.coords.longitude.toFixed(3);

    let loc = document.getElementById("locationText");
    if(loc){
      loc.innerText = "📍 " + lat + ", " + lng;
    }
  });

  let myProblems = problems.filter(p => p.user === user);

  let myCount = document.getElementById("myCount");
  if(myCount) myCount.innerText = myProblems.length;

  let savedCount = document.getElementById("savedCount");
  if(savedCount) savedCount.innerText = saved.length;
}

function uploadImage(event){
  let file = event.target.files[0];
  if(!file) return;

  let reader = new FileReader();

  reader.onload = function(e){
    let img = e.target.result;

    let profileImg = document.getElementById("profileImg");
    if(profileImg){
      profileImg.src = img;
    }

    localStorage.setItem("profileImg", img);
  };

  reader.readAsDataURL(file);
}