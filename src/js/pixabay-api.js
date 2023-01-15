'use strict';

export class PixabayAPI {
  static BASE_URL = 'https://pixabay.com/api/';
  static API_KEY = '32875867-65814ebf8b23bcdf5668f7744';

  constructor() {
    this.page = 1;
    this.query = null;
  }

  async fetchPhotosByQuery() {
    const searchParams = new URLSearchParams({
      q: this.q,
      page: this.page,
      per_page: 20,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      key: PixabayAPI.API_KEY,
    });

    const response = await fetch(`${PixabayAPI.BASE_URL}?${searchParams}`);
    if (!response.ok) {
      throw new Error(response.status);
    }
    return await response.json();
  }
}
