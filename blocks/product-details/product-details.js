import {
  fetchSheetData,
  getBlockConfig,
} from '../../scripts/services/data-service.js';

import {
  addToCart,
} from '../../scripts/services/cart-service.js';

export default async function decorate(block) {
  const config = getBlockConfig(block);

  const params =
    new URLSearchParams(
      window.location.search,
    );

  const sku = params.get('sku');

  const products =
    await fetchSheetData(
      config['data source'],
    );

  const product =
    products.find(
      (item) => item.sku === sku,
    );

  if (!product) {
    block.innerHTML = `
      <div class="product-details-empty">
        Product not found.
      </div>
    `;

    return;
  }

  block.innerHTML = `
    <section class="product-details">

      <div class="product-details__image">
        <img src=${product.image}/>
      </div>

      <div class="product-details__content">

        <h1>
          ${product.title}
        </h1>

        <div class="product-details__rating">
          ★ ${product.rating}
        </div>

        <p class="product-details__description">
          ${product.description}
        </p>

        <div class="product-details__price">
          $${product.price}
        </div>

        <div class="product-details__quantity">

          <button type="button" class="qty-btn qty-minus" > −
          </button>

          <span class="qty-value"> 1
          </span>

          <button type="button" class="qty-btn qty-plus">
            +
          </button>

        </div>

        <button type="button" class="add-to-cart"> Add To Cart</button>

      </div>

    </section>
  `;

  let quantity = 1;

  const qtyValue =
    block.querySelector('.qty-value');

  const minusButton =
    block.querySelector('.qty-minus');

  const plusButton =
    block.querySelector('.qty-plus');

  const addToCartButton =
    block.querySelector('.add-to-cart');

  plusButton.addEventListener(
    'click',
    () => {
      quantity += 1;

      qtyValue.textContent =
        quantity;
    },
  );

  minusButton.addEventListener(
    'click',
    () => {
      if (quantity <= 1) {
        return;
      }

      quantity -= 1;

      qtyValue.textContent =
        quantity;
    },
  );

  addToCartButton.addEventListener(
    'click',
    () => {
      addToCart(
        product.sku,
        quantity,
        product.title
      );

      addToCartButton.textContent =
        'Added To Cart ✓';

      setTimeout(() => {
        addToCartButton.textContent =
          'Add To Cart';
      }, 2000);
    },
  );
}