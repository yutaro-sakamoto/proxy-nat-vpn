import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as logs from "aws-cdk-lib/aws-logs";

export interface ProxyNatVpnProps {
  /**
   * Server certificate ARN for Client VPN
   */
  clientVpnServerCertificateArn: string;

  /**
   * Client certificate ARN for Client VPN
   */
  clientVpnClientCertificateArn: string;

  /**
   * Allocation ID of an Elastic IP to use for the NAT Gateway
   * If not provided, a new Elastic IP will be created automatically
   * @default - A new Elastic IP is created
   */
  eipAllocationId?: string;
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
    const {
      clientVpnServerCertificateArn,
      clientVpnClientCertificateArn,
      eipAllocationId,
    } = props;

    // 指定されたEIP allocation IDがある場合は、それを使用する
    const natGatewayProvider = eipAllocationId
      ? ec2.NatProvider.gateway({
          eipAllocationIds: [eipAllocationId],
        })
      : ec2.NatProvider.gateway(); // デフォルト動作: 自動的に新しいEIPを作成

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
      natGatewayProvider: natGatewayProvider,
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

    // Add Vpc FlowLogs
    const vpcFlowLogGroup = new logs.LogGroup(this, "VpcFlowLogGroup", {
      retention: logs.RetentionDays.ONE_DAY,
    });

    const vpcFlowLogRole = new iam.Role(this, "VpcFlowLogRole", {
      assumedBy: new iam.ServicePrincipal("vpc-flow-logs.amazonaws.com"),
    });

    new ec2.FlowLog(this, "VpcFlowLog", {
      resourceType: ec2.FlowLogResourceType.fromVpc(this.vpc),
      trafficType: ec2.FlowLogTrafficType.REJECT,
      destination: ec2.FlowLogDestination.toCloudWatchLogs(
        vpcFlowLogGroup,
        vpcFlowLogRole,
      ),
    });
  }
}
