import {
  fetchSheetData,
  createProductCard,
  getBlockConfig,
  getUrlParams,
} from '../../scripts/services/data-service.js';

const PAGE_SIZE = 8;

export default async function decorate(block) {
  const config = getBlockConfig(block);

  let products = await fetchSheetData(
    config['data source'],
  );

  const params = getUrlParams();

  const category =
    params.get('category') || '';

  if (config['filter featured'] === 'true') {
    products = products.filter(
      (product) =>
        String(product.featured)
          .toLowerCase() === 'true',
    );
  }

  block.innerHTML = '';

  const section = document.createElement('section');

  section.className = 'product-list';

  section.innerHTML = `
    <div class="product-list__header">
      <h2>${config.heading || ''}</h2>

      <p>${config.description || ''}</p>
    </div>
  `;

  const grid = document.createElement('div');

  grid.className = 'product-list__grid';

  const loadMoreButton =
    document.createElement('button');

  loadMoreButton.className =
    'product-list__load-more';

  loadMoreButton.textContent =
    'Load More Products';

  let currentPage = 1;

  let searchText = '';

  let sortValue = '';

  function renderProducts() {
    grid.innerHTML = '';

    let filteredProducts = [...products];

    // category filter

    if (category) {
      filteredProducts =
        filteredProducts.filter(
          (product) =>
            String(product.category || '')
              .toLowerCase() ===
            category.toLowerCase(),
        );
    }

    // search

    if (searchText) {
      filteredProducts =
        filteredProducts.filter(
          (product) =>
            [
              product.title,
              product.category,
              product.description,
              product.sku,
            ]
              .join(' ')
              .toLowerCase()
              .includes(
                searchText.toLowerCase(),
              ),
        );
    }

    // sort

    switch (sortValue) {
      case 'price-low':
        filteredProducts.sort(
          (a, b) =>
            Number(a.price) -
            Number(b.price),
        );
        break;

      case 'price-high':
        filteredProducts.sort(
          (a, b) =>
            Number(b.price) -
            Number(a.price),
        );
        break;

      case 'rating':
        filteredProducts.sort(
          (a, b) =>
            Number(b.rating) -
            Number(a.rating),
        );
        break;

      default:
        break;
    }

    const visibleProducts =
      filteredProducts.slice(
        0,
        currentPage * PAGE_SIZE,
      );

    if (!visibleProducts.length) {
      grid.innerHTML = `
        <div class="product-list-empty">
          No products found.
        </div>
      `;

      loadMoreButton.style.display =
        'none';

      return;
    }

    visibleProducts.forEach(
      (product) => {
        grid.append(
          createProductCard(product),
        );
      },
    );

    const remainingProducts =
      filteredProducts.length -
      visibleProducts.length;

    if (remainingProducts > 0) {
      loadMoreButton.style.display =
        'inline-flex';

      loadMoreButton.textContent =
        `Load ${Math.min(
          PAGE_SIZE,
          remainingProducts,
        )} More Products`;
    } else {
      loadMoreButton.style.display =
        'none';
    }
  }

  loadMoreButton.addEventListener(
    'click',
    () => {
      currentPage += 1;
      renderProducts();
    },
  );

  window.addEventListener(
    'search-changed',
    (event) => {
      searchText = event.detail;

      currentPage = 1;

      renderProducts();
    },
  );

  window.addEventListener(
    'sort-changed',
    (event) => {
      sortValue = event.detail;

      currentPage = 1;

      renderProducts();
    },
  );

  section.append(grid);
  section.append(loadMoreButton);

  if (
    config['cta label'] &&
    config['cta link']
  ) {
    const footer =
      document.createElement('div');

    footer.className =
      'product-list__footer';

    footer.innerHTML = `
      <a href=${config['cta link']}>
        ${config['cta label']}
      </a>
    `;

    section.append(footer);
  }

  block.append(section);

  renderProducts();
}   