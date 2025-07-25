declare module 'snarkjs' {
  export interface Groth16Proof {
    pi_a: [string, string];
    pi_b: [[string, string], [string, string]];
    pi_c: [string, string];
    protocol: string;
    curve: string;
  }

  export interface Groth16PublicSignals {
    [key: string]: string;
  }

  export interface Groth16VerificationKey {
    protocol: string;
    curve: string;
    nPublic: number;
    vk_alpha_1: [string, string, string];
    vk_beta_2: [[string, string], [string, string], [string, string]];
    vk_gamma_2: [[string, string], [string, string], [string, string]];
    vk_delta_2: [[string, string], [string, string], [string, string]];
    vk_alphabeta_12: [[[string, string], [string, string], [string, string]], [[string, string], [string, string], [string, string]]];
    IC: [string, string, string][];
  }

  export const groth16: {
    fullProve(input: any, wasmPath: string, zkeyPath: string): Promise<{
      proof: Groth16Proof;
      publicSignals: Groth16PublicSignals;
    }>;
    verify(vKey: Groth16VerificationKey, publicSignals: Groth16PublicSignals, proof: Groth16Proof): Promise<boolean>;
    prove(zkeyPath: string, witnessPath: string): Promise<{
      proof: Groth16Proof;
      publicSignals: Groth16PublicSignals;
    }>;
  };

  export const plonk: {
    fullProve(input: any, wasmPath: string, zkeyPath: string): Promise<{
      proof: any;
      publicSignals: any;
    }>;
    verify(vKey: any, publicSignals: any, proof: any): Promise<boolean>;
  };

  export const wtns: {
    calculate(input: any, wasmPath: string, witnessPath: string): Promise<void>;
  };

  export const zKey: {
    newZKey(r1csPath: string, ptauPath: string, zkeyPath: string): Promise<void>;
    exportVerificationKey(zkeyPath: string, vKeyPath: string): Promise<void>;
  };

  export const r1cs: {
    info(r1csPath: string): Promise<any>;
  };

  export const powersOfTau: {
    newAccumulator(ceremonyPath: string, ptauPath: string, power: number, logger?: any): Promise<void>;
    contribute(ptauOldPath: string, ptauNewPath: string, name: string, entropy?: string, logger?: any): Promise<void>;
    verify(ptauPath: string, logger?: any): Promise<void>;
    beacon(ptauOldPath: string, ptauNewPath: string, beaconHash: string, numIterationsExp: number, logger?: any): Promise<void>;
    preparePhase2(ptauPath: string, ptauFinalPath: string, logger?: any): Promise<void>;
  };
}
