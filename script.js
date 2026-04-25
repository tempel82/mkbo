/* =========================
   CHARACTER SELECT
========================= */
function startGame() {
    window.location.href = "character-select.html";
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

function detectMobile() {
    const hasTouch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
    const isNarrow = window.innerWidth <= 1024;
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const isMobile = hasTouch || isMobileUA || isNarrow;

    const info = document.getElementById("deviceInfo");

    if (isMobile) {
        document.body.classList.add("is-mobile");
        if (info) info.innerText = "📱 Smartphone / Tablet gedetecteerd";
    } else {
        document.body.classList.remove("is-mobile");
        if (info) info.innerText = "💻 PC / Desktop gedetecteerd";
    }

    console.log("DEVICE DEBUG:", {
        hasTouch,
        isNarrow,
        isMobileUA,
        result: isMobile
    });
}

document.addEventListener("DOMContentLoaded", () => {
    detectMobile();
    window.addEventListener("resize", detectMobile);

    const globalFullscreenBtn = document.getElementById("fullscreenBtn");
    const fsHint = document.getElementById("fullscreenHint");

    function hideFullscreenHint() {
        if (fsHint) fsHint.style.display = "none";
    }

    if (globalFullscreenBtn) {
        globalFullscreenBtn.onclick = () => {
            toggleFullscreen();
            hideFullscreenHint();
        };
    }

    document.addEventListener("fullscreenchange", () => {
        if (document.fullscreenElement) {
            hideFullscreenHint();
        }
    });
});

/* =========================
   CHARACTER SELECT
========================= */
if (document.getElementById("fighterGrid")) {
    const fighterList = Object.values(fighters);

    const SELECT_COLS = 13;
    const SELECT_ROWS = 8;
    const TOTAL_SLOTS = SELECT_COLS * SELECT_ROWS;

    const STAGES = [
        { name: "Desert", image: "assets/backgrounds/fight-bg.png" },
        { name: "Temple", image: "assets/backgrounds/temple-bg.png" },
        { name: "Forest", image: "assets/backgrounds/forest-bg.png" },
        { name: "Castle", image: "assets/backgrounds/castle-bg.png" },
        { name: "Cemetery", image: "assets/backgrounds/cemetery-bg.png" },
        { name: "D-mountain", image: "assets/backgrounds/D-mountain-bg.png" },
        { name: "Sumo", image: "assets/backgrounds/sumo-bg.png" },
        { name: "Dungeon", image: "assets/backgrounds/dungeon-bg.png" },
        { name: "Stockroom", image: "assets/backgrounds/stockroom-bg.png" },
        { name: "Mountain", image: "assets/backgrounds/mountain-bg.png" },
        { name: "Bridge", image: "assets/backgrounds/bridge-bg.png" }
    ];

    let selectedStage = null;
    let selectingStage = false;

    let previewStageImage = null;
    const defaultSelectBackground = "assets/backgrounds/character-select-bg.png";

    let selectedTowerSize = null;
    let selectedTowerData = null;
    let selectingTower = false;

    const fighterGrid = document.getElementById("fighterGrid");
    const topSubInfo = document.getElementById("topSubInfo");
    const lockBtn = document.getElementById("lockBtn");
    const resetBtn = document.getElementById("resetBtn");
    const startBtn = document.getElementById("startBtn");
    const turnIndicator = document.getElementById("turnIndicator");
    const statusText = document.getElementById("statusText");
    const towerMiniGrid = document.getElementById("towerMiniGrid");

    const p1PreviewImg = document.getElementById("p1PreviewImg");
    const p2PreviewImg = document.getElementById("p2PreviewImg");
    const p1Placeholder = document.getElementById("p1Placeholder");
    const p2Placeholder = document.getElementById("p2Placeholder");
    const p1Name = document.getElementById("p1Name");
    const p2Name = document.getElementById("p2Name");
    const modeButtons = document.querySelectorAll(".mode-btn");

    let currentPlayer = 1;
    let selectedHover = null;
    let player1 = null;
    let player2 = null;
    let selectedMode = "pvp";

    if (
        window.innerWidth <= 900 ||
        navigator.maxTouchPoints > 0 ||
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    ) {
        selectedMode = "cpu";
    }

    function getCorrectScale(fighter, player) {
        if (player === 1) {
            return fighter.facing === "right" ? "scaleX(1)" : "scaleX(-1)";
        }
        return fighter.facing === "right" ? "scaleX(-1)" : "scaleX(1)";
    }

    function applyModeUI() {
        if (selectingStage) {
            turnIndicator.textContent = "SELECT BACKGROUND";
            topSubInfo.textContent = selectedStage
                ? `Geselecteerd stage: ${selectedStage.name}`
                : "Kies een background";
            return;
        }

        modeButtons.forEach(btn => {
            btn.classList.toggle("active", btn.dataset.mode === selectedMode);
        });

        if (selectedMode === "pvp") {
            turnIndicator.textContent = player2 ? "BEIDE FIGHTERS GEKOZEN" : (currentPlayer === 1 ? "PLAYER 1 KIEST" : "PLAYER 2 KIEST");
            topSubInfo.textContent = "Lokale versus mode";
        } else if (selectedMode === "cpu") {
            turnIndicator.textContent = player1 ? "CPU MODE KLAAR" : "PLAYER 1 KIEST";
            topSubInfo.textContent = "Speel tegen de CPU";
        } else if (selectedMode === "tower5") {
            if (!player1) {
                turnIndicator.textContent = "PLAYER 1 KIEST";
                topSubInfo.textContent = "Kies je fighter voor Tower mode";
            } else if (selectingTower) {
                turnIndicator.textContent = selectedTowerSize
                    ? `TOWER ${selectedTowerSize} GEKOZEN`
                    : "KIES TOWER 5, 7 OF 9";
                topSubInfo.textContent = selectedTowerSize
                    ? `Tower ${selectedTowerSize} geselecteerd`
                    : "Kies Tower 5, 7 of 9";
            } else {
                turnIndicator.textContent = "TOWER MODE";
                topSubInfo.textContent = "Versla tegenstanders op rij";
            }
        }
    }

    function pickRandomCpu(list, excludeName = null) {
        const pool = list.filter(f => f.name !== excludeName);
        return pool[Math.floor(Math.random() * pool.length)];
    }

    function buildTowerData(list, towerSize, playerName) {
        const pool = list.filter(f => f.name !== playerName);
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        const enemies = shuffled.slice(0, towerSize);

        const stages = enemies.map(() => {
            const randomStage = STAGES[Math.floor(Math.random() * STAGES.length)];
            return randomStage.image;
        });

        return { enemies, stages };
    }

    function setSelectBackgroundPreview(imagePath) {
        document.body.style.backgroundImage = `url("${imagePath}")`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundRepeat = "no-repeat";
    }

    function restoreSelectBackgroundPreview() {
        if (selectedStage && selectedStage.image) {
            setSelectBackgroundPreview(selectedStage.image);
        } else {
            setSelectBackgroundPreview(defaultSelectBackground);
        }
    }

    function renderGrid() {
        fighterGrid.innerHTML = "";

        fighterGrid.style.setProperty("--grid-cols", SELECT_COLS);

        const allSlots = [...fighterList];

        while (allSlots.length < TOTAL_SLOTS) {
            allSlots.push({
                name: "locked",
                portrait: "",
                locked: true
            });
        }

        allSlots.slice(0, TOTAL_SLOTS).forEach((f) => {
            const card = document.createElement("div");

            if (f.locked) {
                card.className = "fighter-card locked-slot-card";
                card.innerHTML = `
                <div class="slot-lock-icon">🔒</div>
                <div class="name">LOCKED</div>
            `;
                fighterGrid.appendChild(card);
                return;
            }

            card.className = "fighter-card";

            if (player1 && player1.name === f.name) card.classList.add("selected-p1");
            if (player2 && player2.name === f.name) card.classList.add("selected-p2");

            card.innerHTML = `
            <img src="${f.portraitGrid || f.portrait}" alt="${f.name}">
            <div class="name">${f.name}</div>
        `;

            card.addEventListener("click", () => {
                if (currentPlayer === 2 && player1 && player1.name === f.name) return;
                if (currentPlayer === 1 && player2 && player2.name === f.name) return;

                selectedHover = f;
                updatePreview();
                statusText.textContent = `${f.name} geselecteerd`;
                topSubInfo.textContent = `Geselecteerd: ${f.name}`;
            });

            fighterGrid.appendChild(card);
        });
    }

    function renderStageRow() {
        fighterGrid.innerHTML = "";

        const totalStageSlots = 13;
        const middleIndex = Math.floor(totalStageSlots / 2);

        for (let i = 0; i < totalStageSlots; i++) {
            const card = document.createElement("div");
            card.className = "fighter-card stage-card";

            if (i === middleIndex) {
                card.innerHTML = `
                <div class="stage-random">?</div>
                <div class="name">RANDOM</div>
            `;

                card.addEventListener("mouseenter", () => {
                    statusText.textContent = "Preview: Random background";
                });

                card.addEventListener("mouseleave", () => {
                    restoreSelectBackgroundPreview();
                });

                card.addEventListener("click", () => {
                    selectedStage = {
                        name: "Random",
                        image: null,
                        random: true
                    };
                    statusText.textContent = "Random background gekozen";
                    topSubInfo.textContent = "Geselecteerd: Random Background";
                    highlightSelectedStage(card);
                    startBtn.style.display = "inline-block";
                });
            } else {
                const stageIndex = i < middleIndex ? i : i - 1;
                const stage = STAGES[stageIndex % STAGES.length];

                card.innerHTML = `
                <img src="${stage.image}" alt="${stage.name}">
                <div class="name">${stage.name}</div>
            `;

                card.addEventListener("mouseenter", () => {
                    setSelectBackgroundPreview(stage.image);
                    statusText.textContent = `Preview: ${stage.name}`;
                });

                card.addEventListener("mouseleave", () => {
                    restoreSelectBackgroundPreview();
                });

                card.addEventListener("click", () => {
                    selectedStage = stage;
                    statusText.textContent = `${stage.name} background gekozen`;
                    topSubInfo.textContent = `Geselecteerd stage: ${stage.name}`;
                    highlightSelectedStage(card);
                    startBtn.style.display = "inline-block";
                    setSelectBackgroundPreview(stage.image);
                });
            }

            fighterGrid.appendChild(card);
        }
    }

    function renderTowerMiniGrid() {
        towerMiniGrid.innerHTML = "";

        const towerSizes = [5, 7, 9];
        const maxRows = 10; // speler + max 9 enemies
        const towerMaps = towerSizes.map(size => {
            const towerData = buildTowerData(fighterList, size, player1.name);
            return {
                size,
                towerData,
                enemiesTopDown: [...towerData.enemies].reverse()
            };
        });

        towerMiniGrid.style.setProperty("--tower-cols", 3);

        // Rij 0 = titels
        towerMaps.forEach(({ size, towerData }) => {
            const titleCell = document.createElement("div");
            titleCell.className = "tower-mini-title tower-col-" + size;
            titleCell.textContent = `TOWER ${size}`;

            titleCell.addEventListener("click", () => {
                selectedTowerSize = size;
                selectedTowerData = towerData;

                document.querySelectorAll(".tower-mini-title, .tower-mini-slot").forEach(el => {
                    el.classList.remove("tower-selected");
                });

                document.querySelectorAll(`.tower-col-${size}`).forEach(el => {
                    el.classList.add("tower-selected");
                });

                statusText.textContent = `Tower ${size} gekozen`;
                topSubInfo.textContent = `Tower ${size} geselecteerd`;
                startBtn.style.display = "inline-block";
            });

            towerMiniGrid.appendChild(titleCell);
        });

        // Rij 1 t/m 10
        for (let row = 0; row < maxRows; row++) {
            towerMaps.forEach(({ size, towerData, enemiesTopDown }) => {
                const cell = document.createElement("div");

                // rij 0 van grid-body = speler
                if (row === 0) {
                    cell.className = "tower-mini-slot tower-player-slot tower-col-" + size;
                    cell.innerHTML = `
                    <img src="${player1.portraitGrid || player1.portraitPreview}" alt="${player1.name}">
                    <div class="name">${player1.name}</div>
                `;

                    cell.addEventListener("click", () => {
                        selectedTowerSize = size;
                        selectedTowerData = towerData;

                        document.querySelectorAll(".tower-mini-title, .tower-mini-slot").forEach(el => {
                            el.classList.remove("tower-selected");
                        });

                        document.querySelectorAll(`.tower-col-${size}`).forEach(el => {
                            el.classList.add("tower-selected");
                        });

                        statusText.textContent = `Tower ${size} gekozen`;
                        topSubInfo.textContent = `Tower ${size} geselecteerd`;
                        startBtn.style.display = "inline-block";
                    });

                    towerMiniGrid.appendChild(cell);
                    return;
                }

                const enemyIndex = row - 1;

                if (enemyIndex < enemiesTopDown.length) {
                    const enemy = enemiesTopDown[enemyIndex];

                    cell.className = "tower-mini-slot tower-col-" + size;
                    if (enemyIndex === 0) cell.classList.add("tower-boss-slot");

                    cell.innerHTML = `
                    <img src="${enemy.portraitGrid || enemy.portraitPreview}" alt="${enemy.name}">
                    <div class="name">${enemy.name}</div>
                `;

                    cell.addEventListener("click", () => {
                        selectedTowerSize = size;
                        selectedTowerData = towerData;

                        document.querySelectorAll(".tower-mini-title, .tower-mini-slot").forEach(el => {
                            el.classList.remove("tower-selected");
                        });

                        document.querySelectorAll(`.tower-col-${size}`).forEach(el => {
                            el.classList.add("tower-selected");
                        });

                        statusText.textContent = `Tower ${size} gekozen`;
                        topSubInfo.textContent = `Tower ${size} geselecteerd`;
                        startBtn.style.display = "inline-block";
                    });
                } else {
                    cell.className = "fighter-card locked-slot-card tower-col-" + size;
                    cell.innerHTML = `
                    <div class="slot-lock-icon">🔒</div>
                    <div class="name">LOCKED</div>
                `;
                }

                towerMiniGrid.appendChild(cell);
            });
        }
    }

    function highlightSelectedStage(activeCard) {
        document.querySelectorAll(".stage-card").forEach(card => {
            card.classList.remove("selected-stage");
        });
        activeCard.classList.add("selected-stage");
    }

    function updatePreview() {
        if (!selectedHover) return;

        topSubInfo.textContent = `Geselecteerd: ${selectedHover.name}`;

        if (currentPlayer === 1) {
            p1PreviewImg.src = selectedHover.portraitPreview;
            p1PreviewImg.style.display = "block";
            p1PreviewImg.style.transform = getCorrectScale(selectedHover, 1);
            p1Placeholder.style.display = "none";
            p1Name.textContent = selectedHover.name;
        } else {
            p2PreviewImg.src = selectedHover.portraitPreview;
            p2PreviewImg.style.display = "block";
            p2PreviewImg.style.transform = getCorrectScale(selectedHover, 2);
            p2Placeholder.style.display = "none";
            p2Name.textContent = selectedHover.name;
        }
    }

    function restoreLockedPreview() {
        if (player1) {
            p1PreviewImg.src = player1.portraitPreview;
            p1PreviewImg.style.display = "block";
            p1PreviewImg.style.transform = getCorrectScale(player1, 1);
            p1Placeholder.style.display = "none";
            p1Name.textContent = player1.name;
        } else {
            p1PreviewImg.style.display = "none";
            p1Placeholder.style.display = "block";
            p1Name.textContent = "";
        }

        if (player2) {
            p2PreviewImg.src = player2.portraitPreview;
            p2PreviewImg.style.display = "block";
            p2PreviewImg.style.transform = getCorrectScale(player2, 2);
            p2Placeholder.style.display = "none";
            p2Name.textContent = player2.name;
        } else {
            p2PreviewImg.style.display = "none";
            p2Placeholder.style.display = "block";
            p2Name.textContent = "";
        }
    }

    modeButtons.forEach(btn => {
        btn.addEventListener("click", () => {

            if (document.body.classList.contains("is-mobile") && btn.dataset.mode !== "cpu") {
                return;
            }
            selectedMode = btn.dataset.mode;
            currentPlayer = 1;
            selectedHover = null;
            player1 = null;
            player2 = null;

            selectedStage = null;
            selectingStage = false;

            restoreLockedPreview();
            restoreSelectBackgroundPreview();

            selectedTowerSize = null;
            selectedTowerData = null;
            selectingTower = false;

            towerMiniGrid.style.display = "none";
            fighterGrid.style.display = "grid";

            startBtn.style.display = "none";
            lockBtn.style.display = "inline-block";
            statusText.textContent = "Mode aangepast";

            renderGrid();
            applyModeUI();
        });
    });

    lockBtn.onclick = () => {
        if (!selectedHover) {
            statusText.textContent = "Kies eerst een fighter";
            return;
        }

        if (selectedMode === "pvp") {
            if (currentPlayer === 1) {
                player1 = selectedHover;
                currentPlayer = 2;
                selectedHover = null;
                statusText.textContent = `${player1.name} gelockt voor Player 1`;
            } else {
                player2 = selectedHover;
                selectedHover = null;
                selectingStage = true;
                selectedStage = null;

                statusText.textContent = "Beide fighters gekozen. Kies nu een background.";
                topSubInfo.textContent = "Kies een background";
                turnIndicator.textContent = "SELECT BACKGROUND";

                lockBtn.style.display = "none";
                startBtn.style.display = "none";

                restoreLockedPreview();
                restoreSelectBackgroundPreview();
                renderStageRow();
                applyModeUI();
                return;
            }

            restoreLockedPreview();
            renderGrid();
            applyModeUI();
            return;
        }

        if (selectedMode === "cpu") {
            player1 = selectedHover;
            player2 = pickRandomCpu(fighterList, player1.name);

            selectedHover = null;
            statusText.textContent = `${player1.name} VS CPU (${player2.name})`;
            startBtn.style.display = "inline-block";
            lockBtn.style.display = "none";

            restoreLockedPreview();
            renderGrid();
            applyModeUI();
            return;
        }

        if (selectedMode === "tower5") {
            player1 = selectedHover;
            player2 = null;
            selectedHover = null;

            selectingTower = true;
            selectedTowerSize = null;
            selectedTowerData = null;

            statusText.textContent = `${player1.name} gelockt. Kies nu Tower 5, 7 of 9`;
            topSubInfo.textContent = "Kies Tower 5, 7 of 9";

            lockBtn.style.display = "none";
            startBtn.style.display = "none";

            restoreLockedPreview();

            fighterGrid.style.display = "none";
            towerMiniGrid.style.display = "grid";
            renderTowerMiniGrid();

            applyModeUI();
            return;
        }
    };

    resetBtn.onclick = () => {
        currentPlayer = 1;
        selectedHover = null;
        player1 = null;
        player2 = null;

        selectedStage = null;
        selectingStage = false;
        restoreSelectBackgroundPreview();

        selectedTowerSize = null;
        selectedTowerData = null;
        selectingTower = false;

        towerMiniGrid.style.display = "none";
        fighterGrid.style.display = "grid";

        restoreLockedPreview();

        startBtn.style.display = "none";
        lockBtn.style.display = "inline-block";
        statusText.textContent = "Alles gereset";

        renderGrid();
        applyModeUI();
    };

    startBtn.onclick = () => {
        if (selectedMode !== "pvp") {
            const randomStage = STAGES[Math.floor(Math.random() * STAGES.length)];
            localStorage.setItem("selectedStage", JSON.stringify(randomStage));
        }

        if (!player1) return;

        if (selectedMode === "pvp") {
            let finalStage = selectedStage;

            if (selectedStage.random) {
                finalStage = STAGES[Math.floor(Math.random() * STAGES.length)];
            }

            localStorage.setItem("fighters", JSON.stringify({
                p1: player1,
                p2: player2
            }));

            localStorage.setItem("selectedStage", JSON.stringify(finalStage));
            localStorage.setItem("gameMode", "pvp");
            localStorage.removeItem("towerData");
            localStorage.removeItem("towerProgress");
            localStorage.removeItem("towerSize");
            window.location.href = "fight.html";
            return;
        }

        if (selectedMode === "cpu") {
            localStorage.setItem("fighters", JSON.stringify({
                p1: player1,
                p2: player2
            }));
            localStorage.setItem("gameMode", "cpu");
            localStorage.removeItem("towerData");
            localStorage.removeItem("towerProgress");
            localStorage.removeItem("towerSize");
            window.location.href = "fight.html";
            return;
        }

        if (selectedMode === "tower5") {
            if (!selectedTowerSize || !selectedTowerData) {
                statusText.textContent = "Kies eerst Tower 5, 7 of 9";
                return;
            }

            const firstEnemy = selectedTowerData.enemies[0];

            localStorage.setItem("fighters", JSON.stringify({
                p1: player1,
                p2: firstEnemy
            }));
            localStorage.setItem("gameMode", "tower");
            localStorage.setItem("towerSize", String(selectedTowerSize));
            localStorage.setItem("towerProgress", "0");
            localStorage.setItem("towerData", JSON.stringify(selectedTowerData));

            window.location.href = "fight.html";
            return;
        }
    };

    restoreLockedPreview();
    renderGrid();
    applyModeUI();
}

/* =========================
   FIGHT SCREEN
========================= */

if (document.getElementById("fighter1")) {

    const saved = JSON.parse(localStorage.getItem("fighters"));
    const gameMode = localStorage.getItem("gameMode") || "pvp";
    const savedStage = JSON.parse(localStorage.getItem("selectedStage"));

    const fallback = {
        p1: {
            name: "sumo",
            img: "assets/characters/sumo/portrait.png",
            portrait: "assets/characters/sumo/portrait.png",
            idle: "assets/characters/sumo/idle.png",
            punch: "assets/characters/sumo/punch.png",
            kick: "assets/characters/sumo/kick.png",
            uppercut: "assets/characters/sumo/uppercut.png",
            block: "assets/characters/sumo/block.png",
            jump: "assets/characters/sumo/jump.png",
            hit: "assets/characters/sumo/hit.png",
            facing: "right"
        },
        p2: {
            name: "kreatos",
            img: "assets/characters/kreatos/idle.png",
            idle: "assets/characters/kreatos/idle.png",
            punch: "assets/characters/kreatos/punch.png",
            facing: "left"
        }
    };

    const fighterData = saved || fallback;

    const fighter1El = document.getElementById("fighter1");
    const fighter2El = document.getElementById("fighter2");
    const health1El = document.getElementById("health1");
    const health2El = document.getElementById("health2");
    const name1El = document.getElementById("name1");
    const name2El = document.getElementById("name2");
    const resultTextEl = document.getElementById("resultText");
    const introTextEl = document.getElementById("introText");
    const timerEl = document.getElementById("timer");
    const gameWrapEl = document.getElementById("gameWrap");
    const arenaEl = document.getElementById("arena");

    if (savedStage && savedStage.image) {
        arenaEl.style.backgroundImage = `url("${savedStage.image}")`;
        arenaEl.style.backgroundSize = "cover";
        arenaEl.style.backgroundPosition = "center";
        arenaEl.style.backgroundRepeat = "no-repeat";
    }

    const p1dot1 = document.getElementById("p1dot1");
    const p1dot2 = document.getElementById("p1dot2");
    const p2dot1 = document.getElementById("p2dot1");
    const p2dot2 = document.getElementById("p2dot2");

    const backBtn = document.getElementById("backBtn");
    const resetFightBtn = document.getElementById("resetFightBtn");

    fighter1El.src = fighterData.p1.idle;
    fighter2El.src = fighterData.p2.idle;

    name1El.textContent = fighterData.p1.name.toUpperCase();
    name2El.textContent = fighterData.p2.name.toUpperCase();

    const state = {
        p1: {
            x: 12,
            health: 100,
            attacking: false,
            canMove: true,
            blocking: false,
            jumping: false,
            burning: false,
            burnTicks: 0,
            burnDamageTick: null,
            specialCooldown: false
        },
        p2: {
            x: 6,
            health: 100,
            attacking: false,
            canMove: true,
            blocking: false,
            jumping: false,
            burning: false,
            burnTicks: 0,
            burnDamageTick: null,
            specialCooldown: false
        },
        p1Rounds: 0,
        p2Rounds: 0,
        matchEnded: false,
        fightEnded: false,
        roundTime: 99,
        timerInterval: null,
        cpuInterval: null,
        lastMover: "p1",
    };

    function getFightScale(fighter, playerKey) {
        const rect1 = fighter1El.getBoundingClientRect();
        const rect2 = fighter2El.getBoundingClientRect();

        const center1 = rect1.left + rect1.width / 2;
        const center2 = rect2.left + rect2.width / 2;

        const isOnLeftSide = playerKey === "p1"
            ? center1 < center2
            : center2 < center1;

        if (isOnLeftSide) {
            return fighter.facing === "right" ? "scaleX(1)" : "scaleX(-1)";
        } else {
            return fighter.facing === "right" ? "scaleX(-1)" : "scaleX(1)";
        }
    }

    function updatePos() {
        fighter1El.style.left = state.p1.x + "%";
        fighter2El.style.right = state.p2.x + "%";

        if (!state.matchEnded && !state.fightEnded) {
            fighter1El.style.transform = getFightScale(fighterData.p1, "p1");
            fighter2El.style.transform = getFightScale(fighterData.p2, "p2");
        }

        // ✅ Z-index overlap fix (MOET BINNEN de functie zitten)
        const rect1 = fighter1El.getBoundingClientRect();
        const rect2 = fighter2El.getBoundingClientRect();
        const overlap = rect1.right > rect2.left;

        if (overlap) {
            if (state.lastMover === "p1") {
                fighter1El.style.zIndex = "6";
                fighter2El.style.zIndex = "5";
            } else {
                fighter2El.style.zIndex = "6";
                fighter1El.style.zIndex = "5";
            }
        } else {
            fighter1El.style.zIndex = "5";
            fighter2El.style.zIndex = "5";
        }
    }

    function updateHealthUI() {
        health1El.style.width = state.p1.health + "%";
        health2El.style.width = state.p2.health + "%";

        health1El.classList.add("damage-pop");
        health2El.classList.add("damage-pop");

        setTimeout(() => {
            health1El.classList.remove("damage-pop");
            health2El.classList.remove("damage-pop");
        }, 120);

        if (state.p1.health > 60) {
            health1El.style.background = "linear-gradient(to right, #2eff2e, #baff39, #ffe600)";
        } else if (state.p1.health > 25) {
            health1El.style.background = "linear-gradient(to right, #ffcf33, #ff8a00, #ff3d00)";
        } else {
            health1El.style.background = "linear-gradient(to right, #ff5252, #ff0000, #8b0000)";
        }

        if (state.p2.health > 60) {
            health2El.style.background = "linear-gradient(to left, #2eff2e, #baff39, #ffe600)";
        } else if (state.p2.health > 25) {
            health2El.style.background = "linear-gradient(to left, #ffcf33, #ff8a00, #ff3d00)";
        } else {
            health2El.style.background = "linear-gradient(to left, #ff5252, #ff0000, #8b0000)";
        }
        if (state.p1.health <= 20) {
            health1El.style.boxShadow = "0 0 18px rgba(255,0,0,0.85)";
        } else {
            health1El.style.boxShadow = "none";
        }

        if (state.p2.health <= 20) {
            health2El.style.boxShadow = "0 0 18px rgba(255,0,0,0.85)";
        } else {
            health2El.style.boxShadow = "none";
        }
    }

    function updateRoundDots() {
        p1dot1.classList.toggle("filled", state.p1Rounds >= 1);
        p1dot2.classList.toggle("filled", state.p1Rounds >= 2);
        p2dot1.classList.toggle("filled", state.p2Rounds >= 1);
        p2dot2.classList.toggle("filled", state.p2Rounds >= 2);
    }

    function getDistance() {
        const rect1 = fighter1El.getBoundingClientRect();
        const rect2 = fighter2El.getBoundingClientRect();

        return rect2.left - rect1.right;
    }

    function burstEffect(x, y) {
        const fx = document.createElement("div");
        fx.className = "attack-effect";
        fx.style.left = x + "px";
        fx.style.top = y + "px";
        arenaEl.appendChild(fx);

        setTimeout(() => fx.remove(), 260);
    }

    function showFlameBeam(playerKey) {
        const flame = document.createElement("div");
        flame.className = `flame-beam ${playerKey}`;

        const attackerEl = playerKey === "p1" ? fighter1El : fighter2El;
        const rect = attackerEl.getBoundingClientRect();
        const arenaRect = arenaEl.getBoundingClientRect();

        flame.style.top = `${rect.top - arenaRect.top + rect.height * 0.38}px`;

        if (playerKey === "p1") {
            flame.style.left = `${rect.left - arenaRect.left + rect.width * 0.58}px`;
        } else {
            flame.style.right = `${arenaRect.right - rect.right + rect.width * 0.58}px`;
        }

        arenaEl.appendChild(flame);

        setTimeout(() => flame.remove(), 280);
    }

    function applyBurn(defenderKey, ticks = 5, damagePerTick = 3) {
        const defender = state[defenderKey];

        if (defender.burnDamageTick) {
            clearInterval(defender.burnDamageTick);
        }

        defender.burning = true;
        defender.burnTicks = ticks;

        defender.burnDamageTick = setInterval(() => {
            if (state.matchEnded || state.fightEnded || defender.health <= 0) {
                clearInterval(defender.burnDamageTick);
                defender.burnDamageTick = null;
                defender.burning = false;
                return;
            }

            defender.health -= damagePerTick;
            if (defender.health < 0) defender.health = 0;

            updateHealthUI();

            defender.burnTicks--;

            if (defender.health === 0) {
                clearInterval(defender.burnDamageTick);
                defender.burnDamageTick = null;
                defender.burning = false;
                return;
            }

            if (defender.burnTicks <= 0) {
                clearInterval(defender.burnDamageTick);
                defender.burnDamageTick = null;
                defender.burning = false;
            }
        }, 350);
    }

    function flashHit(defenderKey) {
        const defenderEl = defenderKey === "p1" ? fighter1El : fighter2El;

        defenderEl.classList.add("hit-flash");
        gameWrapEl.classList.add("shake");

        const rect = defenderEl.getBoundingClientRect();
        burstEffect(rect.left + rect.width / 2, rect.top + rect.height / 2);

        setTimeout(() => {
            defenderEl.classList.remove("hit-flash");
        }, 180);

        setTimeout(() => {
            gameWrapEl.classList.remove("shake");
        }, 260);
    }

    function hitStop(duration = 70) {
        state.p1.canMove = false;
        state.p2.canMove = false;

        setTimeout(() => {
            if (!state.matchEnded && !state.fightEnded) {
                state.p1.canMove = true;
                state.p2.canMove = true;
            }
        }, duration);
    }

    function showCenterText(text, duration = 1200) {
        resultTextEl.textContent = text;
        resultTextEl.classList.remove("show-text");
        void resultTextEl.offsetWidth;
        resultTextEl.classList.add("show-text");

        setTimeout(() => {
            resultTextEl.classList.remove("show-text");
            resultTextEl.style.opacity = "0";
        }, duration);
    }

    function showFinishHim() {
        resultTextEl.textContent = "FINISH HIM";
        resultTextEl.classList.remove("show-text");
        void resultTextEl.offsetWidth;
        resultTextEl.classList.add("show-text");
    }

    function resetRound() {
        state.p1.health = 100;
        state.p2.health = 100;
        state.p1.x = 12;
        state.p2.x = 12;
        state.lastMover = "p1";

        state.p1.blocking = false;
        state.p2.blocking = false;
        state.p1.jumping = false;
        state.p2.jumping = false;

        state.p1.attacking = false;
        state.p2.attacking = false;

        state.p1.burning = false;
        state.p2.burning = false;
        state.p1.burnTicks = 0;
        state.p2.burnTicks = 0;
        state.p1.specialCooldown = false;
        state.p2.specialCooldown = false;

        if (state.p1.burnDamageTick) {
            clearInterval(state.p1.burnDamageTick);
            state.p1.burnDamageTick = null;
        }

        if (state.p2.burnDamageTick) {
            clearInterval(state.p2.burnDamageTick);
            state.p2.burnDamageTick = null;
        }

        state.p1.canMove = true;
        state.p2.canMove = true;

        state.fightEnded = false;
        state.roundTime = 99;

        fighter1El.src = fighterData.p1.idle;
        fighter2El.src = fighterData.p2.idle;

        resultTextEl.textContent = "";
        resultTextEl.classList.remove("show-text");

        updateHealthUI();
        updatePos();
        timerEl.textContent = "99";
        stopCpu();
        startCpu();

        const nextRound = state.p1Rounds + state.p2Rounds + 1;
        startRoundIntro(nextRound);
    }

    function finishRound(winnerKey) {
        if (state.fightEnded || state.matchEnded) return;

        state.fightEnded = true;

        if (winnerKey === "p1") state.p1Rounds++;
        if (winnerKey === "p2") state.p2Rounds++;

        updateRoundDots();

        if (state.p1Rounds >= 2 || state.p2Rounds >= 2) {
            state.matchEnded = true;
            stopCpu();
            showFinishHim();

            setTimeout(() => {
                localStorage.removeItem("fighters");
                localStorage.removeItem("gameMode");
                window.location.href = "character-select.html";
            }, 3000);

            return;
        }

        showCenterText((winnerKey === "p1" ? fighterData.p1.name : fighterData.p2.name).toUpperCase() + " WINS", 1400);

        setTimeout(() => {
            resetRound();
        }, 1600);
    }

    function applyHit(attackerKey, damage = 10) {
        const defenderKey = attackerKey === "p1" ? "p2" : "p1";
        const defender = state[defenderKey];
        const defenderEl = defenderKey === "p1" ? fighter1El : fighter2El;
        const defenderInfo = defenderKey === "p1" ? fighterData.p1 : fighterData.p2;

        if (defender.blocking) {
            damage = Math.floor(damage / 3);
        }

        defender.health -= damage;
        if (defender.health < 0) defender.health = 0;

        if (defenderInfo.hit) {
            defenderEl.src = defenderInfo.hit;
        }

        flashHit(defenderKey);

        hitStop(damage >= 18 ? 95 : damage >= 14 ? 75 : 55);

        const knockback = damage >= 18 ? 2.8 : damage >= 14 ? 2.0 : 1.2;

        if (defenderKey === "p1") {
            state.p1.x = Math.max(0, state.p1.x - knockback);
        } else {
            state.p2.x = Math.max(0, state.p2.x - knockback);
        }

        updatePos();
        updateHealthUI();

        setTimeout(() => {
            if (!defender.blocking && !defender.jumping) {
                defenderEl.src = defenderInfo.idle;
            }
        }, 180);

        if (defender.health === 0) {
            finishRound(attackerKey);
        }
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function startIntroSequence() {
        state.fightStarted = false;
        state.fightEnded = false;
        state.p1.canMove = false;
        state.p2.canMove = false;

        await delay(400);
        showCenterText("READY", 900);
        await delay(1000);

        showCenterText("1", 650);
        await delay(700);

        showCenterText("2", 650);
        await delay(700);

        showCenterText("3", 650);
        await delay(700);

        showCenterText("FIGHT", 900);
        await delay(850);

        state.fightStarted = true;
        state.p1.canMove = true;
        state.p2.canMove = true;
    }

    async function startRoundIntro(roundNumber) {
        state.fightStarted = false;
        state.fightEnded = false;
        state.p1.canMove = false;
        state.p2.canMove = false;

        await delay(350);
        showCenterText(`ROUND ${roundNumber}`, 900);
        await delay(1000);

        showCenterText("FIGHT", 900);
        await delay(850);

        state.fightStarted = true;
        state.p1.canMove = true;
        state.p2.canMove = true;
    }

    function attack(playerKey) {
        const attacker = state[playerKey];
        if (attacker.attacking || state.matchEnded || state.fightEnded) return;

        attacker.attacking = true;

        const fighterEl = playerKey === "p1" ? fighter1El : fighter2El;
        const fighterInfo = playerKey === "p1" ? fighterData.p1 : fighterData.p2;

        fighterEl.src = fighterInfo.punch;

        const baseScale = getFightScale(fighterInfo, playerKey);
        const moveX = playerKey === "p1" ? " translateX(28px)" : " translateX(-28px)";
        fighterEl.style.transform = baseScale + moveX;

        const distance = getDistance();

        console.log("distance =", distance);

        if (distance <= 20) {
            applyHit(playerKey);
        }

        setTimeout(() => {
            fighterEl.src = fighterInfo.idle;
            fighterEl.style.transform = baseScale;
            attacker.attacking = false;
        }, 200);
    }

    function movePlayer(playerKey, direction) {
        const player = state[playerKey];
        if (!player.canMove || state.fightEnded) return;

        const moveAmount = 1.6;
        state.lastMover = playerKey;

        if (playerKey === "p2") {
            player.x -= direction * moveAmount;
        } else {
            player.x += direction * moveAmount;
        }

        player.x = Math.max(0, Math.min(70, player.x));
        updatePos();
    }

    function doAttack(playerKey, type, damage, moveAmount) {
        const attacker = state[playerKey];
        if (!attacker.canMove || attacker.attacking || state.matchEnded || state.fightEnded) return;

        attacker.attacking = true;
        attacker.blocking = false;

        const fighterEl = playerKey === "p1" ? fighter1El : fighter2El;
        const fighterInfo = playerKey === "p1" ? fighterData.p1 : fighterData.p2;

        const sprite = fighterInfo[type] || fighterInfo.punch || fighterInfo.idle;
        fighterEl.src = sprite;

        const baseScale = getFightScale(fighterInfo, playerKey);
        const moveX = playerKey === "p1"
            ? ` translateX(${moveAmount}px)`
            : ` translateX(-${moveAmount}px)`;

        fighterEl.style.transform = baseScale + moveX;

        const distance = getDistance();
        console.log(type, "distance =", distance);

        if (distance <= 20) {
            applyHit(playerKey, damage);
        }

        setTimeout(() => {
            fighterEl.src = fighterInfo.idle;
            fighterEl.style.transform = baseScale;
            attacker.attacking = false;
        }, 220);
    }

    function punch(playerKey) {
        doAttack(playerKey, "punch", 10, 28);
    }

    function kick(playerKey) {
        doAttack(playerKey, "kick", 14, 38);
    }

    function uppercut(playerKey) {
        doAttack(playerKey, "uppercut", 20, 42);
    }

    function specialAttack(playerKey) {
        const attacker = state[playerKey];
        if (!attacker.canMove || attacker.attacking || attacker.specialCooldown || state.matchEnded || state.fightEnded) return;

        const fighterEl = playerKey === "p1" ? fighter1El : fighter2El;
        const fighterInfo = playerKey === "p1" ? fighterData.p1 : fighterData.p2;
        const defenderKey = playerKey === "p1" ? "p2" : "p1";

        if (!fighterInfo.special) return;

        attacker.attacking = true;
        attacker.blocking = false;
        attacker.specialCooldown = true;

        fighterEl.src = fighterInfo.special;

        const baseScale = getFightScale(fighterInfo, playerKey);
        const moveX = playerKey === "p1"
            ? " translateX(18px)"
            : " translateX(-18px)";

        fighterEl.style.transform = baseScale + moveX;

        showFlameBeam(playerKey);

        const distance = getDistance();

        if (distance <= 180) {
            applyHit(playerKey, 18);
            applyBurn(defenderKey, 5, 3);
        }

        setTimeout(() => {
            fighterEl.src = fighterInfo.idle;
            fighterEl.style.transform = baseScale;
            attacker.attacking = false;
        }, 320);

        setTimeout(() => {
            attacker.specialCooldown = false;
        }, 1400);
    }

    function startBlock(playerKey) {
        const player = state[playerKey];
        if (player.attacking || player.jumping || state.matchEnded || state.fightEnded) return;

        player.blocking = true;

        const fighterEl = playerKey === "p1" ? fighter1El : fighter2El;
        const fighterInfo = playerKey === "p1" ? fighterData.p1 : fighterData.p2;

        if (fighterInfo.block) {
            fighterEl.src = fighterInfo.block;
        }
    }

    function stopBlock(playerKey) {
        const player = state[playerKey];
        player.blocking = false;

        const fighterEl = playerKey === "p1" ? fighter1El : fighter2El;
        const fighterInfo = playerKey === "p1" ? fighterData.p1 : fighterData.p2;

        if (!player.attacking && !player.jumping) {
            fighterEl.src = fighterInfo.idle;
        }
    }

    function jump(playerKey) {
        const player = state[playerKey];
        if (player.jumping || player.attacking || state.matchEnded || state.fightEnded) return;

        player.jumping = true;
        player.blocking = false;

        const fighterEl = playerKey === "p1" ? fighter1El : fighter2El;
        const fighterInfo = playerKey === "p1" ? fighterData.p1 : fighterData.p2;
        const baseScale = getFightScale(fighterInfo, playerKey);

        if (fighterInfo.jump) {
            fighterEl.src = fighterInfo.jump;
        }

        fighterEl.style.transform = baseScale + " translateY(-120px)";

        setTimeout(() => {
            fighterEl.style.transform = baseScale;
            fighterEl.src = fighterInfo.idle;
            player.jumping = false;
        }, 420);
    }

    function stopCpu() {
        if (state.cpuInterval) {
            clearInterval(state.cpuInterval);
            state.cpuInterval = null;
        }
    }

    function cpuThink() {
        if (gameMode !== "cpu") return;
        if (state.matchEnded || state.fightEnded) return;
        if (!state.p2.canMove) return;

        const distance = getDistance();

        // CPU komt dichterbij als hij te ver staat
        if (distance > 60) {
            movePlayer("p2", 2);
            return;
        }

        // als CPU te dicht staat, soms beetje achteruit
        if (distance < -20) {
            movePlayer("p2", -2);
            return;
        }

        const roll = Math.random();

        // soms blocken
        if (roll < 0.15) {
            startBlock("p2");
            setTimeout(() => stopBlock("p2"), 300);
            return;
        }

        // aanvallen als dichtbij
        if (roll < 0.55) {
            punch("p2");
        } else if (roll < 0.80) {
            kick("p2");
        } else {
            uppercut("p2");
        }
    }

    function startCpu() {
        stopCpu();

        if (gameMode !== "cpu") return;

        state.cpuInterval = setInterval(() => {
            cpuThink();
        }, 500);
    }

    document.addEventListener("keydown", (e) => {
        if (state.matchEnded) return;

        // PLAYER 1
        if (e.key === "a") movePlayer("p1", -2);
        if (e.key === "d") movePlayer("p1", 2);
        if (e.key === "w") jump("p1");
        if (e.key === "f") punch("p1");
        if (e.key === "g") kick("p1");
        if (e.key === "h") uppercut("p1");
        if (e.key === "r") specialAttack("p1");
        if (e.key === "s") startBlock("p1");

        // PLAYER 2 alleen als het GEEN cpu mode is
        if (gameMode !== "cpu") {
            if (e.key === "ArrowLeft") movePlayer("p2", -2);
            if (e.key === "ArrowRight") movePlayer("p2", 2);
            if (e.key === "ArrowUp") jump("p2");
            if (e.key === "l") punch("p2");
            if (e.key === "k") kick("p2");
            if (e.key === "j") uppercut("p2");
            if (e.key === "u") specialAttack("p2");
            if (e.key === "ArrowDown") startBlock("p2");
        }
    });

    document.addEventListener("keyup", (e) => {
        if (e.key === "s") stopBlock("p1");

        if (gameMode !== "cpu") {
            if (e.key === "ArrowDown") stopBlock("p2");
        }
    });

    backBtn?.addEventListener("click", () => {
        window.location.href = "character-select.html";
    });

    resetFightBtn?.addEventListener("click", () => {
        state.p1Rounds = 0;
        state.p2Rounds = 0;
        state.matchEnded = false;
        updateRoundDots();
        resetRound();
    });

    fullscreenBtn?.addEventListener("click", async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (err) {
            console.log("Fullscreen fout:", err);
        }
    });

    // ===========================
    // MOBILE TOUCH CONTROLS
    // ===========================
    const mobileActionMap = {
        "p1-left": () => movePlayer("p1", -2),
        "p1-right": () => movePlayer("p1", 2),
        "p1-jump":     () => jump("p1"),
        "p1-punch":    () => punch("p1"),
        "p1-kick":     () => kick("p1"),
        "p1-uppercut": () => uppercut("p1"),
        "p1-special":  () => specialAttack("p1"),
        "p1-block":    null, // handled as hold
        "p2-left":     () => movePlayer("p2", -1),
        "p2-right":    () => movePlayer("p2", 1),
        "p2-jump":     () => jump("p2"),
        "p2-punch":    () => punch("p2"),
        "p2-kick":     () => kick("p2"),
        "p2-uppercut": () => uppercut("p2"),
        "p2-special":  () => specialAttack("p2"),
        "p2-block":    null,
    };

    // Continuous movement intervals for held direction buttons
    const holdIntervals = {};

    function startMobileHold(action) {
        if (holdIntervals[action]) return;

        if (action === "p1-block") { startBlock("p1"); return; }
        if (action === "p2-block") { startBlock("p2"); return; }

        const fn = mobileActionMap[action];
        if (!fn) return;

        fn(); // fire immediately
        // For movement, fire continuously while held
        if (action.endsWith("-left") || action.endsWith("-right")) {
            holdIntervals[action] = setInterval(fn, 25);
        }
    }

    function stopMobileHold(action) {
        if (action === "p1-block") { stopBlock("p1"); return; }
        if (action === "p2-block") { stopBlock("p2"); return; }

        if (holdIntervals[action]) {
            clearInterval(holdIntervals[action]);
            delete holdIntervals[action];
        }
    }

    document.querySelectorAll("[data-action]").forEach(btn => {
        const action = btn.dataset.action;
        if (!action) return;

        const start = (e) => {
            e.preventDefault();
            startMobileHold(action);
        };

        const stop = (e) => {
            e.preventDefault();
            stopMobileHold(action);
        };

        btn.addEventListener("touchstart", start, { passive: false });
        btn.addEventListener("touchend", stop, { passive: false });
        btn.addEventListener("touchcancel", stop, { passive: false });

        btn.addEventListener("mousedown", start);
        btn.addEventListener("mouseup", stop);
        btn.addEventListener("mouseleave", () => stopMobileHold(action));
    });

    updateHealthUI();
    updateRoundDots();
    updatePos();
    startIntroSequence();
    startCpu();
    timerEl.textContent = "99";
}