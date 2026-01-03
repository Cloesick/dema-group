module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'jest --findRelatedTests --passWithNoTests'
  ],
  '*.{css,scss}': ['stylelint --fix', 'prettier --write'],
  '*.{json,md}': ['prettier --write']
};
