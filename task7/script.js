(() => {
  'use strict';

  const CONFIG = Object.freeze({
    apiUrl: 'https://jsonplaceholder.typicode.com',
    pageSize: 10,
    searchDelay: 300,
    scrollOffset: 200,
  });

  function debounce(callback, delay) {
    let timerId = null;
    return (...args) => {
      clearTimeout(timerId);
      timerId = setTimeout(() => callback(...args), delay);
    };
  }

  class PostsApi {
    constructor(baseUrl) {
      this.baseUrl = baseUrl;
    }

    async getPosts(start, limit) {
      const params = new URLSearchParams({ _start: start, _limit: limit });
      let response;
      try {
        response = await fetch(`${this.baseUrl}/posts?${params}`);
      } catch {
        throw new Error('Нет соединения с сервером. Проверьте интернет и попробуйте ещё раз.');
      }
      if (!response.ok) {
        throw new Error(`Сервер ответил ошибкой ${response.status}. Попробуйте ещё раз позже.`);
      }
      const posts = await response.json().catch(() => null);
      if (!Array.isArray(posts)) {
        throw new Error('Сервер прислал данные в неожиданном формате.');
      }
      return posts;
    }
  }

  class PostsModel {
    constructor(pageSize) {
      this.pageSize = pageSize;
      this.posts = [];
      this.query = '';
      this.isLoading = false;
      this.hasMore = true;
      this.error = '';
    }

    canLoad() {
      return this.hasMore && !this.isLoading;
    }

    canAutoLoad() {
      return this.canLoad() && !this.error && !this.query;
    }

    startLoading() {
      this.isLoading = true;
      this.error = '';
    }

    finishLoading() {
      this.isLoading = false;
    }

    addPosts(newPosts) {
      this.posts.push(...newPosts);
      this.hasMore = newPosts.length === this.pageSize;
    }

    setError(message) {
      this.error = message;
    }

    setQuery(query) {
      this.query = query.trim().toLowerCase();
    }

    getVisiblePosts() {
      if (!this.query) {
        return this.posts;
      }
      return this.posts.filter(post => post.title.toLowerCase().includes(this.query));
    }
  }

  class PostsView {
    constructor(scrollOffset) {
      this.scrollOffset = scrollOffset;
      this.observer = null;
      this.searchInput = document.getElementById('search');
      this.counter = document.getElementById('counter');
      this.list = document.getElementById('posts');
      this.emptyMessage = document.getElementById('empty');
      this.searchHint = document.getElementById('search-hint');
      this.loader = document.getElementById('loader');
      this.errorBox = document.getElementById('error');
      this.errorText = document.getElementById('error-text');
      this.retryButton = document.getElementById('retry');
      this.endMessage = document.getElementById('end');
      this.sentinel = document.getElementById('sentinel');
    }

    bindSearch(handler) {
      this.searchInput.addEventListener('input', () => handler(this.searchInput.value));
    }

    bindRetry(handler) {
      this.retryButton.addEventListener('click', handler);
    }

    bindScrollEnd(handler) {
      this.observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          handler();
        }
      }, { rootMargin: `0px 0px ${this.scrollOffset}px 0px` });
      this.observer.observe(this.sentinel);
    }

    recheckScrollEnd() {
      this.observer.unobserve(this.sentinel);
      this.observer.observe(this.sentinel);
    }

    render({ posts, loadedCount, query, isLoading, hasMore, error }) {
      this.list.replaceChildren(...posts.map(post => this.createPostCard(post)));
      this.counter.hidden = loadedCount === 0;
      this.counter.textContent = query
        ? `Найдено: ${posts.length} из ${loadedCount}`
        : `Загружено постов: ${loadedCount}`;
      this.emptyMessage.hidden = !query || posts.length > 0;
      this.searchHint.hidden = !query || !hasMore;
      this.loader.hidden = !isLoading;
      this.errorBox.hidden = !error;
      this.errorText.textContent = error;
      this.endMessage.hidden = hasMore;
    }

    createPostCard(post) {
      const card = this.createElement('li', 'post');
      const meta = this.createElement('div', 'post__meta');
      meta.append(
        this.createElement('span', 'post__author', `Автор ${post.userId}`),
        this.createElement('span', 'post__number', `Пост ${post.id}`),
      );
      card.append(
        meta,
        this.createElement('h2', 'post__title', post.title),
        this.createElement('p', 'post__body', post.body),
      );
      return card;
    }

    createElement(tag, className, text = '') {
      const element = document.createElement(tag);
      element.className = className;
      element.textContent = text;
      return element;
    }
  }

  class PostsController {
    constructor(model, view, api, searchDelay) {
      this.model = model;
      this.view = view;
      this.api = api;
      this.searchDelay = searchDelay;
    }

    init() {
      this.view.bindSearch(debounce(query => this.handleSearch(query), this.searchDelay));
      this.view.bindRetry(() => this.loadMore());
      this.view.bindScrollEnd(() => this.handleScrollEnd());
      this.loadMore();
    }

    async loadMore() {
      if (!this.model.canLoad()) {
        return;
      }
      this.model.startLoading();
      this.render();
      try {
        const posts = await this.api.getPosts(this.model.posts.length, this.model.pageSize);
        this.model.addPosts(posts);
      } catch (error) {
        this.model.setError(error.message);
      } finally {
        this.model.finishLoading();
        this.render();
        this.view.recheckScrollEnd();
      }
    }

    handleScrollEnd() {
      if (this.model.canAutoLoad()) {
        this.loadMore();
      }
    }

    handleSearch(query) {
      this.model.setQuery(query);
      this.render();
      this.view.recheckScrollEnd();
    }

    render() {
      this.view.render({
        posts: this.model.getVisiblePosts(),
        loadedCount: this.model.posts.length,
        query: this.model.query,
        isLoading: this.model.isLoading,
        hasMore: this.model.hasMore,
        error: this.model.error,
      });
    }
  }

  const api = new PostsApi(CONFIG.apiUrl);
  const model = new PostsModel(CONFIG.pageSize);
  const view = new PostsView(CONFIG.scrollOffset);
  const controller = new PostsController(model, view, api, CONFIG.searchDelay);
  controller.init();
})();
