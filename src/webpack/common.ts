interface Config {
  [key: string]: string | object | any;
}

const config: Config = {
  alias: {
    "@redux": "src/redux",
    "@components": "src/components",
    "@common": "src/common",
    "@app": "src/app",
    "@routers": "src/routers",
    "@graphql": "src/graphql",
    "@config": "config",
    "@socket": "src/socket",
  },
  localIdentName: "[local]--[hash:base64:8]",
};

export default config;
