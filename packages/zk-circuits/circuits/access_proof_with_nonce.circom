pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

template AccessProof() {
    signal input secret;
    signal input org_id;
    signal input nonce;

    signal output nullifier;

    component hash = Poseidon(3);
    hash.inputs[0] <== secret;
    hash.inputs[1] <== org_id;
    hash.inputs[2] <== nonce;

    nullifier <== hash.out;
}

component main = AccessProof();