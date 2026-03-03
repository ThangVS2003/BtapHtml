document.addEventListener ("DOMContentLoaded", (event) =>{
    console.log("Da co su kien");
    initEmployeesData();
})
// Sidebar toggle handler: restore saved state and persist on change
document.addEventListener('DOMContentLoaded', (event) => {
    const toggle = document.querySelector('.sidebar__toggle');
    const sidebar = document.querySelector('.sidebar');

    if (sidebar) {
        const saved = localStorage.getItem('sidebarCollapsed');
        if (saved === 'true') sidebar.classList.add('collapsed');
        // mirror state on toggle element if present
        if (toggle) toggle.classList.toggle('collapsed', saved === 'true');
    }

    if (toggle && sidebar) {
        // initialize aria-expanded if toggle is a real button
        if (toggle.tagName && toggle.tagName.toLowerCase() === 'button') {
            toggle.setAttribute('aria-expanded', sidebar.classList.contains('collapsed') ? 'false' : 'true');
        }

        const updateToggleVisuals = () => {
            const isCollapsed = sidebar.classList.contains('collapsed');
            // set class on toggle for CSS transitions
            toggle.classList.toggle('collapsed', isCollapsed);
            // update text label if exists
            const txt = toggle.querySelector('.sidebar__toggle__text');
            if(txt) txt.textContent = isCollapsed ? 'Mở rộng' : 'Thu gọn';
        };

        // initialize visuals
        updateToggleVisuals();

        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            sidebar.classList.toggle('collapsed');
            // persist state
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
            if (toggle.tagName && toggle.tagName.toLowerCase() === 'button') {
                toggle.setAttribute('aria-expanded', sidebar.classList.contains('collapsed') ? 'false' : 'true');
            }
            updateToggleVisuals();
        });
    }
});