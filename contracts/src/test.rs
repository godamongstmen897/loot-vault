#![cfg(test)]

use super::*;
use soroban_sdk::token::{Client as TokenClient, StellarAssetClient};
use soroban_sdk::{testutils::Address as _, vec, Address, Env, String};

fn create_token<'a>(env: &Env, admin: &Address) -> (TokenClient<'a>, StellarAssetClient<'a>) {
    let contract_address = env.register_stellar_asset_contract_v2(admin.clone());
    (
        TokenClient::new(env, &contract_address.address()),
        StellarAssetClient::new(env, &contract_address.address()),
    )
}

#[test]
fn end_to_end_escrow_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);

    // Register a mock Stellar asset (token)
    let (token_client, token_admin) = create_token(&env, &admin);

    // Register MercenaryBoard contract
    let contract_id = env.register(MercenaryBoard, ());
    let client = MercenaryBoardClient::new(&env, &contract_id);

    // Create participant addresses
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);

    // Mint initial token balance to client
    let initial_balance: i128 = 10_000;
    token_admin.mint(&client_addr, &initial_balance);

    // Prepare milestones
    let m1 = Milestone {
        amount: 100i128,
        description: String::from_str(&env, "Milestone 1"),
        status: MilestoneStatus::Pending,
    };
    let m2 = Milestone {
        amount: 200i128,
        description: String::from_str(&env, "Milestone 2"),
        status: MilestoneStatus::Pending,
    };
    let milestones = vec![&env, m1, m2];

    // Create job: client transfers total bounty into contract
    let job_id = String::from_str(&env, "job-abc-1");
    let refund_timelock = 10u32;
    client.create_job(
        &job_id,
        &client_addr,
        &freelancer,
        &token_client.address,
        &milestones,
        &refund_timelock,
    );

    // Freelancer submits work for milestone 0
    client.submit_work(&job_id, &0u32, &freelancer);

    // Client approves milestone 0, releasing funds to freelancer
    client.approve_milestone(&job_id, &0u32, &client_addr);

    // Verify freelancer received milestone amount
    let freelancer_balance = token_client.balance(&freelancer);
    assert_eq!(freelancer_balance, 100i128);
}
