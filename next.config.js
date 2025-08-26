const path = require("path");

/** @type {import('next').NextConfig} */
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
    // If you use `MDXProvider`, uncomment the following line.
    providerImportSource: "@mdx-js/react",
  },
})

const nextConfig = {
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
}

module.exports = withMDX(nextConfig)
