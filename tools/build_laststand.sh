#!/bin/zsh
# Exports Last Stand (Godot project) to the web and copies it into www/laststand/.
#   tools/build_laststand.sh [path to cuetip-last-stand]
set -e
LS=${1:-/Volumes/CuetipDev/cuetip-last-stand}
GODOT=/Volumes/CuetipDev/tools/godot/Godot.app/Contents/MacOS/Godot
HERE=${0:A:h}/..
rm -rf $LS/export/web && mkdir -p $LS/export/web
$GODOT --headless --path $LS --export-release "Web" $LS/export/web/index.html
rm -rf $HERE/www/laststand && cp -R $LS/export/web $HERE/www/laststand
echo "Last Stand web build copied to www/laststand ($(du -sh $HERE/www/laststand | cut -f1))"
