const getContext = () => {
  const trace = Error().stack.split('at ')[3].split('src')[1]
  const [_, __, module, service, a, b] = trace.split('\\')
  const file = service === 'endpoints'
    ? b.split('/')[1].split('.js')[0]
    : a.split('/')[1].split('.js')[0]
  const version = service === 'endpoints'
   ? a
   : undefined
  const path = service === 'endpoints'
    ? `src/modules/${module}/${service}/${version}/${file}`
    : `src/modules/${module}/${service}/${file}`

  return {
    module,
    version,
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

const pipeAsync = (...fns) => (...args) => fns.reduce((p, f) => p.then(f), Promise.resolve(...args))

export {
  getContext,
  uniqBy,
  capitalize,
  capitalizeKebabCase,
  pipeAsync
}
