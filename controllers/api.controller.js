const ApiError = require("../api/ApiError");
const apiService = require("../services/api.service");

class ApiController {
  async updateApiKey(req, res, next) {
    try {
      const { key } = req.query;
      console.log(key);
      await apiService.updateApiKey(key);
      return res.json("ok");
    } catch (error) {
      return next(ApiError.BadRequest(error.message));
    }
  }
}

module.exports = new ApiController();
