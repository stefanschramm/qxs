# qxs - QuickXS

qxs is a command line utility that provides access to [trovu.net](https://trovu.net/)'s shortcut database.

## Installation

```
sudo npm install -g @stefanschramm/qxs
```

## Usage (Examples)

```
qxs w Berlin
qxs en.w Berlin
qxs bvg Alexanderplatz, Hermannplatz
qxs yt kitten
```

## Uninstalling qxs

```
sudo npm uninstall -g @stefanschramm/qxs
```

## Installation (development)

```
git clone https://github.com/stefanschramm/qxs.git
cd qxs
npm ci # install dependencies
npm run build # call TypeScript compiler
sudo npm install -g . # install command globally
```
