# frozen_string_literal: true

module Api
  module V1
    class UsersController < ApplicationController
      skip_before_action :authenticate
      
      def register
        @user = User.new(user_params)
        if @user.save
          render json: { token: jwt_token }, status: :created
        else
          render json: user.errors, status: :unprocessable_entity
        end
      end

      def login
        if @user.authenticate(params[:password])
          render json: { token: jwt_token }, status: :ok
        else
          render json: { message: "Invalid email or password" }, status: :unprocessable_entity
        end
      end

      private

      def user_params
        params.require(:user).permit(:email, :password, :password_confirmation, :first_name, :last_name)
      end

      def jwt_token
        exp = (DateTime.current + 5.minutes).to_i
        payload = { email: @user.email, exp:  }
        JWT.encode(payload, HMAC_SECRET, 'HS256')
      end
    end
  end
end