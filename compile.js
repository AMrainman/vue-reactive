class Compile {
  constructor(el, vm) {
    this.$el = document.querySelector(el)
    this.$vm = vm

    const fragment = this.node2Fragment(this.$el)

    this.compile(fragment)

    this.$el.appendChild(fragment)
  }

  node2Fragment(el) {
    const fragment = document.createDocumentFragment()
    
    let child
    while (child = el.firstChild) {
      fragment.appendChild(child)
    }

    return fragment
  }

  compile(el) {
    Array.from(el.childNodes).forEach(node => {
      if (node.nodeType === 1) {
        this.compileElement(node)
      } else if (this.isInter(node)) {
        this.compileText(node)
      }
      node.children && this.compile(node)
    })
  }

  compileElement(node) {
    const attrs = node.attributes
    Array.from(attrs).forEach(attr => {
      if (attr.name === 'v-text') {
        this.compileVText(node, attr.value)
      } else if (attr.name === 'v-html') {
        this.compileVHtml(node, attr.value)
      } else if (attr.name === '@click') {
        this.compileClick(node, attr.value)
      } else if (attr.name === 'v-model') {
        this.compileVModel(node, attr.value)
      }
    })
  }

  compileText(node) {
    const key = RegExp.$1
    node.textContent = this.$vm[key]
    new Watcher(this.$vm, key, function(value) {
      node.textContent = value
    })
  }

  compileVText(node, key) {
    node.removeAttribute('v-text')
    node.textContent = this.$vm[key]
    new Watcher(this.$vm, key, function(value) {
      node.textContent = value
    })
  }

  compileVHtml(node, key) {
    node.removeAttribute('v-html')
    node.innerHTML = this.$vm[key]
    new Watcher(this.$vm, key, function(value) {
      node.innerHTML = value
    })
  }

  compileClick(node, key) {
    node.removeAttribute('@click')
    node.onclick = this.$vm.$options.methods[key].bind(this.$vm)
  }

  compileVModel(node, key) {
    node.removeAttribute('v-model')
    node.value = this.$vm[key]
    node.oninput = e => {
      this.$vm[key] = e.target.value
    }
    new Watcher(this.$vm, key, function(value) {
      node.value = value
    })
  }

  isInter(node) {
    return /\{\{\s*([^\s]+)\s*\}\}/.test(node.textContent)
  }
}