import { Controller } from "@hotwired/stimulus"
import { get } from "@rails/request.js"

export default class extends Controller {
  static targets = [
    "resultElement",
    "startElement"
  ]

  start() {
    this.startElementTarget.textContent = "Ping in progess..."
    this.startElementTarget.disabled = "disabled"
    this.interval = setInterval(() => this.measureAndDisplayPing(), 1000)
  }

  async measureAndDisplayPing() {
    const timeBeforePing = Date.now()
    await get('/api/ping')
    const timeAfterPing = Date.now()

    this.resultElementTarget.textContent = `${timeAfterPing - timeBeforePing}ms`
  }

  disconnect() {
    clearInterval(this.interval)
  }
}
