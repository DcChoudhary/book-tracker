# frozen_string_literal: true

class Book < ApplicationRecord

  validates :title, :author, presence: true

  belongs_to :user
end
