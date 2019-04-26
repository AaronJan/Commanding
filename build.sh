#!/bin/bash

echo "Build and publish?"
select decision in "yes" "no"; do
  if [ $decision = "no" ]; then
    echo "Bye!"
    exit 1
  fi

  echo "Clear node_modules?"
  select yn in "Yes" "No"; do
    case $yn in
      Yes) rm -rf node_modules/; npm i; break;;
      No) echo "Skipped clearing node_modules"; break;;
    esac
  done

  select version_type in "patch" "minor" "major"; do
    read -p "Creating commit and tag for a $version_type release. Press [Enter].";

    # Use npm to increment the version and capture it
    version_with_v=`npm version $version_type`

    # Quickly show changes to verify
    git diff
    read -p "Examine and correct CHANGELOG.md. [Enter] to continue"
    break
  done

  npm run build

  read -p "Ready to publish @command@$version. [Enter] to continue"
  cd ./dist/
  npm publish
  cd ../

  read -p "Ready to push to upstream. [Enter] to continue"
  git push upstream
  git push upstream --tags
done