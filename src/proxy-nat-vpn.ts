import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export interface ProxyNatVpnProps {
  /**
   * Server certificate ARN for Client VPN
   */
  clientVpnServerCertificateArn: string;

  /**
   * Client certificate ARN for Client VPN
   */
  clientVpnClientCertificateArn: string;
}

export class ProxyNatVpn extends Construct {
  /**
   * The VPC created by this construct
   */
  public readonly vpc: ec2.Vpc;

  /**
   * The Client VPN Endpoint created by this construct (if enabled)
   */
  public readonly clientVpnEndpoint?: ec2.ClientVpnEndpoint;

  constructor(scope: Construct, id: string, props: ProxyNatVpnProps) {
    super(scope, id);

    // Default values
    const { clientVpnServerCertificateArn, clientVpnClientCertificateArn } =
      props;

    // Create VPC with public and private subnets
    this.vpc = new ec2.Vpc(this, "Vpc", {
      maxAzs: 1, // Ensure at least 2 AZs for high availability
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "PublicSubnet",
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: "PrivateSubnet",
          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
        },
      ],
      cidr: "10.0.0.0/16",
      natGateways: 1,
    });

    const privateSubnet = this.vpc.privateSubnets[0];

    this.clientVpnEndpoint = new ec2.ClientVpnEndpoint(
      this,
      "ClientVpnEndpoint",
      {
        cidr: "10.100.0.0/16",
        serverCertificateArn: clientVpnServerCertificateArn,
        clientCertificateArn: clientVpnClientCertificateArn,
        vpc: this.vpc,
        splitTunnel: true,
        dnsServers: ["10.0.0.2"],
        vpcSubnets: {
          subnets: [privateSubnet],
        },
      },
    );
  }
}
