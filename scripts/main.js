let ringIndicatorHolding = false;
let pickerIndicatorHolding = false;
let color = "hsl(0, 100.00%, 76.30%)";
let tool = "pen";
let H = 0;
let S = 0;
let L = 0;

function ringUpdate(event) {
    if (!ringIndicatorHolding) return;
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
        H = getHueByAngle(angle);

        // update color picker & color
        pickerUpdate(event);
    }
    catch (error) {
        console.error("Error updating color ring: ", error);
    }
}

function pickerUpdate(event) {
    if (!pickerIndicatorHolding && !ringIndicatorHolding) return;
    try {
        //get mouse relative position in color picker
        let rect = document.getElementById("color-picker").getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;

        // update color picker indicator position
        if(pickerIndicatorHolding){
            let indicator = document.getElementById("color-picker-indicator");
            let indicatorRect = indicator.getBoundingClientRect();
            indicator.style = `left: ${Math.max(0, Math.min(rect.width, x)) - indicatorRect.width / 2}px; top: ${Math.max(0, Math.min(rect.height, y)) - indicatorRect.height / 2}px;`;
            S = Math.round(Math.max(0, Math.min(100, (x / rect.width) * 100)));
            L = Math.round(Math.max(0, Math.min(100, (1 - y / rect.height) * 50 * ((1 - x / rect.width) + 1))));
            // console.log("Indicator moved to:", x, y); // debug
        }

        // update color picker background
        document.getElementById("color-picker").style = `background:  -webkit-linear-gradient(270deg, white 0%, black 100%), -webkit-linear-gradient(0deg, white 0%, hsl(${H}, 100%, 50%) 100%);`

        // update color
        updateColor();
    }
    catch (error) {
        console.error("Error updating color picker:", error);
    }
}

function updateColor () {
    try {
        // change color to hsl format
        color = `hsl(${H}, ${S}%, ${L}%)`;
        document.getElementById("picked-color").style.backgroundColor = color;
        // console.log("Picked color:", color); // debug
    }
    catch (error) {
        console.error("Error updating color:", error);
    }
}

function setRingIndicatorHolding(value) {
    ringIndicatorHolding = value;
}

function setPickerIndicatorHolding(value) {
    pickerIndicatorHolding = value;
}

function getHueByAngle(angle) {
    return angle % 360;
}

function pageInit() {
    let rect = document.getElementById("color-picker").getBoundingClientRect();
    setPickerIndicatorHolding(true);
    pickerUpdate({ clientX: rect.right, clientY: rect.bottom });
    setPickerIndicatorHolding(false);
}

function toggleVisible(event) {
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

function draw(event) {
    try {
        switch(tool) {
            case "pen":
                // Draw with pen tool
                break;
            case "eraser":
                // Erase with eraser tool
                break;
            default:
                console.error("Unknown tool:", tool);
        }
    }
    catch (error) {
        console.error("Error drawing:", error);
    }
}