export default function decorate(block) {
  const rows = [...block.children];

  const title = rows[0]?.textContent.trim() || '';
  const description = rows[1]?.textContent.trim() || '';
  const backgroundImage = rows[2]?.textContent.trim() || '';
  const ctaText = rows[3]?.textContent.trim() || '';
  const ctaLink = rows[4]?.textContent.trim() || '#';

  block.innerHTML = `
    <section
      class="hero-container"
      style="background-image:url('${backgroundImage}')"
    >
      <div class="hero-overlay">
        <div class="hero-content">
          <h1>${title}</h1>

          <p>${description}</p>

         <a href=${ctaLink}>
            ${ctaText}
          </a>
        </div>
      </div>
    </section>
  `;
}