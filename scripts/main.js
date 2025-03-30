class Palette {
    constructor() {
        this.ringIndicatorHolding = false;
        this.pickerIndicatorHolding = false;
        this.color = "hsl(0, 100.00%, 76.30%)";
        this.H = 0;
        this.S = 0;
        this.L = 0;
    }

    ringUpdate(event) {
    if (!this.ringIndicatorHolding) return;
    try {
        // get mouse position
        let x = event.clientX;
        let y = event.clientY;

        // get color ring center
        let rect = document.getElementById("color-ring").getBoundingClientRect();
        let centerX = rect.left + rect.width / 2;
        let centerY = rect.top + rect.height / 2;

        // get ring angle
        let angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI) + 90;

        // update ring indicator position
        document.getElementById("color-ring-indicator").style.transform = `rotate(${angle}deg)`;
        // console.log("Rotate the indicator to angle:", angle); // debug

        // update hue
        this.H = this.getHueByAngle(angle);

        // update color picker & color
        this.pickerUpdate(event);
    }
    catch (error) {
        console.error("Error updating color ring: ", error);
    }
}

    pickerUpdate(event) {
        if (!this.pickerIndicatorHolding && !this.ringIndicatorHolding) return;
        try {
            //get mouse relative position in color picker
            let rect = document.getElementById("color-picker").getBoundingClientRect();
            let x = event.clientX - rect.left;
            let y = event.clientY - rect.top;

            // update color picker indicator position
            if(this.pickerIndicatorHolding){
                let indicator = document.getElementById("color-picker-indicator");
                let indicatorRect = indicator.getBoundingClientRect();
                indicator.style = `left: ${Math.max(0, Math.min(rect.width, x)) - indicatorRect.width / 2}px; top: ${Math.max(0, Math.min(rect.height, y)) - indicatorRect.height / 2}px;`;
                this.S = Math.round(Math.max(0, Math.min(100, (x / rect.width) * 100)));
                this.L = Math.round(Math.max(0, Math.min(100, (1 - y / rect.height) * 50 * ((1 - x / rect.width) + 1))));
                // console.log("Indicator moved to:", x, y); // debug
            }

            // update color picker background
            document.getElementById("color-picker").style = `background:  -webkit-linear-gradient(270deg, white 0%, black 100%), -webkit-linear-gradient(0deg, white 0%, hsl(${this.H}, 100%, 50%) 100%);`

            // update color
            this.updateColor();
        }
        catch (error) {
            console.error("Error updating color picker:", error);
        }
    }

    updateColor () {
        try {
            // change color to hsl format
            this.color = `hsl(${this.H}, ${this.S}%, ${this.L}%)`;
            document.getElementById("picked-color").style.backgroundColor = this.color;
            // console.log("Picked color:", this.color); // debug
        }
        catch (error) {
            console.error("Error updating color:", error);
        }
        canvas.setColor(this.color);
    }

    setRingIndicatorHolding(value) {
        this.ringIndicatorHolding = value;
    }

    setPickerIndicatorHolding(value) {
        this.pickerIndicatorHolding = value;
    }

    getHueByAngle(angle) {
        return angle % 360;
    }
}

class Canvas {
    constructor() {
        this.tool = "pen";
        this.canvas = null;
        this.preview = null;
        this.brush = null;
        this.ctx = null;
        this.previewCtx = null;
        this.color = "hsl(0, 0%, 0%)";
        this.brushSize = 50;
        this.drawing = false;
        this.startX = 0;
        this.startY = 0;
        this.lastX = 0;
        this.lastY = 0;
        this.X = 0;
        this.Y = 0;
        this.Opacity = 1;
        this.cursor = null;
        this.listeningText = false;
        this.text = null;
    }

    setCanvas(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.preview = document.getElementById("canvas-preview");
        this.previewCtx = this.preview.getContext("2d");
        this.brush = document.getElementById("brush");
        this.cursor = document.getElementById("cursor");
        this.setBrushSize(this.brushSize);
        this.setColor(this.color);
        this.ctx.font = "20px Arial";
        this.ctx.textAlign = "left";
    }

