# This is a script that runs on npm install postinstall phase.
# It contains all prerequisites required to use the build system.

./node_modules/.bin/bower install --allow-root

# Godep is required by the project. Install it in the tools directory.
GOPATH=`pwd`/.tools/go go get github.com/tools/godep
