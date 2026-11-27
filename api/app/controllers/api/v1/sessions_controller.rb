# frozen_string_literal: true

module Api
  module V1
    class SessionsController < ApplicationController
      skip_before_action :authenticate, only: :create
      
      # Rate limit to 5 within 1 minute for login
      rate_limit to: 5, within: 1.minutes, only: :create
      
      def create
        if user = User.authenticate_by(email: params[:email], password: params[:password])
          render json: { token: jwt_token_for(user) }, status: :ok
        else
          render json: { message: "Invalid email or password" }, status: :unprocessable_entity
        end
      end
    end
  end
end