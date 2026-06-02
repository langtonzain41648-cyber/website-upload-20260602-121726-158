import { H as Hls } from "./video-vendor-dru42stk.js";

const activePlayers = new WeakMap();

document.addEventListener("DOMContentLoaded", function () {
    const cards = Array.from(document.querySelectorAll("[data-player-card]"));

    cards.forEach(function (card) {
        const video = card.querySelector("video");
        const overlay = card.querySelector("[data-play-button]");
        const sourceButtons = Array.from(card.querySelectorAll("[data-source]"));

        if (!video) {
            return;
        }

        const defaultSource = video.dataset.videoUrl || "";
        const fallbackSource = video.dataset.fallbackUrl || "";

        function setActiveButton(source) {
            sourceButtons.forEach(function (button) {
                button.classList.toggle("active", button.dataset.source === source);
            });
        }

        function loadAndPlay(source, fallback) {
            attachSource(video, source, fallback).then(function () {
                return video.play();
            }).catch(function () {
                if (fallback && fallback !== source) {
                    attachSource(video, fallback, "").then(function () {
                        return video.play();
                    }).catch(function () {
                        video.controls = true;
                    });
                }
            });
        }

        if (overlay) {
            overlay.addEventListener("click", function () {
                overlay.classList.add("hidden");
                setActiveButton(defaultSource);
                loadAndPlay(defaultSource, fallbackSource);
            });
        }

        sourceButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                const source = button.dataset.source || defaultSource;
                setActiveButton(source);
                if (overlay) {
                    overlay.classList.add("hidden");
                }
                loadAndPlay(source, fallbackSource);
            });
        });
    });
});

async function attachSource(video, source, fallback) {
    destroyExisting(video);

    if (!source) {
        throw new Error("Missing video source");
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.load();
        return;
    }

    if (Hls && Hls.isSupported && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90
        });

        activePlayers.set(video, hls);

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal && fallback && fallback !== source) {
                destroyExisting(video);
                attachSource(video, fallback, "");
            }
        });

        return;
    }

    video.src = fallback || source;
    video.load();
}

function destroyExisting(video) {
    const hls = activePlayers.get(video);

    if (hls && typeof hls.destroy === "function") {
        hls.destroy();
    }

    activePlayers.delete(video);
}
