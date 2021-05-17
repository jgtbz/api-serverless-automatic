const getContext = () => {
  const [_, __, module, service, rest] = Error().stack.split('at ')[3].split('src')[1].split('\\')
  const file = rest.split('/')[1].split('.js')[0]
  const path = `src/modules/${module}/${service}/${file}`

  return {
    module,
    service,
    file,
    path
  }
}

const uniqBy = (by, values) => values.reduce((result, prop) => {
  const exists = result.some(item => item[by] === prop[by])

  if (exists) {
    return result
  }

  return [
    ...result,
    prop
  ]
}, [])

const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()

const capitalizeKebabCase = (value) => value.split('-').map(capitalize).join('')

export {
  getContext,
  uniqBy,
  capitalize,
  capitalizeKebabCase
}
