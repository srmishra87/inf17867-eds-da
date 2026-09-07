export default function decorate(block) {
  const orderId =
    localStorage.getItem(
      'commerce-last-order-id',
    ) || 'N/A';

  block.innerHTML = `
    <section class="order-confirmation">

      <div class="order-confirmation__icon">
        ✓
      </div>

      <h1>
        Order Placed Successfully
      </h1>

      <p>
        Thank you for shopping with ShopSphere.
      </p>

      <div class="order-confirmation__order-id">
        Order ID:
        <strong>${orderId}</strong>
      </div>

      <div class="order-confirmation__actions">

        <a href="/plp">
            Continue Shopping
        </a>

      </div>

    </section>
  `;
}