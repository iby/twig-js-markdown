"use strict";

process.env.TS_NODE_PROJECT = "./tsconfig.json";

// See https://mochajs.org/#command-line-usage.
module.exports = {
    "node-option": ["no-experimental-strip-types"],
    require: ["ts-node/register"],
    ui: "tdd",
    spec: ["source/ts/Test/**/*.ts"],
};
