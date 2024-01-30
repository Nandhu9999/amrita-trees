const treeSound = new Audio(
  "https://cdn.discordapp.com/attachments/1055426492659675167/1055434259067846706/tree_rustling.mp3"
);
const celebrateSnd = new Audio(
  "https://cdn.discordapp.com/attachments/1055426492659675167/1055608351100252330/celebrate.wav"
);
const deniedSnd = new Audio(
  "https://cdn.discordapp.com/attachments/1055426492659675167/1055608574967038032/denied.wav"
);

function createUserTopbar(map) {
  const div = document.createElement("div");
  div.classList = "topbar";
  div.innerHTML = `<div class="iconDiv" onclick="closePrompt()"><i class="fas fa-plus" style="transform:rotate(45deg);" title="close"></i></div>`;
  return div;
}

function createUserPrompt(map) {
  const div = document.createElement("div");
  div.classList = "content";
  return div;
}

function closePrompt() {
  document.querySelector("#userPrompt .content").classList.remove("active");
  setTimeout(() => {
    document.querySelector("#userPrompt").classList.remove("active");
    document.querySelector(".navbar").classList.add("active");
  }, 200);
}

async function initMap(command) {
  let map;

  if (command) {
    const key = command.key;
    if (key == "test") {
      console.log("it worked!!");
      map.setCenter({ lat: 10.900016808568687, lng: 76.9028589289025 });
    } else if (key == "mapSettings1") {
      map.setOptions({
        zoomControl: false,
        disableDoubleClickZoom: true,
        disableDefaultUI: true,
      });
    } else if (key == "mapSettings2") {
      map.setOptions({
        zoomControl: false,
        disableDoubleClickZoom: true,
        disableDefaultUI: true,
        draggable: false,
        scrollwheel: false,
      });
    } else if (key == "check") {
      console.log(map);
    }

    return;
  }

  const tree_icon_url =
    "https://cdn.discordapp.com/attachments/1027927070191403189/1039163926702719086/qmark64.png";
  const shadow_url =
    "https://www.transparentpng.com/download/shadow/iuqEeA-shadow-png-pic-controlled-drugs-cabinets-from-pharmacy.png";
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 10.900016808568687, lng: 76.9028589289025 },
    zoom: 20,
    mapId: "661dd2cc98d8e9e2",
    mapTypeId: "satellite",
  });

  map.setOptions({
    zoomControl: false,
    disableDoubleClickZoom: true,
    disableDefaultUI: true,
    // draggable: false,
    // scrollwheel: false,
  });

  const allMarkers = [];

  const userPrompt = document.createElement("div");
  userPrompt.id = "userPrompt";

  const topbarDiv = createUserTopbar(map);
  userPrompt.appendChild(topbarDiv);
  const promptDiv = createUserPrompt(map);
  userPrompt.appendChild(promptDiv);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(userPrompt);

  // FETCH TREES
  let treedata;
  let TREES_ARRAY;
  treedata = await fetch("./treedata");
  TREES_ARRAY = await treedata.json();
  if (typeof TREES_ARRAY !== Array) {
    TREES_ARRAY = [];
  }
  // SPANW TREE SHADOWS
  if (TREES_ARRAY.length != 0) {
    TREES_ARRAY.forEach((item) => {
      const iconSize = 70;
      const coords = item.coords.split(",");
      const lat = Number(coords[0]);
      const lng = Number(coords[1]);
      const marker = new google.maps.Marker({
        position: { lat: lat, lng: lng },
        map,
        icon: {
          url: shadow_url,
          scaledSize: new google.maps.Size(iconSize, iconSize),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(iconSize / 2, iconSize / 2 - 1.75),
        },
      });
    });
    // SPANW TREE (QUESTION MARKS)
    TREES_ARRAY.forEach((tree, id) => {
      const coords = tree.coords.split(",");
      const lat = Number(coords[0]);
      const lng = Number(coords[1]);
      allMarkers.push({ lat: lat, lng: lng });

      const iconSize = 60;
      const marker = new google.maps.Marker({
        title: tree.title,
        position: { lat: lat, lng: lng },
        map,
        icon: {
          url: tree_icon_url,
          scaledSize: new google.maps.Size(iconSize, iconSize),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(iconSize / 2, iconSize / 2),
        },
      });
      marker.setAnimation(null);
      function toggleBounce() {
        if (marker.getAnimation() !== null) {
          marker.setAnimation(null);
        } else {
          marker.setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(() => {
            marker.setAnimation(null);
          }, 500);
        }
      }

      marker.addListener("click", () => {
        console.log("marker clicked");

        if ($("#soundCB").checked) treeSound.play();

        const pos2 = allMarkers[id];
        console.log(pos2);
        const DISTANCE_THRESHOLD = $("#devCB").checked ? 10000000 : 100;
        userPrompt.classList.add("active");
        document.querySelector(".navbar").classList.remove("active");

        // CLICKING MARKER
        // Fetching QUESTION & Checking ANSWER
        // wont work when IF the user turned off his location

        window.navigator.geolocation.getCurrentPosition(async (pos1) => {
          const dist =
            0 ||
            measureDistance(
              pos1.coords.latitude,
              pos1.coords.longitude,
              pos2.lat,
              pos2.lng
            );
          const ACCURACY = pos1.coords.accuracy;
          console.log("ACCURACY", ACCURACY);

          if (
            dist < DISTANCE_THRESHOLD &&
            pos1.coords.accuracy < DISTANCE_THRESHOLD
          ) {
            map.setCenter({
              lng: allMarkers[id].lng,
              lat: allMarkers[id].lat - 0.0001,
            });
            toggleBounce();
            document
              .querySelector("#userPrompt .content")
              .classList.add("active");
            document.querySelector("#userPrompt .content").innerHTML = "";
          } else {
            console.log("cannot ask question");
            return;
          }

          const locationResp = await fetch("./checkinglocation", {
            method: "POST",
            headers: {
              accept: "application.json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              pos1: { lat: pos1.coords.latitude, lng: pos1.coords.longitude },
              pos2: pos2,
            }),
          });
          const data = await locationResp.json();

          const DISTANCE = data.distance;
          const QUIZ_ID = data.quiz_id;
          const QUESTION = data.quiz;
          const OPTIONS = data.options
            .split(",")
            .map((item, id) => {
              return `<span 
                              class='option noSelect'
                              abcd='${["a", "b", "c", "d", "e "][id]}'
                              onclick='submitAnswer("${QUIZ_ID}","${item}")'>
                              ${item}
                            </span>`;
            })
            .join("");

          console.log("ask question");
          userPrompt.querySelector(".content").innerHTML = `
            <div id="quiz">
              <span class="qsymbol">Q:</span><span class="qcontent">${QUESTION}<span>
            </div>
            <div id="options" class="noSelect">
              ${OPTIONS}
            </div>
          `;

          let max_width = 0;
          let min_height = 999;
          userPrompt.querySelector(".content").classList.add("active");
          document.querySelectorAll(".option").forEach((item) => {
            if (item.offsetWidth > max_width) {
              max_width = item.offsetWidth;
            }
            if (item.offsetHeight < min_height) {
              min_height = item.offsetHeight;
            }
          });
          document.querySelectorAll(".option").forEach((item) => {
            item.style.width = max_width + "px";
            item.style.height = min_height + "px";
          });
        });
      });
    });
  }
  let locationUpdateRate = 5;
  let updateTick = 0;
  const loop = () => {
    updateTick += 1;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const latlng = new google.maps.LatLng(pos.lat, pos.lng);
        currPosMarker.setPosition(latlng);
        let promptOpen = document
          .querySelector("#userPrompt")
          .classList.contains("active");

        let ifdevCB = $("#devCB").checked || false;
        if (!promptOpen && !ifdevCB) map.setCenter(pos);

        if (ifdevCB) {
          map.setOptions({
            zoomControl: false,
            disableDoubleClickZoom: true,
            disableDefaultUI: true,
            draggable: true,
            scrollwheel: true,
          });
        } else {
          map.setZoom(20);
          map.setOptions({
            zoomControl: false,
            disableDoubleClickZoom: true,
            disableDefaultUI: true,
            draggable: false,
            scrollwheel: false,
          });
        }

        let liveLocation = $("#livelocationCB").checked || false;
        if (liveLocation && updateTick == locationUpdateRate) {
          updateTick -= locationUpdateRate;
          if (ifdevCB) msglog("lat:" + pos.lat + ", lng:" + pos.lng);

          fetch("./setuserlocation", {
            method: "POST",
            headers: {
              accept: "application.json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(pos),
          });
        }
      });
    }

    const date = new Date();
    const day = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][date.getDay()];
    let hrs = date.getHours();
    let mins = date.getMinutes();
    const suffix = hrs > 12 ? "pm" : "am";
    hrs = hrs > 12 ? hrs - 12 : hrs;
    hrs = hrs > 9 ? hrs : "0" + hrs;
    mins = mins > 9 ? mins : "0" + mins;

    document.querySelector(".navbar .textDiv p.day").innerHTML = day;
    document.querySelector(".navbar .textDiv p.time .hrs").innerHTML = hrs;
    document.querySelector(".navbar .textDiv p.time .mins").innerHTML =
      mins + "" + suffix;
  };

  const currPosMarker = new google.maps.Marker({
    position: { lat: 10.900016808568687, lng: 76.9028589289025 },
    map,
    icon: "https://cdn.glitch.global/9d67ff5c-524b-467b-aa2f-2cb422728542/currPosMarker.png?v=1661892594255",
  });

  setInterval(loop, 1000);
}

