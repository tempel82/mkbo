document.addEventListener("DOMContentLoaded", () => {

    const buttons = document.querySelectorAll("[data-action]");

    buttons.forEach(btn => {

        let interval;
        const action = btn.dataset.action;

        function press(key) {
            window.dispatchEvent(new KeyboardEvent("keydown", { key }));
        }

        function release(key) {
            window.dispatchEvent(new KeyboardEvent("keyup", { key }));
        }

        function run() {
            switch (action) {
                case "p1-left": press("a"); break;
                case "p1-right": press("d"); break;
                case "p1-jump": press("w"); break;
                case "p1-punch": press("f"); break;
                case "p1-kick": press("g"); break;
                case "p1-uppercut": press("h"); break;
                case "p1-block": press("r"); break;
            }
        }

        function stop() {
            switch (action) {
                case "p1-left": release("a"); break;
                case "p1-right": release("d"); break;
                case "p1-block": release("r"); break;
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