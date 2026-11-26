require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'validation' do
    it 'is invalid without email, password and password_confirmation' do
      user = User.new
      expect(user).to be_invalid
      expect(user.errors[:email]).to include("can't be blank")
      expect(user.errors[:password]).to include("can't be blank")
    end

    it 'is invalid with duplicate email id' do
      User.create(email: 'first_user@example.com', password: 'Password', password_confirmation: 'Password')

      user = User.create(email: 'first_user@example.com')
      expect(user).to be_invalid
      expect(user.errors[:email]).to include("has already been taken")
    end
  end
end
