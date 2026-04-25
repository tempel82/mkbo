document.addEventListener("DOMContentLoaded", () => {

    const buttons = document.querySelectorAll("[data-action]");

    buttons.forEach(btn => {

        let interval;
        const action = btn.dataset.action;

        function pressKey(key) {
            window.dispatchEvent(new KeyboardEvent("keydown", { key }));
        }

        function releaseKey(key) {
            window.dispatchEvent(new KeyboardEvent("keyup", { key }));
        }

        function run() {
            switch (action) {

                case "p1-left": pressKey("a"); break;
                case "p1-right": pressKey("d"); break;
                case "p1-jump": pressKey("w"); break;
                case "p1-punch": pressKey("f"); break;
                case "p1-kick": pressKey("g"); break;
                case "p1-uppercut": pressKey("h"); break;
                case "p1-block": pressKey("r"); break;
            }
        }

        function stop() {
            switch (action) {

                case "p1-left": releaseKey("a"); break;
                case "p1-right": releaseKey("d"); break;
                case "p1-block": releaseKey("r"); break;
            }
        }

        btn.addEventListener("touchstart", (e) => {
            e.preventDefault();
            run();
            interval = setInterval(run, 120);
        });

        btn.addEventListener("touchend", () => {
            clearInterval(interval);
            stop();
        });

    });

});