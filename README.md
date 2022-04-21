# drastic-dams

## LDP Preparation

The DAMS UI expects certain folders to exist on the LDP server. So we have to create them.

```
curl -X POST \
     -H "Link: <http://www.w3.org/ns/ldp#BasicContainer>; rel=\"type\"" \
     -H "Slug: submissions" \
     http://localhost:8080
```

## Project setup
```
cd app
npm install
```

### Compiles and hot-reloads for development
```
cd app
env $(cat test.env | xargs) npm run serve
```

### Compiles and minifies for production
```
cd app
npm run build
```

### Lints and fixes files
```
cd app
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
