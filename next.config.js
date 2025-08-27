const path = require("path");

module.exports = {
  output: 'export',
  // Append the default value with md extensions
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  reactStrictMode: true,
  images: {
    loader: 'akamai',
    path: '',
  },
  webpack: (config) => {
      config.resolve.alias = {
      ...(config.resolve.alias || {}),
      danfojs: path.resolve(
        __dirname,
        "node_modules/danfojs/dist/danfojs-browser/src"
      ),
    };

    return config;
  }
};
