/**
 * Manta - Frontend Scripts
 * Interatividades leves: Menu mobile acessível e abas de filtro do mockup.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Controle do Menu Mobile
    const menuToggle = document.getElementById('menu-toggle');
    const primaryNav = document.getElementById('primary-nav');

    if (menuToggle && primaryNav) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            menuToggle.setAttribute('aria-label', isExpanded ? 'Abrir menu de navegação' : 'Fechar menu de navegação');
            primaryNav.classList.toggle('is-open');
        });

        // Fechar o menu ao clicar em qualquer link de navegação
        const navLinks = primaryNav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (primaryNav.classList.contains('is-open')) {
                    primaryNav.classList.remove('is-open');
                    menuToggle.setAttribute('aria-expanded', 'false');
                    menuToggle.setAttribute('aria-label', 'Abrir menu de navegação');
                }
            });
        });
    }

    // 2. Filtro Interativo na Demonstração (Preview Mockup)
    const previewTabs = document.querySelectorAll('.preview-tab');
    const appItems = document.querySelectorAll('.preview-list .app-item');

    previewTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Atualizar abas ativas
            previewTabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            // Filtrar os itens de aplicação
            const filterValue = tab.getAttribute('data-filter');

            appItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    item.style.display = 'flex';
                    item.style.animation = 'fadeIn 0.25s ease-out forwards';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // 3. Header Responsivo ao Scroll
    const siteHeader = document.getElementById('site-header');
    const SCROLL_THRESHOLD = 60;
    let isScrolled = false;

    if (siteHeader) {
        const handleScroll = () => {
            const shouldBeScrolled = window.scrollY > SCROLL_THRESHOLD;

            if (shouldBeScrolled !== isScrolled) {
                isScrolled = shouldBeScrolled;
                siteHeader.classList.toggle('header-scrolled', isScrolled);
            }
        };

        // Usar passive listener para performance
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Checar estado inicial (caso a página carregue já com scroll)
        handleScroll();
    }
});
