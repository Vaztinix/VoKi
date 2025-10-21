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
