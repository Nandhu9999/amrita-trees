import { authObj } from "./authorization.js";
import { sendClicked } from "./chatscript.js";
import { randomUUID, tempPfp } from "./utils.js"
import { toggleSidebarLeft, forceFocusMain, toggleSidebarRight } from "./sidebarscript.js";
import { clearcanvasTool, redoTool, settingsTool, undoTool, panzoomTool, brushTool, paletteTool, bucketTool, eraseTool, layersTool, setBaseCanvas, colorpickerTool } from "./drawscript.js";

// console.log("frameState.js")

export function updateUser(username, pfp){
    if ( username ) {authObj.account.username = username}
    if (      pfp ) {authObj.account.pfp      = pfp}

    const accountItem        = JSON.parse(window.localStorage.getItem("account"))
    accountItem.username     = authObj.account.username
    accountItem.pfp          = authObj.account.pfp

    window.localStorage.setItem("account", JSON.stringify(accountItem))
    updateUserDOMElements();
}

export function updateUserDOMElements(){
    $(".sidebarLeft .profile img").src = authObj.account.pfp || tempPfp
    $(".sidebarLeft .profile .usernameDisplay").innerText = authObj.account.username
}

export function defaultState(){
    window.onbeforeunload = null
    $("main").dataset.state = "default"
    
    $(".mainheader").classList.remove("hide")
    $(".maincontent").classList.remove("hide")
    $(".mainfooter").classList.remove("hide")
    
    $(".overlayFrame").classList.add("hide")
    $(".overlayChatWindow").classList.add("hide")

    $(".overlayFrame").innerHTML   = ""
    $(".overlayFrame").style.display = ""
    $(".overlayFrame").style.flexDirection = "none"
    $(".overlayFrame").dataset.state = "default";

    // move chatlogs to default chat space
    $(".maincontent").appendChild(document.getElementById("chatlogs"));

    // focus to main 
    forceFocusMain();
}

export function overlayState(){
    $("main").dataset.state = "overlay"
    
    $(".overlayFrame").classList.remove("hide")
    $(".overlayChatWindow").classList.add("hide")
    
    $(".mainheader").classList.add("hide")
    $(".maincontent").classList.add("hide")
    $(".mainfooter").classList.add("hide")

    // move chatlogs to overlay chat window
    $(".overlayChatlogs").append(document.getElementById("chatlogs"));

    // focus to main 
    forceFocusMain();
}

