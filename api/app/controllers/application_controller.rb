class ApplicationController < ActionController::API
  rescue_from Authentication::JsonWebToken::AuthenticationError, with: :render_authentication_error

  include Authenticatable

  private

  def render_authentication_error
    render json: { error: 'Authentication is required to access this resource.' }, status: :unauthorized
  end
end
