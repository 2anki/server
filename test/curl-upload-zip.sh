ZIP_FILE_PATH=$1

curl \
  -F "pkg=@${ZIP_FILE_PATH}" \
  http://localhost:9000/.netlify/functions/upload