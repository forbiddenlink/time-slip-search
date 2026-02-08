import '@testing-library/jest-dom'

// Polyfill for Web APIs
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init = {}) {
      this.url = input
      this.headers = new Map(Object.entries(init.headers || {}))
    }

    get(name) {
      return this.headers.get(name)
    }
  }

  global.Request.prototype.headers = {
    get: function(name) {
      return this.headers ? this.headers.get(name) : null
    }
  }
}

if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init = {}) {
      this._headers = new Map(Object.entries(init))
    }

    get(name) {
      return this._headers.get(name) || null
    }

    set(name, value) {
      this._headers.set(name, value)
    }

    has(name) {
      return this._headers.has(name)
    }

    delete(name) {
      this._headers.delete(name)
    }

    forEach(callback) {
      this._headers.forEach((value, key) => callback(value, key))
    }
  }
}
