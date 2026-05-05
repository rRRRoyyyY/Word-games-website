document.addEventListener('DOMContentLoaded', () => {
    const menuWrapper = document.querySelector('.menuWrapper');
    const menuContent = document.querySelector('.menuContent');

    // Only run if the menu actually exists on this page
    if (menuWrapper && menuContent) {
        
        menuWrapper.addEventListener('click', (e) => {
            e.stopPropagation();
            menuContent.classList.toggle('show');
        });

        window.addEventListener('click', (e) => {
            if (!menuWrapper.contains(e.target)) {
                menuContent.classList.remove('show');
            }
        });
    }
});
