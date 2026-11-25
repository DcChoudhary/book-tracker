# frozen_string_literal: true

module Api
  module V1
    class SessionsController < ApplicationController
      skip_before_action :authenticate, only: %i[create login]
      
      # Rate limit to 5 within 1 minute for login and register api's
      rate_limit to: 5, within: 1.minutes, only: %i[create login]
      
      def create
        @user = User.new(user_params)
        if @user.save
          render json: { token: jwt_token }, status: :created
        else
          render json: @user.errors, status: :unprocessable_entity
        end
      end

      def login
        if user = User.authenticate_by(email: params[:email], password: params[:password])
          render json: { token: jwt_token_for(user) }, status: :ok
        else
          render json: { message: "Invalid email or password" }, status: :unprocessable_entity
        end
      end

      private

      def user_params
        params.require(:user).permit(:email, :password, :password_confirmation, :first_name, :last_name)
      end

      def jwt_token_for(user)
        Authenticate::JsonWebToken.encode(user)
      end
    end
  end
end