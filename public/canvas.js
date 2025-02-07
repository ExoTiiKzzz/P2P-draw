export default class Canvas {
    prevX = 0;
    prevY = 0;
    selfColor = 'black';
    selfStroke = 1;
    canvas = null;
    ctx = null;
    frames = []; // Stocke les frames capturées

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
        this.ctx.strokeStyle = this.selfColor;
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
        this.frames = []; // Effacer les frames
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
        a.href = this.canvas.toDataURL('image/' + type);
        a.download = 'drawing.' + type;
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

    // 🎥 Générer une vidéo avec **haute qualité** (WebM ou MP4)
    async generateHighQualityMP4(format = 'webm') {
        if (!['webm', 'mp4'].includes(format)) format = 'webm';
        const loading = document.getElementById('loading');
        loading.classList.remove('hidden');

        // 🔥 Création d'un `canvas` caché en haute qualité
        let hiddenCanvas = document.createElement("canvas");
        hiddenCanvas.width = this.canvas.width;
        hiddenCanvas.height = this.canvas.height;
        let hiddenCtx = hiddenCanvas.getContext("2d", {willReadFrequently: true});

        // 🎬 Capture en haute qualité (VP9 pour WebM)
        let stream = hiddenCanvas.captureStream(60);
        let recorder = new MediaRecorder(stream, {
            mimeType: `video/webm; codecs=vp9`, // VP9 pour meilleure qualité
            videoBitsPerSecond: 5_000_000 // 🔥 Augmente le débit vidéo (5 Mbps)
        });

        let chunks = [];
        recorder.ondataavailable = (e) => chunks.push(e.data);

        recorder.onstop = () => {
            let blob = new Blob(chunks, {type: `video/${format}`});
            let url = URL.createObjectURL(blob);

            // 📂 Téléchargement automatique
            const a = document.createElement("a");
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
                hiddenCtx.drawImage(img, 0, 0, hiddenCanvas.width, hiddenCanvas.height); // 🎨 Pas de redimensionnement !

                // ⚡ Accélération avec un bon timing
                let delay = frameIndex === 0 ? 100 : Math.max(30, (this.frames[frameIndex].time - this.frames[frameIndex - 1].time));

                frameIndex++;
                setTimeout(drawNextFrame, delay / 2);
            };
        };

        recorder.start();
        drawNextFrame();
    }
}
