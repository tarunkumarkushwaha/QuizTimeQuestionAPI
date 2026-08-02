const axios = require("axios");
const { UAParser } = require("ua-parser-js");
const VisitorLog = require("../models/VisitorLog");

const visitorTracker = async (req, res, next) => {
  try {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      req.ip;

    const parser = new UAParser(req.body.userAgent || "");
    const ua = parser.getResult();

    let geo = {};

    try {
      const { data } = await axios.get(
        `http://ip-api.com/json/${ip}?fields=status,country,regionName,city,isp`
      );

      if (data.status === "success") {
        geo = data;
      }
    } catch (err) {
      console.log("Geo lookup failed");
    }

    await VisitorLog.create({
      username: req.body.username || null,

      // If you send email from frontend
      email: req.body.email || null,

      ip,

      country: geo.country || null,
      state: geo.regionName || null,
      city: geo.city || null,
      isp: geo.isp || null,

      browser: ua.browser.name || null,
      browserVersion: ua.browser.version || null,

      os: ua.os.name || null,
      osVersion: ua.os.version || null,

      device: ua.device.type || "Desktop",

      page: req.body.page || req.originalUrl,

      screen: req.body.screen,

      language: req.body.language,

      timezone: req.body.timezone,

      referrer: req.body.referrer,

      userAgent: req.body.userAgent,

      visitTime: new Date(),
    });
  } catch (err) {
    console.error("Visitor Tracker:", err.message);
  }

  next();
};

module.exports = visitorTracker