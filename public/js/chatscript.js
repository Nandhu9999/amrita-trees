import { authObj } from "./authorization.js";
import { socketObj } from "./socketClient.js"
import { getTimePrefix, randomUUID, tempPfp, devCommand, getScrollPercent } from "./utils.js"

// console.log("chatscript.js")

function containerSize(){
    const { x, y, width, height } = navigator.virtualKeyboard.boundingRect;
    $("#container").style.height = `calc(100% - ${height}px)`;
}

const widgetOpts = $("#widget")
const textArea = $("#textarea")
const sendBtn = $("#send")

function systemInit(){
    if ("virtualKeyboard" in navigator) {
        navigator.virtualKeyboard.overlaysContent = true;
        navigator.virtualKeyboard.addEventListener("geometrychange", containerSize);
    }

    widgetOpts.addEventListener("click", widgetClicked)
    textArea.addEventListener("click", textareaClicked)
    textArea.addEventListener("input", isTyping)
    sendBtn.addEventListener("click", ()=>{sendClicked()})

    function KEYDOWN(e){
        if( e.code == "Enter" && e.shiftKey == false ){
            sendClicked();
            e.preventDefault();
        }
    }

    if( window.mobileAndTabletCheck ){textArea.addEventListener("keydown", KEYDOWN)}
    else {textArea.addEventListener("keydown", KEYDOWN)}
}

function widgetClicked(){
    widgetOpts.classList.toggle("active")
    updateWidgetState();
    textArea.focus();
}

export function forceCloseWidget(){
    widgetOpts.classList.remove("active")
    updateWidgetState();
}

function updateWidgetState(){
    const widgetActive = widgetOpts.classList.contains("active")
    // console.log(widgetActive ? "open" : "close", "widget")
    if ( widgetActive ){
        $(".widgetDialog").show();
    } else {
        $(".widgetDialog").close();
    }
}

function textareaClicked(){
    widgetOpts.classList.remove("active")
    updateWidgetState()
    const scrollPercent = getScrollPercent($(".maincontent"));
    if(scrollPercent > 92){
        $(".maincontent").scrollTop = $(".maincontent").scrollTopMax;
    }
}

export function sendClicked(msg=null){
    if(!msg && !textArea.innerText.trim()){return}
    let myMessage = {}
    if (msg) {
        myMessage = msg
    } else {
        myMessage = {
            uid       : authObj.uid,
            username  : authObj.account.username,
            messageid : `msgid${randomUUID(12)}`,
            content   : textArea.innerText,
            timestamp : Date.now(),
            pfp       : authObj.account.pfp
        }
    }
    if(myMessage.content.startsWith("/")){
        const stopProcess = devCommand(myMessage.content);
        if(stopProcess) return;
        // broadcast command
    }

    textArea.innerText = ""
    textArea.focus()
    
    if(socketObj.active){
        socketObj.io.emit("messageServer", myMessage)
        appendMessage(myMessage, 0.5)
    } else {
        console.log("socket disconnected..")
    }
}

let lastTypedTimestamp = 0;
function isTyping(){
    const currTimestamp = Date.now()
    if(currTimestamp - lastTypedTimestamp < 5000 || !textArea.innerText.trim())
        {return}
    
    lastTypedTimestamp = currTimestamp;
    if(socketObj.active){
        socketObj.io.emit("isTyping", null)
    } else {
        console.log("socket disconnected..")
    }
}

export function appendBulkMessages(msgsArray){
    MessageCreator.lastMsg = {
        uid: "",
        username:"",
        timestamp: 0
    };
    msgsArray.forEach(msg=>{appendMessage(msg, 1)})
    $(".maincontent").scrollTop = $(".maincontent").scrollTopMax;
}

export function appendMessage(data, opacity = 1){
    const scrollPercent =  getScrollPercent($(".maincontent"))
    if(data.content.startsWith("/")){
        console.log("entered slash command")
        devCommand(data.content);
        return
    }

    const msg = new MessageCreator(data)
    msg.autoGenerateFormat()
    msg.setOpacity(opacity)

    $("#chatlogs").appendChild(msg.tag)
    const msgHeight = msg.getHeight()
    if(scrollPercent > 92){
        $(".maincontent").scrollBy( 0, msgHeight)
        $(".overlayChatlogs").scrollBy( 0, msgHeight)
    }
}
export function appendVerifiedMessage(messageid){
    const message = $("#chatlogs").querySelector("#" + messageid)
    if (message) {message.style.opacity = 1}
}
export class MessageCreator{
    static lastMsg = {
        uid: "",
        username:"",
        timestamp: 0
    };
    static sameUIDCount = 0;
    constructor({uid, username, messageid, timestamp, content, pfp}){
        this.uid       = uid
        this.username  = username
        this.timestamp = timestamp
        this.content   = content
        this.pfp       = pfp

        this.tag               = document.createElement("div");
        this.tag.id            = messageid
        this.tag.classList     = "usermessage noSelect"
        this.tag.oncontextmenu = "return false"
        this.tag.innerHTML     = `<div data-col1></div><div data-col2></div>`
    }

