document.addEventListener("DOMContentLoaded", () => {
    const left = document.querySelector('[data-action="p1-left"]');
    const right = document.querySelector('[data-action="p1-right"]');

    if (left) {
        left.onclick = () => alert("LEFT klik gezien");
        left.ontouchstart = () => alert("LEFT touch gezien");
    }

    if (right) {
        right.onclick = () => alert("RIGHT klik gezien");
        right.ontouchstart = () => alert("RIGHT touch gezien");
    }
});