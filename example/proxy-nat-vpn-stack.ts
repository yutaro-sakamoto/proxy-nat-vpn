import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { ProxyNatVpn } from "../src/proxy-nat-vpn";

export class ProxyNatVpnStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ACMの証明書ARNを指定（実際のARNに置き換える必要があります）
    const serverCertArn = this.node.tryGetContext("serverCertArn");
    const clientCertArn = this.node.tryGetContext("clientCertArn");

    if (!serverCertArn || !clientCertArn) {
      throw new Error(
        "serverCertArn and clientCertArn must be provided via context",
      );
    }

    // ProxyNatVpn Constructをインスタンス化
    new ProxyNatVpn(this, "ProxyNatVpn", {
      clientVpnServerCertificateArn: serverCertArn,
      clientVpnClientCertificateArn: clientCertArn,
    });
  }
}
