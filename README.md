# Vanilla JS Image Editor

A lightweight, browser-based image processing application built entirely with **HTML5 Canvas**, **CSS3**, and **Vanilla JavaScript**. This project demonstrates direct pixel manipulation, advanced selection logic, and real-time data visualization without relying on external libraries.

##  Features

### Core Tools
* **File Handling:** Upload images via File Browser or **Drag & Drop**.
* **Save/Export:** Download the processed image as PNG.
* **Reset:** Instantly revert the image to its original state.

### Advanced Selection & Layers
* **Selection Tool:** Click and drag to define a rectangular area of interest.
* **"Cut & Move" Logic:** Hold **`Shift + Drag`** inside a selection to cut it from the background and move it around as a floating layer. The background is automatically filled (erased) behind the moved object.
* **Context Aware:** Filters and Histogram update based on whether a selection is active or if you are working on the whole image.

### Image Manipulation
* **Crop:** Trim the image to the selected area.
* **Delete:** Erase the selected area (fill with white).
* **Scale:** Resize the image to specific dimensions using high-quality smoothing.
* **Text Insertion:** Add custom text with adjustable color, size, and position (X, Y).

### Filters & Effects
* **Color Adjustments:** Grayscale, Invert, Sepia.
* **Channel Isolation:** Red, Green, Blue, and 2-Channel (Red+Blue) extraction.
* **Threshold:** Converts the image to strictly black and white based on luminance.
* **Pixelate:** Dynamic pixelation effect with adjustable block size.

### Real-time Histogram
* Visualizes the RGB distribution of the image (or the current selection).
* Updates instantly as you draw or move layers.
* Uses `globalCompositeOperation` to visually blend overlapping color channels (CMYK-style).

## Technical Highlights

This application uses the **Canvas 2D API** for all rendering operations. Key technical implementations include:

* **Floating Layer System:** A custom implementation of layers. When moving a selection, the pixel data is transferred to a temporary in-memory canvas, allowing non-destructive positioning before "committing" the layer back to the main canvas upon release.
* **Filter Memory Buffer:** Uses a `tempOriginalData` buffer to prevent filters from overlapping destructively (e.g., applying Blue over Red doesn't result in Black; it re-applies Blue over the original pixel data).
* **Mathematical Coordinate Mapping:** A `getMousePos` function handles the disparity between the DOM element size and the internal Canvas resolution.

## Technologies Used

* **HTML5** (Structure & Canvas API)
* **CSS3** (Pastel UI, Flexbox, Grid, CSS Variables)
* **JavaScript (ES6+)** (Logic, Event Handling, Image Processing)
