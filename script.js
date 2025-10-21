// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('show');
});

// Basic error handling for broken links
document.querySelectorAll('a').forEach(link => {
  link.addEventListener('error', () => {
    alert(`Oops! The page ${link.href} could not be loaded.`);
  });
});
// Sidebar toggle for mobile
const sidebar = document.querySelector('.sidebar');
const toggleBtn = document.querySelector('.toggle-btn');

toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('sidebar-open');
});
