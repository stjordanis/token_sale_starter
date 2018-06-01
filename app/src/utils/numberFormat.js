import env from './env'

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  minimumFractionDigits: env.DECIMALS
})
