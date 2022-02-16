#!/bin/sh
for file in /usr/share/nginx/html/js/app.*.js;
do
  if [ ! -f $file.tmpl.js ]; then
    cp $file $file.tmpl.js
  fi
  envsubst '$VUE_APP_LDP_USERNAME$VUE_APP_LDP_PASSWORD$VUE_APP_BASE_URL$VUE_APP_LDP_URL$VUE_APP_AS_WEBSOCKET_URL' < $file.tmpl.js > $file
done
echo "Starting Nginx"
nginx -g 'daemon off;'
