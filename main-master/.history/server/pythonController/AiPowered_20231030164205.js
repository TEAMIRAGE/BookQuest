const { spawn } = require("child_process");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });
const port = process.env.PORT;
const ip = process.env.IP;

module.exports.Ai_Powered_system_post = async (req, res) => {
  try {
    const id = req.params.id;

    const response = await axios.get(
      `${ip}${port}/api/all_books_details?id=${id}`
    );

    const details = response.data;

    const pythonAddress = "server/pythonController/bookchat.py";
  } catch (err) {
    console.log(err);
  }
};
