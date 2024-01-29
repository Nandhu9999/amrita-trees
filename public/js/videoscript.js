export function updateMovieState(stream = "",captions = ""){
    if (!$(".movieFrame")) {return}
    
    $(".movieFrame").remove()

    console.log("stream link:",stream)
    console.log("captions link:",captions)

    const movieFrame = document.createElement("video")
    const source     = document.createElement("source")
    const  track     = document.createElement("track")

    movieFrame.classList.add("movieFrame")
    movieFrame.controls = true
    source.src       = stream
    source.type      = "video/mp4"
    track.src        = captions
    track.label      = "English"
    track.kind       = "captions"
    track.srclang    = "en-us"
    track.default    = true

    movieFrame.appendChild( track)
    movieFrame.appendChild(source)    
    
    $(".overlayFrame").prepend(movieFrame)
}