export function setOverlayState(type, media){
    window.onbeforeunload = function(){return 'Are you sure you want to exit?'}
    
    function enableChatframe(){
        const chatButton = document.createElement('div');
        chatButton.classList = "chatButton";
        chatButton.innerText = "💬"
        chatButton.onclick = () => { setChatOverlay(true) }
        $(".overlayFrame").appendChild(chatButton)
    }

    if(type == "embed"){

        const iframe = document.createElement("iframe")
        iframe.src               = media.link + "?autostart=true"
        iframe.allowtransparency = "false" 
        iframe.width             = "980"
        iframe.height            = "100%"
        iframe.frameborder       = "0" 
        iframe.scrolling         = "no"
        iframe.allowfullscreen   = "true"
        iframe.style.position    = "absolute"
        iframe.style.left        = "50%"
        iframe.style.translate   = "-50% 0"

        $(".overlayFrame").innerHTML   = ""
        $(".overlayFrame").style.display = "block"
        $(".overlayFrame").style.flexDirection = "none"
        $(".overlayFrame").appendChild(iframe)
        $(".overlayFrame").dataset.state = "embed";

        enableChatframe()
    }
    else if(type == "movie"){

        const movieFrame = document.createElement("video")
        const source     = document.createElement("source")
        const  track     = document.createElement("track")

        movieFrame.classList.add("movieFrame")
        movieFrame.controls = true
        source.src       = media.stream
        source.type      = "video/mp4"
        track.src        = media.captions
        track.label      = "English"
        track.kind       = "captions"
        track.srclang    = "en-us"
        track.default    = true


        movieFrame.appendChild(source)    
        movieFrame.appendChild( track)
        
        $(".overlayFrame").innerHTML   = ""
        $(".overlayFrame").style.display = "flex"
        $(".overlayFrame").style.flexDirection = "column"
        $(".overlayFrame").style.justifyContent = "space-around"
        $(".overlayFrame").appendChild(movieFrame)
        $(".overlayFrame").appendChild( document.createElement("div"))
        $(".overlayFrame").appendChild( document.createElement("div"))
        $(".overlayFrame").dataset.state = "movie";

        enableChatframe()
    }
    else if(type == "draw"){

        const drawTools = [
            {name:"🗑️",exec:clearcanvasTool},
            // {name:"📎",exec:settingsTool},
            {name:"🔚",exec:undoTool},{name:"🔜",exec:redoTool},
            {name:"👆",exec:panzoomTool},
            {name:"🖌️",exec:brushTool},{name:"🎨",exec:paletteTool},{name:"🤏",exec:eraseTool},
            // {name:"💧",exec:colorpickerTool},
            {name:"🪣",exec:bucketTool},
            // {name:"📄",exec:layersTool},
        ]

        const canvasContainer = document.createElement("div")
        const canvasTools     = document.createElement("div")
        const toolsOpenBtn    = document.createElement("div")
        const toolsCloseBtn   = document.createElement("div")
        const canvas          = document.createElement("canvas")

        const drawLoader      = document.createElement("div")

        canvasContainer.id      = "canvasContainer"
        toolsOpenBtn.classList  = "toolsOpenBtn noSelect"
        toolsCloseBtn.classList = "toolsCloseBtn noSelect"
        canvasTools.id          = "canvasTools"
        canvas.id               = "baseCanvas"
        drawLoader.classList    = "drawLoader"

        canvasTools.style.setProperty("--totalTools", drawTools.length)
        const toolsArr        = document.createElement("div")
        const toolsArrWrapper = document.createElement("div")
        toolsArr.classList        = "toolsArray"
        toolsArrWrapper.classList = "toolsArrWrapper"
        toolsArrWrapper.appendChild(toolsArr)

        drawTools.forEach(tool=>{
            const item = document.createElement("div")
            item.innerText = tool.name
            item.classList = "item noSelect"
            item.onclick = tool.exec;
            toolsArr.append(item)
        })
        
        toolsOpenBtn.innerText = "🅾"
        toolsCloseBtn.innerText = "❎"

        drawLoader.innerText = "executing.."

        toolsOpenBtn.onclick = ()=>{canvasTools.classList.remove("hide")}
        toolsCloseBtn.onclick = ()=>{canvasTools.classList.add("hide")}

        canvasTools.appendChild(toolsArrWrapper)
        canvasTools.appendChild(toolsCloseBtn)
        
        canvasContainer.appendChild(toolsOpenBtn)
        canvasContainer.appendChild(canvasTools)
        canvasContainer.appendChild(canvas)
        canvasContainer.appendChild(drawLoader)

        $(".overlayFrame").innerHTML   = ""
        $(".overlayFrame").style.display = "block"
        $(".overlayFrame").appendChild(canvasContainer)
        $(".overlayFrame").dataset.state = "draw";

        setBaseCanvas(canvas, canvasContainer)
        enableChatframe()
    }
}


export function setChatOverlay(open){
    // Only if chatWindow exists
    if(!$(".chatButton")) return;

    if(open == true){
        $(".overlayChatWindow").classList.remove("hide")
        $(".chatButton").classList.add("hide")

        if(window.mobileAndTabletCheck() == true){
            console.log("mobile")
            $(".overlayChatWindow .overlayHeader .expandOchannels").style.visibility = "visible";
            $(".overlayChatWindow .overlayHeader .expandOmembers").style.visibility = "visible";
            $(".overlayChatWindow .overlayHeader .expandOchannels").onclick = ()=>{toggleSidebarLeft()}
            $(".overlayChatWindow .overlayHeader .expandOmembers").onclick = ()=>{toggleSidebarRight()}
        }else{
            console.log("desktop")
            $(".overlayChatWindow .overlayHeader .expandOchannels").style.visibility = "hidden";
            $(".overlayChatWindow .overlayHeader .expandOmembers").style.visibility = "hidden";
        }

        // ################################################
        sendBtn.onclick = sendClicked2
        function KEYDOWN(e){
            if( e.code == "Enter" && e.shiftKey == false ){
                sendClicked2();e.preventDefault();
            }
        }
        if( window.mobileAndTabletCheck ){textArea.onkeydown = KEYDOWN}
        else {textArea.onkeypress = KEYDOWN}
        // ################################################
    }
    else if(open == false){
        $(".overlayChatWindow").classList.add("hide")
        $(".chatButton").classList.remove("hide")
    }
}

const closeChat = $(".overlayChatWindow .closechat")
const textArea = $(".overlayChatWindow .textarea")
const sendBtn = $(".overlayChatWindow .send")

closeChat.addEventListener("click", ()=>{setChatOverlay(false)})

function sendClicked2(){
    if(!textArea.innerText.trim()){return}
    const myMessage = {
        uid       : authObj.uid,
        username  : authObj.account.username,
        messageid : `msgid${randomUUID(12)}`,
        content   : textArea.innerText,
        timestamp : Date.now(),
        pfp       : authObj.account.pfp
    }
    sendClicked(myMessage)
    textArea.innerText = ""
    textArea.focus()
}
