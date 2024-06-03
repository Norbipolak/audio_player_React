import { FontAwesomeIcon } from "@fontawesome/react/react-fontawesome";
import { useEffect, useRef, useState } from "react"; 

function AudioPlayer() {
    const [player, setPlayer] = useState(new Audio());
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(75);
    const [trackList, setTrackList] = useState([]);
    const [trackSlider, setTrackSlider] = useState(0);
    const [trackIndex, setTrackIndex] = useState(0);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [currentTime, setCurrentTime] = useState({
        h: "00",
        m: "00",
        s: "00"
    });
    const [listDuration, setListDuration] = useState({
        h: "00",
        m: "00",
        s: "00"
    });
    const inputRef = useRef(null);

    const timeObj = (sec)=> {
        return {
            h: Math.floor(sec/3600).toString().padStart(2, "00"),
            m: Math.floor(sec%3600/60).toString().padStart(2, "00"),
            s: Math.floor(sec%60).toString().padStart(2, "00")
        }
    }

    const loadMusic = ()=> {
        const files = e.target.files;
        let index = 0;

        for(let i = 0; i < files.length; i++) {
            const p = new Audio();
            p.src = require(`../tracks/${files[i].name}`);
            p.load();

            p.onloadeddata = ()=> {
                const audioObj = {
                    name: files[i].name,
                    duration: getTimeObj(p.duration)
                }

                setTrackList(previousList=> previousList, audioObj);

                if(index === files.length - 1) {
                    setDataLoaded(true);
                }

                index++;
            }
        }
    };

    const play = ()=> {
        if(!isPlaying) 
            player.play();
        else 
            player.pause();

        setIsPlaying(ip=> !ip);
    }

    const stop = ()=> {
        player.pause();
        player.currentTime = 0;
        setIsPlaying(false);
    }

    const adjustVolume = (vol)=> {
        setVolume(vol);
        player.volume = vol/100;
    }

    const adjustTrackSlider = (percentage)=> {
        setTrackSlider(percentage);
        player.currentTime = percentage/100 * player.duration;
    }

    const timeUpdated = ()=> {
        const percentage = player.currentTime/player.duration * 100;
        if(isNaN(percentage))
            return;

        setTrackSlider(Math.round(percentage*10)/10);
        setCurrentTime(getTimeObj(player.currentTime));
    };

    const selectTrack = (index)=> {
        setTrackIndex(index);
        player.pause();
        player.src = require(`../tracks/${trackList[index].name}`);

        if(isPlaying) 
            player.play();
    } 

    const removeTrack = (index, e)=> {
        e.stopPropagation();

        if(index === trackIndex && isPlaying)
            return;

        const tracks = [...trackList];
        tracks.splice(index, 1);

        setTrackList(tracks);
    }

    const clearList = ()=> {
        setTrackList([]);
    }

    const forward = ()=> {
        if(trackList.length === 0)
            return;

        if(trackIndex < trackList.length - 1) {
            setTrackIndex(prevIndex=> prevIndex + 1);
            player.pause();
            player.src = require(`../tracks/${trackList[trackIndex + 1].name}`); 
        } else {
            setTrackIndex(0);
            player.src = require(`../tracks/${trackList[0].name}`); 
        }
    }

    const backward = ()=> {
        if(trackList.length === 0)
            return;

        if(trackIndex > 0) {
            setTrackIndex(prevIndex=>prevIndex-1);
            player.pause();
            player.src = require(`../tracks/${trackList[trackIndex-1].name}`);
        } else {
            setTrackIndex(trackList.length-1);
            player.src = require(`../tracks/${trackList[trackList.length-1].name}`);
        }

        if(isPlaying)
            player.play();
    };

    useEffect(()=> {
        player.ontimeupdate = timeUpdated;
    }, []);

    const getSecFromTimeObj = (timeObj)=> {
        return parseInt(timeObj.h) * 3600 + parseInt(timeObj.m) * 60 + parseInt(timeObj.s);
    };

    useEffect(()=> {
        if(!dataLoaded)
            return;

        player.src = require(`../tracks/${trackList[trackIndex].name}`);
        inputRef.current.value = "";

        let sec = trackList.reduce((subTotal, t)=> subTotal + getSecFromTimeObj(t.duration), 0);
        setListDuration(getTimeObj(sec));

        return ()=>setDataLoaded(false);
    }, [dataLoaded]);

    return(
        <div className="audio-player">
        <div style={{padding:"15px"}}>
            <input onChange={loadMusic}
            ref={inputRef} type="file" multiple/>
        </div>

        <div className="player-controls">
            <div className="play-pause-stop">
                <FontAwesomeIcon onClick={play}
                className="pointer"
                icon={"fa-regular " + (!isPlaying ? "fa-circle-play" : "fa-circle-pause")} />
                
                <FontAwesomeIcon onClick={stop}
                className="pointer"
                icon="fa-regular fa-circle-stop" />
            </div>
            <div className="center-controls">
                <div className="pointer">
                    <FontAwesomeIcon onClick={backward}
                    icon="fa-solid fa-backward-step" />
                </div>

                <input className="w100"
                value={trackSlider} onChange={e=>adjustTrackSlider(parseFloat(e.target.value))}
                step={0.1} type="range" min={0} max={100}/>

                <div className="pointer">
                    <FontAwesomeIcon onClick={forward}
                    icon="fa-solid fa-forward-step" />
                </div>
            </div>
            <div className="vertical-center">
                <input className="w100" 
                value={volume} onChange={(e)=>adjustVolume(parseFloat(e.target.value))}
                type="range" min={0} max={100}/>
            </div>
        </div>
        <div className="audio-information mb-15">
            <div>
                {
                    trackList.length > 0 ? 
                    trackList[trackIndex].name :
                    "-"
                }
            </div>
            <div>
                {currentTime.h}:
                {currentTime.m}:
                {currentTime.s}
            </div>
        </div>
        <div className="tracklist mb-15">
            {
                trackList.map((track, i)=> 
                    <div onClick={()=>selectTrack(i)}
                    key={i} className={"tracklist-element " 
                    + (trackIndex === i ? "current-track" : "")}>
                        <div>
                            {track.name}
                        </div>
                        <div>
                            {track.duration.h}:
                            {track.duration.m}:
                            {track.duration.s}

                            <FontAwesomeIcon 
                            onClick={(e)=>removeTrack(i, e)}
                            className="ml-5"
                            icon="fa-regular fa-circle-xmark" />
                        </div>
                    </div>
                )
            }
        </div>

        <div className="tracklist-information">
            <div>
                {listDuration.h}:
                {listDuration.m}:
                {listDuration.s}
            </div>
            <div>
                <FontAwesomeIcon 
                onClick={clearList}
                className="pointer"
                icon="fa-regular fa-trash-can"/>
            </div>
            </div>
        </div>
    );
}

