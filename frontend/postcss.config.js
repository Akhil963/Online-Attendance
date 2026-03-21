module.exports = {
  plugins: {
    tailwindcss: {},
    'postcss-preset-env': {
      stage: 3,
      features: {
        'nesting-rules': true,
        'custom-properties': false,
      },
      autoprefixer: {
        flexbox: 'no-2009',
        grid: true,
      },
    },
  },
}
