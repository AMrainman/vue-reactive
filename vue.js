class Vue {
  constructor(options) {
    this.$options = options
    this.$vm = this

    this.observe(this.$options.data)

    new Compile(options.el, this)

    this.$options.mounted.call(this)
  }

  observe(data) {
    if (!data || !(typeof data === 'object')) return
    Object.entries(data).forEach(([key, value]) => {
      this.observe(value)
      this.defineReactive(data, key, value)
      if (data === this.$options.data) {
        this.proxyData(key)
      }
    })
  }

  defineReactive(data, key, value) {
    const dep = new Dep()
    Object.defineProperty(data, key, {
      get() {
        console.log('被get了：', value)
        Dep.target && dep.addDep(Dep.target)
        return value
      },
      set(newV) {
        value = newV
        dep.notify()
      }
    })
  }

  proxyData(key) {
    Object.defineProperty(this, key, {
      get() {
        return this.$options.data[key]
      },
      set(newV) {
        this.$options.data[key] = newV
      }
    })
  }
}

class Dep {
  constructor() {
    this.watchers = []
  }

  addDep(watcher) {
    this.watchers.push(watcher)
  }

  notify() {
    this.watchers.forEach(watcher => watcher.update())
  }
}

class Watcher {
  constructor(vm, key, cb) {
    this.vm = vm
    this.key = key
    this.cb = cb

    Dep.target = this
    this.vm[key]
    Dep.target = null
  }

  update() {
    this.cb.call(this.vm, this.vm[this.key])
  }
}

