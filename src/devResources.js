const resources = [
  { name: "dev-center", url: "https://developer.genesys.cloud" },
  { name: "dev-forum", url: "https://developer.genesys.cloud/forum" },
  {
    name: "dev-tools",
    url: "https://developer.genesys.cloud/developer-tools",
  },
  { name: "apis", url: "https://developer.genesys.cloud/api" },
  { name: "blueprints", url: "https://developer.genesys.cloud/blueprints" },
];

const environments = [
  { id: "US East (Virginia)", value: "mypurecloud.com" },
  { id: "US West (Oregon)", value: "usw2.pure.cloud" },
  { id: "Canada (Central)", value: "cac1.pure.cloud" },
  { id: "Europe (Ireland)", value: "mypurecloud.ie" },
  { id: "Europe (London)", value: "euw2.pure.cloud" },
  { id: "Europe (Frankfurt)", value: "mypurecloud.de" },
  { id: "Asia Pacific (Mumbai)", value: "aps1.pure.cloud" },
  { id: "Asia Pacific (Tokyo)", value: "mypurecloud.jp" },
  { id: "Asia Pacific (Seoul)", value: "apne2.pure.cloud" },
  { id: "Asia Pacific (Sydney)", value: "mypurecloud.com.au" },
];

module.exports.resources = resources;

module.exports.environments = environments;
