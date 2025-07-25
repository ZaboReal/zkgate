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
