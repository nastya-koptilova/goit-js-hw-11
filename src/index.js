import './css/styles.css';
import Notiflix from 'notiflix';
import axios, { isCancel, AxiosError } from 'axios';
import SimpleLightbox from 'simplelightbox';
import { PixabayAPI } from './js/pixabay-api';

const searchFormEL = document.querySelector('#search-form');
const galleryEl = document.querySelector('.gallery');

const pixabayAPI = new PixabayAPI();

const onsearchFormELSubmit = event => {
  event.preventDefault();

  pixabayAPI.q = event.target.elements.searchQuery.value.trim();
  pixabayAPI.page = 1;

  pixabayAPI
    .fetchPhotosByQuery()
    .then(data => {
      console.log(data);

      galleryEl.innerHTML = createGalleryCards(data.hits);
    })
    .catch(err => {
      console.log(err);
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
  <img src=${webformatURL} alt=${tags} loading="lazy" />
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

searchFormEL.addEventListener('submit', onsearchFormELSubmit);
