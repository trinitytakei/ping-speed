class Api::PingController < ApplicationController
  def index
    head :ok
  end
end
