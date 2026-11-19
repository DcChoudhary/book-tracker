const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1/books";

async function request(url, option) {
  const response = await fetch(url, option)

  if (!response.ok) {
    const message = response.text();
    throw new Error(message || `Request failed: ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json();
}

function jsonOption(method, book) {
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

  create(book) {
    return request(API_URL, jsonOption('POST', book))
  },

  update(id, newBook) {
    return request(`${API_URL}/${id}`, jsonOption("PUT", newBook))
  },

  delete(id) {
    return request(`${API_URL}/${id}`, { method: "DELETE" })
  }
}