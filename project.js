// here we aretying to fetch music list from directory  but its not a good idea we will get songs list from server through api
// console.log("garima")
let currentSongs = new Audio()
let songs;
let currentFolder;


// here we are trying to give the folder name in parameter so our song will be fetch into a folder then show accordingly on UI 
async function getSongs(folder){ 
    currentFolder = folder;

        let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
        // console.log(a)
        let response = await a.text();
        // console.log(response);
        let div =  document.createElement("div");
        div.innerHTML = response;
        let as = div.getElementsByTagName("a");
        // console.log(as)
        songs = []
        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            // console.log(element)

            if(element.href.endsWith(".mp3")){
                songs.push(element.href.split(`/${folder}/`)[1])
            }
            
        }
        // console.log(songs)
        // return songs
        let songUL = document.querySelector(".songPlaylist").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
    songUL.innerHTML = songUL.innerHTML + `<li> 
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 18V5l12-2v13"/>
                            <circle cx="6" cy="18" r="3"/>
                            <circle cx="18" cy="16" r="3"/>
                        </svg>
                        <div class="info"> 
                            <div>${song.replaceAll("%20"," ")}</div>
                            <div>GARIMA JAIN</div>
                        </div>
                        <div class="playnow">
                        <span>Play Now</span>
                        <img class="invert" src="project_playNow.svg">
                        </div>
                        </li>`;
        
    }

    // attach an a eventlistner to each song

    Array.from(document.querySelector(".songPlaylist").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click",element=>{
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
        // console.log(e.querySelector(".info").firstElementChild.innerHTML)

    })
    return songs

}

const playMusic = (track , pause=false)=>{
    // let audio = new Audio("/project_songs/"+track)
    // audio.play()
    currentSongs.src = `/${currentFolder}/`+track
    if(!pause){
        currentSongs.play()
        play.src = "project_pause.svg"
    }
    
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}

// playing next music 
currentSongs.addEventListener("ended",()=>{
    playNextSongs()
})

function playNextSongs(){
    currentSongs.pause();
    const currentIndex = songs.indexOf(currentSongs.src.split("/").slice(-1)[0])
    console.log(currentIndex)
    if(currentIndex+1 < songs.length){
        playMusic(songs[currentIndex+1])
    }
}

// display album dynamically on the page

async function displayAlbum(){
    let a = await fetch(`http://127.0.0.1:3000/project_songs/`)
    let response = await a.text();
    let div =  document.createElement("div");
    div.innerHTML = response;
    console.log(div)
    let anchors = div.getElementsByTagName("a")
    console.log(anchors)
    let cardContainer = document.querySelector(".cardContainer")

    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        
        
        if(e.href.includes("/project_songs")){
            console.log(e.href.split("/").slice(-2)[0])
            let fol = e.href.split("/").slice(-2)[0]
            // get the meta data of the  folder
            let a = await fetch(`http://127.0.0.1:3000/project_songs/${fol}/info.json`)
            let response = await a.json();
            console.log(response)

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${fol}" class="card">
            <div  class="play">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50%" height="50%" class="play-button">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
            </div>
            <img src="/project_songs/${fol}/cover.jpg">
            
            <h2>${response.title}</h2>
            <p>${response.description}</p>
            
        </div>`
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        // console.log(e)
        e.addEventListener("click", async item=>{
            songs =await getSongs(`project_songs/${item.currentTarget.dataset.folder}`)
            // if i want to automatically play a song according to select folder (1 song)
            playMusic(songs[0])
        })
    })

}


async function main(){
  
    // get the all songs list
    await getSongs("project_songs/god")       //project songs m ncs 1 folder h 
    // console.log(songs)
    // now here we are trying to load one song when we load browser
    playMusic(songs[0],true)
    

    //  attach an a eventlistner to play,next,previous buttons
    play.addEventListener("click",()=>{
        if(currentSongs.paused){
            currentSongs.play()
            play.src = "project_pause.svg"
            
        } else {
            currentSongs.pause()
            play.src = "project_play.svg"
        }

    })

    // listen for time update
    // currentSongs.addEventListener("timeupdate",()=>{
    //     console.log(currentSongs.currentTime , currentSongs.duration)
    // })
    currentSongs.addEventListener("timeupdate", () => {
        // Function to convert seconds to minutes in "mm:ss" format
        function formatTime(seconds) {
            var minutes = Math.floor(seconds / 60);
            var remainingSeconds = Math.floor(seconds % 60);
            return (
                (minutes < 10 ? "0" : "") + minutes + ":" +
                (remainingSeconds < 10 ? "0" : "") + remainingSeconds
            );
        }

        document.querySelector(".songtime").innerHTML = `${formatTime(currentSongs.currentTime)} / ${formatTime(currentSongs.duration)}`
        // here i am adding the circle property 
        document.querySelector(".circle").style.left = (currentSongs.currentTime / currentSongs.duration)*100 + "%";
        // console.log("Current Time:", formatTime(currentSongs.currentTime));
        // console.log("Duration:", formatTime(currentSongs.duration));
    });

    // add a event listner to seekbar
    document.querySelector(".seekbar").addEventListener("click",e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSongs.currentTime = ((currentSongs.duration)*percent)/100
    })


    //add a event on hamburger when we click on this then lieft bar show 
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "0"
    })

    // add event listner for  close button

    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "-120%"
    })


    // add event listner to previous and next listner
    previous.addEventListener("click",()=>{
        console.log("previous click")
        currentSongs.pause()
        index = songs.indexOf(currentSongs.src.split("/").slice(-1)[0])
        if((index-1)>=0){
            playMusic(songs[index-1])
        }
    })

    next.addEventListener("click",()=>{
        console.log("next click")
        currentSongs.pause()
        console.log(currentSongs.src.split("/").slice(-1)[0])

        index = songs.indexOf(currentSongs.src.split("/").slice(-1)[0])
        if((index+1)<(songs.length)){
            playMusic(songs[index+1])
        }
        console.log(index)

    })

    // add a event listner to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        console.log(e , e.target ,e.target.value)
        currentSongs.volume = parseInt(e.target.value)/100
        if(currentSongs.volume>0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("project_mute.svg" , "project_volume.svg")
        }
    })

    // load the playlist whenever card is clicked

    // cuurentTarget we are using for this
    // Array.from(document.getElementsByClassName("card")).forEach(e=>{
    //     // console.log(e)
    //     e.addEventListener("click", async item=>{
    //         songs =await getSongs(`project_songs/${item.currentTarget.dataset.folder}`)
             
    //     })
    // })


    // display all the albums on the page
    await displayAlbum()
    

    // add event listner to mute volume button
    document.querySelector(".volume>img").addEventListener("click",(e)=>{
        console.log(e.target.src)
        if(e.target.src.includes("project_volume.svg")){
            // its a string and string are mutable so we need to store in variable
           e.target.src= e.target.src.replace("project_volume.svg","project_mute.svg");
            currentSongs.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else{
            e.target.src = e.target.src.replace("project_mute.svg" , "project_volume.svg");
            currentSongs.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    }
    )
  


}

main()