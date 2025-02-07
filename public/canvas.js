export default class Canvas {
    prevX = 0
    prevY = 0
    selfColor = 'black'
    selfStroke = 1
    canvas = null
    ctx = null

    constructor(elementSelector) {
        this.canvas = document.querySelector(elementSelector);
        this.ctx = this.canvas.getContext('2d');
        this.ctx.mozImageSmoothingEnabled = true;
        this.ctx.strokeStyle = this.selfColor;
        this.ctx.lineWidth = this.selfStroke;
    }

    handleStroke(x, y, color, lineWidth) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.prevX, this.prevY);
        this.ctx.lineTo(x, y);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.stroke();
        this.prevX = x;
        this.prevY = y;
        this.ctx.strokeStyle = this.selfColor;
    }

    handlePress(x, y, color) {
        this.ctx.beginPath();
        this.prevX = x;
        this.prevY = y;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = this.selfStroke;
    }

    reset() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    press(ev) {
        let x = ev.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - this.canvas.offsetLeft;
        let y = ev.clientY + document.body.scrollTop + document.documentElement.scrollTop - this.canvas.offsetTop;
        ev.target.onmousemove = drag;
        document.onmouseup = release;

        this.ctx.beginPath();
        this.prevX = x;
        this.prevY = y;
        // ctx.moveTo(x,y);
        // ctx.lineTo(x, y);
        // ctx.stroke();
        const event = new CustomEvent('canvas-press', {detail: {x: x, y: y, color: selfColor, lineWidth: selfStroke}});
        window.dispatchEvent(event);

        function drag(ev) {
            let x = ev.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - this.canvas.offsetLeft;
            let y = ev.clientY + document.body.scrollTop + document.documentElement.scrollTop - this.canvas.offsetTop;
            if (x !== this.prevX || y !== this.prevY) {
                this.ctx.beginPath();
                this.ctx.moveTo(this.prevX, this.prevY);
                this.ctx.lineTo(x, y);
                this.ctx.stroke();

                this.prevX = x;
                this.prevY = y;
                const event = new CustomEvent('canvas-drag', {
                    detail: {
                        x: x,
                        y: y,
                        color: selfColor,
                        lineWidth: selfStroke
                    }
                });
                window.dispatchEvent(event);
            }
        }

        function release(ev) {
            ev.target.onmousemove = null;
            document.onmouseup = null;
        }
    }

    setStroke(stroke) {
        this.selfStroke = stroke;
        this.ctx.lineWidth = stroke;
    }

    setColor(color) {
        this.selfColor = color;
        this.ctx.strokeStyle = color;
    }
}