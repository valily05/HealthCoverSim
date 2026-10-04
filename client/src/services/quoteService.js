// src/services/quoteService.js

const API_URL = "http://localhost:3001/api/quotes";

async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export async function createQuote(quoteData) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(quoteData),
  });

  return handleResponse(response);
}

export async function getQuote(id) {
  const response = await fetch(`${API_URL}/${id}`);
  return handleResponse(response);
}
export async function getQuotes() {
  const response = await fetch(API_URL);
  return handleResponse(response);
}

export async function getQuoteById(id) {
  const response = await fetch(`${API_URL}/${id}`);
  return handleResponse(response);
}
export async function updateQuote(id, quoteData) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(quoteData),
  });

  return handleResponse(response);
}

export async function deleteQuote(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  return handleResponse(response);
}