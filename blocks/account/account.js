const PROFILE_KEY = 'commerce-profile';

export default function decorate(block) {
  const profile = JSON.parse(
    localStorage.getItem(PROFILE_KEY) || 'null',
  );

  if (!profile) {
    block.innerHTML = `
      <section class="account-empty">
        <h1>My Account</h1>

        <p>
          No profile information found.
        </p>

        /checkout
          Complete your first order
        </a>
      </section>
    `;

    return;
  }

  block.innerHTML = `
    <section class="account">

      <h1>My Account</h1>

      <div class="account-card">

        <div class="account-field">
          <label>Name</label>
          <p>${profile.name}</p>
        </div>

        <div class="account-field">
          <label>Email</label>
          <p>${profile.email}</p>
        </div>

        <div class="account-field">
          <label>Address</label>
          <p>${profile.address}</p>
        </div>
        <a href="/orders">view orders</a>
      </div>

    </section>
  `;
}