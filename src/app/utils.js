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

export {
  getContext
}
