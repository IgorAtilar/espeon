import './style.css';

const addActiveStyleToCurrentLink = () => {
  const bottomNavigationLinks = document.querySelectorAll('.nav-link');

  bottomNavigationLinks.forEach((link) => {
    const path = window.location.pathname;
    const linkHref = link.getAttribute('href');
    if (path === linkHref) {
      link.classList.add('bottom-nav-anchor-active');
    }
  });
};

addActiveStyleToCurrentLink();
