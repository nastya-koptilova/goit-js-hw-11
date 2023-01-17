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

const onSearchFormELSubmit = async event => {
  event.preventDefault();

  const { target } = event;

  pixabayAPI.query = target.elements.searchQuery.value.trim();
  pixabayAPI.page = 1;

  try {
    const { data } = await pixabayAPI.fetchPhotosByQuery();
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
    console.log(data);
    Notiflix.Notify.info(`Hooray! We found ${data.totalHits} images.`);
    lightbox.refresh();
    smoothScroll();
  } catch (err) {
    galleryEl.innerHTML = '';
    console.log(err);
  }
};

const onLoadMoreBtnClick = async event => {
  const { target } = event;
  target.disabled = true;

  pixabayAPI.page += 1;

  try {
    const { data } = await pixabayAPI.fetchPhotosByQuery();
    if (data.totalHits <= pixabayAPI.countHits) {
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
      loadMoreBtn.classList.add('hidden');
      return;
    }
    pixabayAPI.countHits += data.hits.length;
    galleryEl.insertAdjacentHTML('beforeend', createGalleryCards(data.hits));
    lightbox.refresh();
    window.scrollTo(0, 0);
    smoothScroll();
    target.disabled = false;
  } catch (err) {
    console.log(err);
  }
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
