class ApplicationController < ActionController::API
  include Authenticate

  class AuthenticationError < StandardError; end
end
