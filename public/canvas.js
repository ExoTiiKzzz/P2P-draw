export default class Canvas {
    prevX = 0;
    prevY = 0;
    canvas = null;
    ctx = null;
    selfColor = 'black';
    selfStroke = 1;
    showArea = false;

    constructor(elementSelector) {
        this.canvas = document.querySelector(elementSelector);
        this.ctx = this.canvas.getContext('2d');
        this.ctx.mozImageSmoothingEnabled = true;
        this.ctx.strokeStyle = this.selfColor;
        this.ctx.lineWidth = this.selfStroke;

        this.canvas.addEventListener('mousedown', (ev) => this.press(ev));
        this.canvas.addEventListener('mousemove', (ev) => this.showAreaPreview(ev));
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
        let x = ev.clientX - this.canvas.offsetLeft;
        let y = ev.clientY - this.canvas.offsetTop;

        this.prevX = x;
        this.prevY = y;

        // Ajouter les écouteurs uniquement au moment du clic
        const drag = (ev) => {
            let x = ev.clientX - this.canvas.offsetLeft;
            let y = ev.clientY - this.canvas.offsetTop;

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
                        color: this.selfColor,
                        lineWidth: this.selfStroke
                    }
                });
                window.dispatchEvent(event);
            }
        };

        const release = () => {
            this.canvas.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', release);
        };

        this.canvas.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', release);

        const event = new CustomEvent('canvas-press', {
            detail: {
                x: x,
                y: y,
                color: this.selfColor,
                lineWidth: this.selfStroke
            }
        });
        window.dispatchEvent(event);
    }

    setStroke(stroke) {
        this.selfStroke = stroke;
        this.ctx.lineWidth = stroke;
    }

    setColor(color) {
        this.selfColor = color;
        this.ctx.strokeStyle = color;
    }

    setShowArea(show) {
        this.showArea = show;
        this.updateCursor();
    }

    updateCursor() {
        if (this.showArea) {
            const cursorSize = this.selfStroke;
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = cursorSize * 2;
            canvas.height = cursorSize * 2;

            ctx.beginPath();
            ctx.arc(cursorSize, cursorSize, cursorSize / 2, 0, Math.PI * 2);
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = "transparent";
            ctx.fill();

            const dataURL = canvas.toDataURL();
            this.canvas.style.cursor = `url(${dataURL}) ${cursorSize / 2} ${cursorSize / 2}, auto`;
        } else {
            this.canvas.style.cursor = "default";
        }
    }
}
