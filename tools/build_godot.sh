#!/bin/zsh
# Exports the Godot modes (platformer + Last Stand, one project) to the web and copies them into www/godot/.
#   tools/build_laststand.sh [path to cuetip-last-stand]
set -e
LS=${1:-/Volumes/CuetipDev/cuetip-last-stand}
GODOT=/Volumes/CuetipDev/tools/godot/Godot.app/Contents/MacOS/Godot
HERE=${0:A:h}/..
rm -rf $LS/export/web && mkdir -p $LS/export/web
$GODOT --headless --path $LS --export-release "Web" $LS/export/web/index.html
rm -rf $HERE/www/godot $HERE/www/laststand && cp -R $LS/export/web $HERE/www/godot
echo "Godot web build copied to www/godot ($(du -sh $HERE/www/godot | cut -f1))"
