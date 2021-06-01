import './styles.css';
import axios from 'axios';
import PNotify from 'pnotify/dist/es/PNotify.js';
import template from './templates/imageCard.hbs';

const url = `https://pixabay.com/api/?image_type=photo&orientation=horizontal`;
const key = `&key=15900106-2c235e732bb321ca7ec900d93`;
let page = 1;
const perPage = `&per_page=12`;

const searchForm = document.querySelector(`.search-form`);
const input = document.querySelector(`input`);
const ul = document.querySelector(`.gallery`);
const modalDiv = document.querySelector(`.lightbox`);
const modalDivButton = document.querySelector(`button[data-action="close-lightbox"]`);
const modalImg = document.querySelector(`.modal-img`);
const nextPicture = document.querySelector(`.add-more`);
let query = ``;

searchForm.addEventListener(`submit`, sendSubmit);

const pnotifySet = {
  text: 'We did not find any pictures for your request',
  delay: 3000,
  addClass: `warning`,
  width: '250px',
  remove: true,
  stack: {
    context: modalDiv,
  },
};

const targets = document.getElementsByClassName('modal-img');

const options = {
  root: null,
  rootMargin: '0px',
  threshold: 0.5,
};

var loadImage = function (entries, observer) {
  if (page > 1) {
    page += 1;
    axios.get(`${url}${query}&page=${page}${perPage}${key}`).then(resp => {
      const data = resp.data.hits;
      const mark = data.reduce(
        (acc, el) => acc + `<li class="image-card">${template(el)}</li>`,
        ``,
      );
      ul.insertAdjacentHTML(`beforeend`, mark);
    });
  }
};

const observer = new IntersectionObserver(loadImage, options);

targets.forEach(target => {
  observer.observe(target);
});

nextPicture.addEventListener(`click`, addNewPictures);

function sendSubmit() {
  event.preventDefault();
  ul.innerHTML = ``;
  query = `&q=${input.value}`;
  nextPicture.style.visibility = `hidden`;
  axios.get(`${url}${query}&page=${page}${perPage}${key}`).then(response => {
    const data = response.data.hits;
    if (data.length >= 1) {
      nextPicture.style.visibility = `visible`;
    }
    if (data.length < 11) {
      nextPicture.disabled = true;
    }
    if (data.length === 0) {
      PNotify.error(pnotifySet);
    }
    const markup = data.reduce(
      (acc, el) => acc + `<li class="image-card">${template(el)}</li>`,
      ``,
    );
    ul.insertAdjacentHTML(`beforeend`, markup);
  });
}

function addNewPictures() {
  page += 1;
  axios.get(`${url}${query}&page=${page}${perPage}${key}`).then(resp => {
    const data = resp.data.hits;
    const mark = data.reduce((acc, el) => acc + `<li class="image-card">${template(el)}</li>`, ``);
    ul.insertAdjacentHTML(`beforeend`, mark);
  });
  nextPicture.removeAttribute('style');
}

ul.addEventListener(`click`, event => {
  if (event.target.className === `gallery__image`) {
    modalDiv.setAttribute(`class`, `lightbox__overlay`);
    modalDivButton.setAttribute(`class`, `lightbox__button`);
    modalImg.setAttribute(`src`, `${event.target.src}`);
  }
});

modalDivButton.addEventListener(`click`, closeModalWindow);

document.addEventListener(`keyup`, event => {
  if (event.key === `Escape`) {
    closeModalWindow();
  }
});

modalDiv.addEventListener(`click`, event => {
  if (event.target != modalImg) {
    closeModalWindow();
  }
});

function closeModalWindow() {
  modalDiv.setAttribute(`class`, ``);
  modalDivButton.setAttribute(`class`, `invisible`);
  modalImg.setAttribute(`src`, ``);
}

// ------------------------/
import './sass/main.scss';
import fetchPhoto from './js/api';

import cardMarkup from './templates/cards.hbs';
import axios from 'axios';

import * as basicLightbox from 'basiclightbox';
import './css/basicLightbox.min.css';

import { error } from '@pnotify/core';
import '@pnotify/core/dist/PNotify.css';
import '@pnotify/core/dist/BrightTheme.css';

const refs = {
  button: document.querySelector('.button'),
  input: document.querySelector('.input'),
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  li: document.querySelector('.gallery-card'),
};

let pageNumber = 1;

refs.form.addEventListener('submit', e => {
  e.preventDefault();

  pageNumber = 1;

  refs.gallery.innerHTML = '';
  if (refs.input.value === '' || refs.input.value === ' ' || refs.input.value === '  ') {
    return error({
      text: 'Please enter something!',
      delay: 2000,
    });
  } else {
    fetchPhoto(refs.input.value, pageNumber).then(renderPhoto);
  }
});
function renderPhoto(data) {
  refs.gallery.insertAdjacentHTML('beforeend', cardMarkup(data));
  if (pageNumber > 1) {
    refs.gallery.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
  }
  if (refs.button.classList.contains('not--active')) {
    refs.button.classList.remove('not--active');
  }
}
refs.button.addEventListener('click', e => {
  e.preventDefault();
  if (refs.input.value === '' || refs.input.value === ' ' || refs.input.value === '  ') {
    return error({
      text: 'Please enter something!',
      delay: 2000,
    });
  }
  pageNumber += 1;
  console.log(pageNumber);
  fetchPhoto(refs.input.value, pageNumber).then(renderPhoto);
});

refs.gallery.addEventListener('click', e => {
  if (e.target.nodeName !== 'IMG') {
    return;
  } else {
    basicLightbox.create(`<img src="${e.target.dataset.source}" width="800" height="600">`).show();
  }
});
