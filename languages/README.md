# Message Extraction

npm run extract -- 'src/**/*.ts*' --ignore='**/*.d.ts' --out-file languages/en.json --id-interpolation-pattern '[sha512:contenthash:base64:6]'
# Message Distribution

npm run extract -- 'src/**/*.ts*' --ignore='**/*.d.ts' --out-file languages/en.json --id-interpolation-pattern '[sha512:contenthash:base64:6]'
npm run compile -- languages/*.json --ast --out-file src/languages/*.json
