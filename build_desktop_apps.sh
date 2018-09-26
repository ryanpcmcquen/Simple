mkdir tmp/
cd tmp/
wget -N https://github.com/Gisto/nwjs-shell-builder/archive/master.zip
unzip -o master.zip

nwjs-shell-builder-master/nwjs-build.sh  \
     --src=$HOME/Simple \
     --output-dir=$HOME/Simple/builds \
     --name=Simple \
     --win-icon=$HOME/Simple/assets/img/Simple_icon.png \
     --osx-icon=$HOME/Simple/assets/img/Simple_icon.png \
     --CFBundleIdentifier=com.McQuen.Simple \
     --target="0 1 2 3 4 5" \
     --version="3.5.0" \
     --libudev \
     --nw=0.33.4 \
     --build
