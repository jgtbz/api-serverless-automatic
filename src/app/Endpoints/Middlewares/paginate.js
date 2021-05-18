const paginate = () => (req) => {
  const { query } = req
  const { page = 1, limit = 10 } = query

  req.paginate = {
    page,
    limit: limit > 50 ? 10 : limit
  }

  return req
}

export default paginate
