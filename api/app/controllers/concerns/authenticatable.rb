# frozen_string_literal: true

module Authenticatable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate
  end

  private

  attr_reader :current_user

  def authenticate
    begin
      @current_user = User.find(decode_token[:sub][:id])
    rescue ActiveRecord::RecordNotFound
      raise Authentication::JsonWebToken::AuthenticationError
    end
  end

  def decode_token
    token = request.authorization.to_s.gsub(/\A\bBearer \b/, "")
    Authentication::JsonWebToken.decode(token)
  end
end