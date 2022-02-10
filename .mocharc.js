"use strict";

process.env.TS_NODE_PROJECT = "./tsconfig.json";

// See https://mochajs.org/#command-line-usage.
module.exports = {
    require: ["ts-node/register"],
    ui: "tdd",
    spec: ["source/ts/Test/**/*.ts"],
};
