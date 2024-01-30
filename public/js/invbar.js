const zipperOpenSnd = new Audio(
  "https://cdn.discordapp.com/attachments/1055426492659675167/1055434142420054016/zipper_open.mp3"
);
const zipperCloseSnd = new Audio(
  "https://cdn.discordapp.com/attachments/1055426492659675167/1055434191090761798/zipper_close.mp3"
);

function toggleInventorybar() {
  $("#invbar").classList.toggle("active");

  if ($("#invbar").classList.contains("active")) {
    if ($("#soundCB").checked) zipperOpenSnd.play();

    fetchInventoryItems();
  } else {
    if ($("#soundCB").checked) zipperCloseSnd.play();
  }
}

async function fetchInventoryItems() {
  console.log("page loaded");
  const response = await fetch("./inventory?raw=json");
  const respdata = await response.json();
  console.log(respdata);

  if (response.ok != true) {
    return;
  }

  const unlocked = respdata.unlocked;
  const locked = respdata.locked;

  $("#CardsCount").innerText = unlocked.length + "/" + respdata.max;

  const old_unlocked = JSON.parse(localStorage.getItem("inventoryData")) || [];
  localStorage.setItem("inventoryData", JSON.stringify(unlocked));

  console.log(old_unlocked, unlocked);
  const newly_unlocked = unlocked.filter(
    ({ scientific_name: id1 }) =>
      !old_unlocked.some(({ scientific_name: id2 }) => id2 === id1)
  );
  console.log("new", newly_unlocked);

  //   console.log(old_data.unlocked)
  //   console.log(jsondata.unlocked)
  //   const new_data = old_data.unlocked.filter(({ scientific_name: id1 }) => !jsondata.unlocked.some(({ scientific_name: id2 }) => id2 === id1));
  //   console.log(new_data)

  //   localStorage.setItem("inventoryData", JSON.stringify(jsondata.unlocked) );
  //   const data = JSON.parse(localStorage.getItem("inventoryData"));

  $(".cards-container").innerHTML = "";

  newly_unlocked.forEach((e) => {
    // console.log(e);
    const card = document.createElement("div");
    card.classList = "card";
    card.style.setProperty("--theme-color", "#f9c04d");
    card.innerHTML = `
              <!-- <div class="img"><img src="${e.url}"></div> -->
              <div class="img"><img src="https://cdn.discordapp.com/attachments/1027927070191403189/1055601596609859706/betterTree_tinted.png"></div>
              <div class="label">${e.scientific_name}</div>`;

    card.onclick = () => {
      cardClicked(e.scientific_name);
    };

    $(".cards-container").appendChild(card);
  });

  old_unlocked.forEach((e) => {
    // console.log(e);
    const card = document.createElement("div");
    card.classList = "card";
    card.innerHTML = `
              <!-- <div class="img"><img src="${e.url}"></div> -->
              <div class="img"><img src="https://cdn.discordapp.com/attachments/1027927070191403189/1039165618617860146/betterTree.png"></div>
              <div class="label">${e.scientific_name}</div>`;

    $(".cards-container").appendChild(card);
  });
  locked.forEach((e) => {
    // console.log(e);
    const card = document.createElement("div");
    card.classList = "card";
    card.style.setProperty("--theme-color", "white");
    card.innerHTML = `
              <div class="img"><img src="https://cdn.discordapp.com/attachments/1027927070191403189/1039165618617860146/betterTree.png" style="filter: grayscale(100%);"></div>
              <div class="label">???</div>`;

    $(".cards-container").appendChild(card);
  });
}

function getDifference(array1, array2) {
  return array1.filter((object1) => {
    return !array2.some((object2) => {
      return object1.id === object2.id;
    });
  });
}
