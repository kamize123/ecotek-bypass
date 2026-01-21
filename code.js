(function() {
    const CHECK_INTERVAL = 500; // Check 0.5s/lần cho đỡ lag máy
    let captured = new Set();
    let hasClicked = false;
    let lastMax = 99; 

    if (!window.originalFillText) {
        window.originalFillText = CanvasRenderingContext2D.prototype.fillText;
        CanvasRenderingContext2D.prototype.fillText = function(text, x, y, maxWidth) {
            if (text && text.toString().trim() !== "") captured.add(text);
            return window.originalFillText.apply(this, arguments);
        };
        console.log("%c[Auto-Next] Chế độ Log Full từng giây!", "color: yellow; font-weight: bold;");
    }

    setInterval(() => {
        if (hasClicked) return;

        const numbers = Array.from(captured)
            .filter(v => !isNaN(v) && v.toString().trim() !== '')
            .map(v => parseInt(v, 10));

        const currentMax = numbers.length > 0 ? Math.max(...numbers) : 0;

        // --- SỬA Ở ĐÂY: Luôn luôn in ra, bất kể Max có đổi hay không ---
        if (numbers.length > 0) {
            console.log(`Time: ${numbers.join(" : ")} (Max: ${currentMax})`);
        }
        // -------------------------------------------------------------

        // Logic Click (Giữ nguyên)
        if (numbers.length > 0 && currentMax === 0) {
            clickNext("Đã về 00:00");
        }
        else if (numbers.length === 0 && lastMax <= 1 && lastMax >= 0) {
            clickNext("Màn hình xóa trắng");
        }

        if (numbers.length > 0) lastMax = currentMax;
        captured.clear();

    }, CHECK_INTERVAL);

    function clickNext(reason) {
        const btn = document.getElementById('next-slide-button') || 
                    document.querySelector('.o_next_slide_button') ||
                    document.querySelector('a.carousel-control-next');
        if (btn) {
            console.log(`%c[ACTION] ${reason} -> CLICK!`, "color: white; background: red; font-size: 16px; font-weight: bold;");
            ['mousedown', 'mouseup', 'click'].forEach(type => btn.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window })));
            hasClicked = true;
        }
    }
})();
