import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { ProxyNatVpn } from "../src/proxy-nat-vpn";

describe("ProxyNatVpn", () => {
  test("VPC is created with public and private subnets", () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack");

    new ProxyNatVpn(stack, "MyProxyNatVpn", {
      clientVpnServerCertificateArn:
        "arn:aws:acm:region:account:certificate/server-cert-id",
      clientVpnClientCertificateArn:
        "arn:aws:acm:region:account:certificate/client-cert-id",
    });

    const template = Template.fromStack(stack);

    // Verify the VPC is created
    template.resourceCountIs("AWS::EC2::VPC", 1);

    // Verify the public and private subnets
    template.resourceCountIs("AWS::EC2::Subnet", 2);
  });

  test("Client VPN Endpoint is created with correct properties", () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack");

    new ProxyNatVpn(stack, "MyProxyNatVpn", {
      clientVpnServerCertificateArn:
        "arn:aws:acm:region:account:certificate/server-cert-id",
      clientVpnClientCertificateArn:
        "arn:aws:acm:region:account:certificate/client-cert-id",
    });

    const template = Template.fromStack(stack);

    // Verify the Client VPN Endpoint is created
    template.resourceCountIs("AWS::EC2::ClientVpnEndpoint", 1);

    // Verify the properties of the Client VPN Endpoint
    template.hasResourceProperties("AWS::EC2::ClientVpnEndpoint", {
      ServerCertificateArn:
        "arn:aws:acm:region:account:certificate/server-cert-id",
      AuthenticationOptions: [
        {
          MutualAuthentication: {
            ClientRootCertificateChainArn:
              "arn:aws:acm:region:account:certificate/client-cert-id",
          },
          Type: "certificate-authentication",
        },
      ],
      SplitTunnel: true,
    });
  });

  test("Throws error when Client VPN certificates are missing", () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack");

    expect(() => {
      new ProxyNatVpn(stack, "MyProxyNatVpn", {
        clientVpnServerCertificateArn: "",
        clientVpnClientCertificateArn: "",
      });
    }).toThrow();
  });
});
