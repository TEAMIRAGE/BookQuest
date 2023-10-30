const { spawn } = require("child_process");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });
const port = process.env.PORT;
const ip = process.env.IP;

module.exports.Ai_Powered_system_post = async (req, res) => {
  try {
    const id = req.params.id;
  } catch (err) {
    console.log(err);
  }
};
