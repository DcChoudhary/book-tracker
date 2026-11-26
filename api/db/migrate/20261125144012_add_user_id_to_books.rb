class AddUserIdToBooks < ActiveRecord::Migration[8.1]
  def change
    add_reference :books, :user, null: false, foreign_key: true
  end
end
