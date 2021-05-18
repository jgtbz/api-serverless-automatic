const sort = () => (req) => {
  const { query } = req
  const { sortBy = '_id', sortOrder = -1 } = query

  req.sort = {
    by: sortBy,
    order: sortOrder
  }

  return req
}

export default sort
