export default function decorate(block) {
  const orders = JSON.parse(
    localStorage.getItem('commerce-orders')
    || '[]',
  );

  if (!orders.length) {
    block.innerHTML = `
      <section class="orders-empty">

        <h1>My Orders</h1>

        <p>
          No orders found.
        </p>

        <a href="/plp">
          Start Shopping
        </a>

      </section>
    `;

    return;
  }

  block.innerHTML = `
    <section class="orders">

      <h1>My Orders</h1>

      ${orders
        .slice()
        .reverse()
        .map(
          (order) => `
            <article
              class="order-card"
            >

              <div class="order-card__header">

                <div>
                  <h3>
                    ${order.orderId}
                  </h3>

                  <p>
                    ${new Date(
                      order.orderDate,
                    ).toLocaleDateString()}
                  </p>
                </div>

                <span
                  class="order-status"
                >
                  ${order.status}
                </span>

              </div>

              <div
                class="order-items"
              >
                ${order.items}
              </div>

              <div
                class="order-total"
              >
                Total:
                $${order.total}
              </div>

            </article>
          `,
        )
        .join('')}

    </section>
  `;
}