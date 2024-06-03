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

/*
van egz a példa és milyen metódusai vannak ennek az elem-nek meg propertyjei!!
pl. ami itt van, hogy click();
*/

//Metódusok

elem.click();
/*
Simulates a mouse click on the element, triggering any click event listeners attached to it!!!! mint itt a példában!! 
*/ 

elem.focus();
/*
Sets focus on the element, making it the active document in the current document!
*/

elem.blur();
/*
Removes focus from the element!! 
*/

//addEventListener
elem.addEventListener("change", { /*Handler*/ });

//removeEventListener
elem.removeEventListener("change", changeHandler);
/*
fontos, hogy itt meg kell adni a függvény nevét ha törölni akarjuk, ezért kell egy külön nevesített függvény, amit majd meg tudunk adni az 
addEventListener-nek is meg a removeEventListener-nek is 
azt miat szoktuk, hogy létrehozunk második paraméterként egy névtelen arrow function-t, az itt nem jó, mert nem tudjuk majd törölni!!!

elem.addEventListener("change", ()=> {}) ezt így lehet, csak akkor nem jó ha ezt a event-et majd törölni szeretnénk
*/

//dispatchEvent -> nagyon fontos, 

const event = new Event("change");
elem.dispatchEvent(event);
/*
vissza fogja vonni az összes event-et!! azt a típus-t, amit ide beírtunk, tehát ha van erre az elemre egy click, azt nem fogja visszavonni tehát 
törölni de az összes "change" event-et, ami erre az elem-re van azt igen!! 
*/

/***************************************************************************************************************************************/
//Properties 

//1. files
const selctedFiles = elem.files;
/*
A files az egy FileList, ami felsorolja az összes file-t, amit a felhasználó kiválasztott!!!!!! ez a fileList ez egy objektum 
FileList 
    0:File 
        lastModified: 1480495490779 ez az ami 1970-től indult másodpercenként 
        lastModifiedDate: Wed Nov 30 2022
        name: "1.jpg"
        size: 76824 -> az mindig byte-ban van de ezt tudjuk alakítani az audioPlayer 43 sorában lévő függvénnyel 
        type: "image/jpeg"
        webkitRelativePath: ...
*/ 

//2.accept
elem.accept = ".jpeg, .jpg, png";
/*
Sets or returns the file types that the server accepts (that can be selected in the file input)
*/

//3.multiple
elem.multiple = true;
/*
A Boolean indicating whether multiple files can be selected 
*/

//4.disabled
elem.disabled = true;
/*
A Boolean indicating whether the control is disabled
*/

//5. name
elem.name = "myFileInput";
/*
Sets or returns the name of the file 
*/ 

//6.value 
const filePath = elem.value;
/*
Although you generally can't set the value of a file input for security reasons but it can be accessed through to get the current file path!!  
*/ 

//7.type 
const type = elem.type; //file
/*
Gets the type of the input element, which is in this case would be "file"
*/

//8. form 
const form = elem.form;
/*
Returns a reference to the form that contains the input element
*/

const elem = document.createElement("input");
elem.type = "file";
elem.accept = ".jpg, .jpeg, .png"; //only accepts image files, de ezt lehetett volna így, hogy image/* 
elem.multiple = true; //allow multiple file selection 

elem.addEventListener("change", ()=> {
    if(elem.files.length > 0) {
        for(let i = 0; i < elem.files.length; i++) {
            console.log("File selected: ", elem.files[i]);
        }
    }
});

document.body,appendChild(elem); //add the input to the document, fontos, hogy a document.body-ra kell itt hívatkozni!!! 
elem.click(); //Simulate the event to open the file dialog!!!!! 
/*****************************************************************************************************************************************/
//nagyon fontos, hogy itt az input-ba meg van adva nekünk egy ref -> <input onchange={loadMusic} ref={inref} type="file" multiple>

/*
Mire jó ha meg adva egy ref az input-nak a React-ben 
4 dolog miatt 

1. Accessong the DOM elements:
    Sometimes you need to interact with a DOM element directly, such as focusing an input, measuring its size, or scrolling a patricular element 
    Using "refs" provides a way to bypass React's virtual DOM a directly manipulate the DOM 
*/ 

class MyComponent extends React.Component {
    constructor(props) {
        super(props);
        this.myRef = React.createRef();
    }

    componentDidMount() {
        this.myRef.current.focus();
    }

    render() {
        return <input ref={this.myRef}/> 
    }
}

/*
2. Managing the focus 
    You can use the "refs" to set focus on elements, especially when dealing with forms or implementing custom keyboard navigation 
*/

class MyForm extends React.Component {
    constructor(props) {
        super(props);
        this.inputRef = React.createRef();
    }

    focusInput = ()=> {
        this.inputRef.current.focus();
    }

