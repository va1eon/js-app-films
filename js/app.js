import {month, monthRu} from './monthList.js';
import {declOfNum, params} from './utils.js';
import {API_KEY} from './api.js';

let queryParam = params.page;

if (!queryParam) {
  queryParam = 1;
  history.pushState(null, null, '?page=1');
}

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();
const currentMonthText = month[currentMonth].toUpperCase();
const currentMonthTextRu = monthRu[currentMonth];

const appListEl = document.querySelector('.app__list');
const yearEl = document.querySelector('.year');
const monthEl = document.querySelector('.month');
const paginationsEl = document.querySelectorAll('.app__pagination');
const errorEl = document.querySelector('.app__error');
const loadEl = document.querySelector('.app__loading');

yearEl.textContent = currentYear.toString();
monthEl.textContent = currentMonthTextRu;

const initApp = (page = 1) => {
  const url = `https://kinopoiskapiunofficial.tech/api/v2.1/films/releases?year=${currentYear}&month=${currentMonthText}&page=${page}`;
  fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': API_KEY,
    }
  })
    .then(res => res.json())
    .then(data => {
      errorEl.style.display = 'none';
      loadEl.style.display = 'none';
      const total = data.total;
      const pages = Math.ceil(total / 10);

      for (let i = pages; i >= 1; i--) {
        paginationsEl.forEach(el => {
          el.insertAdjacentHTML('afterbegin', `
            <li class="app__pagination-item">
              <a class="app__pagination-link ${i == queryParam ? 'app__pagination-link--current' : ''}" href="?page=${i}">${i}</a>
            </li>
          `);
        });
      }
      return data;
    })
    .then(data => {
      for (let item of data.releases) {
        const options = {
          month: 'long',
          day: 'numeric'
        };

        let date = new Date(item.releaseDate).toLocaleDateString('ru-RU', options);
        let rating = item.rating ? item.rating.toFixed(1) : 'Недостаточно голосов';
        let duration = `${item.duration} ${declOfNum(item.duration, ['минута', 'минуты', 'минут'])}`;
        let to = item.genres.map(item => Object.values(item)[0]);
        let genres = to.join(', ');

        appListEl.insertAdjacentHTML('afterbegin', `
          <li class="app__list-item">
            <article class="app__card movie-card">
              <a class="movie-card__link" href="https://www.kinopoisk.ru/film/${item.filmId}/" target="_blank">
                <div class="movie-card__image-wrapper">
                  <img
                      class="movie-card__img"
                      src="${item.posterUrlPreview}"
                      alt="${item.nameRu ? item.nameRu : item.nameEn}"
                      loading="lazy"
                  >
                  <div class="movie-card__hover">
                    <div class="movie-card__rating ${item.rating == null ? 'movie-card__rating--null' : ''}">${rating}</div>
                    <div class="movie-card__genres">${genres}</div>
                    <div class="movie-card__duration ${item.duration == 0 ? 'movie-card__duration--hidden' : ''}">${duration}</div>
                  </div>
                </div>
                <h2 class="movie-card__title">${item.nameRu ? item.nameRu : item.nameEn}</h2>
                <div class="movie-card__date">${date}</div>
              </a>
            </article>
          </li>
        `);
      }
    })
    .catch(() => {
      errorEl.style.display = 'block';
      loadEl.style.display = 'none';
    })
};

initApp(queryParam);