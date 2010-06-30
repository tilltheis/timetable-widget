#Copyright (c) 2010 Till Theis, http://www.tilltheis.de
#
#Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
#The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
#THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


# usage: ./addtranslation.sh lang mon tue wed thu fri


#!/bin/sh

dir=$1.lproj
file=localizedStrings.js

mon=`echo ${2:0:1} | tr '[:lower:]' '[:upper:]'`${2:1}
tue=`echo ${3:0:1} | tr '[:lower:]' '[:upper:]'`${3:1}
wed=`echo ${4:0:1} | tr '[:lower:]' '[:upper:]'`${4:1}
thu=`echo ${5:0:1} | tr '[:lower:]' '[:upper:]'`${5:1}
fri=`echo ${6:0:1} | tr '[:lower:]' '[:upper:]'`${6:1}

mkdir $dir

printf "var localizedStrings = {\n    'Monday': '%s',\n    'Tuesday': '%s',\n    'Wednesday': '%s',\n    'Thursday': '%s',\n    'Friday': '%s'\n};\n" $mon $tue $wed $thu $fri > $dir/$file

