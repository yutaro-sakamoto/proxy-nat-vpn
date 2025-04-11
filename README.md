# Proxy Environment with a NAT gateway and VPN

This CDK construct sets up a VPC with a NAT gateway and a client VPN endpoint.
Users can connect to internet resources through the NAT gateway and VPN.

![Architecture](./system-architecture.png)

## How to set up the environment

* Generate certificates and keys adn upload them to [ACM](https://aws.amazon.com/certificate-manager/).
  * See [AWS Client VPN documentation](https://docs.aws.amazon.com/vpn/latest/clientvpn-admin/client-auth-mutual-enable.html) for instructions on how to generate certificates and keys and upload them to ACM. 
* Deploy the stack using this construct. The following code is an example of how to use this construct.

```ts
import { ProxyNatVpn } from 'proxy-nat-vpn';

new ProxyNatVpnStack(app, "ProxyNatVpnStack", {
  env: {
    account: 'your-aws-account-id',
    region: 'your-aws-region',
  },
  // ARN of the certificate
  serverCertArn: 'arn:aws:acm:your-region:012345678901:certificate/11111111-2222-3333-4444-555555555555',
  // ARN of the certificate
  clientCertArn: 'arn:aws:acm:your-region:012345678901:certificate/11111111-2222-3333-4444-555555555555',
  // This is an optional parameter. If you set allocation id of EIP, the NAT gateway will be created with the EIP.
  // Otherwise, EIP will be allocated automatically and the NAT gateway will use it.
  eipAllocationId,
});
```

* Create the Client VPN endpoint configuration file
  * See [official documentation](https://docs.aws.amazon.com/vpn/latest/clientvpn-admin/cvpn-getting-started.html#cvpn-getting-started-config) to download the configuration file and edit the file.
* Distribute the configuration file to users.

## How to connect to the VPN

1. Download the AWS VPN client from [here](https://aws.amazon.com/vpn/client-vpn-download/).
2. See [official documentation](https://docs.aws.amazon.com/vpn/latest/clientvpn-user/connect-aws-client-vpn-connect.html) to connect to the VPN endpoint.