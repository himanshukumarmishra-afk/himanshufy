console.log('Lets Write JawaScript')
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let i = 0; i < as.length; i++) {
        const element = as[i]
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""




    //show all the songs and singers in the playlist
    for (const song of songs) {
        songUL.innerHTML += `<li><img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${cleanSongName(song)}</div>
                                <div>${getSingerName(song)}</div>

                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div>
                        </li>
                    </ul>`;

    }

    //eventlistner to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })
    })

    return songs;
}
function highlightCard(clickedCard) {
    document.querySelectorAll(".card").forEach(card => {
        card.classList.remove("active-card");
    });

    clickedCard.classList.add("active-card");
}

function highlightCurrentSong(track) {
    let allSongs = document.querySelectorAll(".songList li");

    allSongs.forEach(li => {
        li.classList.remove("active-song");

        let songName = li.querySelector(".info div").innerText.trim().toLowerCase();
        if (songName === track.toLowerCase()) {
            li.classList.add("active-song");
        }
    });
}

const cleanSongName = (filename) => {
    let name = decodeURIComponent(filename)
        .replace(/\(.*?\)|Full Video Song|Full Audio|Official Visualizer|Latest Punjabi Song \d+/gi, "")
        .split(/[-|–]/)[0]
        .trim()
        .split(" ")
        .slice(0, 2)
        .join(" ");

    // Ensure exactly one .mp3 at the end
    return name.replace(/\.mp3$/i, "") + ".mp3";
};


const getSingerName = (filename) => {
    const name = decodeURIComponent(filename)
        .toLowerCase()
        .replace(/\.mp3|\(.*?\)|full video song|full audio|official visualizer|latest punjabi song \d+/gi, "");

    const singers = [
        ["dagabaaz", "Salman Khan"],
        ["haseen", "Talwinder"],
        ["raanjhanaa", "A. R. Rahman"],
        ["mast", "Mika Singh"],
        ["sahiba", "Rikhari"],
        ["raabta", "Arijit Singh"],
        ["teri", "Rahat Fateh"],
        ["dhandho", "Munawar"],
        ["raat", "Seedhe Maut"],
        ["old", "AP Dhillon"],
        ["brown", "Raga"],
    ];

    return singers.find(([key]) => name.includes(key))?.[1] || "Himanshu";
};



const playMusic = (track, pause = false) => {
    // let audio=new Audio("/songs/" + track) 

    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

    // 🔥 highlight current song
    highlightCurrentSong(cleanSongName(track));

}


async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        const url = new URL(e.href);

        // Only folders directly inside /songs/
        if (
            url.pathname.startsWith("/songs/") &&
            url.pathname.split("/").length === 4 &&  // /songs/folder/
            !url.pathname.endsWith(".mp3")
        ) {
            let folder = url.pathname.split("/")[2];
            console.log(folder);

            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();

            cardContainer.innerHTML += `
            <div data-folder="${folder}" class="card">
                <div class="play">
                    <div class="spotify-play"></div>
                </div>
                <img src="/songs/${folder}/cover.jpg" alt="">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>
        `;
        }
    }


    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            highlightCard(item.currentTarget);
            // songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            // playMusic(songs[0])
            const playlist = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            currentSong._playlist = playlist;   // store playlist in audio
            playMusic(playlist[0]);

        })
    })
}



async function main() {
    //get the list of all songs
    await getsongs("songs/ncs");
    console.log(songs);



    // Display all the albums on the page
    await displayAlbums()





    //eventlistner to play 
    const play = document.getElementById("play");
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })


    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listener to previous

    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("Previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to next

    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })
    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })




    //auto next song
    currentSong.addEventListener("ended", () => {
        const playlist = currentSong._playlist;
        if (!playlist || !playlist.length) return;

        const currentTrack = currentSong.src.split("/").pop();
        const index = playlist.indexOf(currentTrack);

        if (index !== -1 && index + 1 < playlist.length) {
            playMusic(playlist[index + 1]);
        }
    });

    // const firstCard = document.querySelector(".card");
    // if (firstCard) {
    //     firstCard.click();
    //       play.src = "play.svg"; 

    // }
    const firstCard = document.querySelector(".card");
    if (firstCard) {
        firstCard.click();

        // stop autoplay immediately
        setTimeout(() => {
            currentSong.pause();
            play.src = "img/play.svg";
        }, 50);
    }


}


main()

let grow = true;
let grow2 = true;

setInterval(() => {

    let el = document.getElementById("barin");
    if (currentSong.paused) {
        return
    }
    if (!el) return;

    el.style.transform = grow ? "scale(1.10)" : "scale(1)";
    el.style.boxShadow = "0 8px 40px rgba(83, 87, 85, 1)";
    grow = !grow;

    let ell = document.getElementById("barin2");
    if (currentSong.paused) {
        return
    }
    if (!ell) return;

    ell.style.transform = grow ? "scale(1.10)" : "scale(1)";
    ell.style.boxShadow = "0 8px 40px rgba(83, 87, 85, 1)";
    grow2 = !grow2;
}, 800);