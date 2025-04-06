#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ProxyNatVpnStack } from "./proxy-nat-vpn-stack";
import * as dotenv from "dotenv";

dotenv.config();

const app = new cdk.App();

const serverCertArn = process.env.SERVER_CERT_ARN;
const clientCertArn = process.env.CLIENT_CERT_ARN;

if (!serverCertArn || !clientCertArn) {
  throw new Error(
    "SERVER_CERT_ARN and CLIENT_CERT_ARN environment variables must be provided",
  );
}

new ProxyNatVpnStack(app, "ProxyNatVpnStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  serverCertArn,
  clientCertArn,
});
