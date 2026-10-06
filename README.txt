# Plain HTML Filebase Download Website

This is the frontend in plain HTML, CSS and JavaScript.

Files:
  index.html
  style.css
  script.js

The frontend expects two backend endpoints:

GET /api/files
Returns:
{
  "files": [
    {
      "key": "folder/file.zip",
      "name": "file.zip",
      "size": 123456,
      "lastModified": "2026-10-06T00:00:00.000Z"
    }
  ]
}

GET /api/download?key=folder%2Ffile.zip
Returns:
{
  "url": "https://temporary-signed-file-url"
}

The backend is where your Filebase S3 credentials belong.

NEVER put the Filebase secret key or access key in index.html or script.js.
