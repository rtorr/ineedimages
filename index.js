#!/usr/bin/env node
const fetch = require('node-fetch');
const { URL } = require('url');
const config = require('dotenv').config();

const apiUrl = 'https://api.gettyimages.com/v3';
const token = process.env.API_KEY;
const headers = {
  Accept: 'application/json',
  'Api-Key': token
};

const ourJason = data => JSON.stringify({ data }, null, ' ');
const imageUrl = id => `${apiUrl}/images/${id}`;
const searchImagesUrl = (page, phrase) =>
  `${apiUrl}/search/images?fields=summary_set&minimum_size=large&page=${page}&page_size=100&sort_order=best_match&phrase=${phrase}`;

const concat = (a, item) => {
  return a.concat(item.images);
};

const makeUrl = image => {
  const newImageUrl = new URL(image.display_sizes[0].uri);
  newImageUrl.searchParams.set('s', process.env.SIZE);
  return newImageUrl.href;
};

function fetchJson(url) {
  return fetch(url, {
    headers
  })
    .then(res => res.json())
    .catch(error => error)
    .then(response => response);
}

function getImage(id) {
  return `${apiUrl}/images/${id}`;
}

async function getImages() {
  return Promise.all([1, 2, 3, 4, 5].map(n => fetchJson(searchImagesUrl(n, process.env.PHRASE))));
}

async function doStuff() {
  const imageSearch = await getImages();
  return imageSearch.reduce(concat, []).map(makeUrl);
}

doStuff().then(data => console.log(ourJason(data)));
