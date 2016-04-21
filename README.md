```
cordova create find com.hcp.find Find
cd find
cordova platform add android
cordova plugin add https://github.com/schollz/cordova-plugin-wifi.git
cordova plugin add cordova-plugin-whitelist
cordova plugin add https://github.com/schollz/cordova-plugin-background-mode.git
cordova plugin add cordova-plugin-dialogs


cp ../appIcon.png platforms/android/res/drawable-hdpi/icon.png
cp ../appIcon.png platforms/android/res/drawable-mdpi/icon.png
cp ../appIcon.png platforms/android/res/drawable-ldpi/icon.png
cp ../appIcon.png platforms/android/res/drawable-xhdpi/icon.png

cp ../index.html platforms/android/assets/www/ && cp ../jquery-1.9.js platforms/android/assets/www/ && cp ../main.js platforms/android/assets/www/ && ./platforms/android/cordova/run --device

./platforms/android/cordova/build
./platforms/android/cordova/run --device
cp /home/phi/Downloads/cord/find/platforms/android/build/outputs/apk/android-debug.apk ~/Dropbox/android-debug.apk
```



JAVA_HOME=~/java/jdk1.8.0_77
PATH=$PATH:~/java/jdk1.8.0_77/bin
export JAVA_HOME
export PATH


cordova create findmobile com.hcp.find FindMobile
cd findmobile
cordova platform add android

cordova plugin add https://github.com/schollz/cordova-plugin-wifi.git
cordova plugin add cordova-plugin-whitelist
cordova plugin add https://github.com/schollz/cordova-plugin-background-mode.git
cordova plugin add cordova-plugin-dialogs

# CHANGE platforms/android/project.properties

cordova plugin add https://github.com/schollz/cordova-plugin-wifi.git
cordova plugin add cordova-plugin-whitelist
cordova plugin add https://github.com/schollz/cordova-plugin-background-mode.git
cordova plugin add cordova-plugin-dialogs

# COPY DIRECTORY AND FILES

./platforms/android/cordova/build
./platforms/android/cordova/run --device

