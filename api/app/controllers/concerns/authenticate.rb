# frozen_string_literal: true

module Authenticate
  extend ActiveSupport::Concern

  included do
    before_action :authenticate
  end

  def authenticate
    begin
      @current_user = User.find(decode_token[:sub][:id])
    rescue ApplicationController::AuthenticationError => e
      render json: { error: e.message }, status: :unauthorized
    end
  end

  private

  attr_reader :current_user

  def decode_token
    token = request.authorization.gsub(/\A\bBearer \b/, "")
    Authentication::JsonWebToken.decode(token)
  end
end