    render()  {
        return(
            <div>
                <input ref={this.inputRef}/>
                <button onClick={this.focusInput}>Focus the input</button>
            </div>
        );
    }
}

/*
3. Animating the elements
    Direct manipulation of the DOM for animations can sometimes be more performant or necessary for certain libraries. "refs" allow you to 
    interact with DOM nodes to apply animations 
*/ 

class MyComponent extends React.Component {
    constructor(props) {
        super(props);
        this.boxRef = React.createRef();
    }

    componentDidMount() {
        this.boxRef.current.style.transition = "transform 0.5s";
        this.boxRef.current.style.transition = "translateX(100px)";
    }

    render() {
        return <div ref={this.boxRef} style={{width: "100px", height: "100px", background: "red"}}>

        </div>
    }
}
/*********************************************************************************************************************************************/
//Prev 

/*
Ha van egy állapotváltózás React-ben ott nagyon fontos, hogy React az arra reegál, hogy mi volt az elöző állapot és ezt kell felülírni 
a set-vel, tehát ha set-elünk valamit, akkor van állapotváltozás 
*/
if(trackIndex < trackList.length-1) {
    setTrackIndex(prevIndex => prevIndex + 1);
    player.pause();
    player.src = require(`../tracks/${trackList[trackIndex + 1].name}`);
} else {
    setTrackIndex(0);
    player.src = require(`../tracks/${trackList[0].name}`);
}

/*
pl. itt set-eltük a trackIndex-nek az állapotát, mert ez egy forward button vagy ikon és azt szeretnénk, hogy az index ilyenkor 
amikor ez a függvény meghívódik, akkor egyel több legyen ezért, kell nekünk a prev!!! és azt is tudjuk, hogy mi lesz az új 
prev + 1, mert egyel akarunk továbbmenni 

és akkor a React-ben van két formája egy állapotót megváltoztatni 
1. functional state update 
    amikor az előző állapotból indulunk ki, ilyenkor kell a prev!!! és akkor azt megváltoztatjuk, a React az mindig tudja, hogy mi a prev 
    tehát ha rányomunk egyet akkor az előzo a prev de utána ez már frissül és akkor ha mégegyszer rányomunk akkor a mostani a prev..!!! 

setTrackIndex(prevIndex => prevIndex + 1);

2. direct state update 
    Amikor direkt módon megadjuk az új értéket 

setTrackIndex(0);
********************************************************************************************************************************************
e.target és e.target.files 
csinálunk egy react-es példát arra, hogy hogyan tudjuk a felhasználónak megcsinálni, hogy kiválasszon egy file-t és display-elje a 
nevét és a nagyságát a kiválasztott file-nak!!! 

import React, { useState } from 'react';

function FileUploader() {
  const [fileInfo, setFileInfo] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0]; // Get the first selected file
    if (file) {
      setFileInfo({
        name: file.name,
        size: file.size,
      });
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {fileInfo && (
        <div>
          <h3>Selected File:</h3>
          <p>Name: {fileInfo.name}</p>
          <p>Size: {fileInfo.size} bytes</p>
        </div>
      )}
    </div>
  );
}

export default FileUploader;

tehát kell hozzá egy input, aminek a file a type-ja majd kell egy erre csinálunk egy függvényt, amit majd megadunk ennek onChange-vel!!! 
abban pedig set-eljük a dolgokat egy objektum formájában és ezt majd megjelenítjük a return-ben egy {}-ben 
*/

function FileUploader() {
    const [fileInfo, setFileInfo] = useState(null);

    const handleChanger = (e)=> {
        const file = e.target.files[0];
        if(file) { //ha lézetik ez, tehát be van töltve az első file!! akkor set-eljük erre a useState-s változónkat, ami egy objektum lesz 
            setFileInfo({
                name: file.name,
                size: file.size
            })
        }
    }

    return(
        <div>
            <input type="file" onChange={handleChanger}/>
            {
                fileInfo && ( <div>
                    <h3>Selected File:</h3>
                    <p>Name: {fileInfo.name}</p>
                    <p>Size: {fileInfo.size} bytes</p>
                  </div>
                )}
        </div>
    );

}

/**********************************************************************************************************************************************/
// Assuming `files` is an array of File objects from a file input
const files = [/* File objects */];

for (let i = 0; i < files.length; i++) {
  const p = new Audio();
  p.src = URL.createObjectURL(files[i]);

  p.onloadeddata = () => {
    const audioObj = {
      name: files[i].name,
      duration: getTimeObj(p.duration)
    };

    console.log(audioObj); // Log the object or do something with it
  };

  // Trigger loading of the audio file
  p.load();
}

// Example function to convert duration to a more readable format
function getTimeObj(duration) {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return { minutes, seconds };
}



