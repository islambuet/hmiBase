# Project starting steps
    npm init --y 
    npm install --save-dev electron
    npm install ejs-electron
    npm install jquery --save #need to use jQuery. Manual jQuery does not work
    npm i electron-store
    npm install log4js
    npm install highcharts --save
# how to build exe
# tutorial link
    https://www.youtube.com/watch?v=N-3s3ezYd8g&t=31315s
# Packager source
    https://github.com/electron/electron-packager
# install Package
    npm install --save-dev electron-packager
    or 
    npm install electron-packager -g
# build command for current os
    npx electron-packager .
# for database timer
    SET GLOBAL event_scheduler = ON;
# https://www.npmjs.com/package/electron-shutdown-command?activeTab=readme
    npm install --save electron-shutdown-command