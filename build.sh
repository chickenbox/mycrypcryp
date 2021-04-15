#! /bin/bash

cd ./ts
tsc-plus

cd ../
uglifyjs -c -m -o ./html/script/all.min.js ./build/all.js
