import { icoStates } from 'utils/data'

export async function icoMap(res) {
  let label
  icoStates.map(async (e) => {
    if (e.value === res.toNumber()) {
      label = e.label
    }
  })
  return label
}
