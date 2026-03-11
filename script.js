document.documentElement.classList.add("js");

// Contentful 閮剖?
const CONTENTFUL_CONFIG = {
    SPACE_ID: '4uv0twlljzf6',       // ?? 隢???函? Space ID
    ACCESS_TOKEN: 'bnBUyXqQRoXf3yeP4zvbDRvMZVx6qVBELgEWKF4-LZQ', // ?? 隢???函? Content Delivery API Access Token
    CONTENT_TYPE_ID: 'jiaYunCaseStudy' // 蝣箔????Contentful 銝剛身摰??批捆璅∪? ID 銝?愕iaYunCaseStudy
};

// Contentful logo 閮剖?
const CONTENTFUL_LOGO = {
    SPACE_ID: '4uv0twlljzf6',
    ACCESS_TOKEN: 'bnBUyXqQRoXf3yeP4zvbDRvMZVx6qVBELgEWKF4-LZQ',
    CONTENT_TYPE_ID: 'jiaYunLogo'
};

const CASES_GRID = document.getElementById('caseStudiesGrid');

// 頛 Contentful Logo
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
    // 閮剖? logo ??class logo-mark ??
    const logoMark = document.querySelector('.logo-mark');

    logoMark.innerHTML = `<img src="${logo.fields.file.url}" alt="${logo.fields.title}" class="logo-mark-img">`;
}

/**
 * 頛銝行葡??Contentful 獢?鞈? (雿輻?祕 API)
 */
async function fetchCaseStudies() {
    if (!CASES_GRID) return;

    if (!window.contentful) {
        CASES_GRID.innerHTML = "<p>合作案例載入失敗，請稍後再試或直接聯絡我們索取案例說明。</p>";
        return;
    } // 瑼Ｘ SDK ?臬頛

    const loadingMessageEl = document.getElementById('loadingMessage');

    try {
        // 2. 撱箇? Contentful 摰Ｘ蝡?
        const client = window.contentful.createClient({
            space: CONTENTFUL_CONFIG.SPACE_ID,
            accessToken: CONTENTFUL_CONFIG.ACCESS_TOKEN
        });

        // 3. ?澆 Content Delivery API ???批捆
        const response = await client.getEntries({
            content_type: CONTENTFUL_CONFIG.CONTENT_TYPE_ID,
            order: 'sys.createdAt' // 靘?批捆?撱箸???摨?
        });

        const caseStudies = response.items;
        // console.log(`caseStudies: ${JSON.stringify(caseStudies)}`);

        CASES_GRID.innerHTML = ''; // 皜征頛閮

        if (caseStudies.length === 0) {
            CASES_GRID.innerHTML = '<p>目前尚無可公開的合作案例，歡迎直接聯絡我們了解更多。</p>';
        } else {
            caseStudies.forEach(item => {
                // 撠?Contentful ???fields ?拐辣?喟策 createCaseCard
                CASES_GRID.innerHTML += createCaseCard(item.fields);
            });
            // ?? .tilt ??蝯行?????
            initializeTiltEffects();
        }

    } catch (error) {
        console.error('Contentful 頛?航炊:', error);
        if (loadingMessageEl) {
            loadingMessageEl.textContent = '合作案例載入失敗，請稍後再試或直接聯絡我們。';
        }
    }
}

/**
 * 撱箇??桐?獢???HTML 蝯?
 * @param {Object} fields - 敺?Contentful ???銝獢?鞈?
 */
function createCaseCard(fields) {
    const isFactoryFeature = fields.badge === '工廠管理案例';
    const cardClass = isFactoryFeature ? 'case-feature' : '';
    const badgeHtml = fields.badge ? `<div class="case-badge">${fields.badge}</div>` : '';

    const renderList = (title, items) => {
        if (!Array.isArray(items) || items.length === 0) return '';
        const listItems = items.map(item => `<li>${item}</li>`).join('');
        const titleHtml = title ? `<p><strong>${title}</strong></p>` : '';

        return `
            ${titleHtml}
            <ul class="case-list">
                ${listItems}
            </ul>
        `;
    };

    const featuresTitle = isFactoryFeature ? '系統重點' : '';
    const featuresListHtml = renderList(featuresTitle, fields.features);
    const deviceListHtml = renderList('設備串接', fields.deviceIntegration);
    const benefitsListHtml = renderList('導入效益', fields.benefits);
    const descriptionHtml = fields.description ? `<p>${fields.description}</p>` : '';

    return `
        <article class="case card tilt ${cardClass}">
            ${badgeHtml}
            <h3>${fields.title || '未命名案例'}</h3>
            <p class="case-subtitle">${fields.subtitle || ''}</p>
            ${descriptionHtml}
            ${featuresListHtml}
            ${deviceListHtml}
            ${benefitsListHtml}
        </article>
    `;
}

// ?踵???script.js 鋆∪??祉? Tilt ??蝔?蝣?
function initializeTiltEffects() {
    // ??????.tilt ??嚗??急頛??
    document.querySelectorAll(".tilt").forEach((card) => {
        // ?宏?方???Event Listener 隞亙????? (?舫嚗??港???
        // ?ㄐ??亥?摰?頝停憟踝?? Contentful 頛敺??踵???CASES_GRID 鋆∠??梯正

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

// 撟單??脣?
function smoothScrollTo(targetSelector) {
    const el = document.querySelector(targetSelector);
    if (!el) return;
    // ?? header 擃漲嚗??雿?憿?
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

        // ???????嗅??詨
        const nav = document.querySelector(".nav");
        if (nav) {
            nav.classList.remove("open");
        }
    });
});

// ??瞍Ｗ?詨
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");
if (navToggle && nav) {
    navToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        nav.classList.toggle("open");
    });

    // 暺?憭???詨
    document.addEventListener("click", (e) => {
        if (!nav.contains(e.target) && !navToggle.contains(e.target)) {
            nav.classList.remove("open");
        }
    });
}

// Header 皛曉??啣蔣??
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

// Scroll Reveal (雿輻 IntersectionObserver)
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    reveals.forEach(el => revealObserver.observe(el));
} else {
    reveals.forEach(el => el.classList.add("active"));
}


// ?∠?敺?3D ?? (Tilt Effect) - ?芸???皜?閮?鞎?
document.querySelectorAll(".tilt").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // ????撟漲嚗?鞈芣??渡帘??
        const xPercent = (x / rect.width - 0.5) * 4; // 隤踵撘瑕漲
        const yPercent = (y / rect.height - 0.5) * -4;

        card.style.transform = `perspective(1000px) rotateX(${yPercent}deg) rotateY(${xPercent}deg) translateY(-5px)`;
    });

    card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) translateY(0)";
    });
});

// Footer 撟港遢
const yearEl = document.getElementById("year");
if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

// ????
const backToTopBtn = document.getElementById("backToTop");
if (backToTopBtn) {
    // 皛曉??＊蝷??梯???
    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add("show");
        } else {
            backToTopBtn.classList.remove("show");
        }
    });

    // 暺???
    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

// 蝣箔???DOM 摰頛敺??瑁?嚗??蝝?瘝??
document.addEventListener('DOMContentLoaded', () => {
    // ?澆銝餃撘???頛獢?
    fetchCaseStudies();
    fetchContentfulLogo();
});
