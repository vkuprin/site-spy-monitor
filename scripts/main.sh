PROJECT_DIR=".."
VERSION_FILES=""
VERSION_FIELD="version"

read_ver() {
    grep "\"$VERSION_FIELD\"" "$PROJECT_DIR/$VERSION_FILE" | sed 's/.*: *"\(.*\)".*/\1/'
}

write_ver() {
    local new_version="$1"
    local file="$PROJECT_DIR/$VERSION_FILE"
    sed "s/\"$VERSION_FIELD\" *: *\".*\",/\"$VERSION_FIELD\": \"$new_version\",/" "$file" > "$file.new"
    mv "$file.new" "$file"
}

inc_ver() {
    local current_version="$1"
    local value=$(echo "$current_version" | sed "s/.*[^0-9]\([0-9]*\)/\1/")
    local new_value=$((value + 1))
    echo "$current_version" | sed "s/\(.*[^0-9]\)[0-9]*$/\1$new_value/"
}

set_ver() {
    write_ver "$1"
    git commit -am "Change version to $1" --no-verify
    git tag "build-$1"
}

bump_ver() {
    local ver=$(read_ver)
    ver=$(inc_ver "$ver")
    set_ver "$ver"
    git push
    git push --tags
}

main() {
    bump_ver
#    pnpm build
#
#    git add .
#    git commit -m "build: increase version number"
}

main