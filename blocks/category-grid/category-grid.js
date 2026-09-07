import { fetchSheetData,getBlockConfig } from '../../scripts/services/data-service.js';

function createCategoryCard(category) {
  const article = document.createElement('article');

  article.className = 'category-card';

  article.innerHTML = `
      ${category.image
          ? `
            <div class="category-card__image">
              <img src=${category.image}/>
            </div>
          `
          : ''
      }

      <div class="category-card__content">
        <h3>${category.title}</h3>

        <p>${category.description}</p>

        <a class="category-card__cta" href="/plp?category=${category.categoryId}">
          Browse Category →
        </a>
      </div>
    </a>
  `;

  return article;
}

export default async function decorate(block) {
  const config = getBlockConfig(block);

  const categories = await fetchSheetData(
    config['data source'],
  );

  let data = categories;

  if (config['featured only'] === 'true') {
    data = categories.filter(
      (category) =>
        String(category.featured).toLowerCase() === 'true',
    );
  }

  block.innerHTML = '';

  const wrapper = document.createElement('section');
  wrapper.className = 'category-grid';

  wrapper.innerHTML = `
    <div class="category-grid__header">
      <h2>${config.heading || ''}</h2>
      <p>${config.description || ''}</p>
    </div>
  `;

  const grid = document.createElement('div');
  grid.className = 'category-grid__items';

  data.forEach((category) => {
    grid.append(createCategoryCard(category));
  });

  wrapper.append(grid);

  if (config['cta label'] && config['cta link']) {
    const footer = document.createElement('div');

    footer.className = 'category-grid__footer';

    footer.innerHTML = `
      <a href=${config['cta link']}>
        ${config['cta label']}
      </a>
    `;

    wrapper.append(footer);
  }

  block.append(wrapper);
}