    autoGenerateFormat(){
        // show msg header 
        // IF UID is newer
        // OR more than 5 messages from same uid 
        // OR been more than 5 mins from same uid
        // OR if the name is new
        if(   MessageCreator.lastMsg.uid != this.uid 
            || MessageCreator.sameUIDCount > 5 
            || MessageCreator.lastMsg.timestamp - Date.now() > 1000 * 60 * 5
            || MessageCreator.lastMsg.username != this.username
        ) {
            this.setMsgHeaders()
            this.setUserPfp()
            this.tag.classList.add("hasHeader")
            MessageCreator.sameUIDCount = 0
        }else{
            MessageCreator.sameUIDCount += 1
        }

        this.setTextContent()
        MessageCreator.lastMsg.uid       = this.uid
        MessageCreator.lastMsg.username  = this.username
        MessageCreator.lastMsg.timestamp = this.timestamp

        this.tag.addEventListener("pointerdown", this.msgTapped,true)
        this.tag.addEventListener("pointerup", this.msgTapRelease,true)
        this.tag.addEventListener("contextmenu", this.msgContextMenu,true)
    }

    setMsgHeaders(){
        const msgHeader = document.createElement("div")
        msgHeader.innerHTML = `
            <div class="msgheader" unselectable="on">
                <span data-username>${this.username}</span>
                <span data-timestamp>${getTimePrefix(this.timestamp)}</span>
            </div>`
        this.tag.querySelector("[data-col2]").prepend(msgHeader)
    }
    setUserPfp(){
        const userPfp = document.createElement("img")
        userPfp.src = this.pfp || tempPfp
        this.tag.querySelector("[data-col1]").appendChild(userPfp)
    }
    setTextContent(){
        const textContent = document.createElement("div")
        textContent.innerHTML = `<div class="msgcontent" data-msgcontent unselectable="on">${this.content}</div>`
        this.tag.querySelector("[data-col2]").appendChild(textContent)
    }
    setOpacity(val){
        this.tag.style.opacity = val;
    }
    getHeight(){
        let headerHeight = 0
        if(this.tag.classList.contains("hasHeader")) headerHeight = 10
        return (this.tag.offsetHeight + headerHeight + 10)
    }
    msgTapped(e){
        let tempParent = e.target
        while (!tempParent.classList.contains("usermessage")){
            tempParent = tempParent.parentElement
        }
        tempParent.classList.add("highlightEffect")
        tempParent.dataset.touchdownTime = Date.now();
    }
    msgTapRelease(e){
        let tempParent = e.target
        while (!tempParent.classList.contains("usermessage")){
            tempParent = tempParent.parentElement
        }
        tempParent.classList.remove("highlightEffect")
        const longpressTime = Date.now() - tempParent.dataset.touchdownTime; 
        if (longpressTime > 250 
            && longpressTime < 1500 
            && window.mobileAndTabletCheck()
            && !tempParent.classList.contains("brokenType")){
            MessageCreator.openCtxMenu(tempParent)
        }
    }
    msgContextMenu(e){
        e.preventDefault();
        let tempParent = e.target
        while (!tempParent.classList.contains("usermessage")){
            tempParent = tempParent.parentElement
        }
        MessageCreator.openCtxMenu(tempParent)
        return false;
    }
    static getSummary(tag){
        const summary = tag.cloneNode(true)
        summary.id = ""
        
        return summary
    }
    static openCtxMenu(tag){
        $("#userMessageModal").showModal();
        const content = tag.querySelector(".msgcontent").innerText
        const msgId = tag.id;

        if( !window.mobileAndTabletCheck() ){
            $("#userMessageModal").classList.add("centerDisplay");
        }
        // reply message
        $("#userMessageModal .replyMsg").onclick = ()=>{
            alert("feature not available yet")
        }
        // copy message
        $("#userMessageModal .copyMsg").onclick = ()=>{
            navigator.clipboard.writeText(content);
            $("#userMessageModal").close()
        }
        // break message
        if( tag.querySelector(".msgcontent").classList.contains("brokenType")){
            $("#userMessageModal .breakMsg").innerText = "fix"    
        }else{
            $("#userMessageModal .breakMsg").innerText = "break"    
        }
        $("#userMessageModal .breakMsg").onclick = ()=>{
            if(tag.querySelector(".msgcontent").classList.contains("brokenType")){
                tag.querySelector(".msgcontent").style.userSelect = "none";
                tag.querySelector(".msgcontent").style.fontFamily = "inherit";
                // tag.querySelector(".msgcontent").innerHTML = content
                tag.querySelector(".msgcontent").classList.remove("brokenType")
            }else{
                tag.querySelector(".msgcontent").style.userSelect = "text";
                tag.querySelector(".msgcontent").style.fontFamily = "monospace";
                // const words = content.split(" ")
                // tag.querySelector(".msgcontent").innerHTML = (words.map(word=>{return (`<code>${word}</code> `)})).join(" ")
                tag.querySelector(".msgcontent").classList.add("brokenType")
            }
            $("#userMessageModal").close()
        }
    }
}

export function loadChatMessages(part = 0){
    if (!authObj.AUTHORIZED){return}
    /*
     * part system used to display only 
     * limited messages from entire corpus
     * maximum only two parts should be active
     */
    $("#chatlogs").innerHTML = `<h1 style="padding:10px;" class="noSelect">#chat</h1>`
}

systemInit();