    setColor(color) {
        if(color.includes("hsla")) {
            let H, S, L, A;
            color.substring(5, color.length - 1).split(", ").forEach((value, index) => {
                if(index == 0) H = value;
                else if(index == 1) S = value;
                else if(index == 2) L = value;
                else if(index == 3) A = value;
            });
            this.color = `hsla(${H}, ${S}, ${L}, ${this.Opacity})`;
        }
        else {
            this.color = "hsla" + color.substring(3, color.length - 1) + `, ${this.Opacity})`;
        }
        this.ctx.strokeStyle = this.color;
        this.ctx.fillStyle = this.color;
        console.log("Canvas color set to:", this.color); // debug
    }

    setBrushSize(size) {
        this.brushSize = Number(size);
        this.ctx.lineWidth = size;
        // console.log("Canvas brush size set to:", this.brushSize); // debug
        this.ctx.font = size + "px Arial";
        this.previewCtx.font = size + "px Arial";
    }

    setOpacity(opacity) {
        this.Opacity = opacity;
        this.setColor(this.color);
        // console.log("Canvas opacity set to:", this.Opacity); // debug
    }

    setTool(tool) {
        let tools = document.getElementsByClassName("tool");
        // console.log("tools : ", tools); // debug
        for (let i = 0; i < tools.length; i++) {
            tools[i].children[0].src = ("images/" + tools[i].children[0].id + (tool == tools[i].children[0].id ? "-using.svg" : ".svg"));
        }
        this.tool = tool;

        this.cursor.children[0].src = "images/" + tool + ".svg";

        this.listeningText = false;
        this.text = "";
        this.previewCtx.clearRect(0, 0, this.preview.width, this.preview.height);
    }

    toggleVisible(event) {
        // get layer name from event target id
        let targetLayer = event.target.parentElement.parentElement.id.split("-")[0];
        //console.log("Toggling visibility of layer:", targetLayer); // debug
    
        // get layer object
        let targetLayerObject = document.getElementById(targetLayer);
    
        // toggle visibility
        targetLayerObject.style.visibility = targetLayerObject.style.visibility == "hidden" ? "visible" : "hidden";
    
        // change button icon
        event.target.src = targetLayerObject.style.visibility == "hidden" ? "images/view.svg" : "images/view--filled.svg";
    }

    startDraw(event) {
        this.drawing = true;
        this.ctx.beginPath();
        this.startX = Number(event.clientX) - this.canvas.getBoundingClientRect().left;
        this.startY = Number(event.clientY) - this.canvas.getBoundingClientRect().top;
        this.X = this.startX;
        this.Y = this.startY;
        this.ctx.moveTo(this.startX, this.startY);
        // console.log("Start drawing at:", this.startX, this.startY); // debug
        if(this.tool == "text") {
            this.text = "";
            this.listeningText = true;
        }
    }
    
    stopDraw(event) {
        this.drawing = false;
        this.ctx.closePath();
        switch(this.tool) {
            case "rectangle":
            case "circle":
            case "triangle":
                this.ctx.drawImage(this.preview, 0, 0, this.preview.width, this.preview.height);
                this.previewCtx.clearRect(0, 0, this.preview.width, this.preview.height);
                break;
            default:
                break;
        }

        // console.log("Stop drawing at:", this.X, this.Y); // debug
    }

    textInput(event) {
        if(!this.listeningText) return;
        // console.log("Text input:", event.key); // debug
        if(event.keyCode == 8 || event.keyCode == 46) {
            // console.log("Backspace/delete pressed"); // debug
            if(this.text.length == 0) return;
            this.text = this.text.substring(0, this.text.length - 1);
            this.previewCtx.clearRect(0, 0, this.preview.width, this.preview.height);
            this.previewCtx.fillText(this.text, this.X, this.Y);
            return;
        }
        switch(event.key) {
            case "Enter":
                if(this.text.length > 0) {
                    this.listeningText = false;
                    this.ctx.fillText(this.text, this.X, this.Y);
                    this.previewCtx.clearRect(0, 0, this.preview.width, this.preview.height);
                }
                break;
            case "Backspace":
                if(this.text.length > 0) {
                    this.text = this.text.substring(0, this.text.length - 1);
                    this.previewCtx.clearRect(0, 0, this.preview.width, this.preview.height);
                    this.previewCtx.fillText(this.text, this.X, this.Y);
                }
                break;
            case "Escape":
                this.listeningText = false;
                this.previewCtx.clearRect(0, 0, this.preview.width, this.preview.height);
                break;
            default:
                this.text += event.key;
                this.previewCtx.clearRect(0, 0, this.preview.width, this.preview.height);
                this.previewCtx.fillText(this.text, this.X, this.Y);
            break;
        }
    }

