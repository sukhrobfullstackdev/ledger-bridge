# ledger-bridge

Ledger-bridge is an internal bridging library used to abstract the specific blockchain logic and dependant libraries for non-evm based chains. The intent is to provide a scalable way off adding additional blockchain support without bloating up the main application.

# Local development

```shell
cd packages/ledger-bridge-flow
yarn run build
yarn link

cd /your/path/to/phantom
yarn link "@fortmatic/ledger-bridge-flow"
```

Then you may make changes in ledger-bridge and rebuild the library
The change shall reflect in your local phantom

# Create a new package

```shell
cd packages
yarn init ledger-bridge-new-blockchain
yarn publish 
```

# publish your changes and manual publish

After changes are merged from the PR

```shell
yarn build
yarn pack
yarn publish --no-git-tag-version # since there are multiple packages in the repo, git tags will conflict with each other
```
