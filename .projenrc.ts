import { awscdk } from 'projen';
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Yutaro Sakamoto',
  authorAddress: 'mail@yutaro-sakamoto.com',
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'release',
  jsiiVersion: '~5.8.0',
  name: 'proxy-nat-vpn',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/mail/proxy-nat-vpn.git',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();