    showBrush() {
        this.brush.style.display = "block";
        this.cursor.style.display = "block";
    }

    hideBrush() {
        this.brush.style.display = "none";
        this.cursor.style.display = "none";
    }

    updateBrush(event) {
        this.showBrush();
        if(this.tool != "text") {
            this.brush.style.left = (Number(event.clientX) - this.brushSize / 2) + "px";
            this.brush.style.top = (Number(event.clientY) - this.brushSize / 2) + "px";
            this.brush.style.width = this.brushSize + "px";
            this.brush.style.height = this.brushSize + "px";
            this.brush.style.backgroundColor = "transparent";
            this.brush.style.borderRadius = "50%";
        }
        else {
            this.brush.style.left = (Number(event.clientX) - 1) + "px";
            this.brush.style.top = (Number(event.clientY) - this.brushSize / 2) + "px";
            this.brush.style.width = 2 + "px";
            this.brush.style.height = this.brushSize + "px";
            this.brush.style.backgroundColor = this.color;
            this.brush.style.borderRadius = "0%";
        }

        this.cursor.style.left = (Number(event.clientX) + this.brushSize) + "px";
        this.cursor.style.top = (Number(event.clientY) - 2 * this.brushSize) + "px";
        // console.log(this.brushSize, event.clientX, (Number(event.clientX) + this.brushSize)); // debug
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.previewCtx.clearRect(0, 0, this.preview.width, this.preview.height);
        this.resize(); // I dont know why bu clearRect had no effect to ellipse so I use a useless resize to clear the preview
        console.log("Canvas cleared"); // debug
    }

    draw(event) {
        if(!this.drawing) return;
        try {
            this.lastX = this.X;
            this.lastY = this.Y;
            this.X = Number(event.clientX) - this.canvas.getBoundingClientRect().left;
            this.Y = Number(event.clientY) - this.canvas.getBoundingClientRect().top;
            switch(this.tool) {
                case "pen":
                    this.ctx.lineWidth = this.brushSize * 0.85;
                    this.ctx.strokeStyle = this.color;
                    this.ctx.lineCap = "round";
                    this.ctx.lineJoin = "round";
                    this.ctx.shadowColor = this.color;
                    this.ctx.shadowBlur = this.brushSize * 0.15;
                    let middleX = (this.lastX + this.X) / 2;
                    let middleY = (this.lastY + this.Y) / 2;
                    this.ctx.quadraticCurveTo(this.lastX, this.lastY, middleX, middleY);
                    this.ctx.quadraticCurveTo(middleX, middleY, this.X, this.Y);
                    this.ctx.stroke();
                    this.ctx.moveTo(this.X, this.Y);
                    this.ctx.globalCompositeOperation = "source-over";
                    // console.log("Drawing with pen at " + event.clientX + ", " + event.clientY + " with color " + this.ctx.strokeStyle); // debug
                    break;
                case "eraser":
                    this.ctx.lineWidth = this.brushSize;
                    this.ctx.strokeStyle = this.color;
                    this.ctx.lineCap = "round";
                    this.ctx.lineJoin = "round";
                    this.ctx.shadowColor = this.color;
                    this.ctx.shadowBlur = 2;
                    this.ctx.quadraticCurveTo(this.lastX, this.lastY, this.X, this.Y);
                    this.ctx.stroke();
                    this.ctx.moveTo(this.X, this.Y);
                    this.ctx.globalCompositeOperation = "destination-out";
                    // console.log("Erasing at " + event.clientX + ", " + event.clientY + " with color " + this.ctx.strokeStyle); // debug
                    break;
                case "rectangle":
                    this.previewCtx.clearRect(0, 0, this.preview.width, this.preview.height);
                    this.previewCtx.strokeStyle = this.color;
                    this.previewCtx.lineWidth = this.brushSize;
                    this.previewCtx.strokeRect(this.startX, this.startY, this.X - this.startX, this.Y - this.startY);
                    this.previewCtx.stroke();
                    this.ctx.globalCompositeOperation = "source-over";
                    break;
                case "circle":
                    this.previewCtx.clearRect(0, 0, this.preview.width, this.preview.height);
                    this.resize();
                    // I dont know why bu clearRect had no effect so I use a useless resize to clear the preview
                    this.previewCtx.strokeStyle = this.color;
                    this.previewCtx.lineWidth = this.brushSize;
                    let a = Math.abs(this.X - this.startX) / 2;
                    let b = Math.abs(this.Y - this.startY) / 2;
                    let x = this.X > this.startX ? this.startX + a : this.X + a;
                    let y = this.Y > this.startY ? this.startY + b : this.Y + b;
                    this.previewCtx.ellipse(x, y, a, b, 0, 0, Math.PI * 2);
                    this.previewCtx.stroke();
                    this.ctx.globalCompositeOperation = "source-over";
                    break;
                case "triangle":
                    let peakX = (this.startX + this.X) / 2;
                    let peakY = this.Y;
                    this.previewCtx.clearRect(0, 0, this.preview.width, this.preview.height);
                    this.resize();
                    // I dont know why bu clearRect had no effect so I use a useless resize to clear the preview
                    this.previewCtx.strokeStyle = this.color;
                    this.previewCtx.lineWidth = this.brushSize;
                    this.previewCtx.moveTo(this.startX, this.startY);
                    this.previewCtx.lineTo(peakX, peakY);
                    this.previewCtx.moveTo(peakX, peakY);
                    this.previewCtx.lineTo(this.X, this.startY);
                    this.previewCtx.moveTo(this.X, this.startY);
                    this.previewCtx.lineTo(this.startX, this.startY);
                    this.previewCtx.stroke();
                    break;
                case "text":
                    break;
                default:
                    console.error("Unknown tool:", tool);
            }
        }
        catch (error) {
            console.error("Error drawing:", error);
        }
    }

