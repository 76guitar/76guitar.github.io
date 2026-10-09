/* =========================================================
   76guitar — интерактив сайта
   ========================================================= */

/* Скрипт загрузился — можно включать анимации появления.
   Если этот файл не загрузится, контент сайта останется видимым. */
document.documentElement.classList.add('js');

/* ---------- НАСТРОЙКИ: заполните своими данными ---------- */
const CONFIG = {
    // Почта, на которую будут приходить заявки из формы (mailto-fallback)
    email: 'mail@example.com',
    // Если используете сервис обработки форм (Formspree, Getform и т.п.),
    // укажите его URL — тогда письмо отправится без открытия почтовой программы.
    formEndpoint: '' // например: 'https://formspree.io/f/xxxxxxx'
};

/* ---------- Год в футере ---------- */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- Шапка при скролле ---------- */
const header = document.getElementById('siteHeader');
const onScroll = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 20);
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* ---------- Полоса акции: закрыть ---------- */
const announceBar = document.getElementById('announceBar');
const announceClose = document.getElementById('announceClose');
if (announceBar && announceClose) {
    if (sessionStorage.getItem('promoHidden') === '1') announceBar.remove();
    announceClose.addEventListener('click', () => {
        announceBar.remove();
        try {
            sessionStorage.setItem('promoHidden', '1');
        } catch {
            /* приватный режим — просто скрываем */
        }
    });
}

/* ---------- Мобильное меню ---------- */
const burger = document.getElementById('burger');
const nav = document.getElementById('primaryNav');

if (burger && nav) {
    burger.addEventListener('click', () => {
        const open = nav.classList.toggle('is-open');
        burger.classList.toggle('is-open', open);
        burger.setAttribute('aria-expanded', String(open));
    });

    // Закрыть меню после клика по ссылке
    nav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            nav.classList.remove('is-open');
            burger.classList.remove('is-open');
            burger.setAttribute('aria-expanded', 'false');
        });
    });

    // Закрыть по Esc / клику вне меню
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('is-open')) {
            nav.classList.remove('is-open');
            burger.classList.remove('is-open');
            burger.setAttribute('aria-expanded', 'false');
        }
    });
}

/* ---------- Появление блоков при скролле ---------- */
const revealEls = document.querySelectorAll('.reveal');
const revealAll = () => revealEls.forEach((el) => el.classList.add('is-visible'));
let revealStarted = false;

if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    revealStarted = true;
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el, i) => {
        el.style.transitionDelay = `${Math.min(i % 4, 3) * 60}ms`;
        io.observe(el);
    });
    // Страховка: если по какой-то причине ничего не показалось — показываем всё
    setTimeout(() => {
        if (!revealStarted) revealAll();
    }, 1500);
} else {
    revealAll();
}

/* ---------- Активная ссылка в меню ---------- */
const sections = Array.from(document.querySelectorAll('main section[id]'));
const navLinks = Array.from(document.querySelectorAll('.nav a'));
if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const id = entry.target.id;
                navLinks.forEach((a) =>
                    a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`)
                );
            });
        },
        { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((s) => spy.observe(s));
}

/* ---------- FAQ: открыт только один вопрос ---------- */
const faqItems = document.querySelectorAll('#faqList .faq__item');
faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
        if (!item.open) return;
        faqItems.forEach((other) => {
            if (other !== item) other.open = false;
        });
    });
});

/* ---------- Галерея / лайтбокс ---------- */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');
const workItems = document.querySelectorAll('.work');

function openLightbox(src, caption) {
    if (!lightbox) return;
    lightboxImg.src = src;
    lightboxImg.alt = caption || '';
    lightboxCaption.textContent = caption || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightboxClose?.focus();
}
function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

workItems.forEach((item) => {
    item.addEventListener('click', () => {
        const src = item.getAttribute('data-full') || '';
        const caption = item.getAttribute('data-caption') || '';
        openLightbox(src, caption);
    });
});
lightboxClose?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
});

/* ---------- Форма заявки ---------- */
const form = document.getElementById('bookingForm');
const statusEl = document.getElementById('formStatus');

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        setStatus('', '');

        // Валидация
        let valid = true;
        const required = form.querySelectorAll('[required]');
        required.forEach((field) => {
            const wrap = field.closest('.field') || field.parentElement;
            const ok = field.type === 'checkbox' ? field.checked : field.value.trim() !== '';
            field.classList.toggle('is-invalid', !ok);
            wrap?.classList.toggle('is-invalid', !ok);
            if (!ok) valid = false;
        });

        if (!valid) {
            setStatus('Заполните обязательные поля', 'error');
            form.querySelector('.is-invalid')?.focus();
            return;
        }

        const data = Object.fromEntries(new FormData(form).entries());
        const text = [
            'Заявка с сайта 76guitar',
            `Имя: ${data.name}`,
            `Контакт: ${data.contact}`,
            data.guitar ? `Инструмент: ${data.guitar}` : '',
            data.service ? `Услуга: ${data.service}` : '',
            data.promo ? `Промокод: ${data.promo} (скидка 20% новым клиентам)` : '',
            data.source ? `Узнал(а) о нас: ${data.source}` : '',
            data.message ? `Комментарий: ${data.message}` : ''
        ]
            .filter(Boolean)
            .join('\n');

        // Если задан endpoint — отправляем на сервер
        if (CONFIG.formEndpoint) {
            try {
                setStatus('Отправляем…', '');
                const res = await fetch(CONFIG.formEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify(data)
                });
                if (!res.ok) throw new Error('network');
                setStatus('Спасибо! Заявка отправлена — свяжусь с вами в ближайшее время.', 'ok');
                form.reset();
            } catch {
                setStatus('Не удалось отправить. Напишите в ВК: vk.ru/76guitar', 'error');
            }
            return;
        }

        // Fallback: открываем почтовую программу с готовым письмом
        const mailto =
            `mailto:${CONFIG.email}?subject=${encodeURIComponent('Заявка с сайта 76guitar')}` +
            `&body=${encodeURIComponent(text)}`;
        window.location.href = mailto;

        setStatus('Открываю почтовую программу. Если не открылась — напишите в ВК: vk.ru/76guitar', 'ok');

        // Дублируем текст в буфер обмена — на всякий случай
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            /* игнорируем */
        }
    });

    // Убираем подсветку ошибки при вводе
    form.querySelectorAll('input, select, textarea').forEach((field) => {
        field.addEventListener('input', () => {
            field.classList.remove('is-invalid');
            field.closest('.field')?.classList.remove('is-invalid');
        });
    });
}

function setStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.remove('is-ok', 'is-error');
    if (type) statusEl.classList.add(`is-${type}`);
}
