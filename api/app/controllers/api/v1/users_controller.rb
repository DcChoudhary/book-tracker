# frozen_string_literal: true

module Api
  module V1
    class UsersController < ApplicationController
      # Rate limit to 5 within 1 minute for user registration api
      rate_limit to: 5, within: 1.minutes, only: :create

      skip_before_action :authenticate, only: :create

      def create
        user = User.new(user_params)
        if user.save
          render json: { token: Authentication::JsonWebToken.decode(user) }, status: :ok
        else
          render json: { error: user.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      private

      def user_params
        params.permit(:email, :password, :first_name, :last_name)
      end
    end
  end
end