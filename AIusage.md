# AI Usage in this project
## Optimizing & Debug Assisting
* Ask For Idea of Anti-aliasing
* Solving that dragged in Image cant be drawn correctly
    I asked ChatGPT for why my canvas.drapImage() function cant work correctly, and found that image may havent be loaded when running ctx.drawImage, so I put the drawImage step into the source image's onload event.
    Modify canvas.drapImage() function at main.js:121:
    from:
    ```
    dropImage(event) {
        console.log(event.dataTransfer.files); // debug
        let source = new Image();
        source.src = URL.createObjectURL(event.dataTransfer.files[0]);
        this.ctx.drawImage(source, Number(event.clientX) - this.canvas.left - source.width / 2, Number(event.clientY) - this.canvas.top - source.height / 2);
    }
    ```
    to:
    dropImage(event) {
        console.log(event.dataTransfer.files); // debug
        let source = new Image();
        source.src = URL.createObjectURL(event.dataTransfer.files[0]);
        source.onload = () => {
            this.ctx.drawImage(source, Number(event.clientX) - this.canvas.left - source.width / 2, Number(event.clientY) - this.canvas.top - source.height / 2);
        }
    }


## Find Way to Implement Wanted Function
* Canvas Resize
    I asked ChatGPT for whether I can make canvas resize automatically when window size changes without content being cleared, and take its way as reference to implement my own canvas.resize() function at main.js:296.

