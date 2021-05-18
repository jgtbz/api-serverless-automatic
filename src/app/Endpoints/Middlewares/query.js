const query = () => (req) => {
  const { query } = req
  const { page, limit, sortBy, sortOrder, ...safeQuery } = query

  req.query = safeQuery

  return req
}

export default query
