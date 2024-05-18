import express from 'express';

declare module './private/features/notion/NotionRouter' {
  export const NotionRouter: () => express.Router;
}

declare module './private/features/favorites/FavoriteRouter' {
  export const FavoriteRouter: () => express.Router;
}
