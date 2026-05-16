#![cfg(test)]

use super::*;
use soroban_sdk::token::{Client as TokenClient, StellarAssetClient};
use soroban_sdk::{testutils::Address as _, Address, Env};

// Helper function to securely mock a Stellar token in our test environment
fn create_token<'a>(env: &Env, admin: &Address) -> (TokenClient<'a>, StellarAssetClient<'a>) {
    let contract_address = env.register_stellar_asset_contract_v2(admin.clone());
    (
        TokenClient::new(env, &contract_address),
        StellarAssetClient::new(env, &contract_address),
    )
}

#[test]
fn test_complete_loot_vault_workflow() {
    let env = Env::default();
    env.mock_all_auths(); // Bypasses cryptographic signatures for testing

    // 1. Setup Identities
    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    // 2. Setup Token & Mint initial balance to user (Fixes the transfer error!)
    let (token, token_admin) = create_token(&env, &admin);
    token_admin.mint(&user, &1000);

    // 3. Register our Vault Contract
    let contract_id = env.register(None, LootVault);
    let vault_client = LootVaultClient::new(&env, &contract_id);

    // 4. Initialize the Vault with the Admin (Fixes the non-existing instance error!)
    vault_client.init(&admin);

    // 5. User Deposits 500 tokens
    vault_client.deposit(&user, &token.address, &500);

    // 6. Admin Generates Mock Yield
    vault_client.mock_generate_yield(&250);
    assert_eq!(vault_client.get_loot_pool(), 250);

    // 7. Admin Draws Winner
    let winner = vault_client.draw_winner();

    // Since 'user' is the only one who deposited, they MUST mathematically be the winner
    assert_eq!(winner, user);
}
