#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ProxyNatVpnStack } from "./proxy-nat-vpn-stack";

const app = new cdk.App();
new ProxyNatVpnStack(app, "ProxyNatVpnStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
