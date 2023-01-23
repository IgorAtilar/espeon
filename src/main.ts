import './style.css';

const addActiveStyleToCurrentLink = () => {
  const bottomNavigationLinks = document.querySelectorAll('.nav-link');

  const mapHrefToPath: Record<string, string> = {
    '.': '/espeon/',
    'deck.html': '/espeon/deck.html',
    'ajuda.html': '/espeon/ajuda.html',
  };

  bottomNavigationLinks.forEach((link) => {
    const path = window.location.pathname;
    const linkHref = link.getAttribute('href')!;

    if (mapHrefToPath[linkHref] === path) {
      link.classList.add('bottom-nav-anchor-active');
    }
  });
};

addActiveStyleToCurrentLink();
