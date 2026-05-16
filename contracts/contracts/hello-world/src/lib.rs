#![no_std]
use soroban_sdk::{contract, contractimpl, token, vec, Address, Env, Symbol, Vec};

#[contract]
pub struct LootVault;

#[contractimpl]
impl LootVault {
    /// Initialize the contract with an admin (the Quest Master)
    pub fn init(env: Env, admin: Address) {
        env.storage()
            .instance()
            .set(&Symbol::new(&env, "Admin"), &admin);
    }

    pub fn deposit(env: Env, user: Address, token: Address, amount: i128) {
        user.require_auth();
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&user, &env.current_contract_address(), &amount);

        let mut user_balance: i128 = env.storage().persistent().get(&user).unwrap_or(0);
        user_balance += amount;
        env.storage().persistent().set(&user, &user_balance);

        // Track list of participants for the draw
        let mut participants: Vec<Address> = env
            .storage()
            .persistent()
            .get(&Symbol::new(&env, "Players"))
            .unwrap_or(vec![&env]);
        if !participants.contains(&user) {
            participants.push_back(user);
            env.storage()
                .persistent()
                .set(&Symbol::new(&env, "Players"), &participants);
        }

        let pool_key = Symbol::new(&env, "TotalPool");
        let mut total_pool: i128 = env.storage().instance().get(&pool_key).unwrap_or(0);
        total_pool += amount;
        env.storage().instance().set(&pool_key, &total_pool);
    }

    /// OPTION 1: Mock Yield - The Admin "injects" loot into the pool
    pub fn mock_generate_yield(env: Env, amount: i128) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&Symbol::new(&env, "Admin"))
            .unwrap();
        admin.require_auth();

        let yield_key = Symbol::new(&env, "LootYield");
        let mut current_yield: i128 = env.storage().instance().get(&yield_key).unwrap_or(0);
        current_yield += amount;
        env.storage().instance().set(&yield_key, &current_yield);
    }

    /// Pick a winner (Simplified for Mock version)
    pub fn draw_winner(env: Env) -> Address {
        let admin: Address = env
            .storage()
            .instance()
            .get(&Symbol::new(&env, "Admin"))
            .unwrap();
        admin.require_auth();

        let participants: Vec<Address> = env
            .storage()
            .persistent()
            .get(&Symbol::new(&env, "Players"))
            .unwrap();

        // Pseudo-random: In production (Option 2), we will use a proper VRF.
        // For now, we'll use the ledger sequence as a placeholder.
        let index = (env.ledger().sequence() % participants.len()) as u32;
        let winner = participants.get(index).unwrap();

        env.storage()
            .instance()
            .set(&Symbol::new(&env, "LastWinner"), &winner);
        winner
    }

    pub fn get_loot_pool(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&Symbol::new(&env, "LootYield"))
            .unwrap_or(0)
    }
}
#[cfg(test)]
mod test;
