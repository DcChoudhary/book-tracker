class CreateBooks < ActiveRecord::Migration[8.1]
  def change
    create_table :books do |t|
      t.string :title, null: false
      t.string :author, null: false
      t.string :status, null: false
      t.decimal :rating, default: 0

      t.timestamps
    end
  end
end
