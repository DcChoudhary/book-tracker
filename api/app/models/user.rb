# frozen_string_literal: true

class User < ApplicationRecord
  has_secure_password

  validates :email, presence: true, uniqueness: true
  validates :password, presence: true, length: { minimum: 8, maximum: 16 }

  normalizes :email, with: ->(email) { email.strip.downcase }

  has_many :books, dependent: :destroy
end
