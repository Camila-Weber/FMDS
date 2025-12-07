import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    snackbar: {
      show: false,
      message: '',
      color: 'success',
      timeout: 3000,
    },
  }),

  actions: {
    showSnackbar(type, message, timeout = 3000) {
      this.snackbar.color = type === 'error' ? 'error' : 'success'
      this.snackbar.message = message
      this.snackbar.timeout = timeout
      this.snackbar.show = true
    },
  },
})
