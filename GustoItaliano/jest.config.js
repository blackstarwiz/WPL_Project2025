/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],   // Alleen tests/ map
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  transform: {
    '^.+\\.ts$': 'ts-jest',     // Transform TypeScript bestanden
  },
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1' // Optioneel: alias voor imports uit src/
  },
};
