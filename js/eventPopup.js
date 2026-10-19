// 予定のHTMLはRazorで生成し、ここでは表示位置だけを補正する。
export function initialize(popup) {
    let frame = 0;
    let disposed = false;

    function place() {
        frame = 0;
        if (disposed || !popup.isConnected) return;

        const viewport = window.visualViewport;
        const width = viewport?.width ?? document.documentElement.clientWidth;
        const height = viewport?.height ?? window.innerHeight;
        const left = viewport?.offsetLeft ?? 0;
        const top = viewport?.offsetTop ?? 0;
        const margin = 12;

        // CSSの全体縮小（zoom）も含めた、実際の描画倍率を求める。
        popup.style.transform = "none";
        popup.style.left = "0px";
        popup.style.top = "0px";
        const initial = popup.getBoundingClientRect();
        const zoom = popup.offsetWidth > 0 ? initial.width / popup.offsetWidth : 1;
        popup.style.width = `${Math.min(560, (width - margin * 2) / zoom)}px`;
        popup.style.maxHeight = `${(height - margin * 2) / zoom}px`;

        const bounds = popup.getBoundingClientRect();
        let x = left + (width - bounds.width) / 2;
        let y = top + (height - bounds.height) / 2;

        if (width >= 800) {
            const anchor = document.querySelector(".schedule-card.selected-event")?.getBoundingClientRect();
            if (anchor) {
                x = anchor.left;
                y = anchor.bottom + 6;
                if (y + bounds.height > top + height - margin) {
                    y = anchor.top - bounds.height - 6;
                }
            }
        }

        x = Math.max(left + margin, Math.min(x, left + width - bounds.width - margin));
        y = Math.max(top + margin, Math.min(y, top + height - bounds.height - margin));
        popup.style.left = `${(x - bounds.left) / zoom}px`;
        popup.style.top = `${(y - bounds.top) / zoom}px`;
    }

    function schedule() {
        if (!disposed && !frame) frame = requestAnimationFrame(place);
    }

    function onScroll(event) {
        if (!popup.contains(event.target)) schedule();
    }

    const observer = new ResizeObserver(schedule);
    observer.observe(popup);
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", onScroll, true);
    window.visualViewport?.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", schedule);
    place();

    return {
        dispose() {
            disposed = true;
            cancelAnimationFrame(frame);
            observer.disconnect();
            window.removeEventListener("resize", schedule);
            window.removeEventListener("scroll", onScroll, true);
            window.visualViewport?.removeEventListener("resize", schedule);
            window.visualViewport?.removeEventListener("scroll", schedule);
        }
    };
}
