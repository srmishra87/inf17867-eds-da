import {
  fetchSheetData,
  getBlockConfig,
} from '../../scripts/services/data-service.js';

import {
  getCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} from '../../scripts/services/cart-service.js';

const PROFILE_KEY = 'commerce-profile';

export default async function decorate(block) {
  const config = getBlockConfig(block);

  const products = await fetchSheetData(
    config['data source'],
  );

  let step = 1;

  function getProfile() {
    return JSON.parse(
      localStorage.getItem(PROFILE_KEY) || 'null',
    );
  }

  function saveProfile(profile) {
    localStorage.setItem(
      PROFILE_KEY,
      JSON.stringify(profile),
    );
  }

  function getCartProducts() {
    const cart = getCart();

    return cart
      .map((item) => {
        const product = products.find(
          (p) => p.sku === item.sku,
        );

        if (!product) {
          return null;
        }

        return {
          ...product,
          quantity: item.quantity,
        };
      })
      .filter(Boolean);
  }

  function getTotal(items) {
    return items.reduce(
      (sum, item) =>
        sum +
        Number(item.price) * item.quantity,
      0,
    );
  }

  function placeOrder(profile, items, total) {
    const order = {
      orderId: `ORD-${Date.now()}`,
      orderDate: new Date().toISOString(),
      customerName: profile.name,
      customerEmail: profile.email,
      address: profile.address,
      items: items
        .map(
          (item) =>
            `${item.title} (${item.quantity})`,
        )
        .join(', '),
      total,
      status: 'Placed',
    };

    const orders = JSON.parse(
      localStorage.getItem(
        'commerce-orders',
      ) || '[]',
    );

    orders.push(order);

    localStorage.setItem(
      'commerce-orders',
      JSON.stringify(orders),
    );

    localStorage.setItem(
      'commerce-last-order-id',
      order.orderId,
    );

    clearCart();

    window.location.href =
      '/order-confirmation';
  }

  function render() {
    block.innerHTML = '';

    const items = getCartProducts();

    if (!items.length) {
      block.innerHTML = `
        <div class="checkout-empty">
          <h2>Your cart is empty</h2>

          <a href="/plp">
            Continue Shopping
          </a>
        </div>
      `;
      return;
    }

    const total = getTotal(items);

    if (step === 1) {
      block.innerHTML = `
        <section class="checkout">

          <h1>Checkout</h1>

          <div class="checkout-products">

            ${items
          .map(
            (item) => `
                  <article
                    class="checkout-item"
                  >
                    <div class="checkout-item__image">
                      <img src=${item.image}/>
                    </div>

                    <div class="checkout-item__details">
                      <h3>
                        ${item.title}
                      </h3>

                      <p>
                        $${item.price}
                      </p>

                      <div class="checkout-item__qty">

                        <button
                          class="qty-minus"
                          data-sku="${item.sku}"
                        >
                          −
                        </button>

                        <span>
                          ${item.quantity}
                        </span>

                        <button
                          class="qty-plus"
                          data-sku="${item.sku}"
                        >
                          +
                        </button>

                      </div>

                      <div>
                        Subtotal:
                        $
                        ${Number(item.price)
              * item.quantity
              }
                      </div>
                    </div>
                  </article>
                `,
          )
          .join('')}

          </div>

          <div class="checkout-summary">
            <h3>
              Total: $${total}
            </h3>

            <button
              class="next-step"
            >
              Next
            </button>
          </div>

        </section>
      `;

      block
        .querySelectorAll('.qty-plus')
        .forEach((button) => {
          button.addEventListener(
            'click',
            () => {
              const { sku } =
                button.dataset;

              const item =
                getCart().find(
                  (i) =>
                    i.sku === sku,
                );

              updateQuantity(
                sku,
                item.quantity + 1,
              );

              render();
            },
          );
        });

      block
        .querySelectorAll('.qty-minus')
        .forEach((button) => {
          button.addEventListener(
            'click',
            () => {
              const { sku } =
                button.dataset;

              const item =
                getCart().find(
                  (i) =>
                    i.sku === sku,
                );

              if (
                item.quantity === 1
              ) {
                removeFromCart(sku);
              } else {
                updateQuantity(
                  sku,
                  item.quantity - 1,
                );
              }

              render();
            },
          );
        });

      block
        .querySelector('.next-step')
        .addEventListener(
          'click',
          () => {
            step = 2;
            render();
          },
        );
    }

    if (step === 2) {
      const profile = getProfile();

      if (profile) {
        block.innerHTML = `
          <section class="checkout-profile">

            <h2>
              Delivery Information
            </h2>

            <div class="profile-card">
              <p>
                <strong>Name:</strong>
                ${profile.name}
              </p>

              <p>
                <strong>Email:</strong>
                ${profile.email}
              </p>

              <p>
                <strong>Address:</strong>
                ${profile.address}
              </p>
            </div>

            <div class="checkout-actions">
              <button
                class="edit-profile"
              >
                Edit
              </button>

              <button
                class="continue-review"
              >
                Continue
              </button>
            </div>

          </section>
        `;

        block
          .querySelector('.edit-profile')
          .addEventListener(
            'click',
            () => {
              localStorage.removeItem(
                PROFILE_KEY,
              );

              render();
            },
          );

        block
          .querySelector(
            '.continue-review',
          )
          .addEventListener(
            'click',
            () => {
              step = 3;
              render();
            },
          );
      } else {
        block.innerHTML = `
  <section class="checkout-form">

    <h2>
      Delivery Information
    </h2>

    <div class="form-field">
      <input
        class="name"
        type="text"
        placeholder="Name"
      >
      <span class="error-message name-error"></span>
    </div>

    <div class="form-field">
      <input
        class="email"
        type="email"
        placeholder="Email"
      >
      <span class="error-message email-error"></span>
    </div>

    <div class="form-field">
      <textarea
        class="address"
        placeholder="Address"
      ></textarea>
      <span class="error-message address-error"></span>
    </div>

    <button
      class="save-profile"
      type="button"
    >
      Save & Continue
    </button>

  </section>
`;

        block
          .querySelector('.save-profile')
          .addEventListener('click', () => {
            const nameField =
              block.querySelector('.name');

            const emailField =
              block.querySelector('.email');

            const addressField =
              block.querySelector('.address');

            const nameError =
              block.querySelector('.name-error');

            const emailError =
              block.querySelector('.email-error');

            const addressError =
              block.querySelector('.address-error');

            let isValid = true;

            nameError.textContent = '';
            emailError.textContent = '';
            addressError.textContent = '';

            if (!nameField.value.trim()) {
              nameError.textContent =
                'Name is required';
              isValid = false;
            }

            const emailPattern =
              /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailField.value.trim()) {
              emailError.textContent =
                'Email is required';
              isValid = false;
            } else if (
              !emailPattern.test(
                emailField.value.trim(),
              )
            ) {
              emailError.textContent =
                'Please enter a valid email address';
              isValid = false;
            }

            if (!addressField.value.trim()) {
              addressError.textContent =
                'Address is required';
              isValid = false;
            }

            if (!isValid) {
              return;
            }

            saveProfile({
              name: nameField.value.trim(),
              email: emailField.value.trim(),
              address: addressField.value.trim(),
            });

            step = 3;

            render();
          });
      }
    }

    if (step === 3) {
      const profile = getProfile();

      block.innerHTML = `
        <section class="checkout-review">

          <h2>
            Review Order
          </h2>

          <div class="review-address">

            <h3>
              Delivery Information
            </h3>

            <p>
              <strong>Name:</strong>
              ${profile.name}
            </p>

            <p>
              <strong>Email:</strong>
              ${profile.email}
            </p>

            <p>
              <strong>Address:</strong>
              ${profile.address}
            </p>

          </div>

          <div class="review-items">

            <h3>
              Items
            </h3>

            ${items
          .map(
            (item) => `
                  <div class="review-item">
                    <span>
                      ${item.title}
                      ×
                      ${item.quantity}
                    </span>

                    <span>
                      $${Number(item.price)
              * item.quantity}
                    </span>
                  </div>
                `,
          )
          .join('')}

          </div>

          <div class="review-total">

            <h3>
              Total: $${total}
            </h3>

          </div>

          <div class="checkout-actions">

            <button
              class="back-to-profile"
            >
              Back
            </button>

            <button
              class="place-order"
            >
              Place Order
            </button>

          </div>

        </section>
      `;

      block
        .querySelector(
          '.back-to-profile',
        )
        .addEventListener(
          'click',
          () => {
            step = 2;
            render();
          },
        );

      block
        .querySelector(
          '.place-order',
        )
        .addEventListener(
          'click',
          async () => {
            placeOrder(
              profile,
              items,
              total,
            );
          },
        );
    }
  }

  render();
}