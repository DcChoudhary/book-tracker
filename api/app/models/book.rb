# frozen_string_literal: true
class Book < ApplicationRecord
  validates :title, :author, :status, presence: true
  validates :rating, numericality: { in: 0..5 }

  enum :status, { 
    want_to_read: 'want_to_read',
    complete: 'complete',
    in_progress: 'in_progress',
    on_hold: 'on_hold' 
  }, default: :want_to_read, validate: true

  belongs_to :user
end
