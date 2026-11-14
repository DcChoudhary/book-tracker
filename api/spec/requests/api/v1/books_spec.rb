require 'rails_helper'

RSpec.describe "Books API", type: :request do

  let(:book_attributes) do
    {
      title: "The Hobbit",
      author: "J. R. R. Tolkien",
      status: "want-to_read",
      rating: 5
    }
  end

  describe "GET /api/v1/books" do
    it "returns the books" do
      Book.create!(book_attributes)

      get api_v1_books_path, as: :json
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.count).to eq(1)
    end
  end

  describe "POST /api/v1/books" do
    it "create new book record" do
      expect do
        post api_v1_books_path, params: { book: book_attributes }, as: :json
      end.to change(Book, :count).by(1)
    end
  end

  describe 'GET /api/v1/books/:id' do
    it 'returns one book' do
      book = Book.create!(book_attributes)

      get api_v1_books_path(book), as: :json
      expect(response.parsed_body.first["id"]).to eq(book.id)
      expect(response.parsed_body.first["title"]).to eq(book.title)
    end
  end

  describe 'PUT /api/v1/books/:id' do
    it 'updates a book' do
      book = Book.create!(book_attributes)
      title = "Updated title".freeze
      put api_v1_book_path(book), params: { book: {title:} }, as: :json
      
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["title"]).to eq(title)
      expect(book.reload.title).to eq(title)
    end
  end

  describe 'DELETE /api/v1/books/:id' do
    it 'deletes a book' do
      book = Book.create(book_attributes)

      expect do 
        delete api_v1_book_path(book)
      end.to change(Book, :count).by(-1)

      expect(response).to have_http_status(:no_content)
      expect(response.parsed_body).to be_empty
    end
  end
end
