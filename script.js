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

function draw() {
    if (!currentImage) return;
    ctx.putImageData(currentImage, 0, 0);
    if (floatingCanvas) {
        ctx.drawImage(floatingCanvas, selection.x, selection.y);
    }

    updateHistogram();
    if (selection.w > 0 && selection.h > 0 && !hideSelectionBorder) {
        ctx.save();
        ctx.strokeStyle = "#ff69b4"; 
        ctx.lineWidth = canvas.width > 2000 ? 4 : 2; 
        ctx.setLineDash([8, 4]);
        ctx.strokeRect(selection.x, selection.y, selection.w, selection.h);
        ctx.fillStyle = "rgba(255, 105, 180, 0.15)";
        ctx.fillRect(selection.x, selection.y, selection.w, selection.h);
        ctx.restore();
    }
}

canvas.addEventListener("mousedown", (e) => {
    if (!currentImage) return;
    const pos = getMousePos(e); 
    const mouseX = pos.x; const mouseY = pos.y;

    const isInsideSelection = selection.w > 0 && 
        mouseX >= selection.x && mouseX <= selection.x + selection.w &&
        mouseY >= selection.y && mouseY <= selection.y + selection.h;

    if (e.shiftKey && isInsideSelection) {
        isMoving = true;
        moveOffsetX = mouseX - selection.x;
        moveOffsetY = mouseY - selection.y;
        if (!floatingCanvas) {
            floatingCanvas = document.createElement("canvas");
            floatingCanvas.width = selection.w; 
            floatingCanvas.height = selection.h;
            const fCtx = floatingCanvas.getContext("2d");
            
            const sx = Math.floor(selection.x);
            const sy = Math.floor(selection.y);
            const sw = Math.floor(selection.w);
            const sh = Math.floor(selection.h);

            try {

                ctx.putImageData(currentImage, 0, 0); 
                const selectedData = ctx.getImageData(sx, sy, sw, sh);
                fCtx.putImageData(selectedData, 0, 0);
                ctx.fillStyle = "white";
                ctx.fillRect(sx, sy, sw, sh);
                updateGlobalImage();
            } catch(err) {}
        }
    } else {
        commitFloatingLayer(); 
        commitAndClearMemory();
        isSelecting = true;
        isMoving = false;
        startX = mouseX; startY = mouseY;
        selection = { x: startX, y: startY, w: 0, h: 0 };
    }
    draw();
});

canvas.addEventListener("mousemove", (e) => {
    if (!currentImage) return;
    const pos = getMousePos(e);
    
    if (isMoving) {
        selection.x = pos.x - moveOffsetX; 
        selection.y = pos.y - moveOffsetY;
        draw(); 
    } else if (isSelecting) {
        let width = pos.x - startX; let height = pos.y - startY;
        selection.w = Math.abs(width); selection.h = Math.abs(height);
        selection.x = (width < 0) ? pos.x : startX;
        selection.y = (height < 0) ? pos.y : startY;
        draw(); 
    }
});

canvas.addEventListener("mouseup", () => {
    isSelecting = false; 
    isMoving = false;
    hideSelectionBorder = false;
    draw();
});

document.getElementById("btnCrop").addEventListener("click", () => {
    if (selection.w < 1) return alert("Selectează o zonă!");
    commitAndClearMemory(); 
    
    ctx.putImageData(currentImage, 0, 0); 
    const cutData = ctx.getImageData(selection.x, selection.y, selection.w, selection.h);
    canvas.width = selection.w; canvas.height = selection.h;
    ctx.putImageData(cutData, 0, 0);
    updateGlobalImage();
    
    selection = { x: 0, y: 0, w: 0, h: 0 };
    draw();
});

document.getElementById("btnDelete").addEventListener("click", () => {
    commitAndClearMemory();
    ctx.putImageData(currentImage, 0, 0);
    
    ctx.fillStyle = "white";
    if (selection.w > 0 && selection.h > 0) {
        ctx.fillRect(selection.x, selection.y, selection.w, selection.h);
    } else {
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    updateGlobalImage();
    selection = { x: 0, y: 0, w: 0, h: 0 };
    draw();
});

document.getElementById("btnScale").addEventListener("click", () => {
    if (!originalImage) return;
    commitAndClearMemory();

    const wInput = document.getElementById("scaleWidth").value;
    const hInput = document.getElementById("scaleHeight").value;
    let newW = parseInt(wInput); let newH = parseInt(hInput);
    const aspectRatio = originalImage.width / originalImage.height;

    if (newW && newH) { } 
    else if (newW && !newH) { newH = newW / aspectRatio; } 
    else if (!newW && newH) { newW = newH * aspectRatio; } 
    else { return alert("Introdu Lățimea sau Înălțimea!"); }

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = newW; tempCanvas.height = newH;
    const tCtx = tempCanvas.getContext("2d");
    const auxCanvas = document.createElement("canvas");
    auxCanvas.width = originalImage.width; auxCanvas.height = originalImage.height;
    auxCanvas.getContext("2d").putImageData(originalImage, 0, 0);

    tCtx.imageSmoothingEnabled = true; tCtx.imageSmoothingQuality = "high";
    tCtx.drawImage(auxCanvas, 0, 0, newW, newH);

    canvas.width = newW; canvas.height = newH;
    ctx.drawImage(tempCanvas, 0, 0);
    updateGlobalImage();
    
    selection = { x: 0, y: 0, w: 0, h: 0 };
    draw();
});

