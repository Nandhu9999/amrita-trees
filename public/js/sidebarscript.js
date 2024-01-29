// console.log("sidebarscript.js")
import { authObj } from "./authorization.js"
import { forceCloseWidget } from "./chatscript.js"
import { updateUser } from "./frameState.js"
import { isValidImage, isValidName, showLoader } from "./utils.js"

// [!] DO NOT REMOVE
// these functions are used 
// inside the evaluated string.
import { defaultState, overlayState, setOverlayState } from "./frameState.js"


export let CHANNELS = []
export let MEMBERS  = []

const sidebarLeft = $(".sidebarLeft")
const sidebarRight = $(".sidebarRight")

const mainBlock = $("#container main")
const menuBtn = $("#menuBtn")
const usersBtn = $("#usersBtn")

let cooldown = 0

menuBtn.addEventListener("click", toggleSidebarLeft)
usersBtn.addEventListener("click", toggleSidebarRight)
mainBlock.addEventListener("click", clickedMain)

export function toggleSidebarLeft(){
    // if widget is open
    forceCloseWidget()
    sidebarLeft.classList.toggle("active");
    if ( sidebarLeft.classList.contains("active") ){
        cooldown = Date.now() + 100;
    }
}

export function toggleSidebarRight(){
    // if widget is open
    forceCloseWidget()
    sidebarRight.classList.toggle("active");
    if ( sidebarRight.classList.contains("active") ){
        cooldown = Date.now() + 100;
        sidebarLeft.classList.add("leftSidebarActive");
    }
}

export function forceFocusMain(){
    cooldown = 0
    clickedMain()
}
function clickedMain(){
    if (Date.now() < cooldown) { return }

    sidebarLeft.classList.remove("active");
    sidebarRight.classList.remove("active");
    sidebarLeft.classList.remove("leftSidebarActive");
}

export async function updateSidebarContents(){
    CHANNELS = await (await fetch("/api/channels")).json()
    MEMBERS  = await (await fetch("/api/members")).json()

    if(Array.isArray(CHANNELS) && Array.isArray(MEMBERS)){
      updateChannelContents()    
      updateMembersContents()    
    } else {
        CHANNELS = []
        MEMBERS  = []
    }
}


function updateChannelContents(){
    const listContainer = sidebarLeft.querySelector("ul");
    listContainer.innerHTML = ""
    
    CHANNELS.forEach(({label, exec}) => {
        const listItem = document.createElement("li")
        listItem.innerText = label
        listItem.classList = "noSelect"
        const itemFunction = eval('(' + exec + ')');
        listItem.onclick = ()=>{itemFunction()}

        listContainer.appendChild(listItem)
    })
}

export function updateMembersContents(){
    const listContainer = sidebarRight.querySelector("ul");
    listContainer.innerHTML = ""

    MEMBERS.sort((a,b)=> (a.username > b.username ? 1 : -1))
    MEMBERS.forEach(({socketid, username, pfp}) => {
        const listItem = document.createElement("li")
        listItem.innerHTML   = `${username}` + `${socketid == authObj.sid ? " (You)" : ""}`
        listItem.classList   = "noSelect"
        listContainer.appendChild(listItem)
    })
}

const profileBar = $(".sidebarLeft .profile")

const profileModal = $("#profileModal")
const profileForm = $("#profileModal form")

const profileModalClose = $("#profileModal .modalClose")
profileBar.addEventListener("click", ()=>{
    
    if(authObj.account.pfp){profileModal.querySelector("img").src = authObj.account.pfp}
    if(authObj.account.username){profileModal.querySelector("h2").innerText = authObj.account.username}
    profileModal.showModal();
})
profileModalClose.addEventListener("click", ()=>{profileForm.reset(); profileModal.close();})
profileForm.addEventListener("submit", editProfile);

export const profileState = {
    username:"",
    pfp:""
}
async function editProfile(e){
    e.preventDefault();
    if ( isValidName(e.target[0].value)) {
        profileState.username = e.target[0].value || authObj.account.username
    }
    if (isValidImage(e.target[1].value)) { 
        profileState.pfp      = e.target[1].value || authObj.account.pfp 
    }

    showLoader()
    
    async function serverUpdate(username, pfp){
        try{
            const rresponse = await fetch("/api/editProfile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body:JSON.stringify({
                    sid: authObj.sid,
                    uid: authObj.uid,
                    username: username,
                    pfp: pfp
                })
            })
            const response = await rresponse.json();
            return response
        } catch {
            return { status: "error" }
        }
    }

    const response = await serverUpdate(profileState.username, profileState.pfp)
    profileForm.reset()
    profileModal.close()
    if (!response){
        alert("error")
        return
    }
    else if(response.status == "error"){
        alert("server unable to process request", response.message)
        return
    }
    // success
    // ..wait for socket response..
}

export function saveProfileEdit(){
    updateUser(profileState.username, profileState.pfp)
}