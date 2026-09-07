const CART_KEY = 'commerce-cart';

export function getCart() {
  return JSON.parse(
    localStorage.getItem(CART_KEY) || '[]',
  );
}

export function saveCart(cart) {
  localStorage.setItem(
    CART_KEY,
    JSON.stringify(cart),
  );
}

export function addToCart(sku, quantity = 1,title) {
  const cart = getCart();

  const existingItem = cart.find(
    (item) => item.sku === sku,
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      sku,
      quantity,
      title
    });
  }

  saveCart(cart);

  window.dispatchEvent(
    new CustomEvent('cart-updated'),
  );
}

export function updateQuantity(
  sku,
  quantity,
) {
  const cart = getCart();

  const item = cart.find(
    (cartItem) => cartItem.sku === sku,
  );

  if (!item) {
    return;
  }

  if (quantity <= 0) {
    removeFromCart(sku);
    return;
  }

  item.quantity = quantity;

  saveCart(cart);

  window.dispatchEvent(
    new CustomEvent('cart-updated'),
  );
}

export function removeFromCart(sku) {
  const cart = getCart().filter(
    (item) => item.sku !== sku,
  );

  saveCart(cart);

  window.dispatchEvent(
    new CustomEvent('cart-updated'),
  );
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);

  window.dispatchEvent(
    new CustomEvent('cart-updated'),
  );
}

export function getCartCount() {
  return getCart().reduce(
    (total, item) => total + item.quantity,
    0,
  );
}