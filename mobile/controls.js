document.addEventListener("DOMContentLoaded", () => {

    const buttons = document.querySelectorAll("[data-action]");

    buttons.forEach(btn => {

        let interval;
        const action = btn.dataset.action;

        function run() {

            switch (action) {

                case "p1-left":
                    window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
                    break;

                case "p1-right":
                    window.dispatchEvent(new KeyboardEvent("keydown", { key: "d" }));
                    break;

                case "p1-jump":
                    window.dispatchEvent(new KeyboardEvent("keydown", { key: "w" }));
                    break;

                case "p1-punch":
                    window.dispatchEvent(new KeyboardEvent("keydown", { key: "f" }));
                    break;

                case "p1-kick":
                    window.dispatchEvent(new KeyboardEvent("keydown", { key: "g" }));
                    break;

                case "p1-uppercut":
                    window.dispatchEvent(new KeyboardEvent("keydown", { key: "h" }));
                    break;

                case "p1-block":
                    window.dispatchEvent(new KeyboardEvent("keydown", { key: "r" }));
                    break;
            }
        }

        btn.addEventListener("touchstart", (e) => {
            e.preventDefault();
            run();
            interval = setInterval(run, 120);
        });

        btn.addEventListener("touchend", () => {
            clearInterval(interval);
        });

    });

});