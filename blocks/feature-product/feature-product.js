async function fetchProducts() {
  const response = await fetch(`${sheetPath}.json`);

  if (!response.ok) {
    throw new Error('Unable to fetch products');
  }

  const json = await response.json();

  return json.data || json;
}

function createCard(product) {
  return  `
  <div class="featured-product-card">
    <img src=${product.image}/>

    <div class="featured-product-content">
      <h3>${product.title}</h3>

      <p>${product.category}</p>

      <p>$${product.price}</p>

      /product/${product.sku}
        View Product
      </a>
    </div>
  </div>
`;
}

export default async function decorate(block) {
  try {
    const products = await fetchProducts();

    const featuredProducts = products.filter(
      (product) =>
        String(product.featured).toLowerCase() === 'true'
    );

    block.innerHTML = `
      <div class="featured-products">
        <button
          class="featured-products-arrow prev"
          aria-label="Previous Product"
        >
          ‹
        </button>

        <div class="featured-products-viewport">
          <div class="featured-products-track">
            ${featuredProducts.map(createCard).join('')}
          </div>
        </div>

        <button
          class="featured-products-arrow next"
          aria-label="Next Product"
        >
          ›
        </button>
      </div>
    `;

    const track = block.querySelector(
      '.featured-products-track'
    );

    const prevButton = block.querySelector('.prev');
    const nextButton = block.querySelector('.next');

    let currentIndex = 0;

    const getCardsVisible = () => {
      if (window.innerWidth < 768) {
        return 1;
      }

      if (window.innerWidth < 1024) {
        return 2;
      }

      return 4;
    };

    const updateSlider = () => {
      const card =
        track.querySelector('.featured-product-card');

      if (!card) return;

      const gap = 24;

      const cardWidth = card.offsetWidth + gap;

      track.style.transform =
        `translateX(-${currentIndex * cardWidth}px)`;
    };

    nextButton.addEventListener('click', () => {
      const visibleCards = getCardsVisible();

      const maxIndex =
        featuredProducts.length - visibleCards;

      currentIndex = Math.min(
        currentIndex + 1,
        maxIndex
      );

      updateSlider();
    });

    prevButton.addEventListener('click', () => {
      currentIndex = Math.max(
        currentIndex - 1,
        0
      );

      updateSlider();
    });

    window.addEventListener(
      'resize',
      updateSlider
    );

    updateSlider();
  } catch (error) {
    block.innerHTML =
      '<p>Unable to load featured products.</p>';

    // eslint-disable-next-line no-console
    console.error(error);
  }
}