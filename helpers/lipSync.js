const axios = require("axios");
var qs = require("qs");
const { ProjectModel } = require("../models/Project")
const { UserModel } = require("../models/User")
const mongoose = require("mongoose")

const getTokenFromLipSync = async () => {
  try {
    console.log("token")
    return new Promise((resolve, reject) => {
      var data = qs.stringify({
        username: "sample@lipsync.com",
        password: "sample123",
      });

      var config = {
        method: "post",
        url: process.env.AUTH_URL? process.env.AUTH_URL : "http://canvas.iiit.ac.in/lipsyncuc3/auth/login",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: data,
      };
      axios(config)
        .then((response) => {
          if (response.data){
            resolve(response.data.access_token);
            }
          else reject("Error in getting lipsync token - " + err);
        })
        .catch((err) => {
          reject("Error in getting lipsync token - " + err);
        });
    });
  } catch (err) {
    throw new Error(err);
  }
};

const lipsync = async (audioFileURL, videoFileURL, id, userId) => {
  try {
    console.log("model")
    let token = await getTokenFromLipSync();
    console.log(token)
    let axiosHeader = {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };

    let jsonBody = {
      audio: audioFileURL,
      video: videoFileURL,
      pads: "0 5 0 0",
      resize_factor: 1,
      temporal_window_smoothing: 5,
      mb: 1,
      gb: 1,
    };
    console.log("before")
    let responseUrl = await axios.post(process.env.MODEL_URL, jsonBody, axiosHeader)
    console.log("before-2")
    await ProjectModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(id) }, { resultUrl: responseUrl.data.url })
    // getAudioDurationInSeconds(responseUrl.data.url).then((duration) => {
    //   UserModel.findById(userId, (err, user) => {
    //     user.usedSeconds += duration
    //     UserModel.save((err, success) => {
    //       if (err) {
    //         return handleError(err)
    //       }
    //     })
    //   })
    // });
    return responseUrl
  } catch (err) {
    console.log("======>" + err)
    logger.error("Error in LipSync call - " + err);
    throw new Error("Error in LipSync call - " + err);
  }
};

getTokenFromLipSync()

module.exports = { lipsync }
