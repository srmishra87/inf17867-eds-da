import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

import {  getCart,  getCartCount,updateQuantity,removeFromCart} from '../../scripts/services/cart-service.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');

    if (!navSections) {
      return;
    }

    const navSectionExpanded = navSections.querySelector(
      '[aria-expanded="true"]',
    );

    if (navSectionExpanded && isDesktop.matches) {
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;

  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');

    if (!navSections) {
      return;
    }

    const navSectionExpanded = navSections.querySelector(
      '[aria-expanded="true"]',
    );

    if (navSectionExpanded && isDesktop.matches) {
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';

  if (
    isNavDrop &&
    (e.code === 'Enter' || e.code === 'Space')
  ) {
    const dropExpanded =
      focused.getAttribute('aria-expanded') === 'true';

    toggleAllNavSections(
      focused.closest('.nav-sections'),
    );

    focused.setAttribute(
      'aria-expanded',
      dropExpanded ? 'false' : 'true',
    );
  }
}

function focusNavSection() {
  document.activeElement.addEventListener(
    'keydown',
    openOnKeydown,
  );
}

function toggleAllNavSections(
  sections,
  expanded = false,
) {
  if (!sections) {
    return;
  }

  sections
    .querySelectorAll(
      '.nav-sections .default-content-wrapper > ul > li',
    )
    .forEach((section) => {
      section.setAttribute(
        'aria-expanded',
        expanded,
      );
    });
}

function toggleMenu(
  nav,
  navSections,
  forceExpanded = null,
) {
  const expanded =
    forceExpanded !== null
      ? !forceExpanded
      : nav.getAttribute('aria-expanded') ===
        'true';

  const button =
    nav.querySelector('.nav-hamburger button');

  document.body.style.overflowY =
    expanded || isDesktop.matches
      ? ''
      : 'hidden';

  nav.setAttribute(
    'aria-expanded',
    expanded ? 'false' : 'true',
  );

  toggleAllNavSections(
    navSections,
    expanded || isDesktop.matches
      ? 'false'
      : 'true',
  );

  button.setAttribute(
    'aria-label',
    expanded
      ? 'Open navigation'
      : 'Close navigation',
  );

  if (navSections) {
    const navDrops =
      navSections.querySelectorAll('.nav-drop');

    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener(
            'focus',
            focusNavSection,
          );
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute('tabindex');
        drop.removeEventListener(
          'focus',
          focusNavSection,
        );
      });
    }
  }

  if (!expanded || isDesktop.matches) {
    window.addEventListener(
      'keydown',
      closeOnEscape,
    );

    nav.addEventListener(
      'focusout',
      closeOnFocusLost,
    );
  } else {
    window.removeEventListener(
      'keydown',
      closeOnEscape,
    );

    nav.removeEventListener(
      'focusout',
      closeOnFocusLost,
    );
  }
}

function renderMiniCart(nav) {
  const miniCartItems = nav.querySelector(
    '.mini-cart__items',
  );

  if (!miniCartItems) {
    return;
  }

  const cart = getCart();

  if (!cart.length) {
    miniCartItems.innerHTML =
      '<p>Your cart is empty.</p>';

    return;
  }

miniCartItems.innerHTML = cart
  .map(
    (item) => `
      <div
        class="mini-cart__item"
        data-sku="${item.sku}"
      >
        <div class="mini-cart__details">
          <span class="mini-cart__title">
            ${item.title}
          </span>
        </div>

        <div class="mini-cart__quantity">
          <button
            class="mini-cart__minus"
            data-sku="${item.sku}"
            type="button"
          >
            −
          </button>

          <span class="mini-cart__qty">
            ${item.quantity}
          </span>

          <button
            class="mini-cart__plus"
            data-sku="${item.sku}"
            type="button"
          >
            +
          </button>
        </div>
      </div>
    `,
  )
  .join('');

miniCartItems
  .querySelectorAll('.mini-cart__plus')
  .forEach((button) => {
    button.addEventListener('click', () => {
      const { sku } = button.dataset;

      const cartItem = getCart().find(
        (item) => item.sku === sku,
      );

      updateQuantity(
        sku,
        cartItem.quantity + 1,
      );
    });
  });

miniCartItems
  .querySelectorAll('.mini-cart__minus')
  .forEach((button) => {
    button.addEventListener('click', () => {
      const { sku } = button.dataset;

      const cartItem = getCart().find(
        (item) => item.sku === sku,
      );

      if (!cartItem) {
        return;
      }

      if (cartItem.quantity === 1) {
        removeFromCart(sku);
      } else {
        updateQuantity(
          sku,
          cartItem.quantity - 1,
        );
      }
    });
  });

  }
