// ==UserScript==
// @name         Auto Next Slide Eco-Tek (v16.0 NaN Fix)
// @namespace    http://tampermonkey.net/
// @version      16.0
// @description  Tự động học + Fix lỗi đồng hồ hiện NaN + Auto F5 sau 7 phút.
// @author       Jason & Gemini
// @match        https://hoclythuyetlaixe.eco-tek.com.vn/*
// @match        http://hoclythuyetlaixe.eco-tek.com.vn/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // --- CẤU HÌNH ---
    const CHECK_INTERVAL = 500;       // Quét mỗi 0.5 giây
    const BUFFER_SECONDS = 5;         // Đợi thêm 5 giây an toàn
    const COOLDOWN_TIME = 8000;       // Nghỉ 8 giây sau khi click
    const FORCE_REFRESH_MINUTES = 7;  // Tự động F5 sau 7 phút (chống treo)

    // TÍNH TOÁN
    const REQUIRED_BUFFER_TICKS = (BUFFER_SECONDS * 1000) / CHECK_INTERVAL;
    const REFRESH_MS = FORCE_REFRESH_MINUTES * 60 * 1000;
    
    // BIẾN TRẠNG THÁI
    let captured = new Set();
    let hasClicked = false;
    let lastMax = 99;
    let bufferCount = 0;

    // 1. AUTO REFRESH (Giữ nguyên)
    setTimeout(() => {
        console.log(`%c[System] Quá 7 phút -> F5 trang để chống treo!`, "color: white; background: red; padding: 5px;");
        location.reload();
    }, REFRESH_MS);

    // 2. HOOK CANVAS
    const originalFillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function(text, x, y, maxWidth) {
        if (text && text.toString().trim() !== "") {
            captured.add(text);
        }
        return originalFillText.apply(this, arguments);
    };

    console.log(`%c[Auto-Next v16] Chế độ xử lý lỗi NaN đã BẬT!`, "color: #fff; background: purple; font-size: 14px; padding: 5px;");

    // 3. VÒNG LẶP CHÍNH
    setInterval(() => {
        if (hasClicked) return;

        // Lấy dữ liệu thô để check NaN
        const rawValues = Array.from(captured);
        
        // Lọc lấy số
        const numbers = rawValues
            .filter(v => !isNaN(v) && v.toString().trim() !== '')
            .map(v => parseInt(v, 10));

        const currentMax = numbers.length > 0 ? Math.max(...numbers) : 0;

        // --- KIỂM TRA LỖI NaN (TÍNH NĂNG MỚI) ---
        // Kiểm tra xem trong các chữ bắt được có chữ "NaN" không
        const isNaNError = rawValues.some(text => text.toString().includes("NaN"));

        // In log
        if (numbers.length > 0 && currentMax !== lastMax) {
            console.log(`⏱️ Time: ${numbers.join(" : ")} (Max: ${currentMax})`);
            lastMax = currentMax;
            if (currentMax > 0) bufferCount = 0;
        }

        // --- LOGIC QUYẾT ĐỊNH ---
        // Hoàn thành nếu: (Về 00:00) HOẶC (Màn hình trắng) HOẶC (Bị lỗi NaN)
        const isFinished = (numbers.length > 0 && currentMax === 0) || 
                           (numbers.length === 0 && lastMax <= 1 && lastMax >= 0) ||
                           isNaNError;

        if (isFinished) {
            bufferCount++;
            
            // Log đặc biệt cho trường hợp NaN
            if (isNaNError && bufferCount % 2 === 0) {
                 console.log(`%c⚠️ PHÁT HIỆN LỖI NaN -> Đang xử lý như hết giờ...`, "color: yellow; background: red; font-weight: bold;");
            } else if (bufferCount % 2 === 0) {
                 const progress = Math.min(100, Math.round((bufferCount / REQUIRED_BUFFER_TICKS) * 100));
                 console.log(`%c⏳ Hết giờ! Chờ Server lưu... ${progress}%`, "color: orange;");
            }

            // Đủ thời gian chờ -> CLICK
            if (bufferCount >= REQUIRED_BUFFER_TICKS) {
                doClickNext(isNaNError ? "Lỗi NaN (Skip)" : "Đã xong 100%");
            }
        } 
        else {
            bufferCount = 0;
        }

        captured.clear();

    }, CHECK_INTERVAL);

    // 4. HÀM CLICK
    function doClickNext(reason) {
        const btn = document.getElementById('next-slide-button') || 
                    document.querySelector('.o_next_slide_button') ||
                    document.querySelector('a.carousel-control-next');

        if (btn) {
            console.log(`%c[ACTION] ${reason} -> CLICK NEXT!`, "color: white; background: green; font-size: 16px; font-weight: bold; padding: 5px;");
            
            ['mousedown', 'mouseup', 'click'].forEach(type => {
                btn.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
            });

            hasClicked = true;
            bufferCount = 0; 
            
            console.log(`[Sleep] Chờ ${COOLDOWN_TIME/1000}s tải bài mới...`);
            setTimeout(() => {
                hasClicked = false;
                lastMax = 99;
                console.log("%c[Ready] Bài tiếp theo!", "color: cyan;");
            }, COOLDOWN_TIME);
        }
    }

})();
