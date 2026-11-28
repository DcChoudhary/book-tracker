const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1/books";

import type { BookParams, UpdateBookParams } from '../../types/book'

async function request(url:string, option = {}) {
  const response = await fetch(url, option)

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return await response.json();
}

function jsonOption(method: string, book: BookParams | UpdateBookParams) {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ book }),
  }
}

export const booksApi = {
  list() {
    return request(API_URL);
  },

  create(book: BookParams) {
    return request(API_URL, jsonOption('POST', book))
  },

  update(id: bigint, newBook: { title: string }) {
    return request(`${API_URL}/${id}`, jsonOption("PUT", newBook))
  },

  delete(id: bigint) {
    return request(`${API_URL}/${id}`, { method: "DELETE" })
  }
}