    resize() {
        // console.log("Backup content"); // debug
        // console.log("Canvas size: ", this.canvas.width, this.canvas.height); // debug
        let tempCanvas = document.createElement("canvas");
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        let tempCtx = tempCanvas.getContext("2d");
        tempCtx.drawImage(this.canvas, 0, 0);

        // console.log("Resizing canvas"); // debug
        let paper = document.getElementById("paper");
        this.canvas.style.left = paper.getBoundingClientRect().left + "px";
        this.canvas.style.top = paper.getBoundingClientRect().top + "px";
        this.canvas.style.width = paper.getBoundingClientRect().width + "px";
        this.canvas.style.height = paper.getBoundingClientRect().height + "px";
        this.canvas.width = paper.getBoundingClientRect().width;
        this.canvas.height = paper.getBoundingClientRect().height;

        // console.log("Resize preview"); // debug
        this.preview.style.left = paper.getBoundingClientRect().left + "px";
        this.preview.style.top = paper.getBoundingClientRect().top + "px";
        this.preview.style.width = paper.getBoundingClientRect().width + "px";
        this.preview.style.height = paper.getBoundingClientRect().height + "px";
        this.preview.width = paper.getBoundingClientRect().width;
        this.preview.height = paper.getBoundingClientRect().height;

        // console.log("Resume content"); // debug
        this.ctx.drawImage(tempCanvas, 0, 0);

    }

    download() {

    }

    test() {
        this.ctx.fillRect(0, 0, 100, 100);
    }
}

const palette = new Palette();
const canvas = new Canvas();
function pageInit() {
    let rect = document.getElementById("color-picker").getBoundingClientRect();
    canvas.setCanvas(document.getElementById("canvas-layer0"));

    palette.setPickerIndicatorHolding(true);
    palette.pickerUpdate({ clientX: rect.right, clientY: rect.bottom });
    palette.setPickerIndicatorHolding(false);
    
    canvas.setTool("pen");
    canvas.setColor(palette.color);
    canvas.setBrushSize(50);
    let paperRect = document.getElementById("paper").getBoundingClientRect();
    canvas.canvas.style.left = paperRect.left + "px";
    canvas.canvas.style.top = paperRect.top + "px";
    canvas.canvas.width = paperRect.width;
    canvas.canvas.height = paperRect.height;
    canvas.canvas.style.width = paperRect.width + "px";
    canvas.canvas.style.height = paperRect.height + "px";

    canvas.preview.style.left = paperRect.left + "px";
    canvas.preview.style.top = paperRect.top + "px";
    canvas.preview.width = paperRect.width;
    canvas.preview.height = paperRect.height;
    canvas.preview.style.width = paperRect.width + "px";
    canvas.preview.style.height = paperRect.height + "px";

    window.addEventListener("resize", () => {
        canvas.resize();
    });
}