export default AudioPlayer;

/*
fontos, hogy ha van egy input mezőnk, akkor az lehet file is a type-ja, amit így irunk be, ugyanugy, mintha js-ben lennénk!! 
type="file" 
a file input az egy string-et tartalmaz, ami reprezentálja egy kiválaszott file-nal a path-ját!!! 
nagyon fontos, hogyha itt meg van adva az hogy multiple, akkor meg van enegedve a felhasználónak, hogy több file-t is ki tudjon választani!!!! 
itt még lehet egy olyan is, hogy accept és akkor meg tudjuk határozni, hogy ez a input milyen file-okat fogadhat!!!!!!! 
pl. accept:".doc", "xml" így!!
<input type="file" accept="image/*,.pdf" />
<form method="post" enctype="multipart/form-data">
  <div>
    <label for="file">Choose file to upload</label>
    <input type="file" id="file" name="file" multiple />
  </div>
  <div>
    <button>Submit</button>
  </div>
</form>

és akkor itt ki lehet választani file-okat 
és a multiple-vel, amit itt is használtunk egyszerre több file is ki tudunk választani!!! 

és ilyenkor visszakapuk egy HTMLInputElement.files-t, ami tartalmazni fogja a következőket 
name -> a file neve 
lastModified -> hogy mikor volt utoljára módosítva a file
size -> hogy mekkora a file (byte-ban)
type -> mime típusa a file-nak!! 

és ha ezt lementjük akkor tudunk neki adni egy eventListener-t change-vel meg cancel-vel is 
meg is tudjuk határozni, hogy mibe írja ki a file méretét 
function returnFileSize(number) {
  if (number < 1024) {
    return `${number} bytes`;
  } else if (number >= 1024 && number < 1048576) {
    return `${(number / 1024).toFixed(1)} KB`;
  } else if (number >= 1048576) {
    return `${(number / 1048576).toFixed(1)} MB`;
  }
}

vagy van rengeteg file típusunk és meg karjuk nézni, hogy validak-e 
const fileTypes = [
  "image/apng",
  "image/bmp",
  "image/gif",
  "image/jpeg",
  "image/pjpeg",
  "image/png",
  "image/svg+xml",
  "image/tiff",
  "image/webp",
  "image/x-icon",
];

function validFileType(file) {
  return fileTypes.includes(file.type);
}
ez vissza fogja adni, hogy true vagy false!!! 

Még nagyon fontos, hogy csinálhatunk rá egy label-t, ahol megmondjuk a felhasználónak, hogy ez mire jó egy leírás
<label for="avatar">Choose a profile picture:</label>

<input type="file" id="avatar" name="avatar" accept="image/png, image/jpeg" />

tehát a label az erre jó és ott van egy olyan, hogy for -> for="avatar"
és akkor ha az input-nak van egy olyan id-je, hogy avatar vagy className, akkor tudni fogjuk, hogy ezt a label-t, ezt mire csináltuk!!!!

accept-nél pedig, ahol meg tudjuk határozni, hogy az input milyen file-okat fogadhat
-> 
audio/* -> ha ezt írjuk be, akkor el fog fogadni minden audio file-t 
video/* -> minden video file 
image/* -> minden image file 
-> 
<input type="file" accept="image/*,.pdf" />
ez elfogad minden image file és pdf-et is 
de amugy meg pont-val tudjuk ezeket felsorolni -> ".doc", ".jpg", ".pdf"
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

Ez ki fogja nekünk írni, hogy a felhasználó bezárta a pop-up, anélkül, hogy választott volna egy file-t 

const elem = document.createElement("input");
elem.type = "file";
elem.addEventListener("cancel", () => {
  console.log("Cancelled.");
});
elem.addEventListener("change", () => {
  if (elem.files.length == 1) {
    console.log("File selected: ", elem.files[0]);
  }
});
elem.click();
******************************************************************************************************
fontos, hogy ha itt akarunk React-ben valamit formázni jsx-ben akkor {} és abba még egy {} és abba tudjuk megadni, hogy mit akarunk 
fontos, hogy "" az érték
-> 
style={{padding: "15px"}}
**********************************************
Felső része a dolognak 
        <div className="audio-player">
        <div style={{padding:"15px"}}>
            <input onChange={loadMusic}
            ref={inputRef} type="file" multiple/>
        </div>

        <div className="player-controls">
            <div className="play-pause-stop">
                <FontAwesomeIcon onClick={play}
                className="pointer"
                icon={"fa-regular " + (!isPlaying ? "fa-circle-play" : "fa-circle-pause")} />
                
                <FontAwesomeIcon onClick={stop}
                className="pointer"
                icon="fa-regular fa-circle-stop" />
            </div>
            <div className="center-controls">
                <div className="pointer">
                    <FontAwesomeIcon onClick={backward}
                    icon="fa-solid fa-backward-step" />
                </div>

                <input className="w100"
                value={trackSlider} onChange={e=>adjustTrackSlider(parseFloat(e.target.value))}
                step={0.1} type="range" min={0} max={100}/>

                <div className="pointer">
                    <FontAwesomeIcon onClick={forward}
                    icon="fa-solid fa-forward-step" />
                </div>
            </div>
            <div className="vertical-center">
                <input className="w100" 
                value={volume} onChange={(e)=>adjustVolume(parseFloat(e.target.value))}
                type="range" min={0} max={100}/>
            </div>
        </div>

van egy audio-player amiben vannak a dolgok, ez a container tulajdonképpen 
ebben legfelül van egy div, amiben van egy input mező ezzel fogjuk majd betölteni a számokat 
fontos dolgok itt 
- input type-ja az, hogy file ezzel tudunk file-okat betölteni 
- multiple -> hogy ne csak egy file-t tudjunk majd feltölteni, hanem többet 
- accept -> az itt nincs, de ezzel meg tudjuk határozni, hogy milyen típusú file-okat fogad ez az input, tudunk itt vele feltölteni 
accept={".jpeg, .png"} ilyen formátumban, ponttal kell beírni és mindent egy stringben!!
ez visszaad nekünk egy HTML elementet, ha így ugye const elem = document.creteElement("input") ha vagy ha lementjük querySelector-val stb. 
fontos, hogy van olyan metódusa, hogy click(), focus(), blur() stb. 
és, hogy ha beírjuk, hogy const files =  elem.files, akkor végig tudunk rajtuk menni!!! 
van olyanja még, hogy multiple, accept, disabled, meg olyan propjai, hogy lastUpdate, name, size stb. 
és tudunk még, erre, hogy elem event-eket is adni meg remove-olni is általában "change" meg "cancel"
elem.addEventListener("change", ()=> {}) stb, így 
*********************************************
következő dolog, hogy itt van a player-controls
        <div className="player-controls">
            <div className="play-pause-stop">
                <FontAwesomeIcon onClick={play}
                className="pointer"
                icon={"fa-regular " + (!isPlaying ? "fa-circle-play" : "fa-circle-pause")} />
                
                <FontAwesomeIcon onClick={stop}
                className="pointer"
                icon="fa-regular fa-circle-stop" />

itt ebbe ikonokat, mentettünk le és nagyon fontos, hogy ezt az App-ben be is kell hívni meg a kisbetűs library-t is ahol átadjuk neki egy add-val
ezeket, hogy library.add(fa-circle-play, fa-circle-pause) az összeset, amit fel szeretnénk használni!!

és itt a FontAwesomeIcont ilyen formában beletesszük, mintha egy a-link lenne pl. -> <FontAwesomeIcon/>
erre lehet adni egy onClick pl. ami egy függvény lesz egy new Audio-s dologbeépített függvény és ez fogja nekünk lejátszani a számot, 
mert van egy olyan metódusa, hogy play()
icon=""-val megadjuk, hogy pontosan melyik ikon kell nekünk -> icon="fa regular fa-circle-stop"
de itt ez az ikon az majd változni fog aszerint, hogy megy a szám vagy még nem erre csináltunk egy isPlaying useState-s változót 
->
amit a play függvényben megvizsgálunk, hogy isPlaying, mert ha nem, akkor a play-vel lejátszuk a számot ha meg igen, akkor meg 
pause()-val megállítjuk  
-> 
const [isPlaying, setIsPlaying] = useState(false);
const play = ()=> {
    if(!isPlaying) 
        player.play();
    else 
        player.pause();

        setIsPlaying(ip => !ip) ezt meg az ellentetjére váltjuk ha lefut a függvény, tehát akkor ha megnyomtuk a gombot illetve az ikont!! 
}
még fontos, hogy ez a player ez onnan jön, hogy ez egy useState-s változó, amiben csináltunk egy new Audio-t! 
const [player, setPlayer] = useState(new Audio());
és ennek vannak különböző metódusai, mint play(), pause() meg lehet adni props-ban, hogy src és akkor azt fogja lejátszani 

ami a stop ikonra van csinálva dolog az teljesen ugyanígy müködik, annyi különbséggel, hogy ott az ikon az a fa-regular fa-circle-stop 
erre is csinálunk egy onClick-et, amiben ha rákattintunk, akkor lemegy az, hogy álljon meg a zene itt a csak a player.pause() lesz 
meg az, hogy currentTime = 0; mert pause()-val csak megállítujuk a currentTime prop-val meg ha az nulla, akkor majd az elejétől fog kezdődni 
const stop = ()=> {
    player.pause();
    player.currentTime = 0;
    setIsPlaying(false);
}
és itt még fontos az is, hogy a isPlaying az false legyen mindig, mert ha rá akarunk kattintani, hogy play, akkor az így jó! 
*********
            <div className="center-controls">
                <div className="pointer">
                    <FontAwesomeIcon onClick={backward}
                    icon="fa-solid fa-backward-step" />
                </div>

                <input className="w100"
                value={trackSlider} onChange={e=>adjustTrackSlider(parseFloat(e.target.value))}
                step={0.1} type="range" min={0} max={100}/>

                <div className="pointer">
                    <FontAwesomeIcon onClick={forward}
                    icon="fa-solid fa-forward-step" />
                </div>
            </div>
            <div className="vertical-center">
                <input className="w100" 
                value={volume} onChange={(e)=>adjustVolume(parseFloat(e.target.value))}
                type="range" min={0} max={100}/>
            </div>
**************************
itt van két range-es input típusunk ez olyan, mint a csúszka, fontos, hogy itt be tudunk állítani egy min, max meg egy step-et 
min={0} max={100} step={1}  
és itt onChange-t kell majd használni fontos, hogy ezt, amit innen megszerzünk számot azt majd át kell adni a függvényeknek 
1. volume -> onChange={(e)=>adjustVolume(parseFloat(e.target.value))}
    Erre csináltunk egy adjustVolume függvényt, ami vár majd egy volume-ot és ez lesz amit innen a input-ból megadunk neki 
    a e.target.value!!!! 
    fontos, hogy ezt parseInt-elni kell mert nekünk egy number kell majd, amit meg innen megkapunk az egy string lesz, mondjuk így "55" 

    Nagyon fontos, hogy value-val mindig hozzá legyen kötve ez a dolog a useState-s változóhóz value={volume}!!!!! 
    mert ugye van egy useState-s változónk, hogy const [volume, setVolume] = useState(75);!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

és ezt a useState-s változó értékét fogjuk set-elni a függvényben, arra ami megváltozót itt az input-ban 
Tehát, fontos, hogy itt mindig value-ja legyen az ami a useState-s változó értéke, mert ha ez megváltozik akkor 
set-eljük a függvényben és itt value miatt meg fogja kapni az új értéket!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

const adjustVolume = (vol)=> {
setVolume(vol);
player.volume = vol/100 -> ezzel meg ténylegesen le fogja hallkítani vagy hangosítani, fontos, hogy ennek a volume props 
ez csak 0-1-ig van!!! ezért a mi értékünket el kell majd osztani 100-val!!! 
}

2. trackSlider 

<input className="w100"
    value={trackSlider} onChange={e=>adjustTrackSlider(parseFloat(e.target.value))}
    step={0.1} type="range" min={0} max={100}/>

ez is nagyon hasonló, mint a volume, ez így type="range" meg itt is meg tudunk adni min-t max-ot 
meg onChange-vel ki tudjuk szedni az értékét, amit majd egy függvényben set-elünk a hozzá tartozó useState-s változónak 
value meg hozzá legyen kötve itt is az input-hoz value={trackSlider}

const [trackSlider, setTrackSlider] = useState(0);

de itt még nagyon fontos, hogy nem mindegy, hogy milyen hosszú egy szám, ezért majd be kell szorozni a duration-val 
mert ez egy %, hogy hol tart a szám, de egy 5 perc-es számnak a 50% nem ugyanott van, mint egy 3 perces számnak!!! 
player.duration props meg tudja mondani, hogy milyen hosszú egy szám!!!!! 

const adjustTracker = (percentage)=> {
    setTrackSlider(percentage);
    player.currentTime = percentage/100 * player.duration;
}

3. 
    <div className="pointer">
        <FontAwesomeIcon onClick={backward}
        icon="fa-solid fa-backward-step" />
    </div>

itt van az, hogy hátra akaruk tekerni meg előre van egy div amiben benne van ez a FontAwesomeIcon-os dolog 
ahol az icon="fa solid fa-backward-step" 
ez nagyon hasonló lesz, mint a képek, amikor előre akarunk menni meg vissza és tudni kell azt, hogy hol vagyunk 
erre itt létrehozunk egy useState-s változót, hogy trackIndex
const [trackIndex, setTrackIndex] = useState(0);
meg van egy trackList is, ami egy tömb lesz és itt lesz az összes számunk!!! 
const [trackList, setTrackList] = useState([]);

mit kell itt megvizsgálni, hogy előre tudjunk menni
1. hogyha a trackList.length-je az nulla, akkor azt jelenti, hogy nincsen egy számunk se ebbe!! 
2. mikor tudunk előre menni, hogyha az trackIndex az kisebb, mint a trackList.length - 1 !!! 
és akkor src-be berakjuk a következő számot!!! fontos a require itt 
else ha meg ez nem igaz, hogy a trackIndex az kisebb mint a trackList.length - 1 az azt jelenti, hogy az utolsó számon vagyunk 
és ilyenkor majd az elsőre kell ugranunk itt 2 dolog van 
    - beállítani az első számnak a src-ét 
    - a trackIndex-et le kell nullázni

az elsőben meg a trackIndex-et egyel kell növelni!! itt van egy olyan dolog, hogy prevIndex ami azelőtt volt elmagyarazas.js!!!!! 

tehát első a kikőtés, hogy mikor nem jó a dolog, ilyenkor kell egy return 
if(trackList.length === 0)
    return;

mit csinálunk mikor if-be jó a feltétel, hogy még nem vagyunk az utolsó számon
- leállítjuk a player.pause()-val 
- megadjuk neki az új src-t 
- set-eljük a trackIndex-et egyel nagyobbra -> setTrackIndex(prevIndex=> prevIndex + 1)

ha viszont else-be megy tehát az utolsó számon vagyunk 
- akkor biztos, hogy az első szám src-ét kell neki megadni 
- set-eljük a trackIndex-et 0-ra, mert a legelejére mentünk -> setTrackIndex(0);

és megnézzük, hogyha isPlaying, tehét akkor azt meg lejátszuk!!!! 

const forward = ()=> {
    if(trackList.length === 0) 
        return;

    if(trackIndex < trackIndex.length - 1) {
        setTrackIndex(prevIndex=> prevIndex + 1);
        player.pause();
        player.src = require(`../tracks/${trackList[trackIndex + 1].name}`); 
        mert a trackList az egy tömb objektumokkal és nekünk itt a name kell az elérési útvonalhoz
    } else {
        setTrackIndex(0);
        player.src = require(`..tracks/${trackList[0].name}`);
    }

    if(isPlaying)
        player.play();
} 

backward az nagyon hasonló, csak kicsit más a logikája, meg kell nézni, hogyha trackIndex az nagyobb, mint nulla, akkor jó tudunk visszafelé menni
de viszont else, akkor meg biztos, hogy az utolsó számra állítjuk be az src-t meg az trackIndex-et is -> trackList.length - 1 kell itt nekünk 

const backward = ()=> {
    if(trackList.length === 0)
        return;

    if(trackIndex > 0) {
        setTrackIndex(prevIndex=> prevIndex - 1);
        player.pause();
        player.src = require(`../tracks/${trackList[trackIndex - 1].name}`);
    } else {
        setTrackIndex(trackList.length - 1]); ez fcsak egy szám a trackList.length - 1, tehét az utolsó indexű
        player.src = require(`../tracks/${trackList[trackList.length - 1].name}`);
    }

    if(isPlaying) 
        player.play();
}

ez nagyon hasonló, mint a képeknél, hogy megnézzük, hogy tudunk-e előre menni vagy hátra ha igen akkor egyel nagyobbat vagy egyel kisebbet 
kell megadni!!! 
ha meg nem tudunk, akkor ha előremegyünk, akkor biztos, hogy a 0-dik indexű kell, ha meg hátra, akkor meg biztos, hogy a length - 1 indexű!!! 
********************************************************************************************************************************************
következő dolog, hogy megjelenítjük, hogy melyik szám megy éppen, megy azt, hogy milyen hosszú ilyen formában  00:03:22


    <div className="audio-information mb-15">
        <div>
            {
                trackList.length > 0 ? 
                trackList[trackIndex].name :
                "-"
            }
        </div>
        <div>
            {currentTime.h}:
            {currentTime.m}:
            {currentTime.s}
        </div>
    </div>

az elsőben megnézzük, hogy a trackList.length > 0 ? akkor megjelenítjük a szám címét ha meg : akkor meg csak egy üres string lesz 
itt a második részben pedig megjelenítjük a currentTime-ot, ami egy useState-s változó

const [currentTime, setCurrentTime] = useState({
    h: "00",
    m: "00",
    s: "00"
})

ez egy objektum lesz, ahol van egy h,m,s ez majd a duration-ből jön ami egy sec lesz 
de előtte megnézzük, hogy töltjük egyáltalán be a számokat 
->
ez a loadMusic függvénym ehhez fontos, hogy van két useState-s változónk az egyik amiben vannak a zenék egy tömb meg egy isLoaded, hogy 
megnézzük, hogy teljesen betöltött-e a dolog!!! 

const [trackList, setTrackList] = useState([]);
const [dataLoaded, setDataLoaded] = useState(false);

<div style={{padding:"15px"}}>
    <input onChange={loadMusic}
    ref={inputRef} type="file" multiple/>
</div>

Itt töltjük be a zenéket majd egyesével, tehét mindent onChange-re ez a loadMusic függvény van bekötve!!! 

const loadMusic = (e)=> {
    const files = e.target.files; itt lesznek majd a file-jaink 
    const input = e.target;
    let index = 0;

    for(let i = 0; i < files.length; i++) {
        const p = new Audio(); 
        p.src = require(`../tracks/${files[i].name}`);

        és akkor minden körben, mindegyik megkapja majd az src-t!!!! 
        p.load();
        ez azért van, mert ha változik az src, akkor ez biztosítja azt, hogy az új be legyen töltve!!!!!!!!!!!!!! 

        most, pedig csinálunk egy onLoad-ot az egy event, arra, hogy megcsináljuk ezt a audioObj-ektet!!! 
        tehát, ha be van töltve minden, akkor készül el ez az audioObj

        o.onloadeddate = ()=> {
            const audioObj = {
                name: files[i].name
                duration: getTimeObj(p.duration) ez meg majd a formátuma miatt!!!! 
            }

            egyesével belerakjuk ezeket az objektumokat a trackList tömbbe, ami egy useState-s változó 
            tehát kell a prev és minden lefutásnál beletesszük az új audioObj-ektünket!!! 

            fontos, hogy itt mindig ki kell bontani a spread operator-val a prev-et és úgy tudjuk majd csak belerakni az újjat!!!!!!! 

            setTrackList(previousList=> [...previousList, audioObj]);

            itt meg mégnézzük, hogy tényleg betöltött-e a data 
            if(index === files.length-1) {
                setDataLoaded(true)
            }

            index++;

            és ha az index, ami nulláról indult files.length-1-vel megegyezik, akkor tudjuk, hogy betöltött minden
        }
    }
}

itt meg a timeObj, ami egy segédfüggvény az majd átalakítja nekünk megfelelő formátumra a duration-t 
ez vár majd egy sec-et, amit majd megadunk neki, hiszen itt az előbb hívtuk meg és megadtuk neki a p.duration-t, ami egy sec lesz!!!! 
duration: getTimeObj(p.duration) itt a audioObj-ben a második 

itt fontos, hogy padStart(2, "0"), hogy kettő tagú legyen összesen és az elsőt ha nem két tagú, akkor egészítse ki nullával 
de nagyon fontos, hogy itt mi egy number-t kapunk és azt toString()-elni kell mert a padStart meg End azok string metódusok!!!! 

const getTimeObj = (sec)=> {
    return {
        h: Math.floor(sec/3600).toString().padStart(2, "0");
        m: Math.floor(sec%3600/60).toString().padStart(2, "0");
        s: Math.floor(sec%60).toString().padStart(2, "0");
    }
}

és ez visszaad nekünk egy olyan formátumot, amit meg szeretnénk majd jeleníteni!!! 00:02:55
1. elosztjuk 3600-val az lesz az óra 
2. hányadosozzuk 3600-val és azt elosztjuk 60-val 
3. hányadosozzuk 60-val és az meg lesz a másodperc 

és ezeket persze a floor-val majd mindegyiket lekerekítjük!!!! 

mondjuk a szám 512 
1. akkor azt elosztjuk 3600-val 0 és akkor 0 óra 
2. hányados osztással elosztjuk 3600-val marad az 512 ezt elosztjuk 60-val az lekerekítve 8 lesz, mert 8 egész valamennyi 
3. elsosztjuk hányadosan 60-val marad a 32 és akkor ez lesz a másodperc 
00:08:32 ez lesz ennek a végeredménye amit return-ölünk egy objektumban 

van egy timeUpdated függvényünk is, amivel azt csináljuk, hogyha beletekerünk az zenébe, akkor írja, ki, hogy jelenleg hol tartunk 

ebben a trackSlider-t kell majd set-elni és lesz egy currentTime változónk is azt is 
const [currentTime, setCurrentTime] = {
    h: "00",
    m: "00",
    s: "00" 
}

itt pedig így kapjuk majd meg a percentage-et, hogy ahol most járunk, tehát a currentTime-ot elosztjuk majd a duration-val 
megnézzük, hogyha ez nem NaN az amit kapunk percentage, akkor return-ölünk

és akkor a trackSlider-t majd set-eljük, arra ahova húztuk és majd a currentTime-ot is 
fontos, arra figyelni, hogy ezt milyen formátum -> meg kell hívni ittis a getTimeObj majd ennek megadjuk a currentTime-ot 

const timeUpdated()=> {
    const percentage = player.currentTime/player.duration * 100

    if(isNaN) 
        return;

    setTrackSlider(Math.round(percentage*10) / 10); hogy egész szám legyen, azért elöször beszorzunk azt kerekítjük majd elosztjuk ugyanazzal 
    setCurrentTime(getTimeObj(player.currentTime));
} 

useEffect(()=> {
    player.ontimeupdate = timeUpdated;
}, []);

és ezt majd itt hívjuk meg és akkor az ontimeupdate miatt tudja, hogy hol fogunk tartani csak ez egy másodperc-et vár!!! 
ezért nekünk vissza kell majd váltani a timeObj-et így 

const getSecFromTimeObj = (timeojb)=> {
    return parseInt(timeObj.h) * 3600 + parseInt(timeObj.m) * 60 + parseInt(timeObj.s);
}

*********************************************************************************************************************************
            <div className="tracklist mb-15">
                {
                    trackList.map((track, i)=> 
                        <div onClick={()=>selectTrack(i)}
                        key={i} className={"tracklist-element " 
                        + (trackIndex === i ? "current-track" : "")}>
                            <div>
                                {track.name}
                            </div>
                            <div>
                                {track.duration.h}:
                                {track.duration.m}:
                                {track.duration.s}

                                <FontAwesomeIcon 
                                onClick={(e)=>removeTrack(i, e)}
                                className="ml-5"
                                icon="fa-regular fa-circle-xmark" />
                            </div>
                        </div>
                    )
                }
            </div>

itt választjuk ki a track-ot majd meg itt is töröljük és akkor azt meg is jelenítjük az aktuális track-et, ami megy!!!!! 
meg lesz egy removeTrack is, amivel letöröljük!!!! 

lesz rajta egy onClick, ahol meg lesz adva neki a selecTrack függvény, ami majd vár egy index-et de mivel itt végigmentünk a 
trackList-en egy map-val szóval itt lesznek indexek is, amit ez meghívásnál meg is kap és tudja majd, hogy melyik indexű lesz 

és itt az src-ben ez a selectTrack ez megadja majd az elérési útvonalat, arra amelyikre éppen rákattintunk, fontos még, hogy 
itt a setTrackIndex-et is be kell állítani erre az index-re, hogy tudjuk, hogy hol vagyunk és tudjunk majd forward meg backward-olni is!! 
az itt mindig nagyon fontos, hogy tudjuk, hogy hol vagyunk melyik indexen!!!! 
és a player.pause()-val meg megállítjuk a zenét és ha megtörtént a csere az src-ben, akkor meg a play()-vel majd elinditjuk az újat 

const selectTrack = (index)=> {
    setTrackIndex(index);
    player.pause();
    player.src = require(`../tracks/${trackList[index].name}`);

    if(isPlaying)
        player.play();
}

remove-nál kell majd egy stopPropagation(), mert benne van a selecTrack-ban és akkor annak az onClick-je is le futna és ezt akadályozzuk meg 
ezzel 

itt úgy lehet kivenni, ahogy beletenni is, kell a spread operator, csak itt majd index alapján kiveszünk egyet a splice-val 
és nem belerakunk 

ha egy olyat akarunk kitörölni, ami éppen jelenleg megy, akkor azt meg kell akadádolyozni, olyat nem szeretnénk kitörölni 
tehát megnézzük, hogy az index, amit most megkapunk majd meghíváskor az megegyezik-e trackIndex-vel, az az a szám, aminél éppen 
járunk, de fontos, hogy az isPlaying-elve legyen is mert ha nem akkor kitörölhetjük

és nagyon fontos dolog, hogy miután kitöröltük ezt a valamit index alapján, azután set-elni kell a trackList-et, hogy onnan is 
eltünjön!!!!! 

const removeTrack = (index, e)=> {
    e.stopPropagation();

    if(index === trackIndex && isPlaying)
        return;

    const tracks = [..trackList];
    tracks.splice(index, 1);

    setTrackList(tracks)
}
********************************************************************************************************************************************
    <div>
        <FontAwesomeIcon 
        onClick={clearList}
        className="pointer"
        icon="fa-regular fa-trash-can"/>
    </div>

Lesz egy olyan clearList függvény, ami meg csak azt fogja csinálni, hogy set-eli a trackList egy üres tömbre!!!! 

const clearList = ()=> {
    setTrackList([]);
}

*/ 