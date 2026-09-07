import {
  fetchSheetData,
  getBlockConfig,
  getUrlParams,
  updateCategory,
} from '../../scripts/services/data-service.js';

export default async function decorate(block) {
  const config = getBlockConfig(block);

  const categories = await fetchSheetData(
    config['data source'],
  );

  const params = getUrlParams();

  const selectedCategory =
    params.get('category') || '';

  block.innerHTML = `
    <div class="plp-filters">

      <div class="plp-filters__search">
        <input
          type="search"
          class="plp-search"
          placeholder="Search products..."
        />
      </div>

      <div class="plp-filters__category">
        <select class="plp-category">
          <option value="">
            Browse All Categories
          </option>

          ${categories
            .map(
              (category) => `
                <option
                  value="${category.categoryId}"
                  ${
                    selectedCategory === category.categoryId
                      ? 'selected'
                      : ''
                  }
                >
                  ${category.title}
                </option>
              `,
            )
            .join('')}
        </select>
      </div>

      <div class="plp-filters__sort">
        <select class="plp-sort">
          <option value="">
            Sort By
          </option>

          <option value="price-low">
            Price: Low to High
          </option>

          <option value="price-high">
            Price: High to Low
          </option>

          <option value="rating">
            Highest Rated
          </option>
        </select>
      </div>

      <div class="plp-filters__clear">
        <button
          type="button"
          class="plp-clear-btn"
        >
          Clear Filters
        </button>
      </div>

    </div>
  `;

  const searchInput = block.querySelector('.plp-search');

  const categorySelect = block.querySelector('.plp-category');

  const sortSelect = block.querySelector('.plp-sort');

  const clearButton = block.querySelector('.plp-clear-btn');

  searchInput.addEventListener('input', () => {
    window.dispatchEvent(
      new CustomEvent('search-changed', {
        detail: searchInput.value.trim(),
      }),
    );
  });

  sortSelect.addEventListener('change', () => {
    window.dispatchEvent(
      new CustomEvent('sort-changed', {
        detail: sortSelect.value,
      }),
    );
  });

  categorySelect.addEventListener('change', () => {
    updateCategory(
      categorySelect.value,
    );
  });

  clearButton.addEventListener('click', () => {
    searchInput.value = '';

    sortSelect.value = '';

    window.dispatchEvent(
      new CustomEvent('search-changed', {
        detail: '',
      }),
    );

    window.dispatchEvent(
      new CustomEvent('sort-changed', {
        detail: '',
      }),
    );

    updateCategory('');
  });
}