// 平滑捲動
function smoothScrollTo(targetSelector) {
    const el = document.querySelector(targetSelector);
    if (!el) return;
    // 扣除 header 高度，避免擋住標題
    const headerOffset = 70;
    const elementPosition = el.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
    });
}

document.querySelectorAll(".nav-link, .btn-scroll").forEach((el) => {
    el.addEventListener("click", (e) => {
        const href = el.getAttribute("href");
        const target = el.dataset.target || href;
        if (!target || !target.startsWith("#")) return;
        e.preventDefault();
        smoothScrollTo(target);

        // 手機版點擊後收合選單
        const nav = document.querySelector(".nav");
        nav?.classList.remove("open");
    });
});

// 手機漢堡選單
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");
if (navToggle && nav) {
    navToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        nav.classList.toggle("open");
    });

    // 點擊外部關閉選單
    document.addEventListener("click", (e) => {
        if (!nav.contains(e.target) && !navToggle.contains(e.target)) {
            nav.classList.remove("open");
        }
    });
}

// Header 滾動陰影效果
const header = document.querySelector(".header");
window.addEventListener("scroll", () => {
    if (window.scrollY > 10) {
        header.style.boxShadow = "0 4px 20px rgba(0,0,0,0.05)";
        header.style.paddingTop = "8px";
        header.style.paddingBottom = "8px";
    } else {
        header.style.boxShadow = "none";
        header.style.paddingTop = "10px";
        header.style.paddingBottom = "10px";
    }
});

// Scroll Reveal (使用 IntersectionObserver)
const reveals = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

reveals.forEach(el => revealObserver.observe(el));


// 卡片微 3D 效果 (Tilt Effect) - 優化版，減少計算負擔
document.querySelectorAll(".tilt").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 降低旋轉幅度，讓質感更穩重
        const xPercent = (x / rect.width - 0.5) * 4; // 調整強度
        const yPercent = (y / rect.height - 0.5) * -4;

        card.style.transform = `perspective(1000px) rotateX(${yPercent}deg) rotateY(${xPercent}deg) translateY(-5px)`;
    });

    card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) translateY(0)";
    });
});

// Footer 年份
const yearEl = document.getElementById("year");
if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

// 回到頂部按鈕
const backToTopBtn = document.getElementById("backToTop");
if (backToTopBtn) {
    // 滾動時顯示/隱藏按鈕
    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add("show");
        } else {
            backToTopBtn.classList.remove("show");
        }
    });

    // 點擊回到頂部
    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}
