import { drawObj, closeDrawModal } from "./drawscript.js"
import { setChatOverlay } from "./frameState.js";

document.body.addEventListener("pointerup",PointerAndTouchUp)
document.body.addEventListener("touchend",PointerAndTouchUp)

function PointerAndTouchUp(e){
    document.querySelectorAll(".highlightEffect").forEach(n=>{
        n.classList.remove("highlightEffect")
    })
}

$("#userMessageModal").addEventListener("click", (e) => {closeModalOnOutsideClick(e, $("#userMessageModal"))})
$("#profileModal").addEventListener("click", (e) => {closeModalOnOutsideClick(e, $("#profileModal"))})
$("#drawModal").addEventListener("click", (e) => {closeModalOnOutsideClick(e, $("#drawModal"))})

function closeModalOnOutsideClick(e,elem){
    const dialogDimensions = elem.getBoundingClientRect()
    if (
      e.clientX < dialogDimensions.left ||
      e.clientX > dialogDimensions.right ||
      e.clientY < dialogDimensions.top ||
      e.clientY > dialogDimensions.bottom
    ) {
        elem.close()
        closeDrawModal();
    }

}



document.body.addEventListener("keydown", GLOBAL_KEYDOWN)

function GLOBAL_KEYDOWN(e){
  const {altKey, ctrlKey, shiftKey, code} = e;
//   console.log(code)
  if(code == "Escape"){
    if ( $("#userMessageModal").classList.contains("hide") == false ){
        setChatOverlay(false)
        return
    }
    if ( $(".overlayChatWindow").classList.contains("hide") == false ){
      setChatOverlay(false)
      return;
    }
  }

  if( $(".overlayChatWindow").classList.contains("hide") == true ){
    // different key codes for different frame states
    if( $(".overlayFrame").dataset.state === "embed" ){
        switch(code){
            case "":
                console.log("");
                break;

            case "KeyC":
                console.log("chat");
                break;
        }
    }
    else if( $(".overlayFrame").dataset.state === "movie" ){
        switch(code){
            case "Space":
                console.log("playpause");
                break;
            case "KeyF":
                console.log("F");
                break;

            case "KeyC":
                console.log("chat");
                break;
        }
    }
    else if( $(".overlayFrame").dataset.state === "draw" ){
        switch(code){
            case "KeyB":
                console.log("B");
                drawObj.setTool("brush")
                break;
            case "KeyV":
                console.log("V");
                drawObj.setTool("pan&zoom")
                break;
            case "KeyE":
                console.log("E");
                drawObj.setTool("erase")
                break;
            case "KeyF":
                console.log("F");
                drawObj.setTool("bucket")
                break;
            case "KeyZ":
                if(ctrlKey && !shiftKey && !altKey){
                    console.log("undo")
                }
                else if(ctrlKey && shiftKey && !altKey){
                    console.log("redo")
                }
                console.log("Z");
                break;
            case "KeyY":
                console.log("Y");
                break;
            case "KeyC":
                console.log("chat");
                break;
        }
    }
  }
}