"use strict";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const histoCanvas = document.getElementById("histograma");
const histoCtx = histoCanvas.getContext("2d");
const dropZone = document.getElementById("dropZone");

let currentImage = null;
let originalImage = null;
let selection = { x: 0, y: 0, w: 0, h: 0 };

let isSelecting = false;
let isMoving = false;
let startX, startY;
let floatingCanvas = null; 
let moveOffsetX = 0, moveOffsetY = 0; 

let tempOriginalData = null; 
let hideSelectionBorder = false;


function getMousePos(evt) {
    const rect = canvas.getBoundingClientRect(); 
    const factorX = canvas.width / rect.width;
    const factorY = canvas.height / canvas.clientHeight;
    return {
        x: evt.offsetX * factorX,
        y: evt.offsetY * factorY
    };
}

function updateGlobalImage() {
    currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
}


function commitFloatingLayer() {
    if (floatingCanvas) {
        ctx.putImageData(currentImage, 0, 0);
        ctx.drawImage(floatingCanvas, selection.x, selection.y);
        updateGlobalImage();
        floatingCanvas = null;
    }
}
function commitAndClearMemory() {
    commitFloatingLayer(); 
    tempOriginalData = null;
    hideSelectionBorder = false;
}

document.getElementById("fileBrowser").addEventListener("change", (e) => handleFile(e.target.files[0]));
dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.classList.add("drop-active"); });
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drop-active"));
dropZone.addEventListener("drop", (e) => {
    e.preventDefault(); dropZone.classList.remove("drop-active");
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});

function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);
            updateGlobalImage();
            originalImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            selection = { x: 0, y: 0, w: 0, h: 0 };
            floatingCanvas = null;
            commitAndClearMemory();
            updateHistogram();
            draw(); 
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
}

document.getElementById("btnSave").addEventListener("click", () => {
    if (!currentImage) return;
    commitFloatingLayer(); 
    ctx.putImageData(currentImage, 0, 0); 
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "imagine_editata.png";
    a.click();
    draw(); 
});

document.getElementById("btnReset").addEventListener("click", () => {
    if (!originalImage) return;
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.putImageData(originalImage, 0, 0);
    updateGlobalImage();
    selection = { x: 0, y: 0, w: 0, h: 0 };
    floatingCanvas = null;
    commitAndClearMemory();
    updateHistogram();
    draw();
});

