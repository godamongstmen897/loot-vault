#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, String, Vec};

/// Milestone status enum
#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum MilestoneStatus {
    Pending,
    Submitted,
    Approved,
}

/// A single milestone inside a job
#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Milestone {
    pub amount: i128,
    pub description: String,
    pub status: MilestoneStatus,
}

/// Escrow/job object
#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Escrow {
    pub client: Address,
    pub freelancer: Address,
    pub token: Address,
    pub milestones: Vec<Milestone>,
    pub total_amount: i128,
    pub released_amount: i128,
    pub creation_ledger: u32,
    pub refund_timelock: u32,
}

#[contract]
pub struct MercenaryBoard;

#[contractimpl]
impl MercenaryBoard {
    /// Create a new job (escrow). `job_id` is a unique key chosen by caller (use a String).
    /// Transfers the total bounty from `client` to the contract immediately.
    pub fn create_job(
        env: Env,
        job_id: String,
        client: Address,
        freelancer: Address,
        token: Address,
        milestones: Vec<Milestone>,
        refund_timelock: u32,
    ) {
        client.require_auth();

        // compute total
        let mut total: i128 = 0;
        for i in 0..milestones.len() {
            let m = milestones.get(i).unwrap();
            total += m.amount;
        }

        // transfer tokens from client to contract
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&client, &env.current_contract_address(), &total);

        let escrow = Escrow {
            client: client.clone(),
            freelancer: freelancer.clone(),
            token: token.clone(),
            milestones: milestones.clone(),
            total_amount: total,
            released_amount: 0,
            creation_ledger: env.ledger().sequence(),
            refund_timelock,
        };

        env.storage().instance().set(&job_id, &escrow);
    }

    /// Freelancer submits work for a specific milestone index
    pub fn submit_work(env: Env, job_id: String, milestone_index: u32, freelancer: Address) {
        freelancer.require_auth();

        let mut escrow: Escrow = env.storage().instance().get(&job_id).unwrap();

        // ensure the caller is the registered freelancer
        if escrow.freelancer != freelancer {
            panic!("only assigned freelancer can submit work");
        }

        let idx = milestone_index;
        let mut m = escrow.milestones.get(idx).unwrap().clone();
        if m.status != MilestoneStatus::Pending {
            panic!("milestone not in Pending state");
        }
        m.status = MilestoneStatus::Submitted;
        escrow.milestones.set(idx, m);

        env.storage().instance().set(&job_id, &escrow);
    }

    /// Client approves a submitted milestone and releases funds to the freelancer
    pub fn approve_milestone(env: Env, job_id: String, milestone_index: u32, client: Address) {
        client.require_auth();

        let mut escrow: Escrow = env.storage().instance().get(&job_id).unwrap();

        if escrow.client != client {
            panic!("only client can approve milestones");
        }

        let idx = milestone_index;
        let mut m = escrow.milestones.get(idx).unwrap().clone();
        if m.status != MilestoneStatus::Submitted {
            panic!("milestone must be Submitted to approve");
        }
        let payout = m.amount;

        // transfer token amount from contract to freelancer
        let token_client = token::Client::new(&env, &escrow.token);
        token_client.transfer(&env.current_contract_address(), &escrow.freelancer, &payout);

        // update state
        m.status = MilestoneStatus::Approved;
        escrow.milestones.set(idx, m);
        escrow.released_amount += payout;
        env.storage().instance().set(&job_id, &escrow);
    }

    /// Allows the client to reclaim unreleased funds after a timelock has passed
    pub fn dispute_refund(env: Env, job_id: String, client: Address) {
        client.require_auth();

        let mut escrow: Escrow = env.storage().instance().get(&job_id).unwrap();

        if escrow.client != client {
            panic!("only client can request a refund");
        }

        let now = env.ledger().sequence();
        if now < escrow.creation_ledger + escrow.refund_timelock {
            panic!("refund timelock not yet passed");
        }

        let unreleased = escrow.total_amount - escrow.released_amount;
        if unreleased <= 0 {
            // nothing to refund
            return;
        }

        // transfer remaining tokens back to client
        let token_client = token::Client::new(&env, &escrow.token);
        token_client.transfer(&env.current_contract_address(), &escrow.client, &unreleased);

        // mark all pending/submitted milestones as Approved=false and set released to total
        escrow.released_amount = escrow.total_amount;
        env.storage().instance().set(&job_id, &escrow);
    }

    /// Read helper: get escrow by job id
    pub fn get_escrow(env: Env, job_id: String) -> Escrow {
        env.storage().instance().get(&job_id).unwrap()
    }
}

#[cfg(test)]
mod test;
