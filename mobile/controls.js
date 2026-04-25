// MOBILE CONTROLS - KOPPELING NAAR GAME

document.addEventListener("DOMContentLoaded", () => {

    const buttons = document.querySelectorAll("[data-action]");

    buttons.forEach(btn => {

        let interval;

        const action = btn.dataset.action;

        function runAction() {
            switch (action) {

                // P1 movement
                case "p1-left":
                    movePlayer("p1", -2);
                    break;

                case "p1-right":
                    movePlayer("p1", 2);
                    break;

                case "p1-jump":
                    jumpPlayer("p1");
                    break;

                case "p1-punch":
                    attackPlayer("p1", "punch");
                    break;

                case "p1-kick":
                    attackPlayer("p1", "kick");
                    break;

                case "p1-uppercut":
                    attackPlayer("p1", "uppercut");
                    break;

                case "p1-block":
                    blockPlayer("p1", true);
                    break;
            }
        }

        // knop ingedrukt houden
        btn.addEventListener("touchstart", (e) => {
            e.preventDefault();
            runAction();
            interval = setInterval(runAction, 100);
        });

        // loslaten
        btn.addEventListener("touchend", () => {
            clearInterval(interval);

            if (action === "p1-block") {
                blockPlayer("p1", false);
            }
        });

    });

});