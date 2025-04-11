import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { ProxyNatVpn } from "../src/proxy-nat-vpn";

/**
 * Stack properties for ProxyNatVpnStack
 */
export interface ProxyNatVpnStackProps extends cdk.StackProps {
  /**
   * Server certificate ARN for Client VPN
   */
  serverCertArn: string;
  /**
   * Client certificate ARN for Client VPN
   */
  clientCertArn: string;
  /**
   * Allocation ID of an existing Elastic IP to use for NAT Gateway
   * @default - A new Elastic IP is created automatically
   */
  eipAllocationId?: string;
}

export class ProxyNatVpnStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ProxyNatVpnStackProps) {
    super(scope, id, props);

    // Instantiate the ProxyNatVpn Construct
    new ProxyNatVpn(this, "ProxyNatVpn", {
      clientVpnServerCertificateArn: props.serverCertArn,
      clientVpnClientCertificateArn: props.clientCertArn,
      eipAllocationId: props.eipAllocationId,
    });
  }
}
