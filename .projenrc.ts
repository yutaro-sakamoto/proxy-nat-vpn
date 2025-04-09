import { awscdk, YamlFile } from 'projen';

const releaseBranch = 'release';

const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Yutaro Sakamoto',
  authorAddress: 'mail@yutaro-sakamoto.com',
  cdkVersion: '2.1.0',
  defaultReleaseBranch: releaseBranch,
  jsiiVersion: '~5.8.0',
  name: 'proxy-nat-vpn',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/yutaro-sakamoto/proxy-nat-vpn.git',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  devDeps: ['cdk-nag@2.12.0'], /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});

project.gitignore.addPatterns('cdk.out');
project.gitignore.addPatterns('.env');
project.npmignore?.addPatterns('example');

new YamlFile(project, '.github/workflows/check-workflows.yml', {
  obj: {
    name: 'Check workflow files',
    on: 'workflow_call',
    permissions: {
      contents: 'read',
    },
    jobs: {
      build: {
        'runs-on': 'ubuntu-latest',
        'steps': [
          {
            name: 'Checkout',
            uses: 'actions/checkout@v4',
          },
          {
            name: 'Install actionlint',
            run: 'GOBIN=$(pwd) go install github.com/rhysd/actionlint/cmd/actionlint@latest',
          },
          {
            name: 'Run actionlint',
            run: 'find .github/workflows -name "*.yml" ' +
              '! -name "upgrade.yml" ' +
              '! -name "build.yml" ' +
              '! -name "pull-request-lint.yml" ' +
              '! -name "release.yml" ' +
              '! -name "upgrade-release.yml" ' +
              '-print0 | xargs -0 ./actionlint',
          },
        ],
      },
    },
  },
});


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
      contents: 'read',
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
            name: 'synth',
            run: 'npx cdk synth',
            env: {
              SERVER_CERT_ARN: 'dummy_arn',
              CLIENT_CERT_ARN: 'dummy_arn',
            },
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

// Adding deploy.yml workflow file with VPN certificate ARN environment variables
new YamlFile(project, '.github/workflows/deploy.yml', {
  obj: {
    name: 'deploy',
    on: {
      workflow_call: {},
    },
    permissions: {
      'id-token': 'write', // Needed for AWS authentication
      'contents': 'read',
    },
    jobs: {
      deploy: {
        'runs-on': 'ubuntu-latest',
        'steps': [
          {
            name: 'Checkout',
            uses: 'actions/checkout@v4',
          },
          {
            name: 'Setup Node.js',
            uses: 'actions/setup-node@v4',
            with: {
              'node-version': '22',
              'cache': 'yarn',
              'cache-dependency-path': 'yarn.lock',
            },
          },
          {
            name: 'Install dependencies',
            run: 'yarn install --frozen-lockfile',
          },
          {
            name: 'Configure AWS credentials',
            uses: 'aws-actions/configure-aws-credentials@v4',
            with: {
              'role-to-assume': '${{ secrets.AWS_ROLE_TO_ASSUME }}',
              'aws-region': '${{ secrets.AWS_REGION }}',
            },
          },
          {
            name: 'Deploy CDK stack',
            run: 'npx cdk deploy --require-approval never',
            env: {
              CDK_DEFAULT_ACCOUNT: '${{ secrets.AWS_ACCOUNT_ID }}',
              CDK_DEFAULT_REGION: '${{ secrets.AWS_REGION }}',
              SERVER_CERT_ARN: '${{ secrets.SERVER_CERT_ARN }}',
              CLIENT_CERT_ARN: '${{ secrets.CLIENT_CERT_ARN }}',
              EIP_ALLOCATION_ID: '${{ secrets.EIP_ALLOCATION_ID }}', // Optional, if not provided, a new EIP will be created
            },
          },
        ],
      },
    },
  },
});

// Adding test-deploy.yml workflow file for test-deploy branch
new YamlFile(project, '.github/workflows/test-deploy.yml', {
  obj: {
    name: 'test-deploy',
    on: {
      push: {
        branches: ['test-deploy'],
      },
    },
    concurrency: {
      'group': '${{ github.workflow }}-${{ github.ref }}',
      'cancel-in-progress': true,
    },
    permissions: {
      'contents': 'read',
      'id-token': 'write', // Needed for AWS authentication
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
      },
      'deploy': {
        needs: 'test',
        secrets: 'inherit',
        uses: './.github/workflows/deploy.yml',
      },
    },
  },
});

project.synth();