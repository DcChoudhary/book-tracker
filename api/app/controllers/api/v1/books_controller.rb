# frozen_string_literal: true

module Api
  module V1
    class BooksController < ApplicationController
      before_action :find_book, only: %i[show destroy update]

      def index
        # Add pagination
        books = current_user.books
        render json: books, status: :ok
      end

      def create
        @book = current_user.book.new(book_params)
      
        if @book.save
          render json: {}, location: api_v1_book_url(@book), status: :created
        else
          render json: @book.errors, status: :unprocessable_entity
        end
      end

      def update
        if @book.update(book_params)
          render json: @book, status: :ok
        else
          render json: @book.errors, status: :unprocessable_entity
        end
      end

      def show
        render json: @book, status: :ok
      end

      def destroy
        @book.destroy
        head :no_content
      end

      private

      def book_params
        params.require(:book).permit(:title, :status, :author, :rating)
      end

      def find_book
        @book ||= current_user.book.find(params[:id])
      end
    end
  end
end