import { Subject } from 'rxjs';
import { createElement } from '../helpers/dom';
import { Toast, ToastType } from '../types/toast';

const toast$ = new Subject<Toast>();

export const showToast = (toast: Toast) => {
  toast$.next(toast);
};

const addActiveStyleToCurrentLink = () => {
  const bottomNavigationLinks = document.querySelectorAll('.nav-link');

  const mapHrefToPath: Record<string, string[]> = {
    '.': ['/espeon/', '/espeon/index.html'],
    'deck.html': ['/espeon/deck.html'],
    'help.html': ['/espeon/help.html'],
  };

  bottomNavigationLinks.forEach((link) => {
    const path = window.location.pathname;
    const linkHref = link.getAttribute('href')!;

    if (mapHrefToPath[linkHref].includes(path)) {
      link.classList.add('bottom-nav-anchor-active');
    }
  });
};

addActiveStyleToCurrentLink();

const mapToastTypeToIcon = {
  [ToastType.ERROR]: createElement({
    tagName: 'i',
    attributes: {
      class: 'ph-x',
    },
  }),
  [ToastType.SUCCESS]: createElement({
    tagName: 'i',
    attributes: {
      class: 'ph-check',
    },
  }),
  [ToastType.WARNING]: createElement({
    tagName: 'i',
    attributes: {
      class: 'ph-warning',
    },
  }),
};

const createToastContent = ({ type, message }: Toast) => {
  const className = `toast-${type.toString().toLowerCase()}`;
  const icon = mapToastTypeToIcon[type];

  const container = createElement({
    tagName: 'div',
    attributes: {
      class: className,
    },
  });

  const text = createElement({
    tagName: 'span',
  });

  text.textContent = message;

  container.appendChild(icon);
  container.appendChild(text);

  return container;
};

toast$.subscribe((notification) => {
  const toastContainer = document.querySelector('#toast-container')!;
  const toastContent = createToastContent(notification);
  toastContainer.replaceChildren(toastContent);

  toastContainer.classList.toggle('show');

  setTimeout(() => {
    toastContainer.classList.toggle('show');
  }, 2000);
});
