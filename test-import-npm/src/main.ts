import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ProxyNatVpn } from 'proxy-nat-vpn';
import * as dotenv from 'dotenv';

dotenv.config();

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const certificateArn = process.env.CERTIFICATE_ARN || 'dummy_arn';
    new ProxyNatVpn(this, 'ProxyNatVpnTestStack', {
      clientVpnServerCertificateArn: certificateArn,
      clientVpnClientCertificateArn: certificateArn,
    });
  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new MyStack(app, 'npm-test-dev', { env: devEnv });
// new MyStack(app, 'npm-test-prod', { env: prodEnv });

app.synth();