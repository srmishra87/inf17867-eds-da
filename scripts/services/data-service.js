export async function fetchSheetData(path) {
  const response = await fetch(`${path}.json`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }

  const json = await response.json();

  return json.data || [];
}

export function createProductCard(product) {
  const article = document.createElement('article');

  article.className = 'product-card';

  article.innerHTML = `
    <a href="/pdp?sku=${product.sku}">
      <div class="product-card__image">
        <img src=${product.image}
      </div>

      <div class="product-card__content">
        <h3>${product.title}</h3>

        <div class="product-card__rating">
          ⭐ ${product.rating}
        </div>

        <p>${product.description || ''}</p>

        <div class="product-card__footer">
          <span class="product-card__price">
            $${product.price}
          </span>

          <span class="product-card__cta">
            View Details →
          </span>
        </div>
      </div>
    </a>
  `;

  return article;
}

export function getBlockConfig(block) {
  const config = {};

  [...block.children].forEach((row) => {
    const cells = [...row.children];

    if (cells.length !== 2) {
      return;
    }

    const key = cells[0].textContent.trim().toLowerCase();
    const value = cells[1].textContent.trim();

    config[key] = value;
  });

  return config;
}

export function getUrlParams() {
  return new URLSearchParams(
    window.location.search,
  );
}

export function updateCategory(category) {
  const params = new URLSearchParams(
    window.location.search,
  );

  if (category) {
    params.set('category', category);
  } else {
    params.delete('category');
  }

  const query = params.toString();

  window.location.href = query
    ? `${window.location.pathname}?${query}`
    : window.location.pathname;
}