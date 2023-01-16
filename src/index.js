import './css/styles.css';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { PixabayAPI } from './js/pixabay-api';

const searchFormEL = document.querySelector('#search-form');
const galleryEl = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
loadMoreBtn.classList.add('hidden');

const pixabayAPI = new PixabayAPI();

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

const onSearchFormELSubmit = event => {
  event.preventDefault();

  const { target } = event;

  pixabayAPI.query = target.elements.searchQuery.value.trim();
  pixabayAPI.page = 1;

  pixabayAPI
    .fetchPhotosByQuery()
    .then(photos => {
      const { data } = photos;
      if (data.hits.length === 0 || pixabayAPI.query === '') {
        galleryEl.innerHTML = '';
        loadMoreBtn.classList.add('hidden');
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }

      loadMoreBtn.classList.remove('hidden');
      galleryEl.innerHTML = createGalleryCards(data.hits);
      Notiflix.Notify.info(`Hooray! We found ${data.totalHits} images.`);
      lightbox.refresh();
      smoothScroll();
    })
    .catch(err => {
      galleryEl.innerHTML = '';
      console.log(err);
    });
};

const onLoadMoreBtnClick = event => {
  const { target } = event;
  target.disabled = true;

  pixabayAPI.page += 1;
  pixabayAPI.countHits += pixabayAPI.per_page;

  pixabayAPI
    .fetchPhotosByQuery()
    .then(photos => {
      const { data } = photos;
      if (data.totalHits <= pixabayAPI.countHits) {
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
        loadMoreBtn.classList.add('hidden');
        return;
      }
      galleryEl.insertAdjacentHTML('beforeend', createGalleryCards(data.hits));
      lightbox.refresh();
      window.scrollTo(0, 0);
      smoothScroll();
    })
    .catch(err => {
      console.log(err);
    })
    .finally(() => {
      target.disabled = false;
    });
};

const createGalleryCards = photos => {
  const galleryCards = photos.map(el => {
    const {
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    } = el;
    return `<div class="photo-card">
    <a class="link" href=${largeImageURL}>
  <img src=${webformatURL} alt=${tags} loading="lazy" />
  </a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      ${likes}
    </p>
    <p class="info-item">
      <b>Views</b>
      ${views}
    </p>
    <p class="info-item">
      <b>Comments</b>
      ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>
      ${downloads}
    </p>
  </div>
</div>`;
  });

  return (galleryEl.innerHTML = galleryCards.join(''));
};

const smoothScroll = () => {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
};

searchFormEL.addEventListener('submit', onSearchFormELSubmit);
loadMoreBtn.addEventListener('click', onLoadMoreBtnClick);
