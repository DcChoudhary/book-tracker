# frozen_string_literal: true

class ErrorsController < ActionController::API
  def not_found
    render json: {
      error: {
        code: 'not_found',
        message: 'The requested resource was not found',
        request_id: request.request_id
      }
    }, status: :not_found
  end

  def internal_server_error
    render json: {
      error: {
        code: 'internal_server_error',
        message: 'An unexpected error occurred, please try again later',
        request_id: request.request_id
      }
    }, status: :internal_server_error
  end
end