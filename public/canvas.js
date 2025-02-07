export default class Canvas {
    prevX = 0;
    prevY = 0;
    canvas = null;
    ctx = null;
    frames = []; // Stores captured frames
    selfColor = 'black';
    selfStroke = 1;
    showArea = false;

    constructor(elementSelector) {
        this.canvas = document.querySelector(elementSelector);
        this.ctx = this.canvas.getContext('2d', {willReadFrequently: true});
        this.ctx.mozImageSmoothingEnabled = true;
        this.ctx.strokeStyle = this.selfColor;
        this.ctx.lineWidth = this.selfStroke;

        this.canvas.addEventListener('mousedown', (ev) => this.press(ev));
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
        this.captureFrame();
    }

    handlePress(x, y, color) {
        this.ctx.beginPath();
        this.prevX = x;
        this.prevY = y;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = this.selfStroke;
        this.captureFrame();
    }

    captureFrame() {
        this.frames.push({frame: this.canvas.toDataURL('image/png', 1.0), time: Date.now()});
    }

    reset() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.frames = [];
    }

    press(ev) {
        let x = ev.clientX - this.canvas.offsetLeft;
        let y = ev.clientY - this.canvas.offsetTop;
        this.prevX = x;
        this.prevY = y;

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
                this.captureFrame();
            }
        };

        const release = () => {
            this.canvas.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', release);
        };

        this.canvas.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', release);
    }

    save(type) {
        if (type === 'mp4' || type === 'webm') {
            this.generateHighQualityMP4(type);
            return;
        }

        const a = document.createElement('a');
        a.href = this.canvas.toDataURL(`image/${type}`);
        a.download = `drawing.${type}`;
        a.click();
    }

    setStroke(stroke) {
        this.selfStroke = stroke;
        this.ctx.lineWidth = stroke;
    }

    setColor(color) {
        this.selfColor = color;
        this.ctx.strokeStyle = color;
    }

    async generateHighQualityMP4(format = 'webm') {
        if (!['webm', 'mp4'].includes(format)) format = 'webm';
        const loading = document.getElementById('loading');
        loading.classList.remove('hidden');

        let hiddenCanvas = document.createElement('canvas');
        hiddenCanvas.width = this.canvas.width;
        hiddenCanvas.height = this.canvas.height;
        let hiddenCtx = hiddenCanvas.getContext('2d', {willReadFrequently: true});

        let stream = hiddenCanvas.captureStream(60);
        let recorder = new MediaRecorder(stream, {
            mimeType: `video/webm; codecs=vp9`,
            videoBitsPerSecond: 5_000_000
        });

        let chunks = [];
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
            let blob = new Blob(chunks, {type: `video/${format}`});
            let url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `drawing.${format}`;
            a.click();

            loading.classList.add('hidden');
        };

        let frameIndex = 0;

        const drawNextFrame = () => {
            if (frameIndex >= this.frames.length) {
                recorder.stop();
                return;
            }

            let img = new Image();
            img.src = this.frames[frameIndex].frame;

            img.onload = () => {
                hiddenCtx.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);
                hiddenCtx.drawImage(img, 0, 0, hiddenCanvas.width, hiddenCanvas.height);

                let delay = frameIndex === 0 ? 100 : Math.max(30, (this.frames[frameIndex].time - this.frames[frameIndex - 1].time));
                frameIndex++;
                setTimeout(drawNextFrame, delay / 2);
            };
        };

        recorder.start();
        drawNextFrame();
    }

    setShowArea(show) {
        this.showArea = show;
        this.updateCursor();
    }

    updateCursor() {
        if (this.showArea) {
            const cursorSize = this.selfStroke;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = cursorSize * 2;
            canvas.height = cursorSize * 2;

            ctx.beginPath();
            ctx.arc(cursorSize, cursorSize, cursorSize / 2, 0, Math.PI * 2);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = 'transparent';
            ctx.fill();

            const dataURL = canvas.toDataURL();
            this.canvas.style.cursor = `url(${dataURL}) ${cursorSize / 2} ${cursorSize / 2}, auto`;
        } else {
            this.canvas.style.cursor = 'default';
        }
    }
}
