// ===== Mobile Navbar Toggle (Home + Team) =====
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('show');
  });
}

// ===== Sidebar Toggle (ToS Page, Mobile) =====
const sidebar = document.querySelector('.sidebar');
const sidebarToggleBtn = document.querySelector('.toggle-btn');

if (sidebar && sidebarToggleBtn) {
  sidebarToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('sidebar-open');
  });
}

// ===== Light/Dark Mode Toggle =====
function toggleMode() {
  document.body.classList.toggle('light');
  document.body.classList.toggle('dark');
}

// ===== ToS Search Highlight =====
function searchTerms() {
  const input = document.getElementById('searchBox');
  if (!input) return;

  const filter = input.value.toLowerCase();
  const content = document.querySelector('.container-content');
  if (!content) return;

  const elements = content.querySelectorAll('p, li, h2, h3');
  elements.forEach(el => {
    if (el.textContent.toLowerCase().includes(filter) && filter.length > 0) {
      el.style.background = 'rgba(255,255,255,0.15)';
      el.style.borderRadius = '8px';
    } else {
      el.style.background = 'transparent';
    }
  });
}

// ===== Basic Error Handling for Broken Links =====
document.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', e => {
    // Attempt fetch to check if link is valid (only for same-origin)
    if (link.hostname === window.location.hostname) {
      fetch(link.href, { method: 'HEAD' }).catch(() => {
        e.preventDefault();
        alert(`Oops! The page ${link.href} could not be loaded.`);
      });
    }
  });
});