window.initMap = initMap;

async function submitAnswer(q, ans) {
  await setTimeout(async () => {
    document.querySelector("#userPrompt .content").classList.remove("active");
    let res = await fetch("./checkinganswer", {
      method: "POST",
      headers: {
        accept: "application.json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: q, ans: ans }),
    });

    let data = await res.json();
    console.log(data);
    const msg = document.createElement("p");
    if (data.correct) {
      console.log("correct");

      confetti();
      confetti();
      document.querySelector("#userPrompt").classList.remove("active");
      document.querySelector(".navbar").classList.add("active");
      // msg.innerText = "You unlocked a new tree!" + `(${data.tree})`;
      msg.innerHTML = `<p>You unlocked a new tree!</p>
      <p>(${data.tree})</p>`;

      let pts = Number($(".pointsSpan").innerText.split("points")[0]);
      $(".pointsSpan").innerText = pts + data.points;

      if ($("#soundCB").checked) celebrateSnd.play();
    } else {
      console.log("not correct");
      navigator.vibrate([250, 50, 250]);
      document.querySelector("#userPrompt").classList.remove("active");
      document.querySelector(".navbar").classList.add("active");
      msg.innerText = "Incorrect answer ☹!";
      document.querySelector("#mapContainer").classList.add("shake");

      if ($("#soundCB").checked) deniedSnd.play();

      setTimeout(() => {
        document.querySelector("#mapContainer").classList.remove("shake");
      }, 500);
    }

    $("#actionbar").appendChild(msg);
    setTimeout(() => {
      msg.remove();
    }, 5000);
  }, 500);
}

function measureDistance(lat1, lon1, lat2, lon2) {
  // generally used geo measurement function
  var R = 6378.137; // Radius of earth in KM
  var dLat = (lat2 * Math.PI) / 180 - (lat1 * Math.PI) / 180;
  var dLon = (lon2 * Math.PI) / 180 - (lon1 * Math.PI) / 180;
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d * 1000; // meters
}

function msglog(content) {
  const msg = document.createElement("p");
  msg.innerHTML = `${content}`;
  msg.style.textDecoration = "none";
  $("#actionbar").appendChild(msg);
  setTimeout(() => {
    msg.remove();
  }, 5000);
}
