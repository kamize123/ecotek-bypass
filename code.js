(function() {
    // 1. Biến lưu trữ giá trị vẽ trên canvas
    let capturedValues = new Set(); 
    let hasClicked = false; // Cờ để đảm bảo chỉ click 1 lần duy nhất
    
    // 2. Hook vào hàm fillText của Canvas
    const originalFillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function(text, x, y, maxWidth) {
        if (text && text.toString().trim() !== "") {
            capturedValues.add(text);
        }
        return originalFillText.apply(this, arguments);
    };

    console.log("%c[Auto-Click] Đang chờ đồng hồ đếm ngược về 0...", "color: yellow; font-size: 14px;");

    // 3. Vòng lặp kiểm tra mỗi giây
    const timerCheck = setInterval(() => {
        if (capturedValues.size > 0) {
            const values = Array.from(capturedValues);
            
            // Lọc ra các giá trị là số nguyên (bỏ qua chữ "Phút", "Giây"...)
            const numbers = values
                .filter(v => !isNaN(v) && v.toString().trim() !== '')
                .map(v => parseInt(v, 10));

            // LOGIC QUAN TRỌNG: 
            // Nếu tìm thấy số VÀ tất cả các số đó đều bằng 0 (VD: 0 giờ, 0 phút, 0 giây)
            if (numbers.length > 0 && numbers.every(n => n === 0)) {
                
                if (!hasClicked) {
                    // --- ĐÂY LÀ ĐOẠN CODE CỦA BẠN ---
                    const btn = document.getElementById('next-slide-button');
                    if (btn) {
                        console.log("%c[v9.0] Đang cưỡng ép chuyển trang sau...", "color: #00ff00; font-weight: bold;");
                        ['mousedown', 'mouseup', 'click'].forEach(type => {
                            btn.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
                        });
                        
                        hasClicked = true; // Đánh dấu đã xong để không spam click
                        
                        // Tùy chọn: Dừng theo dõi sau khi đã click thành công
                        // clearInterval(timerCheck); 
                    } else {
                        console.log("%c[Lỗi] Đã hết giờ nhưng không tìm thấy nút 'next-slide-button'", "color: red");
                    }
                    // --------------------------------
                }
            } else {
                // Nếu chưa về 0 thì in ra để theo dõi (có thể comment dòng này nếu thấy rối)
                console.log("Đang đếm: ", numbers.join(" : "));
            }
            
            // Xóa bộ nhớ đệm cho lượt vẽ tiếp theo
            capturedValues.clear();
        }
    }, 1000);
})();