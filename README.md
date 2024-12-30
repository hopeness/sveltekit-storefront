# SvelteKit eCommerce Store Starter App for Majel or Vendure

![Preview](https://github.com/pevey/sveltekit-medusa-starter/assets/7490308/e2b4fa4e-eb31-4082-aba3-b1cc26044ca0)

Currently, this starter uses Braintree checkout only.  Your backend must be configured for Braintree payments.

## Creating a project

```bash
# install degit
npm install -g degit

# create a new project in my-app
degit https://github.com/pevey/sveltekit-storefront.git my-app
```

## Installing packages

```bash
cd my-app
yarn install
```

## Configuring a project

```bash
mv .env.example .env
```
- Open .env and add any required settings

- To make development a bit easier, you can change the urls in the EmailPlugin configuration options in majel-config.ts or vendure-config.ts to match the default SvelteKit dev url: http://localhost:5173:

`majel-config.ts`
```js
verifyEmailAddressUrl: 'http://localhost:5173/verify',
passwordResetUrl: 'http://localhost:5173/auth',
changeEmailAddressUrl: 'http://localhost:5173/account'
```

## Run Codegen

YOU CANNOT SKIP THIS STEP.

To generate the types from your own backend to use in developing your frontend, you need to run codegen.  The types cannot be generated against a graphql endpoint in production mode (with introspection turned off).  Introsepction must be turned on.

```bash
yarn codegen
```

This will output your types in src/lib/gql.

## Running the app

Make sure your backend is running first and that you configure the api urls in your .env file or your shell environment.

```bash
yarn dev
```
