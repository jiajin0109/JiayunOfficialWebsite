document.documentElement.classList.add("js");

const CASES_GRID = document.getElementById('caseStudiesGrid');
const CASE_STUDIES_DATA = [];
let caseModalEl = null;

async function fetchCaseStudies() {
    if (!CASES_GRID) return;

    const loadingMessageEl = document.getElementById('loadingMessage');

    try {
        const response = await fetch('cases.json', { cache: 'no-cache' });
        if (!response.ok) {
            throw new Error(`Failed to load cases.json: ${response.status}`);
        }

        const caseStudies = await response.json();
        CASES_GRID.innerHTML = '';
        CASE_STUDIES_DATA.length = 0;

        if (!Array.isArray(caseStudies) || caseStudies.length === 0) {
            CASES_GRID.innerHTML = '<p>目前尚無可公開的合作案例，歡迎直接聯絡我們了解更多。</p>';
            return;
        }

        caseStudies.forEach((item, index) => {
            CASE_STUDIES_DATA.push(item);
            CASES_GRID.innerHTML += createCaseCard(item, index);
        });

        initializeTiltEffects();
    } catch (error) {
        console.error('案例載入失敗:', error);
        if (loadingMessageEl) {
            loadingMessageEl.textContent = '合作案例載入失敗，請稍後再試或直接聯絡我們。';
        }
    }
}

/**
 * 撱箇??桐?獢???HTML 蝯?
 * @param {Object} fields - Case data fields.
 */
function createCaseCard(fields, index) {
    const isFactoryFeature = fields.badge === '工廠管理案例';
    const cardClass = isFactoryFeature ? 'case-feature' : '';
    const badgeHtml = fields.badge ? `<div class="case-badge">${fields.badge}</div>` : '';
    const summaryText = getCaseSummary(fields);

    return `
        <article class="case card tilt ${cardClass}" data-case-index="${index}">
            ${badgeHtml}
            <h3>${fields.title || '未命名案例'}</h3>
            <p class="case-subtitle">${fields.subtitle || ''}</p>
            <p class="case-summary">${summaryText}</p>
            <button class="case-open-btn btn outline" type="button" data-case-index="${index}">查看完整內容</button>
        </article>
    `;
}

function getCaseSummary(fields) {
    const parts = [];
    if (fields.description) parts.push(String(fields.description));
    if (Array.isArray(fields.features)) parts.push(fields.features.slice(0, 2).join('、'));
    return parts.join(' ').trim() || '點擊查看此案例的完整內容。';
}

function renderCaseList(title, items) {
    if (!Array.isArray(items) || items.length === 0) return '';
    const listItems = items.map(item => `<li>${item}</li>`).join('');
    return `
        <div class="modal-block">
            <h4>${title}</h4>
            <ul class="case-list">
                ${listItems}
            </ul>
        </div>
    `;
}

function createCaseModal() {
    if (caseModalEl) return;
    caseModalEl = document.createElement('div');
    caseModalEl.className = 'case-modal';
    caseModalEl.setAttribute('aria-hidden', 'true');
    caseModalEl.innerHTML = `
        <div class="case-modal-overlay" data-close-modal="true"></div>
        <div class="case-modal-dialog" role="dialog" aria-modal="true" aria-label="合作案例完整內容">
            <button class="case-modal-close" type="button" aria-label="關閉視窗" data-close-modal="true">×</button>
            <div class="case-modal-content" id="caseModalContent"></div>
        </div>
    `;
    document.body.appendChild(caseModalEl);

    caseModalEl.addEventListener('click', (event) => {
        const target = event.target;
        if (target && target.getAttribute('data-close-modal') === 'true') {
            closeCaseModal();
        }
    });
}

function openCaseModal(index) {
    const caseData = CASE_STUDIES_DATA[index];
    if (!caseData) return;
    createCaseModal();

    const modalContent = document.getElementById('caseModalContent');
    const isFactoryFeature = caseData.badge === '工廠管理案例';
    const featuresTitle = isFactoryFeature ? '系統重點' : '主要功能';
    const descriptionHtml = caseData.description ? `<p>${caseData.description}</p>` : '';

    modalContent.innerHTML = `
        ${caseData.badge ? `<div class="case-badge modal-badge">${caseData.badge}</div>` : ''}
        <h3>${caseData.title || '未命名案例'}</h3>
        <p class="case-subtitle">${caseData.subtitle || ''}</p>
        ${descriptionHtml}
        ${renderCaseList(featuresTitle, caseData.features)}
        ${renderCaseList('設備串接', caseData.deviceIntegration)}
        ${renderCaseList('導入效益', caseData.benefits)}
    `;

    caseModalEl.classList.add('open');
    caseModalEl.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
}

function closeCaseModal() {
    if (!caseModalEl) return;
    caseModalEl.classList.remove('open');
    caseModalEl.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
}

function initializeCaseModalEvents() {
    if (!CASES_GRID) return;
    CASES_GRID.addEventListener('click', (event) => {
        const card = event.target.closest('.case[data-case-index]');
        const button = event.target.closest('.case-open-btn');

        // 優先處理按鈕點擊
        if (button) {
            const index = Number(button.getAttribute('data-case-index'));
            openCaseModal(index);
            return;
        }

        // 點整張卡片也可開啟，避免點到互動元素時誤觸
        if (!card) return;
        const interactiveTarget = event.target.closest('a, button, input, textarea, select, label');
        if (interactiveTarget) return;

        const index = Number(card.getAttribute('data-case-index'));
        openCaseModal(index);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeCaseModal();
    });
}

// ?踵???script.js 鋆∪??祉? Tilt ??蝔?蝣?
function initializeTiltEffects() {
    // ??????.tilt ??嚗??急頛??
    document.querySelectorAll(".tilt").forEach((card) => {
        // ?宏?方???Event Listener 隞亙????? (?舫嚗??港???
        // Re-applies hover tilt to cards rendered after page load.

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
    initializeCaseModalEvents();
    fetchCaseStudies();
});
