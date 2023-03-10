const ApiError = require("../api/ApiError");
const ApiKey = require("../models/api.model");

class ApiKeyService {
  async updateApiKey(key) {
    try {
      const currentApiKey = await ApiKey.findOne({ where: { id: 1 } });
      if (!currentApiKey) await ApiKey.create({ key });
      else {
        await currentApiKey.update({ key });
        await currentApiKey.save();
      }
      return;
    } catch (error) {
      throw ApiError.BadRequest(`ApiKeyService: updateApiKey: ${error.message}`);
    }
  }

  async getApiKey() {
    try {
      return await ApiKey.findOne({ where: { id: 1 } });
    } catch (error) {
      throw ApiError.BadRequest(`ApiKeyService: getApiKey: ${error.message}`);
    }
  }
}

module.exports = new ApiKeyService();
