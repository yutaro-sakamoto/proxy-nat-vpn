import { awscdk } from 'projen';
import { YamlFile } from 'projen';

const releaseBranch = 'release';

const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Yutaro Sakamoto',
  authorAddress: 'mail@yutaro-sakamoto.com',
  cdkVersion: '2.1.0',
  defaultReleaseBranch: releaseBranch,
  jsiiVersion: '~5.8.0',
  name: 'proxy-nat-vpn',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/mail/proxy-nat-vpn.git',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});

project.gitignore.addPatterns('cdk.out')

new YamlFile(project, '.github/workflows/push.yml', {
  obj: {
    name: 'push',
    on: {
      push: {
        'branches-ignore': [releaseBranch],
      },
    },
    concurrency: {
      'group': '${{ github.workflow }}-${{ github.ref }}',
      'cancel-in-progress': true,
    },
    permissions: {
      'contents': 'read',
    },
    jobs: {
      'check-workflows': {
        permissions: {
          contents: 'read',
        },
        uses: './.github/workflows/check-workflows.yml',
      },
      'test': {
        needs: 'check-workflows',
        secrets: 'inherit',
        uses: './.github/workflows/test.yml',
        with: {
          environment: 'dev',
        },
      },
    },
  },
});

new YamlFile(project, '.github/workflows/test.yml', {
  obj: {
    name: 'test',
    on: {
      workflow_call: {},
    },
    jobs: {
      test: {
        'runs-on': 'ubuntu-latest',
        'steps': [
          {
            name: 'Checkout',
            uses: 'actions/checkout@v4',
          },
          {
            uses: 'actions/setup-node@v4',
            with: {
              'node-version': '22',
              'cache': 'yarn',
              'cache-dependency-path': 'yarn.lock',
            },
          },
          {
            run: 'yarn install',
          },
          {
            name: 'Check format by Prettier',
            run: 'npx prettier src test example --check',
          },
          {
            name: 'Check by ESLint',
            run: 'yarn eslint',
          },
          {
            name: 'Tests',
            run: 'yarn test',
          },
          {
            name: 'Check docs',
            run: 'npx typedoc --validation src/*.ts',
          },
        ],
      },
    },
  },
});


project.synth();