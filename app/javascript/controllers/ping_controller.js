import { Controller } from "@hotwired/stimulus"
import { get } from "@rails/request.js"

export default class extends Controller {
  static targets = [
    "resultElement"
  ]

  start() {
    this.interval = setInterval(() => this.measureAndDisplayPing(), 1000)
  }

  async measureAndDisplayPing() {
    const timeBeforePing = Date.now()
    await get('/api/ping')
    const timeAfterPing = Date.now()

   this.resultElementTarget.textContent = timeAfterPing - timeBeforePing
  }

  disconnect() {
    clearInterval(this.interval)
  }
}
