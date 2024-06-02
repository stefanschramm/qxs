# qxs

qxs is a command line utility that provides quick access to [trovu.net](https://trovu.net/)'s shortcut database.

It tries to re-implement most of Trovu's functionality, however, some more sophisticated features are currently missing.

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

To get a list of available command line options call

```
qxs --help
```

## Configuration

To configure namespaces, language and country, create a `~/.qxs.yml` with the following content (example):

```
namespaces:
- o
- de
- .de
language: de
country: de
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

