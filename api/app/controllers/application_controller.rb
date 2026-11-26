class ApplicationController < ActionController::API
  include authenticate

  class AuthenticationError < StandardError; end
end
