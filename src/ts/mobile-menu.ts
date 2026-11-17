export function setupMobileMenu(): void {
    const toggle = document.getElementById('mobile-menu-toggle') as HTMLButtonElement | null;
    const menu = document.getElementById('mobile-menu') as HTMLElement | null;
    if (!toggle || !menu) return;

    const setOpen = (open: boolean): void => {
        menu.hidden = !open;
        toggle.setAttribute('aria-expanded', String(open));
    };

    toggle.addEventListener('click', () => {
        setOpen(menu.hidden);
    });

    menu.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (target.closest('a, button')) {
            setOpen(false);
        }
    });

    document.addEventListener('click', (event) => {
        if (menu.hidden) return;
        const target = event.target as HTMLElement;
        if (!target.closest('.header-more')) {
            setOpen(false);
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !menu.hidden) {
            setOpen(false);
            toggle.focus();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 640 && !menu.hidden) {
            setOpen(false);
        }
    });
}
