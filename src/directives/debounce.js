// Debounce directive for Vue 3
export const debounce = {
  mounted(el, binding) {
    const delay = binding.value || 300
    let timeoutId = null

    const debouncedFunction = (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(() => {
        if (binding.arg === 'input') {
          el.dispatchEvent(new Event('input', { bubbles: true }))
        } else if (binding.arg === 'change') {
          el.dispatchEvent(new Event('change', { bubbles: true }))
        }
      }, delay)
    }

    // Store the debounced function on the element
    el._debouncedFunction = debouncedFunction

    // Add event listeners
    if (binding.arg === 'input') {
      el.addEventListener('input', debouncedFunction)
    } else if (binding.arg === 'change') {
      el.addEventListener('change', debouncedFunction)
    } else {
      // Default to input event
      el.addEventListener('input', debouncedFunction)
    }
  },

  unmounted(el) {
    // Clean up event listeners
    if (el._debouncedFunction) {
      el.removeEventListener('input', el._debouncedFunction)
      el.removeEventListener('change', el._debouncedFunction)
      delete el._debouncedFunction
    }
  }
}

export default debounce 