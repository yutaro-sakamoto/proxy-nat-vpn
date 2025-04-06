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
}

export class ProxyNatVpnStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ProxyNatVpnStackProps) {
    super(scope, id, props);

    // ProxyNatVpn Constructをインスタンス化
    new ProxyNatVpn(this, "ProxyNatVpn", {
      clientVpnServerCertificateArn: props.serverCertArn,
      clientVpnClientCertificateArn: props.clientCertArn,
    });
  }
}
