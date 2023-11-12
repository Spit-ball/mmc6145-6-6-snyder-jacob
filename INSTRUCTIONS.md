# Module 6 Assignment: Complete the Full-stack Book Search Application

(**NOTE:** View a rendered version of this file in VS Code with `ctrl-shift-v` or `cmd-shift-v`)

&nbsp;
## Introduction

For this assignment, you'll once again be adding features to the book search application from previous assignments. This time, you'll be adding to the backend functionality of the site and integrating that functionality with the book add to and remove from favorites features.

&nbsp;
## Setup

Copy the starter files inside of `unsolved` into the root directory of your GitHub repository.

Create a `.env.local` file that is modeled after the `.env.EXAMPLE` file. It should look like:

```
IRON_PASS=this_is_my_long_32_char_crazy_password
```

Run `npm i` in the root directory of your repository (your `package.json` should be in the root directory).

Ensure that you have Docker installed and running so that you can run MongoDB locally during development.

To start developing, run `npm run dev`.

&nbsp;
## Instructions

To complete the recipe application, follow the instructions below.

In `/pages/api/auth/[action].js`, use provided functions to implement these routes:
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `POST /api/auth/signup`

In `/pages/api/book.js`, implement these routes:
  - `POST /api/book`
  - `DELETE /api/book`

In the `/pages/book/[id].jsx` component:
  - Use fetch to add and remove books.
  - Refresh the page after a successful call using `router.replace(router.asPath)`.


&nbsp;
## App Behavior

Your site should behave in the same manner as [this example site](https://booker-auth.vercel.app/).

&nbsp;
## Requirements for full credit

To receive full credit for this assignment, your program MUST:

  * Be implemented according to the above [instructions](#instructions).
  * Pass all [automated tests](#testing).
  * Be [deployed](#deployment) correctly.
  * Be [submitted](#submission) correctly. 

&nbsp;
## Testing

Automated tests are included with this assignment. To receive full credit, all automated tests must pass.

To run the tests, run:

```
npm test
```

To run the tests only once, run:

```
npm test -- run
```

&nbsp;
## Deployment

This assignment may be deployed for free with [Vercel](https://vercel.com/docs).

To deploy, make an account with Vercel and either [attach Vercel to your GitHub repository](https://vercel.com/docs/concepts/get-started/deploy#create-and-deploy-a-project) or [use the Vercel CLI](https://vercel.com/docs/cli) to [deploy](https://vercel.com/docs/cli/deploy) your site.

Vercel is pre-configured to be able to recognize and deploy NextJS websites. However, you will need to add environmental variables to your Vercel configuration as appropriate. In this application, both the `IRON_PASS` and `MONGODB_URI` variables will be necessary for the deployment to function correctly. To connect your site to MongoDB, make a free account on the [MongoDB Atlas site](https://www.mongodb.com/atlas/database). 

&nbsp;
## Submission

When submitting this assignment, please include **ALL** of the following:

  * A link to the assignment's GitHub repository.
  * A link to the deployed application.
  * A screenshot of the automated test results.

Please verify that your links are correct when submitting.

