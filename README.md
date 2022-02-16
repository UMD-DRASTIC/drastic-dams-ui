# drastic-dams

## LDP Preparation

The DAMS UI expects certain folders to exist on startup. So we have to create them.

```
curl -X POST \
     -H "Link: <http://www.w3.org/ns/ldp#BasicContainer>; rel=\"type\"" \
     -H "Slug: submissions" \
     http://localhost:8080
```

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
