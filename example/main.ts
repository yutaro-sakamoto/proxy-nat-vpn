#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ProxyNatVpnStack } from "./proxy-nat-vpn-stack";
import { AwsSolutionsChecks } from "cdk-nag";
import { Aspects } from "aws-cdk-lib";

const app = new cdk.App();

// Add AWS Solution Checks
Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));

const serverCertArn = process.env.SERVER_CERT_ARN;
const clientCertArn = process.env.CLIENT_CERT_ARN;
// Retrieve the allocation ID of a pre-prepared EIP from environment variables
const eipAllocationId = process.env.EIP_ALLOCATION_ID;

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
  eipAllocationId, // Pass the allocation ID of a pre-prepared EIP (if not specified, a new EIP will be created automatically)
});
