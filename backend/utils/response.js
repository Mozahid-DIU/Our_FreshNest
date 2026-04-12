function success(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

function error(res, msg, status = 400) {
  return res.status(status).json({ success: false, error: msg });
}

module.exports = { success, error };