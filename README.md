# ZK Gateway

A comprehensive Zero-Knowledge (ZK) proof system for secure access control and identity verification.

## Project Structure

This monorepo contains the following components:

### Apps
- **dashboard-ui**: Frontend dashboard for managing ZK Gateway operations
- **zk-gateway**: Core gateway server that handles ZK proof verification and access control

### Packages
- **smart-contracts**: Solidity smart contracts for on-chain verification and access control
- **zk-circuits**: Circom circuits for generating ZK proofs
- **zk-sdk**: TypeScript SDK for integrating with the ZK Gateway
- **shared**: Shared utilities and types across packages

### Infrastructure
- **db**: Database schema and migrations
- **deployment**: Docker and Terraform configurations
- **monitoring**: Grafana and Prometheus configurations
- **relayer**: Transaction relayer for gasless operations

## Features

- **Zero-Knowledge Proofs**: Privacy-preserving identity verification
- **Access Control**: Secure gatekeeping with cryptographic guarantees
- **Smart Contract Integration**: On-chain verification and access management
- **SDK Support**: Easy integration for developers
- **Dashboard**: Web interface for managing operations

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ZaboReal/zkgate.git
cd zkgate
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install package dependencies
npm run install:all
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development environment:
```bash
npm run dev
```

## Development

### Building
```bash
npm run build
```

### Testing
```bash
npm run test
```

### Linting
```bash
npm run lint
```

## Architecture

The ZK Gateway system consists of:

1. **ZK Circuits**: Circom circuits that generate proofs of identity/access
2. **Gateway Server**: Verifies proofs and manages access control
3. **Smart Contracts**: On-chain verification and access management
4. **SDK**: Client libraries for easy integration
5. **Dashboard**: Web interface for administration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Security

This project involves cryptographic operations and should be used with appropriate security considerations. Please review the security documentation before deployment.

## Support

For support and questions, please open an issue on GitHub or contact the development team. 