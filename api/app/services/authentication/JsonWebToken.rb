# frozen_string_literal: true

module Authentication
  class JsonWebToken
    class AuthenticationError < StandardError; end

    TOKEN_TTL = 15.minutes
    ALGORITHM = 'HS256'.freeze
    
    class << self
      def encode(user)
        # Note: Let me know how i can make it better and industry standard
        payload = { sub: { id: user.id }, exp: TOKEN_TTL.from_now.to_i }
        JWT.encode(payload, secret, ALGO)
      end

      def decode(token)
        begin
          token = JWT.decode(token, true, secret, { algorithm: ALGORITHM })
          token[0].with_indifferent_access
        rescue JWT::DecodeError => e
          raise AuthenticationError, e.message
        end
      end

      private

      def secret = ENV["HMAC_SECRET"]
    end
  end
end