function updateCartBadge(nav) {
  const cartBadge = nav.querySelector(
    '.header-cart-count',
  );

  if (!cartBadge) {
    return;
  }

  cartBadge.textContent = getCartCount();
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');

  const navPath = navMeta
    ? new URL(
      navMeta,
      window.location,
    ).pathname
    : '/nav';

  const fragment = await loadFragment(navPath);

  block.textContent = '';

  const nav = document.createElement('nav');

  nav.id = 'nav';

  while (fragment.firstElementChild) {
    nav.append(fragment.firstElementChild);
  }

  const classes = [
    'brand',
    'sections',
    'tools',
  ];

  classes.forEach((c, i) => {
    const section = nav.children[i];

    if (section) {
      section.classList.add(`nav-${c}`);
    }
  });

  const navBrand =
    nav.querySelector('.nav-brand');

  const brandLink =
    navBrand?.querySelector('.button');

  if (brandLink) {
    brandLink.className = '';

    brandLink.closest(
      '.button-container',
    ).className = '';
  }

  const navSections =
    nav.querySelector('.nav-sections');

  if (navSections) {
    navSections
      .querySelectorAll(
        ':scope .default-content-wrapper > ul > li',
      )
      .forEach((navSection) => {
        if (navSection.querySelector('ul')) {
          navSection.classList.add(
            'nav-drop',
          );
        }

        navSection.addEventListener(
          'click',
          () => {
            if (isDesktop.matches) {
              const expanded =
                navSection.getAttribute(
                  'aria-expanded',
                ) === 'true';

              toggleAllNavSections(
                navSections,
              );

              navSection.setAttribute(
                'aria-expanded',
                expanded
                  ? 'false'
                  : 'true',
              );
            }
          },
        );
      });
  }

  const navTools =
    nav.querySelector('.nav-tools');

  if (navTools) {
    navTools.innerHTML = `
      

      <a href="/account">
        👤
      </a>

      <button
        type="button"
        class="header-cart"
        aria-label="Shopping Cart"
      >
        🛒
        <span class="header-cart-count">
          0
        </span>
      </button>

      <div
        class="mini-cart"
        hidden
      >
        <div class="mini-cart__header">
          <h3>My Cart</h3>
        </div>

        <div class="mini-cart__items"></div>

        <div class="mini-cart__actions">

          <a href="/checkout">
            Checkout
          </a>
        </div>
      </div>
    `;

    updateCartBadge(nav);
    renderMiniCart(nav);

    const cartButton =
      nav.querySelector('.header-cart');

    const miniCart =
      nav.querySelector('.mini-cart');

    cartButton?.addEventListener(
      'click',
      () => {
        renderMiniCart(nav);

        miniCart.hidden =
          !miniCart.hidden;
      },
    );

    window.addEventListener(
      'cart-updated',
      () => {
        updateCartBadge(nav);
        renderMiniCart(nav);
      },
    );
  }

  const hamburger =
    document.createElement('div');

  hamburger.classList.add(
    'nav-hamburger',
  );

  hamburger.innerHTML = `
    <button
      type="button"
      aria-controls="nav"
      aria-label="Open navigation"
    >
      <span class="nav-hamburger-icon"></span>
    </button>
  `;

  hamburger.addEventListener(
    'click',
    () => toggleMenu(nav, navSections),
  );

  nav.prepend(hamburger);

  nav.setAttribute(
    'aria-expanded',
    'false',
  );

  toggleMenu(
    nav,
    navSections,
    isDesktop.matches,
  );

  isDesktop.addEventListener(
    'change',
    () =>
      toggleMenu(
        nav,
        navSections,
        isDesktop.matches,
      ),
  );

  const navWrapper =
    document.createElement('div');

  navWrapper.className =
    'nav-wrapper';

  navWrapper.append(nav);

  block.append(navWrapper);
}