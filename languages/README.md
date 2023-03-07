# Message Extraction

npm run extract -- 'src/**/_.ts_' --ignore='**/\*.d.ts' --out-file languages/en.json --id-interpolation-pattern '[sha512:contenthash:base64:6]' --format crowdin

# Message Distribution

npm run extract -- 'src/**/_.ts_' --ignore='**/\*.d.ts' --out-file languages/en.json --id-interpolation-pattern '[sha512:contenthash:base64:6]'
npm run compile -- languages/en.json --ast --out-file src/languages/en.json
