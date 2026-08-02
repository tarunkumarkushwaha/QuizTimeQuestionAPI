const mongoose = require("mongoose");

const visitorLogSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      default: null,
    },

    email: {
      type: String,
      default: null,
    },

    ip: {
      type: String,
      default: null,
    },

    country: {
      type: String,
      default: null,
    },

    state: {
      type: String,
      default: null,
    },

    city: {
      type: String,
      default: null,
    },

    isp: {
      type: String,
      default: null,
    },

    browser: {
      type: String,
      default: null,
    },

    browserVersion: {
      type: String,
      default: null,
    },

    os: {
      type: String,
      default: null,
    },

    osVersion: {
      type: String,
      default: null,
    },

    device: {
      type: String,
      default: "Desktop",
    },

    page: {
      type: String,
      default: null,
    },

    screen: {
      type: String,
      default: null,
    },

    language: {
      type: String,
      default: null,
    },

    timezone: {
      type: String,
      default: null,
    },

    referrer: {
      type: String,
      default: null,
    },

    userAgent: {
      type: String,
      default: null,
    },

    visitTime: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("VisitorLog", visitorLogSchema);