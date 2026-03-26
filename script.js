let problems = JSON.parse(localStorage.getItem("problems")) || [];

/* THEME */
function toggleTheme(){
  document.body.classList.toggle("light");
  localStorage.setItem("theme",document.body.classList.contains("light"));
}
if(localStorage.getItem("theme")==="true"){
  document.body.classList.add("light");
}

/* GPS AUTO TRACK */
let myLat, myLng;

function useMyLocation(){
  navigator.geolocation.getCurrentPosition(pos=>{
    myLat=pos.coords.latitude;
    myLng=pos.coords.longitude;

    document.getElementById("locText").innerText =
      "📍 Location added!";
  });
}

/* SAVE */
function saveProblem(){
  let p={
    title:title.value,
    desc:desc.value,
    img:img.value,
    lat:myLat,
    lng:myLng
  };

  problems.push(p);
  localStorage.setItem("problems",JSON.stringify(problems));

  showNotif("Problem added!");
  location.href="explore.html";
}

/* MAP */
if(document.getElementById("map")){
  let map=L.map('map').setView([42.7,25.4],7);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  /* USER LIVE LOCATION */
  navigator.geolocation.watchPosition(pos=>{
    let lat=pos.coords.latitude;
    let lng=pos.coords.longitude;

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

/* RENDER */
function render(data){
  let c=document.getElementById("cards");
  if(!c) return;

  c.innerHTML="";
  data.forEach((p,i)=>{
    c.innerHTML+=`
    <div class="problem-card glass">
      <img src="${p.img||'https://via.placeholder.com/300'}">
      <div style="padding:10px">
      <h3>${p.title}</h3>
      <p>${p.desc}</p>
      <button onclick="deleteProblem(${i})">🗑️</button>
      </div>
    </div>
    `;
  });
}
if(document.getElementById("cards")) render(problems);

/* DELETE */
function deleteProblem(i){
  problems.splice(i,1);
  localStorage.setItem("problems",JSON.stringify(problems));
  render(problems);
}

/* SEARCH */
function search(){
  let val=document.querySelector(".search").value.toLowerCase();
  let f=problems.filter(p=>p.title.toLowerCase().includes(val));
  render(f);
}

/* NOTIF */
function showNotif(msg){
  let n=document.getElementById("notif");
  if(!n) return;
  n.innerText=msg;
  n.classList.remove("hidden");
  setTimeout(()=>n.classList.add("hidden"),2000);
}

/* PROFILE */
if(document.getElementById("username")){
  username.innerText=localStorage.getItem("user");
}

function logout(){
  localStorage.removeItem("user");
  location.href="index.html";
}

/* AUTH CHECK */
let currentUser = localStorage.getItem("user");

if(!currentUser && !location.href.includes("index.html")){
  location.href = "index.html";
}

if(document.getElementById("username")){
  let u = localStorage.getItem("user");
  document.getElementById("username").innerText = u;

  document.getElementById("stats").innerText =
    "Problems created: " + problems.length;
}

/* PROFILE SYSTEM */
if (document.getElementById("username")) {

  let user = localStorage.getItem("user");
  let saved = JSON.parse(localStorage.getItem("saved")) || [];

  document.getElementById("username").innerText = user;

  /* LOAD PROFILE IMAGE */
  let img = localStorage.getItem("profileImg");
  if (img) document.getElementById("profileImg").src = img;

  /* LOCATION */
  navigator.geolocation.getCurrentPosition(pos => {
    let lat = pos.coords.latitude.toFixed(3);
    let lng = pos.coords.longitude.toFixed(3);

    document.getElementById("locationText").innerText =
      "📍 " + lat + ", " + lng;
  });

  /* STATS */
  let myProblems = problems.filter(p => p.user === user);
  document.getElementById("myCount").innerText = myProblems.length;

  let likes = problems.reduce((sum,p)=>sum+(p.likes||0),0);
  document.getElementById("likesCount").innerText = likes;

  document.getElementById("savedCount").innerText = saved.length;
}

/* UPLOAD PROFILE IMAGE */
function uploadImage(event) {
  let file = event.target.files[0];
  let reader = new FileReader();

  reader.onload = function(e) {
    let img = e.target.result;
    document.getElementById("profileImg").src = img;
    localStorage.setItem("profileImg", img);
  };

  reader.readAsDataURL(file);
}

let user = localStorage.getItem("user");

let map = L.map('map').setView([42.7,25.4],7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
.addTo(map);

setTimeout(() => {
  map.invalidateSize();
}, 200);