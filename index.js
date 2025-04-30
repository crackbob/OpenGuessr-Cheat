let chunks = Object.values(document.getElementsByTagName("link")).filter(link => link?.href.includes("/chunks/"));

let targetChunk = null;
let rawChunk = null;
for (const chunkElement of chunks) {
    const script = await fetch(chunkElement.href).then(response => response.text());
    
    if (script.includes("Terrain:")) {
        targetChunk = chunkElement.href;
        rawChunk = script;
        break;
    }
}

let searchTerm = rawChunk.split('"map"')[1].split(")}")[1].match(/([a-zA-Z_$][\w$]*)\.set/)[1] + " as";
let importName = rawChunk.split(searchTerm)[1].split(",")[0].replaceAll(" ", "");

let mapObj;
(await import(targetChunk))[importName].subscribe(map => mapObj = map);

function flyToLocation (zoom) {
    let panoramaIframe = document.querySelector('#PanoramaIframe');
    let mapsUrl = new URL(panoramaIframe.src);
    let coords = mapsUrl.searchParams.get('location').split(",").map(parseFloat);
        
    mapObj.flyTo({
        lat: coords[0],
        lng: coords[1]
    }, zoom)
}

const panel = document.createElement('div');
panel.style.position = 'fixed';
panel.style.width = '250px';
panel.style.height = 'auto';
panel.style.backgroundColor = 'rgba(25, 25, 25, 0.75)';
panel.style.zIndex = '999999';
panel.style.left = '100px';
panel.style.top = '100px';
panel.style.userSelect = "none";
panel.style.padding = '10px';
panel.style.borderRadius = '8px';
document.body.append(panel);

let header = document.createElement('h2');
header.style.margin = '0';
header.style.textAlign = "center";
header.style.fontSize = "30px";
header.style.color = '#FFF';
header.style.cursor = 'grab';
header.textContent = "OpenGuessr Cheat";
panel.appendChild(header);

const slider = document.createElement('input');
slider.type = 'range';
slider.min = '0';
slider.max = '20';
slider.value = '15';
slider.style.width = '100%';
slider.style.marginTop = '15px';
panel.appendChild(slider);

const goButton = document.createElement('button');
goButton.textContent = 'Go';
goButton.style.marginTop = '10px';
goButton.style.width = '100%';
goButton.style.padding = '8px';
goButton.style.fontSize = '16px';
goButton.style.backgroundColor = '#4CAF50';
goButton.style.color = 'white';
goButton.style.border = 'none';
goButton.style.borderRadius = '4px';
goButton.style.cursor = 'pointer';
panel.appendChild(goButton);

goButton.addEventListener('click', () => {
    flyToLocation(slider.value);
});

let isDragging = false;
let offset = { x: 0, y: 0 };

header.addEventListener('mousedown', (event) => {
  isDragging = true;
  offset.x = event.clientX - panel.getBoundingClientRect().left;
  offset.y = event.clientY - panel.getBoundingClientRect().top;
  header.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', (event) => {
  if (isDragging) {
    panel.style.left = `${event.clientX - offset.x}px`;
    panel.style.top = `${event.clientY - offset.y}px`;
  }
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  header.style.cursor = 'grab';
});
