const path = require("path");

module.exports = {
  // Append the default value with md extensions
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  reactStrictMode: true,
  images: {
    loader: 'akamai',
    path: '',
  },
};
