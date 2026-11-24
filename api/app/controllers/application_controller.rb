class ApplicationController < ActionController::API
  class AuthenticationError < StandardError; end

  before_action :authenticate

  HMAC_SECRET = "MyJWTsecretKEY".freeze

  def authenticate
    begin
      @user = User.find_by(email: decode_token.first[:email])
    rescue JWT::ExpiredSignature => e
      render json: { message: e.message }, status: :unprocessable_entity and return
    rescue AuthenticationError => e
      render json: { message:e.message }, status: :unauthorized and return
    end
  end

  def current_user
    @user
  end

  private

  def decode_token
    bearer_token = request.headers[:Authorization]
    raise AuthenticationError, 'Please pass bearer token' if bearer_token.nil?
    token = bearer_token.delete_prefix("Bearer ")
    JWT.decode(token, HMAC_SECRET, true, { algo: 'HMAC256' })
  end
end
