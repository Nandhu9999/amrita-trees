import { loadChatMessages } from "./chatscript.js"
import { defaultState, updateUserDOMElements } from "./frameState.js"
import { updateSidebarContents } from "./sidebarscript.js"
import { socketInit } from "./socketClient.js"
import { isValidImage, randomUUID, tempPfp } from "./utils.js"


// console.log("authorization.js")

export const authObj = {
    verifying: false,
    AUTHORIZED: false,
    uid: "",
    sid: "",
    account: {
        username: "",
        pfp:""
    },
    other_service_url:""
}

const authModal = $("#authModal")
const authForm = $("#authModal form")

export function showAuthModal(){
    const accountItem = window.localStorage.getItem("account")
    authModal.showModal()
    if( accountItem ){
        authForm.querySelector("input[name=username]").value = JSON.parse(accountItem).username
        authForm.querySelector("input[name=password]").focus()
    } else {
        authForm.querySelector("input[name=username]").focus()
    }
}

/*
 * CHECK AUTHENTICATION
 * verifies if user session details is
 * upto date
 * if session exists, then set authObj
 * details for easier use between services  
 */
export async function updateAuth(){
    if (authObj.verifying) return
    authObj.verifying = true

    async function validateSessions(){
        try{
            const rresponse = await fetch("/api/authorize")
            const response = await rresponse.json();
            return response
        } catch {
            return { status: "error" }
        }
    }
    
    const response = await validateSessions();
    authObj.verifying = false

    if(response && response.status == "ok"){
        console.log("SESSIONS: ✅")
        authObj.AUTHORIZED       = true
        const accountItem        = JSON.parse(window.localStorage.getItem("account"))
        authObj.uid              = accountItem.uid
        authObj.account.username = accountItem.username
        authObj.account.pfp      = accountItem.pfp
        if(!isValidImage(authObj.account.pfp)){
            authObj.account.pfp = tempPfp
        }
        userActivate()
        return
    }
    
    authObj.AUTHORIZED = false
    showAuthModal()
}

/*
 * AUTHENTICATE USER
 * fill user details to authenticate
 * them, user form needs to be filled
 * with username and passcode.
 * 
 * if user session exists, set username
 * input tag to previous username
 */
async function authenticateUser(e){
    e.preventDefault();
    authForm.querySelector("button").innerText = "loading.."
    
    async function validateForm(username = null, password = null){
        
        if (!password){
            return "invalid"
        }
        try{
            const rresponse = await fetch("/api/authenticate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body:JSON.stringify({
                    username: username,
                    password: password
                })
            })
            const response = await rresponse.json();
            return response
        } catch {
            return { status: "error" }
        }
    }
    
    const username = e.target[0].value
    const password = e.target[1].value

    const response = await validateForm(username, password)
    authForm.querySelector("button").innerText = "submit"

    if (!response){
        e.target[0].value = ""
        alert("error")
        return
    }
    else if(response.status == "error"){
        e.target[0].value = ""
        alert("server error", response.message)
    }
    else if(response.status == "ok"){
        authObj.AUTHORIZED = true

        let previousPfp = ""
        let accountItem = window.localStorage.getItem("account")
        if(accountItem){
            previousPfp = JSON.parse(accountItem).pfp
        }
        if(!isValidImage(previousPfp)){
            previousPfp = tempPfp
        }
        accountItem = {
            uid      : randomUUID(8),
            username : username,
            pfp      : previousPfp
        }
        authObj.account.username = username
        authObj.uid = accountItem.uid

        window.localStorage.setItem("account", JSON.stringify(accountItem))
        userActivate()
        authModal.close()
    }
}

function forceClose(e){
    if (!authObj.AUTHORIZED){
        e.preventDefault();
        showAuthModal()
    }
}

if (authObj.AUTHORIZED == false) updateAuth()
authModal.addEventListener("close", forceClose)
authForm.addEventListener("submit",authenticateUser)

function userActivate(){
    if (authObj.AUTHORIZED){
        socketInit()
        defaultState();
        updateSidebarContents();
        loadChatMessages();
        updateUserDOMElements(); //
    }
}
