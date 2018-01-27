#!/usr/bin/env node
const sade = require('sade');
const fetch = require('node-fetch');
const { URL } = require('url');
const version = require('./package');

const prog = sade('ineedimages');
const apiUrl = 'https://api.gettyimages.com/v3';

const ourJason = data => JSON.stringify({ data }, null, ' ');
const imageUrl = id => `${apiUrl}/images/${id}`;
const searchImagesUrl = (page, phrase) =>
  `${apiUrl}/search/images?fields=summary_set&minimum_size=large&page=${page}&page_size=100&sort_order=best_match&phrase=${phrase}`;

const concat = (a, item) => {
  return a.concat(item.images);
};

const makeUrl = size => image => {
  try {
    const newImageUrl = new URL(image.display_sizes[0].uri);
    newImageUrl.searchParams.set('s', size);
    return newImageUrl.href;
  } catch (e) {
    console.error("Your API key probably doesn't work");
    process.exit(1);
  }
};

function fetchJson(url, options) {
  const headers = {
    Accept: 'application/json',
    'Api-Key': options.key
  };
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

async function getImages(options) {
  return Promise.all(
    [1, 2, 3, 4, 5].map(n => fetchJson(searchImagesUrl(n, options.phrase), options))
  );
}

async function doStuff(options) {
  const imageSearch = await getImages(options);
  return imageSearch.reduce(concat, []).map(makeUrl(options.size));
}

prog
  .command('run <key> <phrase> <size>', '', { default: true })
  .describe('Return images from getty')
  .action((key, phrase, size) => {
    if (!key) {
      console.error('You need to process.env.GETTY_API_KEY to a getty image API token');
      process.exit(1);
    }
    const _size = size ? size : '100x100';
    const _phrase = phrase ? phrase : 'cats';
    doStuff({ key, phrase: _phrase, size: _size }).then(data => console.log(ourJason(data)));
  });

prog.parse(process.argv);
