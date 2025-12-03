// Contentful 設定
const CONTENTFUL_CONFIG = {
    SPACE_ID: '4uv0twlljzf6',       // ⚠️ 請替換成您的 Space ID
    ACCESS_TOKEN: 'bnBUyXqQRoXf3yeP4zvbDRvMZVx6qVBELgEWKF4-LZQ', // ⚠️ 請替換成您的 Content Delivery API Access Token
    CONTENT_TYPE_ID: 'jiaYunCaseStudy' // 確保與您在 Contentful 中設定的內容模型 ID 一致jiaYunCaseStudy
};

// Contentful logo 設定
const CONTENTFUL_LOGO = {
    SPACE_ID: '4uv0twlljzf6',
    ACCESS_TOKEN: 'bnBUyXqQRoXf3yeP4zvbDRvMZVx6qVBELgEWKF4-LZQ',
    CONTENT_TYPE_ID: 'jiaYunLogo'
};

const CASES_GRID = document.getElementById('caseStudiesGrid');

// 載入 Contentful Logo
async function fetchContentfulLogo() {
    if (!CONTENTFUL_LOGO || !window.contentful) return;
    const client = window.contentful.createClient({
        space: CONTENTFUL_LOGO.SPACE_ID,
        accessToken: CONTENTFUL_LOGO.ACCESS_TOKEN
    });
    const response = await client.getEntries({
        content_type: CONTENTFUL_LOGO.CONTENT_TYPE_ID
    });
    const logo = response.items[0].fields.logo;
    // 設定 logo 到 class logo-mark 元素
    const logoMark = document.querySelector('.logo-mark');

    logoMark.innerHTML = `<img src="${logo.fields.file.url}" alt="${logo.fields.title}" class="logo-mark-img">`;
}

/**
 * 載入並渲染 Contentful 案例資料 (使用真實 API)
 */
async function fetchCaseStudies() {
    if (!CASES_GRID || !window.contentful) return; // 檢查 SDK 是否載入

    const loadingMessageEl = document.getElementById('loadingMessage');

    try {
        // 2. 建立 Contentful 客戶端
        const client = window.contentful.createClient({
            space: CONTENTFUL_CONFIG.SPACE_ID,
            accessToken: CONTENTFUL_CONFIG.ACCESS_TOKEN
        });

        // 3. 呼叫 Content Delivery API 取得內容
        const response = await client.getEntries({
            content_type: CONTENTFUL_CONFIG.CONTENT_TYPE_ID,
            order: 'sys.createdAt' // 依照內容的創建時間排序
        });

        const caseStudies = response.items;
        // console.log(`caseStudies: ${JSON.stringify(caseStudies)}`);

        CASES_GRID.innerHTML = ''; // 清空載入訊息

        if (caseStudies.length === 0) {
            CASES_GRID.innerHTML = '<p>目前沒有可供展示的合作案例。</p>';
        } else {
            caseStudies.forEach(item => {
                // 將 Contentful 回傳的 fields 物件傳給 createCaseCard
                CASES_GRID.innerHTML += createCaseCard(item.fields);
            });
            // 重新應用 .tilt 效果給新生成的卡片
            initializeTiltEffects();
        }

    } catch (error) {
        console.error('Contentful 載入錯誤:', error);
        if (loadingMessageEl) {
            loadingMessageEl.textContent = '載入案例失敗，請檢查 API 憑證或網路連線。';
        }
    }
}

/**
 * 建立單一案例的 HTML 結構
 * @param {Object} fields - 從 Contentful 取得的單一案例資料
 */
function createCaseCard(fields) {
    // 判斷是否為「工廠主打案例」
    const isFactoryFeature = fields.badge === '工廠主打案例';
    const cardClass = isFactoryFeature ? 'case-feature' : '';
    const badgeHtml = fields.badge ? `<div class="case-badge">${fields.badge}</div>` : '';

    /**
     * 輔助函式：將陣列轉為 HTML
     * title: 標題 (如果是 null 或空字串，就不顯示標題)
     * items: 清單陣列
     */
    const renderList = (title, items) => {
        if (!items || items.length === 0) return '';

        const listItems = items.map(item => `<li>${item}</li>`).join('');

        // 如果有傳入 title 才顯示標題，否則只顯示清單
        const titleHtml = title ? `<p><strong>${title}：</strong></p>` : '';

        return `
            ${titleHtml}
            <ul class="case-list">
                ${listItems}
            </ul>
        `;
    };

    // 1. 設定 features (主要功能) 的標題
    // 如果是工廠主打案例，標題用「系統協助做到」
    // 如果是其他案例 (如賽鴿、POS)，則不顯示標題 (傳入 null)
    const featuresTitle = isFactoryFeature ? '系統協助做到' : null;
    const featuresListHtml = renderList(featuresTitle, fields.features);

    // 2. 只有工廠案例才會有這兩項，標題固定即可
    // 如果 Contentful 沒填這兩個欄位，renderList 會直接回傳空字串，不會顯示標題
    const deviceListHtml = renderList('與現場設備的串接', fields.deviceIntegration);
    const benefitsListHtml = renderList('對工廠的實際效益', fields.benefits);

    // 3. 渲染描述 (Description)
    // 為了處理像賽鴿案例中 <p>...</p><p>...</p> 多段落的情況，
    // 建議在 Contentful description 欄位中若有換行，這裡可以簡單轉成 <br> 或保持原樣
    const descriptionHtml = fields.description ? `<p>${fields.description}</p>` : '';

    return `
        <article class="case card tilt ${cardClass}">
            ${badgeHtml}
            <h3>${fields.title || '無標題案例'}</h3>
            <p class="case-subtitle">${fields.subtitle || ''}</p>
            
            ${descriptionHtml}
            
            ${featuresListHtml}
            ${deviceListHtml}
            ${benefitsListHtml}
        </article>
    `;
}

// 替換您 script.js 裡原本的 Tilt 效果程式碼
function initializeTiltEffects() {
    // 重新取得所有 .tilt 元素，包含新載入的
    document.querySelectorAll(".tilt").forEach((card) => {
        // 先移除舊的 Event Listener 以免重複掛載 (可選，但更保險)
        // 這裡我們直接讓它重跑就好，因為 Contentful 載入後會替換掉 CASES_GRID 裡的東西

        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const xPercent = (x / rect.width - 0.5) * 4;
            const yPercent = (y / rect.height - 0.5) * -4;

            card.style.transform = `perspective(1000px) rotateX(${yPercent}deg) rotateY(${xPercent}deg) translateY(-5px)`;
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) translateY(0)";
        });
    });
}

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

// 確保在 DOM 完全載入後才執行，避免元素還沒出現
document.addEventListener('DOMContentLoaded', () => {
    // 呼叫主函式，開始載入案例
    fetchCaseStudies();
    fetchContentfulLogo();
});
