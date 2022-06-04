Rails.application.routes.draw do
  get 'home/index'
  root "home#index"

  namespace :api do
    get 'ping', to: 'ping#index'
  end
end
