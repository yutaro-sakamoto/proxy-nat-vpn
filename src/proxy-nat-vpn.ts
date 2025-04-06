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
          name: "Public",
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: "Private",
          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
          cidrMask: 24,
        },
      ],
      natGateways: 1,
    });

    // Associate with all private subnets
    const privateSubnet = this.vpc.selectSubnets({
      subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
    }).subnets[0];

    this.clientVpnEndpoint = new ec2.ClientVpnEndpoint(
      this,
      "ClientVpnEndpoint",
      {
        cidr: privateSubnet.ipv4CidrBlock,
        serverCertificateArn: clientVpnServerCertificateArn,
        clientCertificateArn: clientVpnClientCertificateArn,
        vpc: this.vpc,
        authorizeAllUsersToVpcCidr: true,
        splitTunnel: true,
      },
    );

    new ec2.CfnClientVpnTargetNetworkAssociation(
      this,
      "VpnNetworkAssociation",
      {
        clientVpnEndpointId: this.clientVpnEndpoint.endpointId,
        subnetId: privateSubnet.subnetId,
      },
    );
  }
}
