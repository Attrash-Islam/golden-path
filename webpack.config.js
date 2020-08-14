module.exports = {
    entry: './src/index.js',
    output: {
      filename: 'index.js',
      libraryTarget: 'umd'
    },
    mode: 'production',
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: 'babel-loader'
        }
      ]
    }
};
